#!/usr/bin/env python3
"""Validate and index canonical source records. Uses only Python's standard library.

No Git/GitHub commands, subprocesses, credentials, or repository APIs are used.
"""
import argparse
from collections import Counter
import concurrent.futures
import csv
from datetime import datetime, timezone
import fnmatch
import hashlib
import json
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TOPICS = ('shape-grammar', 'set-theory', 'group-theory', 'monster-moonshine', 'bridges')


def local_only(path):
    """Keep local instructions and assistant configuration out of public indexes."""
    parts = tuple(part.lower() for part in path.relative_to(ROOT).parts)
    names = ('shapegrammar-agent-prompt.md', 'vscode_terminal_commands.md',
             '*agent-prompt*.md', '*agent-instructions*.md', 'agents*.md',
             'claude*.md', 'gemini*.md', 'skill.md', 'copilot-instructions.md',
             '*.agent.md', '*.instructions.md', '*.prompt.md', '*.chatmode.md', '.aider*',
             'shapegrammar-workspace*.json', 'shapegrammar-derivation*.json')
    dirs = {'.agents', '.codex', '.claude', '.gemini', '.cursor', '.continue'}
    if any(part in dirs or fnmatch.fnmatchcase(part, '.aider*') for part in parts):
        return True
    if any(fnmatch.fnmatchcase(parts[-1], pattern) for pattern in names):
        return True
    return any(parts[i] == '.github' and parts[i + 1] in {'agents', 'instructions', 'prompts'}
               for i in range(len(parts) - 1))


def records():
    return [(p, json.loads(p.read_text())) for p in sorted(ROOT.glob('*/metadata/*.json'))
            if not local_only(p)]


def checked_path(value):
    path = (ROOT / value).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        raise ValueError(f'Missing or unsafe path: {value}')
    return path


def validate():
    errors, ids, dois, originals = [], set(), set(), set()
    rows = records()
    required = {'schema_version', 'id', 'topic', 'title', 'authors', 'year',
                'edition_version', 'doi', 'stable_url', 'reading_url', 'download_url',
                'tags', 'relevance', 'prerequisite_level', 'prerequisites', 'access_date',
                'license_redistribution', 'local_files', 'locators', 'verification', 'annotation_file'}
    for p, d in rows:
        try:
            missing = required - d.keys()
            assert not missing, f'Missing fields: {sorted(missing)}'
            assert d['schema_version'] == 1
            assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', d['id'])
            assert d['id'] not in ids, 'Duplicate source ID'
            ids.add(d['id'])
            assert p.name == d['id'] + '.json'
            assert d['topic'] in TOPICS and p.parent.parent.name == d['topic']
            assert isinstance(d['authors'], list) and d['authors']
            assert d['year'] is None or isinstance(d['year'], int)
            assert d['prerequisite_level'] in ('beginner', 'intermediate', 'advanced')
            assert d['topic'] in d['tags']
            datetime.strptime(d['access_date'], '%Y-%m-%d')
            for key in ('stable_url', 'reading_url'):
                assert d[key].startswith('https://'), f'Invalid {key}'
            if d['doi']:
                assert d['doi'].lower() not in dois, 'Duplicate DOI; use cross-topic tags'
                dois.add(d['doi'].lower())
            checked_path(d['annotation_file'])
            for f in d['local_files']:
                assert d['license_redistribution']['status'] == 'downloaded-with-conditions', 'Original lacks redistribution approval'
                assert f['unmodified'] is True
                fp = checked_path(f['path'])
                assert fp.parent == ROOT / d['topic'] / 'originals'
                assert f['path'] not in originals, 'Duplicated original path'
                originals.add(f['path'])
                data = fp.read_bytes()
                assert data.startswith(b'%PDF-'), 'Original is not a PDF'
                assert len(data) == f['bytes'], 'Byte count mismatch'
                assert hashlib.sha256(data).hexdigest() == f['sha256'], 'Checksum mismatch'
            for f in d.get('existing_local_files', []):
                fp = checked_path(f['path'])
                assert hashlib.sha256(fp.read_bytes()).hexdigest() == f['sha256'], 'Preserved user file changed'
                assert f['public_candidate'] is False
        except (AssertionError, ValueError, KeyError, TypeError) as e:
            errors.append(f'{p.relative_to(ROOT)}: {e}')
    for p in ROOT.glob('*/originals/*'):
        if p.suffix == '.pdf' and str(p.relative_to(ROOT)) not in originals:
            errors.append(f'Unregistered original: {p.relative_to(ROOT)}')
    coverage = ROOT / 'coverage.json'
    if coverage.exists():
        for row in json.loads(coverage.read_text()):
            for source in row['source_ids']:
                if source not in ids:
                    errors.append(f'Unknown coverage source: {source}')
    if errors:
        raise ValueError('\n'.join(errors))
    return rows, originals


def rebuild():
    rows, originals = validate()
    sources = [d for _, d in rows]
    (ROOT / 'catalogue.json').write_text(json.dumps({'schema_version': 1,
        'generated_from': '*/metadata/*.json (canonical)', 'sources': sources}, indent=2, ensure_ascii=False) + '\n')
    fields = ['id', 'topic', 'title', 'authors', 'year', 'edition_version', 'doi',
              'stable_url', 'reading_url', 'tags', 'prerequisite_level', 'relevance',
              'access_date', 'license', 'local_files']
    with (ROOT / 'catalogue.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fields)
        writer.writeheader()
        for d in sources:
            row = {k: d.get(k) for k in fields}
            row.update(authors='; '.join(d['authors']), tags='; '.join(d['tags']),
                       license=d['license_redistribution']['license'],
                       local_files='; '.join(f['path'] for f in d['local_files']))
            writer.writerow(row)
    lines = ['# Reference catalogue', '', 'Generated from canonical records in each topic’s `metadata/` folder.', '',
             'Search this file or `catalogue.csv` in VS Code. Years and versions are separate; a blank year means it was not verified.', '']
    for topic in TOPICS:
        lines += ['## ' + topic.replace('-', ' ').title(), '', '| Source | Author(s) / year | Level | Access |', '| --- | --- | --- | --- |']
        for d in sources:
            if d['topic'] == topic:
                title = d['title'].replace('|', '\\|')
                access = f"{len(d['local_files'])} local PDF(s)" if d['local_files'] else 'reading link'
                people = ', '.join(d.get('editors') or d['authors'])
                if d.get('publication_type') == 'edited-issue':
                    people += ' (editors)'
                if d.get('contributors'):
                    people += '; named contribution: ' + ', '.join(d['contributors'])
                lines.append(f"| [{title}]({d['annotation_file']}) | {people} / {d['year'] or 'undated'} | {d['prerequisite_level']} | {access} |")
        lines.append('')
    (ROOT / 'CATALOGUE.md').write_text('\n'.join(lines))
    def bib(value):
        return str(value).replace('\\', r'\textbackslash{}').replace('&', r'\&').replace('%', r'\%').replace('_', r'\_')
    bibs = []
    for d in sources:
        fields = {'title': d['title'], 'author': ' and '.join(d['authors']), 'url': d['stable_url'],
                  'urldate': d['access_date'], 'note': d['edition_version']}
        if d.get('publication_type') == 'edited-issue':
            fields.pop('author')
            fields['editor'] = ' and '.join(d['editors'])
        if d.get('contributors'):
            fields['note'] += ' Named contribution: ' + ', '.join(d['contributors']) + '.'
        if d['year'] is not None:
            fields['year'] = d['year']
        if d['doi']:
            fields['doi'] = d['doi']
        if d['venue']:
            fields['howpublished'] = d['venue']
        bibs.append('@misc{' + d['id'] + ',\n' + ',\n'.join('  ' + k + ' = {' + bib(v) + '}' for k, v in fields.items()) + '\n}')
    (ROOT / 'references.bib').write_text('\n\n'.join(bibs) + '\n')
    manifest = []
    for p in sorted(ROOT.rglob('*')):
        if not p.is_file() or p.name == '.DS_Store' or '__pycache__' in p.parts or local_only(p):
            continue
        relative = str(p.relative_to(ROOT))
        if p.suffix == '.pdf' and relative not in originals:
            continue
        if p.suffix not in ('.md', '.json', '.csv', '.bib', '.py', '.txt', '.pdf'):
            raise ValueError(f'Unreviewed file type: {relative}')
        manifest.append('Reference/' + relative)
    if 'Reference/PUBLIC_FILES.txt' not in manifest:
        manifest.append('Reference/PUBLIC_FILES.txt')
    (ROOT / 'PUBLIC_FILES.txt').write_text('\n'.join(sorted(manifest)) + '\n')
    print(json.dumps({'sources': len(sources), 'topic_counts': dict(Counter(d['topic'] for d in sources)),
                      'permitted_original_pdfs': len(originals), 'public_reference_paths': len(manifest)}, indent=2))


def check_links():
    rows, _ = validate()
    urls = sorted({d[key] for _, d in rows for key in ('stable_url', 'reading_url')})
    def fetch(url):
        request = urllib.request.Request(url, headers={'User-Agent': 'ShapeGrammar-Reference-LinkCheck/1.0'})
        result = {'url': url, 'checked_at_utc': datetime.now(timezone.utc).isoformat()}
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                sample = response.read(4096)
                result.update(status=response.status, final_url=response.url,
                              content_type=response.headers.get('Content-Type'),
                              pdf_header=sample.startswith(b'%PDF-'))
        except urllib.error.HTTPError as e:
            result.update(status=e.code, final_url=e.url, error=str(e))
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            result.update(status=None, error=str(e))
        return result
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(fetch, urls))
    report = {'note': 'HTTP success checks reachability only. 403/406 may be access filtering; source verification scope is recorded separately. No paywalls or access controls were bypassed.', 'results': results}
    (ROOT / 'LINK_CHECK_REPORT.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'checked_urls': len(results), 'statuses': dict(Counter(str(x['status']) for x in results))}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['validate', 'rebuild', 'check-links'])
    args = parser.parse_args()
    try:
        if args.action == 'rebuild':
            rebuild()
        elif args.action == 'check-links':
            check_links()
        else:
            rows, originals = validate()
            print(f'PASS: {len(rows)} canonical records; {len(originals)} original checksums; coverage IDs and preserved user-file checksum.')
    except (ValueError, json.JSONDecodeError) as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

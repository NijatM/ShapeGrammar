# Preview and publication

The application is a static site. It requires Node.js 20 or newer for checks/builds and Python 3.9 or newer for reference validation and the local server. It has no npm dependencies. JavaScript modules require an HTTP server rather than opening HTML files directly.

```bash
npm run check
npm run build
node tools/check-site.mjs --dist
npm run dev
```

Open `http://127.0.0.1:8765/` for the working source or `http://127.0.0.1:8765/dist/` for the exact production files. Stop the server with Control-C. Relative asset and worker URLs allow the same build to work beneath the `/ShapeGrammar/` project path. A missing hash route shows a recovery page; valid lesson URLs use hashes, for example `#/lesson/SG-01`.

## GitHub Pages

After reviewing and pushing the source to **NijatM/ShapeGrammar**, the owner can choose **Settings → Pages → Source → GitHub Actions**. Then open **Actions → Publish reviewed site → Run workflow** on the reviewed branch. The workflow only runs manually; pushing does not trigger it. It checks the source, builds `dist`, checks the distribution, and uploads only that distribution to Pages. Its expected project URL is `https://NijatM.github.io/ShapeGrammar/`; GitHub reports the actual URL after a successful deployment.

The workflow follows the [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and the [official Node setup action](https://github.com/actions/setup-node). The hosted workflow has been prepared locally; it has not been executed or deployed as part of local validation.

## Public-file boundaries

The build copies only the two entry pages, application modules, learning data, public documentation, and files declared in `Reference/PUBLIC_FILES.txt`. It excludes local prompts/instructions, assistant configuration, private study/workspace downloads, Git metadata, and unregistered originals. `dist/` is generated and ignored; the workflow recreates it from source. The distribution check removes macOS `.DS_Store` folder metadata from this generated output before verifying its exact file list.

Reference originals keep their individual license conditions. The pre-existing 1980 Stiny PDF with unknown redistribution provenance is excluded. See the [rights ledger](../Reference/RIGHTS_AND_ATTRIBUTION.md). Public availability alone does not grant redistribution permission.

The supplied ignore rules do not remove files already tracked in an existing repository. The owner must inspect the staged file list before their commit. No repository state is inspected by the build or reference tool.

## Private study data

Study notes/progress and the laboratory workspace use separate browser storage keys. They belong to the exact origin, including scheme, hostname and port. A localhost preview does not share notes with the future Pages site. Export a backup before moving; import it on the destination. Both tools remain usable without persistent browser storage and show a storage error when saving fails. There is no account, server-side database or sync service.

Google Fonts supplies the optional IBM Plex Mono stylesheet; a local monospace stack works if that request fails. PDFs and references load when requested. There is no analytics or application telemetry.

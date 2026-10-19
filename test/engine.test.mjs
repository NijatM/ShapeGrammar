import test from 'node:test';
import assert from 'node:assert/strict';
import { q, Rational, normalize, serializeShape, shapeKey, equalShapes, sum, common, difference, isPart,
  transformShape, transformPoint, domain, transformations, serializeTransform, allowedTransform, validateAlignment,
  applyRule, findMatches, Derivation } from '../src/engine/core.mjs';

const line = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];
const h = (a, b) => line(a, 0, b, 0);
const identity = { orientation: 'r0', scale: 1, translation: [0, 0] };
const small = { xMin: -1, xMax: 1, yMin: -1, yMax: 1, scales: ['1/2', 1], step: 1 };
const one = { xMin: 0, xMax: 0, yMin: 0, yMax: 0, scales: [1], step: 1 };
const witness = t => JSON.stringify(serializeTransform(t));

test('exact arithmetic, normalized signs, large values, and rejected inexact input', () => {
  assert.equal(String(q('2/-4')), '-1/2');
  assert.equal(String(q('1/3').add('2/3')), '1');
  assert.equal(String(q(2n ** 100n).add(1)), String(2n ** 100n + 1n));
  assert.equal(String(q('7/9').mul('3/7').div('1/3')), '1');
  for (const invalid of [0.1, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, true, '1.5', '1/0']) assert.throws(() => q(invalid));
  assert.throws(() => new Rational(Number.MAX_SAFE_INTEGER + 1));
});

test('canonical maximal lines ignore direction, stroke order, duplication, splitting and overlap', () => {
  const variants = [[h(0, 6)], [h(0, 3), h(3, 6)], [h(4, 0), h(6, 2)], [h(0, 6), h(6, 0), h(2, 5)]];
  for (const v of variants) assert.equal(shapeKey(v), shapeKey([h(0, 6)]));
  assert.equal(shapeKey([line(0, 0, 2, 2), line(2, 2, 4, 4)]), shapeKey([line(0, 0, 4, 4)]));
  assert.equal(shapeKey([line(2, -1, 2, 1), line(2, 1, 2, 3)]), shapeKey([line(2, -1, 2, 3)]));
  assert.throws(() => normalize([h(0, 0)]), /Zero-length/);
});

test('geometric embedding spans original boundaries and proper subsegments; gaps fail', () => {
  assert.ok(isPart([h(2, 4)], [h(0, 3), h(3, 6)]));
  assert.ok(isPart([h('1/3', '7/3')], [h(0, 6)]));
  assert.ok(!isPart([h(2, 4)], [h(0, '5/2'), h(3, 6)]));
  assert.ok(isPart([], []));
  assert.ok(!isPart([h(0, 1)], []));
  assert.ok(isPart([line(1, 1, 3, 3)], [line(0, 0, 4, 4)]));
});

test('one-dimensional intersection ignores crossings and point contacts', () => {
  assert.deepEqual(serializeShape(common([h(-1, 1)], [line(0, -1, 0, 1)])), []);
  assert.deepEqual(serializeShape(common([h(0, 1)], [h(1, 2)])), []);
  assert.ok(equalShapes(common([h(0, 3)], [h(1, 4)]), [h(1, 3)]));
  assert.ok(equalShapes(sum([h(0, 1)], [h(1, 2)]), [h(0, 2)]));
});

test('difference splits, deletes, preserves untouched crossings and fuses when added back', () => {
  assert.ok(equalShapes(difference([h(0, 6)], [h(2, 4)]), [h(0, 2), h(4, 6)]));
  assert.ok(equalShapes(difference([h(0, 1)], [h(1, 2)]), [h(0, 1)]));
  assert.deepEqual(serializeShape(difference([h(0, 6)], [h(-1, 8)])), []);
  assert.ok(equalShapes(difference([h(-1, 1)], [line(0, -1, 0, 1)]), [h(-1, 1)]));
  assert.ok(equalShapes(sum(difference([h(0, 6)], [h(2, 4)]), [h(2, 4)]), [h(0, 6)]));
  assert.ok(equalShapes(difference([line(0, 0, 6, 6)], [line(2, 2, 4, 4)]), [line(0, 0, 2, 2), line(4, 4, 6, 6)]));
});

test('same transformation on both rule sides; fractions are preserved without snapping', () => {
  const r = { left: [h(0, 2)], right: [h(0, 2), line(1, 0, 1, 1)] };
  const t = { scale: '1/2', orientation: 'r90', translation: [1, 1] };
  const cfg = { ...small, xMin: 0, xMax: 2, yMin: 0, yMax: 2 };
  const result = applyRule(r, [line(1, 1, 1, 2)], t, cfg);
  assert.ok(isPart([line('1/2', '3/2', 1, '3/2')], result));
  assert.deepEqual(transformPoint([1, 1], t).map(String), ['1/2', '3/2']);
  const far = applyRule({ left: [h(0, 1)], right: [h(1000, 1001)] }, [h(0, 1)], identity, one);
  assert.ok(equalShapes(far, [h(1000, 1001)]));
});

test('finite domains are explicit, deduplicate equal parameters and reject malformed settings', () => {
  assert.equal(domain().total, 10584n);
  assert.equal(domain({ ...one, scales: [1, '2/2'], orientations: ['r0', 'r0'] }).total, 1n);
  assert.equal(domain({ ...one, xMax: '5/2', step: 1 }).xCount, 3n);
  assert.throws(() => domain({ step: 0 }));
  assert.throws(() => domain({ scales: [-1] }));
  assert.throws(() => domain({ orientations: ['r45'] }));
  assert.throws(() => domain({ xMin: 1, xMax: 0 }));
  assert.ok(!allowedTransform({ ...identity, translation: ['1/3', 0] }, small));
});

test('symmetry witnesses remain distinct despite identical matched geometry', async () => {
  const r = { left: [h(0, 2)], right: [h(0, 2), line(1, 0, 1, 1)] };
  const result = await findMatches(r, [h(0, 2)], one);
  assert.equal(result.complete, true);
  assert.equal(result.transformationCount, 2);
  assert.equal(result.regionCount, 1);
  assert.equal(result.resultCount, 2);
  assert.deepEqual(result.matches.map(x => x.transform.orientation), ['r0', 'f0']);
});

test('manual alignment and automatic search agree on every transform in a small domain', async () => {
  const r = { left: [h(0, 1)], right: [] }, host = [h(-1, 2), line(0, -1, 0, 2)];
  const result = await findMatches(r, host, small);
  const keys = new Set(result.matches.map(m => witness(m.transform)));
  for (const t of transformations(small)) assert.equal(validateAlignment(r, host, t, small).valid, keys.has(witness(t)));
  assert.equal(validateAlignment(r, host, { ...identity, scale: 4 }, small).reason, 'unsupported-transform');
  assert.equal(validateAlignment(r, [], identity, small).reason, 'not-embedded');
  assert.throws(() => applyRule(r, [], identity, small), /not-embedded/);
  assert.throws(() => applyRule({ left: [], right: [] }, [], identity, one), /Empty left-hand/);
});

test('emergence fixture has the same complete witness set across stroke representations', async () => {
  const r = { left: [h(0, 2)], right: [] };
  const cfg = { ...one, xMin: 0, xMax: 6, scales: [1] };
  const a = await findMatches(r, [h(0, 3), h(3, 6)], cfg);
  const b = await findMatches(r, [h(0, 6), h(6, 0), h(2, 5)], cfg);
  assert.ok(a.complete && b.complete);
  assert.deepEqual(a.matches.map(m => witness(m.transform)), b.matches.map(m => witness(m.transform)));
  assert.ok(a.matches.some(m => m.transform.orientation === 'r0' && m.transform.translation[0].cmp(2) === 0));
});

test('cancellation and protective limits never claim complete results', async () => {
  const r = { left: [h(0, 1)], right: [] };
  const controller = new AbortController(); controller.abort();
  assert.equal((await findMatches(r, [h(0, 6)], small, { signal: controller.signal })).reason, 'cancelled');
  const capped = await findMatches(r, [h(0, 6)], small, { maxCandidates: 1 });
  assert.equal(capped.complete, false); assert.equal(capped.reason, 'candidate-limit');
  const matches = await findMatches(r, [h(0, 6)], small, { maxMatches: 0 });
  assert.equal(matches.complete, false); assert.equal(matches.reason, 'match-limit');
  const during = new AbortController();
  const cancelled = await findMatches(r, [h(0, 6)], small, { batchSize: 2, signal: during.signal, onProgress: () => during.abort() });
  assert.equal(cancelled.complete, false); assert.equal(cancelled.reason, 'cancelled'); assert.equal(cancelled.checked, 2);
});

test('history, undo/redo, branching and import replay preserve exact geometry', () => {
  const r = { left: [h(0, 1)], right: [h(0, 1), line(0, 0, 0, '1/2')] };
  const session = new Derivation([h(0, 2)], small), initial = shapeKey(session.current);
  session.apply(r, identity); const first = shapeKey(session.current);
  session.apply({ left: [h(0, 2)], right: [] }, identity);
  const second = shapeKey(session.current);
  session.undo(); assert.equal(shapeKey(session.current), first);
  const copy = Derivation.import(JSON.parse(JSON.stringify(session.export())));
  assert.equal(shapeKey(copy.current), first); assert.equal(copy.length, 2);
  copy.redo(); assert.equal(shapeKey(copy.current), second);
  session.undo(); assert.equal(shapeKey(session.current), initial);
  session.apply({ left: [h(0, 1)], right: [] }, identity); assert.equal(session.length, 1);
  const bad = copy.export(); bad.steps[0].expectedResult = [];
  assert.throws(() => Derivation.import(bad), /mismatch/);
  assert.equal(shapeKey(copy.current), second);
  assert.throws(() => Derivation.import({ ...copy.export(), domain: undefined }));
  assert.throws(() => Derivation.import({ ...copy.export(), version: 99 }));
});

// Independent oracle: all fixture coordinates are integer multiples of 1/2.
// Convert to integer coordinates and test coverage with cross/dot products and
// projected interval merging; do not use production transforms or shape predicates.
function oracleCovered(query, host) {
  return query.every(([a, b]) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], length2 = dx * dx + dy * dy;
    const intervals = [];
    for (const [p, r] of host) {
      if ((p[0] - a[0]) * dy !== (p[1] - a[1]) * dx || (r[0] - a[0]) * dy !== (r[1] - a[1]) * dx) continue;
      const t0 = (p[0] - a[0]) * dx + (p[1] - a[1]) * dy, t1 = (r[0] - a[0]) * dx + (r[1] - a[1]) * dy;
      intervals.push([Math.max(0, Math.min(t0, t1)), Math.min(length2, Math.max(t0, t1))]);
    }
    intervals.sort((a, b) => a[0] - b[0]); let end = 0;
    for (const [lo, hi] of intervals) { if (lo > end) break; end = Math.max(end, hi); }
    return end >= length2;
  });
}
function oracleMatches(query, host) {
  const result = [], scaledHost = host.map(s => s.map(p => p.map(x => x * 2)));
  for (const scale of [0.5, 1]) for (const orientation of ['r0', 'r90', 'r180', 'r270', 'f0', 'f90', 'f180', 'f270'])
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) {
      const transformed = query.map(s => s.map(([px, py]) => {
        if (orientation[0] === 'f') py = -py;
        for (let k = 0; k < Number(orientation.slice(1)) / 90; k++) [px, py] = [-py, px];
        return [(px * scale + x) * 2, (py * scale + y) * 2];
      }));
      if (oracleCovered(transformed, scaledHost)) result.push(JSON.stringify({ scale: scale === 0.5 ? '1/2' : '1', orientation, translation: [String(x), String(y)] }));
    }
  return result.sort();
}
test('complete matcher equals independent exhaustive oracle on 192 fixture pairs / 27,648 candidates', async () => {
  const pool = [h(0, 1), h(1, 2), line(0, 0, 0, 1), line(0, 1, 0, 2), line(0, 0, 1, 1), line(1, 1, 2, 2)];
  const queries = [[h(0, 1)], [line(0, 0, 1, 1)], [h(0, 1), line(0, 0, 0, 1)]];
  for (let mask = 0; mask < 64; mask++) {
    const host = pool.filter((_, index) => mask & (1 << index));
    for (const query of queries) {
      const actual = await findMatches({ left: query, right: [] }, host, small, { batchSize: 1000 });
      assert.equal(actual.complete, true);
      assert.deepEqual(actual.matches.map(m => witness(m.transform)).sort(), oracleMatches(query, host), `mask=${mask}; query=${JSON.stringify(query)}`);
    }
  }
});

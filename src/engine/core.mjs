/** Exact planar line shapes. See docs/MATHEMATICAL_MODEL.md for the contract. */
const abs = n => n < 0n ? -n : n;
function gcd(a, b) { a = abs(a); b = abs(b); while (b) [a, b] = [b, a % b]; return a; }

export class Rational {
  constructor(n, d = 1n) {
    for (const value of [n, d]) if (!['bigint', 'string'].includes(typeof value)
      && !(typeof value === 'number' && Number.isSafeInteger(value))) throw new TypeError('Inexact rational input');
    n = BigInt(n); d = BigInt(d);
    if (!d) throw new RangeError('Zero denominator');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); this.n = n / g; this.d = d / g;
    Object.freeze(this);
  }
  add(b) { b = q(b); return new Rational(this.n * b.d + b.n * this.d, this.d * b.d); }
  sub(b) { b = q(b); return new Rational(this.n * b.d - b.n * this.d, this.d * b.d); }
  mul(b) { b = q(b); return new Rational(this.n * b.n, this.d * b.d); }
  div(b) { b = q(b); return new Rational(this.n * b.d, this.d * b.n); }
  cmp(b) { b = q(b); const v = this.n * b.d - b.n * this.d; return v < 0n ? -1 : v > 0n ? 1 : 0; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
  toJSON() { return this.toString(); }
  toNumber() { return Number(this.n) / Number(this.d); } // Rendering only.
}
export function q(value) {
  if (value instanceof Rational) return value;
  if (typeof value === 'bigint') return new Rational(value);
  if (typeof value === 'number' && Number.isSafeInteger(value)) return new Rational(BigInt(value));
  if (typeof value === 'string' && /^[+-]?\d+(?:\/[+-]?\d+)?$/.test(value)) {
    const [n, d = '1'] = value.split('/'); return new Rational(n, d);
  }
  throw new TypeError('Use a safe integer or an exact rational string such as "1/2"');
}
const point = p => {
  if (!Array.isArray(p) || p.length !== 2) throw new TypeError('A point needs two coordinates');
  return Object.freeze(p.map(q));
};
const min = (a, b) => a.cmp(b) <= 0 ? a : b;
const max = (a, b) => a.cmp(b) >= 0 ? a : b;
const frozenSegment = (a, b) => Object.freeze([Object.freeze(a), Object.freeze(b)]);

function describe(segment) {
  if (!Array.isArray(segment) || segment.length !== 2) throw new TypeError('A segment needs two points');
  const a = point(segment[0]), b = point(segment[1]);
  const dx = b[0].sub(a[0]), dy = b[1].sub(a[1]);
  if (!dx.n && !dy.n) throw new RangeError('Zero-length segments are not line elements');
  const vertical = !dx.n;
  const slope = vertical ? null : dy.div(dx);
  const offset = vertical ? a[0] : a[1].sub(slope.mul(a[0]));
  const i = vertical ? 1 : 0;
  return { key: vertical ? `v:${offset}` : `l:${slope}:${offset}`, vertical, slope, offset,
    lo: min(a[i], b[i]), hi: max(a[i], b[i]) };
}
function at(line, t) { return line.vertical ? [line.offset, t] : [t, line.slope.mul(t).add(line.offset)]; }
function groups(shape) {
  if (!Array.isArray(shape)) throw new TypeError('A shape must be an array of segments');
  const result = new Map();
  for (const segment of shape) {
    const d = describe(segment);
    if (!result.has(d.key)) result.set(d.key, { ...d, intervals: [] });
    result.get(d.key).intervals.push([d.lo, d.hi]);
  }
  for (const line of result.values()) {
    line.intervals.sort((a, b) => a[0].cmp(b[0]) || a[1].cmp(b[1]));
    const merged = [];
    for (const [lo, hi] of line.intervals) {
      const last = merged.at(-1);
      if (last && lo.cmp(last[1]) <= 0) last[1] = max(last[1], hi);
      else merged.push([lo, hi]);
    }
    line.intervals = merged;
  }
  return result;
}
function fromGroups(map) {
  return Object.freeze([...map.values()].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0).flatMap(line =>
    line.intervals.filter(([lo, hi]) => lo.cmp(hi) < 0).map(([lo, hi]) => frozenSegment(at(line, lo), at(line, hi)))));
}
export function normalize(shape) { return fromGroups(groups(shape)); }
export function serializeShape(shape) { return normalize(shape).map(s => s.map(p => p.map(String))); }
export function shapeKey(shape) { return JSON.stringify(serializeShape(shape)); }
export function equalShapes(a, b) { return shapeKey(a) === shapeKey(b); }
export function sum(a, b) { return normalize([...a, ...b]); }
export function common(a, b) {
  const ga = groups(a), gb = groups(b);
  for (const line of ga.values()) line.intervals = line.intervals.flatMap(([a0, a1]) =>
    (gb.get(line.key)?.intervals ?? []).flatMap(([b0, b1]) => {
      const lo = max(a0, b0), hi = min(a1, b1); return lo.cmp(hi) < 0 ? [[lo, hi]] : [];
    }));
  return normalize(fromGroups(ga));
}
export function difference(a, b) {
  const ga = groups(a), gb = groups(b);
  for (const line of ga.values()) {
    for (const [lo, hi] of gb.get(line.key)?.intervals ?? []) {
      line.intervals = line.intervals.flatMap(([start, end]) => {
        if (hi.cmp(start) <= 0 || lo.cmp(end) >= 0) return [[start, end]];
        const parts = [];
        if (start.cmp(lo) < 0) parts.push([start, lo]);
        if (end.cmp(hi) > 0) parts.push([hi, end]);
        return parts;
      });
    }
  }
  return fromGroups(ga);
}
function covered(queryGroups, hostGroups) {
  for (const query of queryGroups.values()) for (const [lo, hi] of query.intervals) {
    if (!(hostGroups.get(query.key)?.intervals ?? []).some(([a, b]) => a.cmp(lo) <= 0 && b.cmp(hi) >= 0)) return false;
  }
  return true;
}
export function isPart(query, host) { return covered(groups(query), groups(host)); }

/** Quarter turns R^k, then R^k F where F reflects across the x axis. */
export const D4 = Object.freeze({
  r0: [1, 0, 0, 1], r90: [0, -1, 1, 0], r180: [-1, 0, 0, -1], r270: [0, 1, -1, 0],
  f0: [1, 0, 0, -1], f90: [0, 1, 1, 0], f180: [-1, 0, 0, 1], f270: [0, -1, -1, 0],
});
for (const m of Object.values(D4)) Object.freeze(m);
export function transformation(t) {
  if (!t || !Object.hasOwn(D4, t.orientation)) throw new TypeError('Unknown D4 orientation');
  const scale = q(t.scale);
  if (scale.cmp(0) <= 0) throw new RangeError('Scale must be positive');
  return Object.freeze({ scale, orientation: t.orientation, translation: point(t.translation) });
}
export function transformPoint(p, t) {
  p = point(p); t = transformation(t);
  const [a, b, c, d] = D4[t.orientation];
  return point([p[0].mul(a).add(p[1].mul(b)).mul(t.scale).add(t.translation[0]),
    p[0].mul(c).add(p[1].mul(d)).mul(t.scale).add(t.translation[1])]);
}
export function transformShape(shape, t) {
  t = transformation(t);
  return normalize(shape.map(segment => segment.map(p => transformPoint(p, t))));
}
export const serializeTransform = t => {
  t = transformation(t); return { scale: String(t.scale), orientation: t.orientation, translation: t.translation.map(String) };
};
const uniqueRationals = values => [...new Map(values.map(v => { const r = q(v); return [String(r), r]; })).values()].sort((a, b) => a.cmp(b));
const countAxis = (min, max, step) => { const span = max.sub(min).div(step); return span.n / span.d + 1n; };
export function domain(config = {}) {
  const result = {};
  for (const [key, fallback] of Object.entries({ xMin: -10, xMax: 10, yMin: -10, yMax: 10, step: 1 })) result[key] = q(config[key] ?? fallback);
  if (result.step.cmp(0) <= 0 || result.xMin.cmp(result.xMax) > 0 || result.yMin.cmp(result.yMax) > 0) throw new RangeError('Invalid finite translation grid');
  result.scales = Object.freeze(uniqueRationals(config.scales ?? ['1/2', 1, 2]));
  if (!result.scales.length || result.scales.some(s => s.cmp(0) <= 0)) throw new RangeError('Supply positive scales');
  const selected = config.orientations ?? Object.keys(D4);
  if (!Array.isArray(selected) || !selected.length || selected.some(x => !Object.hasOwn(D4, x))) throw new RangeError('Supply known D4 orientations');
  result.orientations = Object.freeze(Object.keys(D4).filter(x => selected.includes(x)));
  result.xCount = countAxis(result.xMin, result.xMax, result.step);
  result.yCount = countAxis(result.yMin, result.yMax, result.step);
  result.total = result.xCount * result.yCount * BigInt(result.scales.length * result.orientations.length);
  return Object.freeze(result);
}
export function serializeDomain(d) {
  d = domain(d);
  return { xMin: String(d.xMin), xMax: String(d.xMax), yMin: String(d.yMin), yMax: String(d.yMax), step: String(d.step),
    scales: d.scales.map(String), orientations: [...d.orientations] };
}
export function* transformations(config) {
  const d = domain(config);
  for (const scale of d.scales) for (const orientation of d.orientations)
    for (let x = 0n; x < d.xCount; x++) for (let y = 0n; y < d.yCount; y++)
      yield transformation({ scale, orientation, translation: [d.xMin.add(d.step.mul(x)), d.yMin.add(d.step.mul(y))] });
}
export function allowedTransform(t, config) {
  t = transformation(t); const d = domain(config);
  const onAxis = (v, min, max) => v.cmp(min) >= 0 && v.cmp(max) <= 0 && v.sub(min).div(d.step).d === 1n;
  return d.orientations.includes(t.orientation) && d.scales.some(s => s.cmp(t.scale) === 0)
    && onAxis(t.translation[0], d.xMin, d.xMax) && onAxis(t.translation[1], d.yMin, d.yMax);
}
export function rule(value) {
  if (!value || !Array.isArray(value.left) || !Array.isArray(value.right)) throw new TypeError('A rule needs left and right shapes');
  const left = normalize(value.left), right = normalize(value.right);
  if (!left.length) throw new RangeError('Empty left-hand sides are unsupported by this implementation');
  return Object.freeze({ left, right });
}
export function validateAlignment(value, host, t, config) {
  value = rule(value); t = transformation(t);
  if (!allowedTransform(t, config)) return { valid: false, reason: 'unsupported-transform' };
  const region = transformShape(value.left, t);
  return isPart(region, host) ? { valid: true, reason: null, region } : { valid: false, reason: 'not-embedded', region };
}
export function applyRule(value, host, t, config) {
  value = rule(value); const alignment = validateAlignment(value, host, t, config);
  if (!alignment.valid) throw new RangeError(alignment.reason);
  return sum(difference(host, alignment.region), transformShape(value.right, t));
}
const yieldToHost = () => new Promise(resolve => setTimeout(resolve, 0));
export async function findMatches(value, host, config, options = {}) {
  value = rule(value); host = normalize(host); const d = domain(config), hostGroups = groups(host);
  const { signal, maxCandidates = 250_000, maxMatches = 20_000, batchSize = 128, maxDurationMs = 8000, onProgress } = options;
  for (const n of [maxCandidates, maxMatches, batchSize]) if (!Number.isSafeInteger(n) || n < 0) throw new RangeError('Search limits must be nonnegative safe integers');
  if (!batchSize) throw new RangeError('batchSize must be positive');
  if (typeof maxDurationMs !== 'number' || !(maxDurationMs >= 0) || Number.isNaN(maxDurationMs)) throw new RangeError('Search duration must be nonnegative');
  const started = performance.now(), cache = new Map();
  // Orient/scale each carrier only once, then translate its exact intervals.
  const placedGroups = t => {
    const cacheKey = `${t.scale}:${t.orientation}`;
    if (!cache.has(cacheKey)) cache.set(cacheKey, groups(transformShape(value.left, { ...t, translation: [0, 0] })));
    const [tx, ty] = t.translation, result = new Map();
    for (const line of cache.get(cacheKey).values()) {
      const offset = line.vertical ? line.offset.add(tx) : line.offset.add(ty).sub(line.slope.mul(tx));
      const key = line.vertical ? `v:${offset}` : `l:${line.slope}:${offset}`;
      const shift = line.vertical ? ty : tx;
      result.set(key, { ...line, key, offset, intervals: line.intervals.map(([lo, hi]) => [lo.add(shift), hi.add(shift)]) });
    }
    return result;
  };
  const matches = []; let checked = 0, reason = null;
  const regions = new Set(), results = new Set();
  for (const t of transformations(d)) {
    if (signal?.aborted) { reason = 'cancelled'; break; }
    if (checked >= maxCandidates) { reason = 'candidate-limit'; break; }
    if (performance.now() - started >= maxDurationMs) { reason = 'duration-limit'; break; }
    const placed = placedGroups(t); checked++;
    if (covered(placed, hostGroups)) {
      if (matches.length >= maxMatches) { reason = 'match-limit'; break; }
      const region = fromGroups(placed);
      const result = sum(difference(host, region), transformShape(value.right, t));
      matches.push(Object.freeze({ transform: t, region, result }));
      regions.add(shapeKey(region)); results.add(shapeKey(result));
    }
    if (checked % batchSize === 0) {
      onProgress?.({ checked, total: String(d.total), found: matches.length });
      await yieldToHost();
    }
  }
  return Object.freeze({ matches: Object.freeze(matches), checked, total: String(d.total), complete: reason === null && BigInt(checked) === d.total,
    reason, transformationCount: matches.length, regionCount: regions.size, resultCount: results.size });
}

/** History is independent of display and drawing-stroke history. */
export class Derivation {
  #initial; #domain; #steps = []; #cursor = 0;
  constructor(initial, config) { this.#initial = normalize(initial); this.#domain = domain(config); }
  get current() { return this.#cursor ? this.#steps[this.#cursor - 1].result : this.#initial; }
  get cursor() { return this.#cursor; }
  get length() { return this.#steps.length; }
  apply(value, t) {
    value = rule(value); t = transformation(t);
    const result = applyRule(value, this.current, t, this.#domain);
    this.#steps = [...this.#steps.slice(0, this.#cursor), Object.freeze({ rule: value, transform: t, result })];
    this.#cursor++; return result;
  }
  undo() { if (this.#cursor) this.#cursor--; return this.current; }
  redo() { if (this.#cursor < this.#steps.length) this.#cursor++; return this.current; }
  export() {
    return { format: 'ShapeGrammar.derivation', version: 1, engineVersion: '0.1.0', initial: serializeShape(this.#initial),
      domain: serializeDomain(this.#domain), cursor: this.#cursor, steps: this.#steps.map(step => ({
        rule: { left: serializeShape(step.rule.left), right: serializeShape(step.rule.right) },
        transform: serializeTransform(step.transform), expectedResult: serializeShape(step.result) })) };
  }
  static import(data) {
    if (!data || data.format !== 'ShapeGrammar.derivation' || data.version !== 1 || data.engineVersion !== '0.1.0'
      || !data.domain || typeof data.domain !== 'object' || !Array.isArray(data.steps) || data.steps.length > 10_000 || !Number.isSafeInteger(data.cursor)
      || data.cursor < 0 || data.cursor > data.steps.length) throw new TypeError('Unsupported or malformed derivation');
    // Build and replay a new object; a failure never mutates an existing session.
    const result = new Derivation(data.initial, data.domain);
    for (const step of data.steps) {
      const shape = result.apply(step.rule, step.transform);
      if (!equalShapes(shape, step.expectedResult)) throw new RangeError('Derivation replay mismatch');
    }
    result.#cursor = data.cursor; return result;
  }
}

import { Derivation, q, rule, serializeShape } from './engine/core.mjs';

export const STORAGE_KEY = 'ShapeGrammar.lab.v1';
export const LIMITS = Object.freeze({ bytes: 1048576, steps: 200, segments: 256, coordinateLength: 128 });
const fail = message => { throw new TypeError(message); };
function exact(value) {
  if (typeof value !== 'string' || value.length > LIMITS.coordinateLength) fail('Coordinates must be short exact rational strings.');
  q(value);
}
export function checkShape(shape) {
  if (!Array.isArray(shape) || shape.length > LIMITS.segments) fail('Use at most 256 maximal segments per shape.');
  for (const segment of shape) {
    if (!Array.isArray(segment) || segment.length !== 2) fail('Each segment needs two points.');
    for (const point of segment) {
      if (!Array.isArray(point) || point.length !== 2) fail('Each point needs two coordinates.');
      point.forEach(exact);
    }
  }
}
function checkRule(value) {
  if (!value || typeof value !== 'object') fail('Missing rule.');
  checkShape(value.left); checkShape(value.right); rule(value);
}
function checkDerivation(data) {
  if (!data || data.format !== 'ShapeGrammar.derivation' || data.version !== 1 || data.engineVersion !== '0.1.0') fail('Unsupported derivation format or version.');
  if (!Array.isArray(data.steps) || data.steps.length > LIMITS.steps) fail('Use at most 200 derivation steps.');
  checkShape(data.initial);
  const d = data.domain;
  if (!d || typeof d !== 'object') fail('Missing search domain.');
  for (const name of ['xMin','xMax','yMin','yMax','step']) exact(d[name]);
  if (!Array.isArray(d.scales) || !d.scales.length || d.scales.length > 32) fail('Use 1–32 scales.');
  d.scales.forEach(exact);
  if (!Array.isArray(d.orientations) || !d.orientations.length || d.orientations.length > 8) fail('Use 1–8 orientations.');
  for (const step of data.steps) {
    if (!step || !step.transform) fail('Missing derivation step.');
    checkRule(step.rule); exact(step.transform.scale);
    if (!Array.isArray(step.transform.translation) || step.transform.translation.length !== 2) fail('Missing translation.');
    step.transform.translation.forEach(exact); checkShape(step.expectedResult);
  }
}
function checkText(text) {
  if (typeof text !== 'string' || text.length > LIMITS.bytes || new TextEncoder().encode(text).length > LIMITS.bytes) fail('Files must be no larger than 1 MiB.');
}
export function encodeWorkspace(session, currentRule) {
  const derivation = session.export();
  const selectedRule = { left: serializeShape(currentRule.left), right: serializeShape(currentRule.right) };
  checkDerivation(derivation); checkRule(selectedRule);
  const text = JSON.stringify({ format:'ShapeGrammar.lab', version:1, derivation, rule:selectedRule }, null, 2);
  checkText(text); return text;
}
export function decodeWorkspace(text) {
  checkText(text);
  const data = JSON.parse(text);
  const legacy = data?.format === 'ShapeGrammar.derivation';
  if (!legacy && (data?.format !== 'ShapeGrammar.lab' || data.version !== 1)) fail('Unsupported laboratory format or version.');
  const derivation = legacy ? data : data.derivation;
  checkDerivation(derivation);
  const selectedRule = legacy ? derivation.steps.at(-1)?.rule ?? null : data.rule;
  if (selectedRule) checkRule(selectedRule);
  else if (!legacy) fail('Missing selected rule.');
  // Replay into a new object. Failure never changes the open workspace.
  const session = Derivation.import(derivation);
  return { session, rule:selectedRule ? rule(selectedRule) : null, legacy };
}
export function saveWorkspace(storage, text) {
  decodeWorkspace(text); // Validate before replacing an existing saved copy.
  storage.setItem(STORAGE_KEY, text);
}
export function restoreWorkspace(storage) {
  const text = storage.getItem(STORAGE_KEY);
  if (text === null) fail('No saved workspace on this browser.');
  return decodeWorkspace(text);
}

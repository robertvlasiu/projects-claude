/**
 * Tamper-evidence hash-chain helpers.
 *
 * Each section's entries (incidents, expenses, exchanges) form a chain ordered
 * by their immutable `createdAt`. Every row stores `prevHash` (the previous
 * row's hash) and its own `hash`, derived from prevHash + id + createdAt. This
 * makes deletion or reordering detectable: recomputing the chain and comparing
 * hashes reveals any break. We hash only immutable fields (id, createdAt) so
 * editing an editable field (e.g. `details`/`occurredAt`) never breaks the
 * chain — that is by design; the chain proves the RECORD's insertion order and
 * timestamps weren't tampered with, while edits are tracked separately via
 * `editedAt`.
 *
 * A small, dependency-free SHA-256 is vendored below so hashing is synchronous
 * at insert time (expo-crypto only exposes an async digest).
 */
import type { ChainedEntry } from "./types";

/** Synchronous SHA-256 returning a lowercase hex string. */
export function sha256(message: string): string {
  // Pre-processing: convert string to UTF-8 bytes.
  const bytes = utf8Bytes(message);

  // Initial hash values (first 32 bits of fractional parts of sqrt of first 8 primes).
  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);

  // Round constants (first 32 bits of fractional parts of cube roots of first 64 primes).
  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  // Padding.
  const l = bytes.length;
  const bitLen = l * 8;
  const withOne = l + 1;
  const padded = new Uint8Array((Math.ceil((withOne + 8) / 64)) * 64);
  padded.set(bytes);
  padded[l] = 0x80;
  // Append 64-bit big-endian length (we only support lengths < 2^32 bytes).
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);

  const w = new Uint32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = dv.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;

    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + k[t] + w[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  let hex = "";
  for (let i = 0; i < 8; i++) hex += h[i].toString(16).padStart(8, "0");
  return hex;
}

function rotr(n: number, x: number): number {
  return (n >>> x) | (n << (32 - x));
}

function utf8Bytes(str: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // Surrogate pair.
      const hi = code;
      const lo = str.charCodeAt(++i);
      code = 0x10000 + ((hi & 0x3ff) << 10) + (lo & 0x3ff);
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      out.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return Uint8Array.from(out);
}

/** Compute the hash for one link given the previous hash and immutable fields. */
export function linkHash(prevHash: string, id: string, createdAt: string): string {
  return sha256(`${prevHash}|${id}|${createdAt}`);
}

/**
 * (Re)build the chain over a list of entries ordered by createdAt ascending,
 * assigning prevHash/hash to each. Returns the same array (mutated) for
 * convenience. Used on insert and after delete to keep the chain contiguous.
 */
export function rechain<T extends ChainedEntry & { id: string }>(
  ordered: T[]
): T[] {
  let prev = "";
  for (const row of ordered) {
    row.prevHash = prev;
    row.hash = linkHash(prev, row.id, row.createdAt);
    prev = row.hash;
  }
  return ordered;
}

export interface ChainCheck {
  ok: boolean;
  count: number;
  /** Hash of the final link, a compact fingerprint of the whole chain. */
  tip: string;
}

/**
 * Verify a chain by recomputing it from immutable fields and comparing stored
 * hashes. Entries are assumed ordered by createdAt ascending.
 */
export function verifyChain<T extends ChainedEntry & { id: string }>(
  ordered: T[]
): ChainCheck {
  let prev = "";
  let ok = true;
  for (const row of ordered) {
    const expected = linkHash(prev, row.id, row.createdAt);
    if (row.prevHash !== prev || row.hash !== expected) ok = false;
    prev = expected;
  }
  return { ok, count: ordered.length, tip: prev };
}

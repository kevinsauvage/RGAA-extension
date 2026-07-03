/**
 * Generates simple brand-colored rounded-square PNG icons with no external
 * dependencies. Replace public/icons/* with real artwork before publishing.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons');

const BRAND = [31, 99, 235]; // #1f63eb

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makePng(size) {
  const radius = Math.round(size * 0.22);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let pos = 0;
  const inside = (x, y) => {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const cx = clamp(x, radius, size - 1 - radius);
    const cy = clamp(y, radius, size - 1 - radius);
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius + 0.5;
  };
  for (let y = 0; y < size; y++) {
    raw[pos++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const on = inside(x, y);
      raw[pos++] = BRAND[0];
      raw[pos++] = BRAND[1];
      raw[pos++] = BRAND[2];
      raw[pos++] = on ? 255 : 0;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  writeFileSync(resolve(OUT_DIR, `icon-${size}.png`), makePng(size));
  console.log(`icon-${size}.png`);
}

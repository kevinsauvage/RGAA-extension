/**
 * Generates brand PNG icons with a simplified accessibility (person-in-circle) mark.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons');

const BRAND = [31, 99, 235];
const WHITE = [255, 255, 255];

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

function roundedRect(x, y, w, h, r) {
  return (px, py) => {
    const cx = Math.max(x + r, Math.min(px, x + w - r));
    const cy = Math.max(y + r, Math.min(py, y + h - r));
    const dx = px - cx;
    const dy = py - cy;
    const inCorner = (px < x + r || px > x + w - r) && (py < y + r || py > y + h - r);
    if (!inCorner) return true;
    return dx * dx + dy * dy <= r * r;
  };
}

/** Simple universal-accessibility silhouette centered in the icon. */
function accessibilityMark(size) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size / 128;
  const headR = 10 * s;
  const bodyW = 34 * s;
  const bodyH = 44 * s;
  const armSpan = 52 * s;

  return (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + (dy + 18 * s) * (dy + 18 * s) <= headR * headR) return true;
    if (Math.abs(dx) <= bodyW / 2 && dy >= -2 * s && dy <= bodyH) return true;
    const armY = 8 * s;
    if (Math.abs(dy - armY) <= 5 * s && Math.abs(dx) <= armSpan / 2) return true;
    return false;
  };
}

function makePng(size) {
  const bg = roundedRect(0, 0, size, size, Math.round(size * 0.22));
  const mark = accessibilityMark(size);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let pos = 0;

  for (let y = 0; y < size; y++) {
    raw[pos++] = 0;
    for (let x = 0; x < size; x++) {
      const onBg = bg(x, y);
      const onMark = mark(x, y);
      const color = onBg ? (onMark ? WHITE : BRAND) : [0, 0, 0, 0];
      raw[pos++] = color[0];
      raw[pos++] = color[1];
      raw[pos++] = color[2];
      raw[pos++] = onBg ? 255 : 0;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

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

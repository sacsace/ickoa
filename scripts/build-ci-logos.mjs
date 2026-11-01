import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cursorAssets =
  "C:/Users/NXTGN-PC/.cursor/projects/d-Software-Project-ICKOA/assets";

/** Clear circular emblem — sharp source used for all composed variants. */
const SRC_CLEAR = path.join(
  cursorAssets,
  "_________________-2-85be774b-a106-40a3-a721-93cd1fe4d0e3.png",
);
const FONT_BOLD = "C:/Windows/Fonts/malgunbd.ttf";
const FONT_REG = "C:/Windows/Fonts/malgun.ttf";
const THRESHOLD = 28;

function knockOutEdgeBlack(data, width, height) {
  const n = width * height;
  const isBg = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (
      data[o] <= THRESHOLD &&
      data[o + 1] <= THRESHOLD &&
      data[o + 2] <= THRESHOLD
    ) {
      isBg[i] = 1;
    }
  }

  const visited = new Uint8Array(n);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i] || !isBg[i]) return;
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    data[i * 4 + 3] = 0;
    const x = i % width;
    const y = (i / width) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

async function loadTransparent(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  knockOutEdgeBlack(data, info.width, info.height);
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

async function trimTransparent(buf) {
  return sharp(buf).trim({ threshold: 0 }).png().toBuffer({ resolveWithObject: true });
}

function wordmarkSvg({ width, height, ko, en, koSize, enSize, align = "left", gap = 12 }) {
  const anchor = align === "center" ? "middle" : "start";
  const x = align === "center" ? width / 2 : 0;
  const koY = Math.round(koSize * 0.92);
  const enY = koY + gap + enSize;
  const boldUrl = FONT_BOLD.replace(/\\/g, "/");
  const regUrl = FONT_REG.replace(/\\/g, "/");
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css"><![CDATA[
      @font-face { font-family: 'CiKo'; src: url('file:///${boldUrl}'); }
      @font-face { font-family: 'CiEn'; src: url('file:///${regUrl}'); }
      .ko { font-family: 'CiKo', 'Malgun Gothic', sans-serif; font-size: ${koSize}px; fill: #111111; }
      .en { font-family: 'CiEn', Arial, sans-serif; font-size: ${enSize}px; fill: #333333; letter-spacing: 0.06em; }
    ]]></style>
  </defs>
  <text x="${x}" y="${koY}" text-anchor="${anchor}" class="ko">${ko}</text>
  <text x="${x}" y="${enY}" text-anchor="${anchor}" class="en">${en}</text>
</svg>`);
}

async function main() {
  const clearRaw = await loadTransparent(SRC_CLEAR);
  const clearTrim = await trimTransparent(clearRaw.data);

  // 1) Clear emblem (full native resolution)
  const clearPath = path.join(root, "public/ci/logo-circle-clear.png");
  await sharp(clearTrim.data).png().toFile(clearPath);
  console.log("wrote", clearPath, `${clearTrim.info.width}x${clearTrim.info.height}`);

  // 2) Stacked signature — large emblem + wordmark (same sharp source)
  const stackEmblem = await sharp(clearTrim.data)
    .resize({ width: 900, height: 900, fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });

  const stackTextW = 1000;
  const stackTextH = 220;
  const stackText = await sharp(
    wordmarkSvg({
      width: stackTextW,
      height: stackTextH,
      ko: "첸나이 한인회",
      en: "KOREAN ASSOCIATION IN CHENNAI",
      koSize: 72,
      enSize: 28,
      align: "center",
      gap: 20,
    }),
  )
    .png()
    .toBuffer();

  const stackGap = 48;
  const stackW = Math.max(stackEmblem.info.width, stackTextW);
  const stackH = stackEmblem.info.height + stackGap + stackTextH;
  const stackPath = path.join(root, "public/ci/logo-circle.png");
  await sharp({
    create: {
      width: stackW,
      height: stackH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: stackEmblem.data,
        left: Math.round((stackW - stackEmblem.info.width) / 2),
        top: 0,
      },
      {
        input: stackText,
        left: Math.round((stackW - stackTextW) / 2),
        top: stackEmblem.info.height + stackGap,
      },
    ])
    .png()
    .toFile(stackPath);
  const stackMeta = await sharp(stackPath).metadata();
  console.log("wrote", stackPath, `${stackMeta.width}x${stackMeta.height}`);

  // 3) Horizontal — large emblem + wordmark beside it
  const hEmblem = await sharp(clearTrim.data)
    .resize({ width: 520, height: 520, fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });

  const textW = 980;
  const textH = 220;
  const hText = await sharp(
    wordmarkSvg({
      width: textW,
      height: textH,
      ko: "첸나이 한인회",
      en: "KOREAN ASSOCIATION IN CHENNAI",
      koSize: 84,
      enSize: 30,
      align: "left",
      gap: 22,
    }),
  )
    .png()
    .toBuffer();

  const hGap = 56;
  const hW = hEmblem.info.width + hGap + textW;
  const hH = Math.max(hEmblem.info.height, textH);
  const hPath = path.join(root, "public/ci/logo-horizontal.png");
  await sharp({
    create: {
      width: hW,
      height: hH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: hEmblem.data,
        left: 0,
        top: Math.round((hH - hEmblem.info.height) / 2),
      },
      {
        input: hText,
        left: hEmblem.info.width + hGap,
        top: Math.round((hH - textH) / 2) + 8,
      },
    ])
    .png()
    .toFile(hPath);
  const hMeta = await sharp(hPath).metadata();
  console.log("wrote", hPath, `${hMeta.width}x${hMeta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

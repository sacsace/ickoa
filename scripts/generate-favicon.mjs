import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public/logo.png");
const appDir = path.join(root, "src/app");

const BLACK_THRESHOLD = 48;

async function logoWithoutBlackBg() {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .trim();
}

async function writePng(pipeline, size, outPath) {
  await pipeline
    .clone()
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}

async function main() {
  const transparentLogo = await logoWithoutBlackBg();

  await writePng(transparentLogo, 32, path.join(appDir, "icon.png"));
  await writePng(transparentLogo, 180, path.join(appDir, "apple-icon.png"));

  const tmp32 = path.join(root, "tmp-favicon-32.png");
  await writePng(transparentLogo, 32, tmp32);

  const ico = await pngToIco(tmp32);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), ico);
  fs.unlinkSync(tmp32);

  console.log("Favicon files updated (transparent circular logo)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

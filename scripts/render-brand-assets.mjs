import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const temp = await mkdtemp(join(tmpdir(), "wezel-brand-"));
const { default: sharp } = await import("sharp");

try {
  // Outline the vendored fonts so exports cannot silently use system fallbacks.
  // Requires the FontTools CLI with WOFF2 support.
  for (const family of ["barlow-semi-condensed", "source-sans-3", "jetbrains-mono"]) {
    execFileSync("fonttools", ["ttLib.woff2", "decompress", join(publicDir, `fonts/${family}-latin.woff2`), "-o", join(temp, `${family}.ttf`)]);
  }
  const mark = await readFile(join(publicDir, "brand/wezel-mark-cut.svg"));
  for (const [file, size] of [
    ["favicon-16x16.png", 16],
    ["favicon-32x32.png", 32],
    ["apple-touch-icon.png", 180],
    ["brand/wezel-mark-cut.png", 512],
  ]) {
    await sharp(mark, { density: 600 }).resize(size, size).png().toFile(join(publicDir, file));
  }

  const layers = [];
  const text = async (value, family, weight, size, color, left, top) => {
    const args = ["pens.svgPathPen", join(temp, `${family}.ttf`), value];
    if (family !== "barlow-semi-condensed") args.push("--variations", `wght=${weight}`);
    const svg = execFileSync("fonttools", args, { encoding: "utf8" })
      .replace("<svg ", `<svg fill="${color}" `);
    const outlined = sharp(Buffer.from(svg));
    const dimensions = await outlined.metadata();
    // All three font families use 1000 units per em.
    const width = Math.round(dimensions.width * size / 1000);
    const height = Math.round(dimensions.height * size / 1000);
    const input = await outlined.resize(width, height).png().toBuffer();
    if (left + width > 1128 || top + height > 558) {
      throw new Error(`Social preview text overflows: ${value}`);
    }
    layers.push({ input, left, top });
    return width;
  };

  layers.push({ input: await sharp(mark).resize(48, 48).png().toBuffer(), left: 72, top: 72 });
  await text("wezel", "barlow-semi-condensed", 600, 38, "#1c201e", 135, 68);
  await text("Your build,", "source-sans-3", 720, 88, "#1c201e", 72, 182);
  const alwaysWidth = await text("always", "source-sans-3", 720, 88, "#2e8058", 72, 279);
  await text(" at its best", "source-sans-3", 720, 88, "#1c201e", 72 + alwaysWidth, 279);
  await text("wezel.build", "jetbrains-mono", 400, 22, "#535a56", 72, 511);
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#f6f7f4" } })
    .composite(layers).png().toFile(join(publicDir, "og.png"));
  console.log("Rendered mineral brand icons and 1200x630 social preview.");
} finally {
  await rm(temp, { recursive: true, force: true });
}

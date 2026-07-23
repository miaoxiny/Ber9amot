import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const artifactPath = require.resolve("@oai/artifact-tool");
const { FileBlob, PresentationFile } = await import(pathToFileURL(artifactPath).href);

const ROOT = "D:\\Dropbox\\Dropbox\\RNAseq 2025\\Time analysis";
const SOURCE = path.join(ROOT, "handmade.pptx");
const TMP = path.join(ROOT, "work", "presentations", "handmade-revision", "tmp");
const PREVIEW = path.join(TMP, "source-preview");
const LAYOUT = path.join(TMP, "source-layout");
await fs.mkdir(PREVIEW, { recursive: true });
await fs.mkdir(LAYOUT, { recursive: true });

async function writeBlob(file, b) {
  await fs.writeFile(file, new Uint8Array(await b.arrayBuffer()));
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(SOURCE));
const inspect = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,layout",
  maxChars: 50000,
});
await fs.writeFile(path.join(TMP, "source-inspect.ndjson"), inspect.ndjson);

for (const [i, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(i + 1).padStart(2, "0")}`;
  await writeBlob(path.join(PREVIEW, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(LAYOUT, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
}
await writeBlob(path.join(PREVIEW, "source-montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 1 }));

console.log(JSON.stringify({
  source: SOURCE,
  slides: presentation.slides.items.length,
  preview: PREVIEW,
  inspect: path.join(TMP, "source-inspect.ndjson"),
}, null, 2));

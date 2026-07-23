import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const artifactPath = require.resolve("@oai/artifact-tool");
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactPath).href);

const ROOT = "D:\\Dropbox\\Dropbox\\RNAseq 2025\\Time analysis";
const OUT_DIR = path.join(ROOT, "outputs");
const TMP_DIR = path.join(ROOT, "work", "presentations", "results-showcase", "tmp-designed");
const PREVIEW_DIR = path.join(TMP_DIR, "preview");
const LAYOUT_DIR = path.join(TMP_DIR, "layout");
const QA_DIR = path.join(TMP_DIR, "qa");
const FINAL_PPTX = path.join(OUT_DIR, "handmade_results_showcase_designed.pptx");

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(PREVIEW_DIR, { recursive: true });
await fs.mkdir(LAYOUT_DIR, { recursive: true });
await fs.mkdir(QA_DIR, { recursive: true });

const W = 1280;
const H = 720;
const C = {
  bg: "#F6F8FA",
  ink: "#102033",
  muted: "#5B6878",
  navy: "#102A43",
  navy2: "#183B56",
  teal: "#087F8C",
  tealDark: "#075E67",
  mint: "#E3F4F1",
  amber: "#D97706",
  red: "#B42318",
  blue: "#2F6DB5",
  green: "#047857",
  line: "#CBD5E1",
  white: "#FFFFFF",
  soft: "#EEF3F7",
};

const A = {
  library: path.join(ROOT, "results", "01_QC", "01_library_size.png"),
  genes: path.join(ROOT, "results", "01_QC", "02_detected_genes.png"),
  corr: path.join(ROOT, "results", "01_QC", "03_sample_correlation_heatmap_FINAL.png"),
  pcaAfter: path.join(ROOT, "results", "01_QC", "05_PCA_after_correction_FINAL.png"),
  markers: path.join(ROOT, "results", "02_composition", "07_celltype_marker_TPM.png"),
  volcano: path.join(ROOT, "results", "03_DEG", "04_volcano_5v0_v6.png"),
  heatmap: path.join(ROOT, "results", "03_DEG", "06_DEG_heatmap_5v0_v4.png"),
  lrt19: path.join(ROOT, "results", "objects", "LRT_19_trajectory_VSTzscore_v1.png"),
  trajectory: path.join(ROOT, "results", "03_DEG", "05_trajectory_6genes.png"),
  rock: path.join(ROOT, "results", "03_DEG", "05b_rock1_vs_rock2_trajectory.png"),
  go5: path.join(ROOT, "results", "04_GSEA", "08_GSEA_GO_BP_5v0_barplot.png"),
  kegg5: path.join(ROOT, "results", "04_GSEA", "09_GSEA_KEGG_5v0_barplot.png"),
  go15v5: path.join(ROOT, "results", "04_GSEA", "10_GSEA_GO_BP_15v5_barplot.png"),
  kegg15v0: path.join(ROOT, "results", "04_GSEA", "12_GSEA_KEGG_15v0_barplot.png"),
  mirror: path.join(ROOT, "results", "04_GSEA", "13_GSEA_mirror_scatter_5v0_vs_15v5.png"),
};

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}
async function writeBlob(file, b) {
  await fs.writeFile(file, new Uint8Array(await b.arrayBuffer()));
}
function shape(slide, position, fill = C.white, line = C.line, geometry = "roundRect", radius = 8) {
  const lineFill = line === "none" ? fill : line;
  const cfg = {
    geometry,
    position,
    fill,
    line: { style: "solid", fill: lineFill, width: line === "none" ? 0 : 1 },
  };
  if (["rect", "textbox", "roundRect"].includes(geometry)) cfg.borderRadius = radius;
  return slide.shapes.add(cfg);
}
function txt(slide, value, position, opt = {}) {
  const s = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  s.text = value;
  s.text.style = {
    typeface: opt.typeface ?? "Aptos",
    fontSize: opt.size ?? 20,
    bold: opt.bold ?? false,
    color: opt.color ?? C.ink,
    alignment: opt.alignment ?? "left",
  };
  return s;
}
async function img(slide, file, position, alt, opt = {}) {
  if (opt.frame !== false) {
    shape(slide, { left: position.left - 8, top: position.top - 8, width: position.width + 16, height: position.height + 16 }, opt.frameFill ?? C.white, opt.frameLine ?? C.line, "roundRect", 8);
  }
  slide.images.add({
    blob: await bytes(file),
    contentType: "image/png",
    alt,
    fit: opt.fit ?? "contain",
    position,
  });
}
function footer(slide, n, source = "Acute Netrin-1 RNA-seq results") {
  txt(slide, source, { left: 54, top: 686, width: 820, height: 20 }, { size: 10.5, color: "#7B8794" });
  txt(slide, String(n).padStart(2, "0"), { left: 1172, top: 684, width: 50, height: 20 }, { size: 11, bold: true, color: "#7B8794", alignment: "right" });
}
function header(slide, tag, title, sub = "") {
  txt(slide, tag.toUpperCase(), { left: 72, top: 36, width: 420, height: 22 }, { size: 12, bold: true, color: C.teal });
  txt(slide, title, { left: 72, top: 72, width: 980, height: 76 }, { size: title.length > 72 ? 30 : 35, bold: true, color: C.ink, typeface: "Aptos Display" });
  if (sub) txt(slide, sub, { left: 72, top: 148, width: 930, height: 28 }, { size: 16, color: C.muted });
  shape(slide, { left: 72, top: 184, width: 118, height: 4 }, C.amber, C.amber, "rect", 0);
}
function note(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines);
  slide.speakerNotes.setVisible(true);
}
function kpi(slide, value, label, x, y, w = 190, fill = C.white, color = C.teal) {
  shape(slide, { left: x, top: y, width: w, height: 118 }, fill, C.line);
  txt(slide, value, { left: x + 12, top: y + 18, width: w - 24, height: 48 }, { size: 38, bold: true, color, alignment: "center", typeface: "Aptos Display" });
  txt(slide, label, { left: x + 18, top: y + 74, width: w - 36, height: 28 }, { size: 13.5, color: C.muted, alignment: "center" });
}
function pills(slide, items, y) {
  const start = 84, gap = 18, w = 172;
  items.forEach((it, i) => {
    const x = start + i * (w + gap);
    shape(slide, { left: x, top: y, width: w, height: 84 }, i % 2 ? C.mint : C.white, C.line);
    txt(slide, it[0], { left: x + 14, top: y + 16, width: w - 28, height: 24 }, { size: 17, bold: true, color: i % 2 ? C.tealDark : C.navy, alignment: "center" });
    txt(slide, it[1], { left: x + 14, top: y + 46, width: w - 28, height: 24 }, { size: 12.5, color: C.muted, alignment: "center" });
    if (i < items.length - 1) txt(slide, ">", { left: x + w + 1, top: y + 22, width: 18, height: 28 }, { size: 24, bold: true, color: C.amber, alignment: "center" });
  });
}
function bullets(slide, list, pos, size = 16) {
  txt(slide, list.map(x => `- ${x}`).join("\n"), pos, { size, color: C.ink });
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });
function slide(bg = C.bg) {
  const s = deck.slides.add();
  s.background.fill = bg;
  return s;
}
let n = 0;

// 1 Dark title with results map
{
  const s = slide(C.navy); n++;
  shape(s, { left: 0, top: 0, width: 1280, height: 720 }, C.navy, "none", "rect", 0);
  shape(s, { left: 0, top: 0, width: 330, height: 720 }, C.tealDark, "none", "rect", 0);
  txt(s, "RESULTS SHOWCASE", { left: 72, top: 70, width: 240, height: 22 }, { size: 13, bold: true, color: "#BFE8E2" });
  txt(s, "Acute Netrin-1 RNA-seq", { left: 72, top: 122, width: 420, height: 70 }, { size: 44, bold: true, color: C.white, typeface: "Aptos Display" });
  txt(s, "A 5-min transcriptional pulse that reverses by 15 min", { left: 72, top: 218, width: 390, height: 58 }, { size: 23, color: "#E6F4F1" });
  const xs = [440, 640, 840, 1040];
  [["QC", "interpretable"], ["DEG", "acute anchors"], ["LRT", "time genes"], ["GSEA", "reversal"]].forEach((d, i) => {
    shape(s, { left: xs[i], top: 300, width: 150, height: 150 }, i === 1 ? "#FFF7ED" : C.white, "none");
    txt(s, d[0], { left: xs[i] + 18, top: 334, width: 114, height: 42 }, { size: 33, bold: true, color: i === 1 ? C.amber : C.teal, alignment: "center", typeface: "Aptos Display" });
    txt(s, d[1], { left: xs[i] + 18, top: 392, width: 114, height: 26 }, { size: 13.5, color: C.muted, alignment: "center" });
  });
  txt(s, "32 DEGs  |  19 LRT genes  |  313 GO BP terms  |  r = -0.991 pathway mirror", { left: 440, top: 520, width: 720, height: 30 }, { size: 21, bold: true, color: C.white, alignment: "center" });
  footer(s, n, "Re-designed from handmade.pptx");
  note(s, ["Open with the results arc. This is the redesigned version based on the handmade content, with a more varied layout system."]);
}

// 2 Contrast map
{
  const s = slide(); n++;
  header(s, "Experimental contrasts", "The result sequence follows onset, time-dependence, then reversal", "The handmade analysis is reorganized around the biological question each contrast answers.");
  pills(s, [["Vehicle", "PBS control"], ["5 min", "acute Netrin-1"], ["15 min", "later Netrin-1"], ["5v0", "onset"], ["15v5", "reversal"], ["15v0", "endpoint"]], 250);
  shape(s, { left: 145, top: 430, width: 990, height: 120 }, C.white, C.line);
  txt(s, "Statistical backbone", { left: 190, top: 460, width: 220, height: 28 }, { size: 23, bold: true, color: C.teal });
  txt(s, "DESeq2 model: ~ replicate + timepoint. Wald contrasts summarize pairwise effects; LRT tests whether a gene changes anywhere across the time course; GSEA ranks genes by Wald statistic.", { left: 410, top: 456, width: 660, height: 52 }, { size: 18, color: C.ink });
  footer(s, n, "Source: handmade methods slides");
  note(s, ["Use this as a clean map before showing results."]);
}

// 3 QC split with diagonal visual rhythm
{
  const s = slide(); n++;
  header(s, "QC and filtering", "Sample depth is comparable after filtering to 14,161 genes", "This condenses the handmade filtering and sequencing-depth slides into one result page.");
  shape(s, { left: 58, top: 230, width: 545, height: 310 }, C.white, C.line);
  shape(s, { left: 676, top: 230, width: 545, height: 310 }, C.white, C.line);
  await img(s, A.library, { left: 90, top: 258, width: 480, height: 252 }, "Library size", { frame: false });
  await img(s, A.genes, { left: 708, top: 258, width: 480, height: 252 }, "Detected genes", { frame: false });
  shape(s, { left: 405, top: 558, width: 470, height: 56 }, C.mint, C.line);
  txt(s, "32,623 quantified genes -> 14,161 genes for DE analysis", { left: 432, top: 574, width: 416, height: 24 }, { size: 18, bold: true, color: C.ink, alignment: "center" });
  footer(s, n, "Source: results/01_QC");
  note(s, ["Filtering and basic QC are shown together so the result flow does not stall early."]);
}

// 4 Correlation/PCA asymmetric
{
  const s = slide(); n++;
  header(s, "Sample structure", "Replicate effects are visible, but corrected PCA reveals timepoint structure", "This supports the model choice and the biological interpretation.");
  await img(s, A.corr, { left: 82, top: 214, width: 410, height: 360 }, "Sample correlation");
  await img(s, A.pcaAfter, { left: 558, top: 188, width: 575, height: 410 }, "PCA after correction");
  shape(s, { left: 82, top: 590, width: 1050, height: 38 }, C.white, C.line);
  txt(s, "Replicate was included in the DESeq2 model; batch correction was used only for PCA visualization.", { left: 120, top: 600, width: 974, height: 18 }, { size: 16.5, bold: true, alignment: "center" });
  footer(s, n, "Source: results/01_QC");
  note(s, ["State this carefully; it is one of the most important statistical safeguards."]);
}

// 5 Composition wide figure
{
  const s = slide(); n++;
  header(s, "Culture composition", "Marker expression supports neuron-dominant, composition-stable cultures", "The transcriptomic response is not explained by a visible cell-composition shift.");
  await img(s, A.markers, { left: 96, top: 204, width: 780, height: 420 }, "Cell marker TPM");
  shape(s, { left: 940, top: 270, width: 220, height: 246 }, C.mint, C.line);
  txt(s, "Key readout", { left: 970, top: 300, width: 160, height: 28 }, { size: 22, bold: true, color: C.teal, alignment: "center" });
  bullets(s, ["Neuronal markers dominate.", "Glial/endothelial markers remain low.", "Conditions are nearly overlapping."], { left: 970, top: 354, width: 160, height: 110 }, 15.5);
  footer(s, n, "Source: results/02_composition");
  note(s, ["This follows the handmade marker slide but with a cleaner figure-first design."]);
}

// 6 DEG overview table + metrics
{
  const s = slide(); n++;
  header(s, "DEG overview", "The largest single-gene response occurs at 5 min", "The DEG layer gives acute anchors, while LRT and GSEA provide the temporal and pathway layers.");
  kpi(s, "32", "5v0 relaxed DEGs", 88, 242, 170, C.white, C.teal);
  kpi(s, "5", "5v0 strict DEGs", 88, 398, 170, C.white, C.amber);
  const rows = [
    ["Contrast", "Question", "Relaxed", "Strict", "Direction"],
    ["5v0", "onset", "32", "5", "14 up / 18 down"],
    ["15v5", "reversal", "6", "2", "6 up / 0 down"],
    ["15v0", "endpoint", "1", "1", "0 up / 1 down"],
    ["LRT", "time effect", "19", "n/a", "time-varying genes"],
  ];
  const tx = 316, ty = 232, tw = 850, rh = 54;
  const col = [0, 138, 315, 458, 574, 850];
  rows.forEach((r, ri) => {
    const fill = ri === 0 ? C.navy : ri % 2 ? C.white : "#F8FAFC";
    shape(s, { left: tx, top: ty + ri * rh, width: tw, height: rh }, fill, C.line, "rect", 0);
    for (let ci = 1; ci < col.length - 1; ci++) {
      shape(s, { left: tx + col[ci], top: ty + ri * rh, width: 1, height: rh }, C.line, C.line, "rect", 0);
    }
    r.forEach((cell, ci) => {
      txt(s, cell, { left: tx + col[ci] + 10, top: ty + ri * rh + 16, width: col[ci + 1] - col[ci] - 20, height: 22 }, {
        size: ri === 0 ? 13.5 : 15,
        bold: ri === 0 || ci === 0,
        color: ri === 0 ? C.white : C.ink,
        alignment: ci >= 2 && ci <= 3 ? "center" : "left",
      });
    });
  });
  footer(s, n, "Source: DEG CSV files and handmade slide 5");
  note(s, ["This is still your handmade table, but with hierarchy and metrics separated."]);
}

// 7 Volcano hero
{
  const s = slide(C.soft); n++;
  shape(s, { left: 0, top: 0, width: 1280, height: 720 }, C.soft, "none", "rect", 0);
  txt(s, "5-MIN DIFFERENTIAL EXPRESSION", { left: 70, top: 40, width: 420, height: 22 }, { size: 12, bold: true, color: C.teal });
  txt(s, "A small DEG set captures interpretable acute response genes", { left: 70, top: 78, width: 690, height: 76 }, { size: 34, bold: true, color: C.ink, typeface: "Aptos Display" });
  await img(s, A.volcano, { left: 72, top: 178, width: 760, height: 452 }, "5v0 volcano");
  shape(s, { left: 890, top: 190, width: 260, height: 330 }, C.white, C.line);
  txt(s, "Gene anchors", { left: 920, top: 222, width: 200, height: 28 }, { size: 23, bold: true, color: C.teal, alignment: "center" });
  bullets(s, ["Fos: IEG suppression", "Rock1: cytoskeleton", "Srsf5/Snrnp70: splicing", "Cntn2: axon guidance", "Nos1/Ryr3: NO-calcium"], { left: 918, top: 282, width: 204, height: 166 }, 16.5);
  footer(s, n, "Source: results/03_DEG/04_volcano_5v0_v6.png");
  note(s, ["The volcano plot is treated as a hero figure rather than one more small panel."]);
}

// 8 DEG modules
{
  const s = slide(); n++;
  header(s, "DEG modules", "Representative 5-min DEGs split into suppressed and activated modules", "This makes the biological direction clearer than a plain gene list.");
  const left = [
    ["Fos", "-2.35", "IEG"],
    ["Rock1", "-0.43", "cytoskeleton"],
    ["Srsf5", "-0.31", "splicing"],
    ["Snrnp70", "-0.27", "splicing"],
  ];
  const right = [
    ["Cntn2", "+0.25", "axon guidance"],
    ["Nos1", "+0.32", "NO-calcium"],
    ["Ryr3", "+0.47", "calcium release"],
    ["Tln2", "+0.39", "adhesion"],
  ];
  function geneList(x, titleText, rows, color, fill) {
    shape(s, { left: x, top: 228, width: 470, height: 330 }, fill, C.line);
    txt(s, titleText, { left: x + 28, top: 258, width: 414, height: 32 }, { size: 25, bold: true, color, alignment: "center" });
    rows.forEach((r, i) => {
      const y = 316 + i * 48;
      txt(s, r[0], { left: x + 44, top: y, width: 120, height: 24 }, { size: 19, bold: true, color: C.ink });
      txt(s, r[1], { left: x + 185, top: y, width: 90, height: 24 }, { size: 18, bold: true, color });
      txt(s, r[2], { left: x + 300, top: y, width: 130, height: 24 }, { size: 16, color: C.muted });
    });
  }
  geneList(116, "Suppressed at 5 min", left, C.red, C.white);
  geneList(694, "Activated at 5 min", right, C.green, C.mint);
  footer(s, n, "Source: DEG_5v0_ALL.csv and handmade slide 7");
  note(s, ["This replaces the table-only feel with a directional module layout."]);
}

// 9 Heatmap stage
{
  const s = slide(); n++;
  header(s, "DEG heatmap", "The 5-min DEG set forms a coherent sample-level expression pattern", "The heatmap supports a coordinated acute response rather than isolated outliers.");
  await img(s, A.heatmap, { left: 228, top: 196, width: 650, height: 430 }, "DEG heatmap");
  shape(s, { left: 912, top: 304, width: 210, height: 172 }, C.white, C.line);
  txt(s, "Interpretation", { left: 938, top: 332, width: 158, height: 26 }, { size: 20, bold: true, color: C.teal, alignment: "center" });
  txt(s, "The response is distributed across the selected DEG set and visible at sample level.", { left: 938, top: 382, width: 158, height: 58 }, { size: 15.5, alignment: "center" });
  footer(s, n, "Source: results/03_DEG/06_DEG_heatmap_5v0_v4.png");
  note(s, ["Another result visual, but with a different stage-like layout."]);
}

// 10 LRT explanation
{
  const s = slide(); n++;
  header(s, "LRT analysis", "LRT tests time-dependence rather than a single pairwise contrast", "This turns the handmade LRT title slide into a scientifically explicit result slide.");
  shape(s, { left: 118, top: 246, width: 300, height: 230 }, C.white, C.line);
  txt(s, "Full model", { left: 150, top: 276, width: 236, height: 30 }, { size: 23, bold: true, color: C.navy, alignment: "center" });
  txt(s, "~ replicate + timepoint", { left: 150, top: 352, width: 236, height: 30 }, { size: 20, alignment: "center" });
  shape(s, { left: 490, top: 246, width: 300, height: 230 }, C.white, C.line);
  txt(s, "Reduced model", { left: 522, top: 276, width: 236, height: 30 }, { size: 23, bold: true, color: C.navy, alignment: "center" });
  txt(s, "~ replicate", { left: 522, top: 352, width: 236, height: 30 }, { size: 20, alignment: "center" });
  shape(s, { left: 862, top: 246, width: 300, height: 230 }, C.mint, C.line);
  txt(s, "Trajectory y-axis", { left: 894, top: 276, width: 236, height: 30 }, { size: 23, bold: true, color: C.teal, alignment: "center" });
  txt(s, "Z-score of VST-normalized expression", { left: 894, top: 340, width: 236, height: 56 }, { size: 20, bold: true, alignment: "center" });
  kpi(s, "19", "time-varying genes", 545, 528, 190, C.white, C.amber);
  footer(s, n, "Source: DESeq2 LRT");
  note(s, ["Explain why log2FC is not the best y-axis for LRT trajectories."]);
}

// 11 LRT trajectory
{
  const s = slide(); n++;
  header(s, "LRT trajectories", "Nineteen time-varying genes show coordinated 5-min deviation and recovery/rebound", "Values are scaled per gene to emphasize temporal shape.");
  await img(s, A.lrt19, { left: 72, top: 190, width: 880, height: 450 }, "LRT 19 trajectories");
  shape(s, { left: 996, top: 266, width: 190, height: 244 }, C.mint, C.line);
  txt(s, "Readout", { left: 1020, top: 296, width: 142, height: 26 }, { size: 21, bold: true, color: C.teal, alignment: "center" });
  bullets(s, ["Rows are genes.", "Pulse-like profiles dominate.", "Fos/Npas4 support IEG suppression."], { left: 1020, top: 354, width: 142, height: 100 }, 15);
  footer(s, n, "Source: results/objects/LRT_19_trajectory_VSTzscore_v1.png");
  note(s, ["This is the replacement for the sparse handmade LRT slide."]);
}

// 12 Two trajectory panels
{
  const s = slide(C.soft); n++;
  txt(s, "GENE-LEVEL DYNAMICS", { left: 70, top: 38, width: 420, height: 22 }, { size: 12, bold: true, color: C.teal });
  txt(s, "Representative trajectories show pulse-like behavior and ROCK1 specificity", { left: 70, top: 76, width: 900, height: 74 }, { size: 34, bold: true, color: C.ink, typeface: "Aptos Display" });
  await img(s, A.trajectory, { left: 76, top: 196, width: 548, height: 370 }, "Representative gene trajectories");
  await img(s, A.rock, { left: 690, top: 196, width: 500, height: 370 }, "ROCK trajectories");
  shape(s, { left: 265, top: 600, width: 750, height: 42 }, C.white, C.line);
  txt(s, "Rock1 is down at 5 min; Rock2 remains statistically unchanged.", { left: 292, top: 611, width: 696, height: 20 }, { size: 18, bold: true, alignment: "center" });
  footer(s, n, "Source: results/03_DEG trajectory figures");
  note(s, ["This combines two handmade result slides in a more compact visual comparison."]);
}

// 13 GO BP - figure with top kpis
{
  const s = slide(); n++;
  header(s, "5-min GSEA: GO BP", "Netrin-1 activates neuron projection and axon guidance programs within 5 min", "Pathway aggregation reveals a coordinated biological program.");
  await img(s, A.go5, { left: 80, top: 208, width: 790, height: 430 }, "5v0 GO BP");
  kpi(s, "313", "significant GO BP terms", 932, 244, 210, C.white, C.green);
  kpi(s, "285 up", "positive NES terms", 932, 418, 210, C.white, C.teal);
  footer(s, n, "Source: results/04_GSEA/GSEA_GO_BP_5v0.csv");
  note(s, ["This is the central pathway slide."]);
}

// 14 KEGG with text left
{
  const s = slide(); n++;
  header(s, "5-min GSEA: KEGG", "Axon guidance is the top KEGG pathway in the acute response", "This connects the RNA-seq response to Netrin-1's canonical biology.");
  shape(s, { left: 78, top: 252, width: 260, height: 250 }, C.mint, C.line);
  txt(s, "Top pathway", { left: 108, top: 286, width: 200, height: 28 }, { size: 22, bold: true, color: C.teal, alignment: "center" });
  txt(s, "Axon guidance\nNES 2.16\nBH-adjusted p = 4.1e-7", { left: 112, top: 348, width: 192, height: 96 }, { size: 22, bold: true, alignment: "center" });
  await img(s, A.kegg5, { left: 404, top: 196, width: 760, height: 430 }, "5v0 KEGG");
  footer(s, n, "Source: results/04_GSEA/GSEA_KEGG_5v0.csv");
  note(s, ["Different layout from GO BP: text anchor on left, figure on right."]);
}

// 15 Reversal
{
  const s = slide(C.soft); n++;
  txt(s, "15v5 REVERSAL", { left: 72, top: 38, width: 420, height: 22 }, { size: 12, bold: true, color: C.teal });
  txt(s, "By 15 min, the 5-min GO BP program is directionally flipped", { left: 72, top: 76, width: 900, height: 66 }, { size: 34, bold: true, color: C.ink, typeface: "Aptos Display" });
  await img(s, A.go15v5, { left: 92, top: 184, width: 790, height: 440 }, "15v5 GO BP");
  shape(s, { left: 930, top: 230, width: 210, height: 150 }, C.white, C.line);
  txt(s, "295", { left: 960, top: 258, width: 150, height: 50 }, { size: 42, bold: true, color: C.green, alignment: "center" });
  txt(s, "significant terms", { left: 960, top: 326, width: 150, height: 24 }, { size: 14, color: C.muted, alignment: "center" });
  shape(s, { left: 930, top: 420, width: 210, height: 150 }, C.white, C.line);
  txt(s, "264", { left: 960, top: 448, width: 150, height: 50 }, { size: 42, bold: true, color: C.red, alignment: "center" });
  txt(s, "negative NES terms", { left: 960, top: 516, width: 150, height: 24 }, { size: 14, color: C.muted, alignment: "center" });
  footer(s, n, "Source: results/04_GSEA/GSEA_GO_BP_15v5.csv");
  note(s, ["This mirrors the GO BP slide but uses a softer background to mark the second half of the story."]);
}

// 16 Mirror scatter dark accent
{
  const s = slide(C.navy); n++;
  shape(s, { left: 0, top: 0, width: 1280, height: 720 }, C.navy, "none", "rect", 0);
  txt(s, "PATHWAY MIRROR", { left: 72, top: 44, width: 420, height: 22 }, { size: 12, bold: true, color: "#BFE8E2" });
  txt(s, "Shared pathways show near-perfect reversal between 5v0 and 15v5", { left: 72, top: 82, width: 780, height: 78 }, { size: 34, bold: true, color: C.white, typeface: "Aptos Display" });
  await img(s, A.mirror, { left: 76, top: 188, width: 790, height: 442 }, "GSEA mirror scatter", { frameFill: C.white, frameLine: "none" });
  shape(s, { left: 936, top: 244, width: 230, height: 250 }, "#E3F4F1", "none");
  txt(s, "603", { left: 972, top: 282, width: 158, height: 52 }, { size: 48, bold: true, color: C.tealDark, alignment: "center", typeface: "Aptos Display" });
  txt(s, "shared pathways", { left: 972, top: 346, width: 158, height: 26 }, { size: 16, bold: true, color: C.ink, alignment: "center" });
  txt(s, "NES correlation\nr = -0.991", { left: 972, top: 402, width: 158, height: 58 }, { size: 20, bold: true, color: C.ink, alignment: "center" });
  footer(s, n, "Source: results/04_GSEA/13_GSEA_mirror_scatter_5v0_vs_15v5.png");
  note(s, ["This is intentionally a dark accent slide so the strongest result feels visually distinct."]);
}

// 17 15v0 caveat
{
  const s = slide(); n++;
  header(s, "15v0 endpoint", "15v0 supports return toward baseline, with a mild mitochondrial KEGG signal", "This slide keeps the conclusion scientifically careful.");
  await img(s, A.kegg15v0, { left: 100, top: 200, width: 740, height: 426 }, "15v0 KEGG");
  shape(s, { left: 900, top: 250, width: 250, height: 272 }, C.white, C.line);
  txt(s, "Caveat", { left: 930, top: 280, width: 190, height: 28 }, { size: 22, bold: true, color: C.amber, alignment: "center" });
  bullets(s, ["GO BP: 0 significant terms", "DEG: 1 significant gene", "KEGG: OXPHOS/mitochondrial signal", "Disease labels reflect shared mitochondrial genes"], { left: 930, top: 336, width: 190, height: 142 }, 15);
  footer(s, n, "Source: GSEA_GO_BP_15v0.csv and GSEA_KEGG_15v0.csv");
  note(s, ["Keep this caveat; it makes the result more defensible."]);
}

// 18 Final synthesis, different from prior
{
  const s = slide(); n++;
  header(s, "Integrated result", "A brief Netrin-1 stimulus produces a reversible transcriptional program", "The result is strongest when DEG, LRT and GSEA are read as one chain of evidence.");
  const xs = [114, 475, 836];
  [["1", "Acute cue", "Netrin-1 stimulation"], ["2", "5-min pulse", "guidance/projection up\nRNA processing down"], ["3", "15-min reversal", "pathway mirror r = -0.991"]].forEach((d, i) => {
    shape(s, { left: xs[i], top: 242, width: 280, height: 180 }, i === 1 ? C.mint : C.white, C.line);
    shape(s, { left: xs[i] + 24, top: 266, width: 42, height: 42 }, i === 1 ? C.teal : C.navy, "none", "ellipse", 0);
    txt(s, d[0], { left: xs[i] + 24, top: 274, width: 42, height: 24 }, { size: 18, bold: true, color: C.white, alignment: "center" });
    txt(s, d[1], { left: xs[i] + 82, top: 268, width: 170, height: 32 }, { size: 24, bold: true, color: i === 1 ? C.tealDark : C.navy, alignment: "center" });
    txt(s, d[2], { left: xs[i] + 36, top: 332, width: 208, height: 56 }, { size: 18, color: C.ink, alignment: "center" });
    if (i < 2) txt(s, ">", { left: xs[i] + 306, top: 306, width: 40, height: 40 }, { size: 38, bold: true, color: C.amber, alignment: "center" });
  });
  shape(s, { left: 172, top: 530, width: 936, height: 72 }, C.navy, "none");
  txt(s, "Take-home: the 5-min response is modest at the DEG level but strongly coordinated at the pathway level, and it is rapidly reversed by 15 min.", { left: 220, top: 550, width: 840, height: 32 }, { size: 20, bold: true, color: C.white, alignment: "center" });
  footer(s, n, "Integrated from handmade content and local result files");
  note(s, ["End with the model and one take-home sentence."]);
}

for (const [index, sl] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  console.log(`rendering ${stem}`);
  await writeBlob(path.join(PREVIEW_DIR, `${stem}.png`), await deck.export({ slide: sl, format: "png", scale: 1 }));
  await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await (await sl.export({ format: "layout" })).text());
}
console.log("rendering montage");
await writeBlob(path.join(PREVIEW_DIR, "deck-montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
console.log("exporting pptx");
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(FINAL_PPTX);
await fs.writeFile(path.join(QA_DIR, "visual-qa.txt"), [
  "Visual QA",
  `Final PPTX: ${FINAL_PPTX}`,
  `Slide count: ${deck.slides.items.length}`,
  "Designed with varied layouts derived from the handmade result order: dark title, contrast map, split QC, asymmetric PCA, module lists, hero figures, dark mirror-scatter slide and synthesis model.",
  "Generated PNG previews for every slide and a montage.",
  "All scientific figures are embedded from local result PNG files.",
  "Speaker notes are present on every slide."
].join("\n"));
console.log(JSON.stringify({ finalPptx: FINAL_PPTX, slides: deck.slides.items.length, previewDir: PREVIEW_DIR }, null, 2));

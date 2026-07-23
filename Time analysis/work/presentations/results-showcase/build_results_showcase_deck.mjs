import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const artifactPath = require.resolve("@oai/artifact-tool");
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactPath).href);

const ROOT = "D:\\Dropbox\\Dropbox\\RNAseq 2025\\Time analysis";
const OUT_DIR = path.join(ROOT, "outputs");
const TMP_DIR = path.join(ROOT, "work", "presentations", "results-showcase", "tmp");
const PREVIEW_DIR = path.join(TMP_DIR, "preview");
const LAYOUT_DIR = path.join(TMP_DIR, "layout");
const QA_DIR = path.join(TMP_DIR, "qa");
const FINAL_PPTX = path.join(OUT_DIR, "handmade_results_showcase_revised.pptx");

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(PREVIEW_DIR, { recursive: true });
await fs.mkdir(LAYOUT_DIR, { recursive: true });
await fs.mkdir(QA_DIR, { recursive: true });

const W = 1280;
const H = 720;
const page = { left: 64, top: 54, width: 1152, height: 600 };
const colors = {
  bg: "#F7FAFC",
  ink: "#102033",
  muted: "#5B6878",
  pale: "#EEF2F7",
  paleGreen: "#E6F4F1",
  navy: "#16324F",
  teal: "#0B7285",
  accent: "#D97706",
  red: "#B91C1C",
  green: "#047857",
  line: "#CBD5E1",
  white: "#FFFFFF",
};

const assets = {
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

async function blob(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

async function writeBlob(file, b) {
  await fs.writeFile(file, new Uint8Array(await b.arrayBuffer()));
}

function box(slide, position, fill = colors.white, line = colors.line, geometry = "roundRect") {
  return slide.shapes.add({
    geometry,
    position,
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
    borderRadius: 8,
  });
}

function text(slide, value, position, opts = {}) {
  const s = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  s.text = value;
  s.text.style = {
    typeface: opts.typeface ?? "Aptos",
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? colors.ink,
    alignment: opts.alignment ?? "left",
  };
  return s;
}

function title(slide, kicker, heading, sub) {
  text(slide, kicker.toUpperCase(), { left: page.left, top: 34, width: 520, height: 24 }, {
    size: 12,
    bold: true,
    color: colors.teal,
  });
  text(slide, heading, { left: page.left, top: 68, width: 980, height: 78 }, {
    size: heading.length > 72 ? 31 : 35,
    bold: true,
    color: colors.ink,
    typeface: "Aptos Display",
  });
  if (sub) text(slide, sub, { left: page.left, top: 145, width: 980, height: 32 }, { size: 16.5, color: colors.muted });
  slide.shapes.add({
    geometry: "rect",
    position: { left: page.left, top: 182, width: 132, height: 4 },
    fill: colors.accent,
    line: { style: "solid", fill: colors.accent, width: 0 },
  });
}

function footer(slide, n, source = "Acute Netrin-1 RNA-seq results") {
  text(slide, source, { left: 64, top: 686, width: 900, height: 20 }, { size: 10.5, color: "#778395" });
  text(slide, String(n).padStart(2, "0"), { left: 1168, top: 684, width: 48, height: 22 }, {
    size: 11,
    bold: true,
    color: "#778395",
    alignment: "right",
  });
}

async function image(slide, file, position, alt, opts = {}) {
  box(slide, { left: position.left - 8, top: position.top - 8, width: position.width + 16, height: position.height + 16 }, opts.frameFill ?? colors.white, opts.frameLine ?? colors.line);
  slide.images.add({
    blob: await blob(file),
    contentType: "image/png",
    alt,
    fit: opts.fit ?? "contain",
    position,
  });
}

function bullets(slide, items, position, opts = {}) {
  text(slide, items.map((d) => `- ${d}`).join("\n"), position, { size: opts.size ?? 18, color: opts.color ?? colors.ink });
}

function kpi(slide, value, label, position, color = colors.teal) {
  box(slide, position, colors.white, colors.line);
  text(slide, value, { left: position.left + 16, top: position.top + 18, width: position.width - 32, height: 54 }, {
    size: 42,
    bold: true,
    color,
    alignment: "center",
    typeface: "Aptos Display",
  });
  text(slide, label, { left: position.left + 18, top: position.top + 82, width: position.width - 36, height: 46 }, {
    size: 14,
    color: colors.muted,
    alignment: "center",
  });
}

function notes(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines);
  slide.speakerNotes.setVisible(true);
}

function process(slide, steps, y = 272) {
  const start = 90;
  const w = 170;
  const gap = 26;
  steps.forEach((step, i) => {
    const left = start + i * (w + gap);
    box(slide, { left, top: y, width: w, height: 112 }, i % 2 ? colors.paleGreen : colors.white, colors.line);
    text(slide, step[0], { left: left + 14, top: y + 18, width: w - 28, height: 30 }, { size: 18, bold: true, color: colors.navy, alignment: "center" });
    text(slide, step[1], { left: left + 16, top: y + 54, width: w - 32, height: 40 }, { size: 13.5, color: colors.muted, alignment: "center" });
    if (i < steps.length - 1) text(slide, ">", { left: left + w + 4, top: y + 36, width: 20, height: 30 }, { size: 25, bold: true, color: colors.accent, alignment: "center" });
  });
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });
function newSlide() {
  const s = deck.slides.add();
  s.background.fill = colors.bg;
  return s;
}

let n = 0;

// 1
{
  const s = newSlide(); n++;
  title(s, "Results storyline", "Acute Netrin-1 produces a 5-min transcriptional pulse that reverses by 15 min", "A results-focused version of the handmade deck: cleaner sequence, unified layout, and fewer detours.");
  kpi(s, "32", "5v0 DEGs, relaxed", { left: 108, top: 252, width: 220, height: 150 }, colors.teal);
  kpi(s, "19", "LRT time-varying genes", { left: 394, top: 252, width: 220, height: 150 }, colors.accent);
  kpi(s, "313", "5v0 GO BP terms", { left: 680, top: 252, width: 220, height: 150 }, colors.green);
  kpi(s, "r = -0.991", "5v0 vs 15v5 pathway mirror", { left: 966, top: 252, width: 220, height: 150 }, colors.navy);
  text(s, "Result logic: QC supports interpretability -> 5-min DEGs define acute anchors -> LRT captures time-dependent genes -> GSEA reveals coordinated pathway reversal.", { left: 158, top: 496, width: 964, height: 60 }, { size: 22, bold: true, color: colors.ink, alignment: "center" });
  footer(s, n);
  notes(s, ["Open with the result, not the methods. This deck is organized around the evidence chain in the handmade slides."]);
}

// 2
{
  const s = newSlide(); n++;
  title(s, "Analysis map", "The three contrasts ask onset, reversal and return-to-baseline questions", "This slide gives the audience the vocabulary used throughout the results.");
  process(s, [
    ["Vehicle", "PBS control"],
    ["5 min", "acute Netrin-1"],
    ["15 min", "later Netrin-1"],
    ["5v0", "onset vs Vehicle"],
    ["15v5", "reversal vs 5 min"],
    ["15v0", "return vs Vehicle"]
  ], 246);
  box(s, { left: 158, top: 488, width: 964, height: 72 }, colors.paleGreen, colors.line);
  text(s, "Statistical model: DESeq2 ~ replicate + timepoint; batch correction was used only for PCA visualization, not for DE testing.", { left: 192, top: 510, width: 896, height: 28 }, { size: 20, bold: true, alignment: "center" });
  footer(s, n, "Source: handmade methods slides and THESIS_writing_pack.md");
  notes(s, ["Keep this concise. It replaces several scattered method statements from the handmade version."]);
}

// 3
{
  const s = newSlide(); n++;
  title(s, "Filtering and sample QC", "Filtering retains 14,161 genes and sample depth is comparable", "The first result block establishes that downstream differences are interpretable.");
  await image(s, assets.library, { left: 80, top: 222, width: 500, height: 310 }, "Library size QC");
  await image(s, assets.genes, { left: 648, top: 222, width: 500, height: 310 }, "Detected gene QC");
  box(s, { left: 320, top: 570, width: 640, height: 50 }, colors.paleGreen, colors.line);
  text(s, "Two-step filtering: 32,623 quantified genes -> 14,161 genes for differential expression.", { left: 348, top: 584, width: 584, height: 22 }, { size: 18, bold: true, alignment: "center" });
  footer(s, n, "Source: results/01_QC and handmade slide 1");
  notes(s, ["This combines handmade filtering with the two QC plots so the audience sees both gene filtering and sample-level QC."]);
}

// 4
{
  const s = newSlide(); n++;
  title(s, "Replicate and timepoint structure", "Replicate effects are visible, but corrected PCA reveals timepoint separation", "This justifies modeling replicate and interpreting the acute timepoint signal.");
  await image(s, assets.corr, { left: 86, top: 210, width: 456, height: 370 }, "Sample correlation heatmap");
  await image(s, assets.pcaAfter, { left: 626, top: 210, width: 540, height: 370 }, "PCA after replicate correction");
  footer(s, n, "Source: results/01_QC");
  notes(s, ["State clearly that replicate is modeled statistically; corrected PCA is only a visualization."]);
}

// 5
{
  const s = newSlide(); n++;
  title(s, "Culture composition", "Marker expression supports neuron-dominant, composition-stable cultures", "This rules against a simple cell-composition explanation for the acute signal.");
  await image(s, assets.markers, { left: 90, top: 206, width: 760, height: 416 }, "Cell marker TPM plot");
  box(s, { left: 902, top: 264, width: 234, height: 238 }, colors.paleGreen, colors.line);
  text(s, "Interpretation", { left: 930, top: 294, width: 178, height: 28 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  bullets(s, ["Pan-neuronal markers are high.", "Glial/endothelial markers remain low.", "Marker profiles are stable across conditions."], { left: 932, top: 348, width: 178, height: 110 }, { size: 15.5 });
  footer(s, n, "Source: results/02_composition");
  notes(s, ["This slide preserves handmade slide 4 but makes the conclusion more compact."]);
}

// 6
{
  const s = newSlide(); n++;
  title(s, "DEG overview", "The largest single-gene response is detected at 5 min", "15v5 is the key contrast for reversal; 15v0 is comparatively quiet at DEG level.");
  const rows = [
    ["Contrast", "Question", "Relaxed", "Strict", "Direction"],
    ["5v0", "onset", "32", "5", "14 up / 18 down"],
    ["15v5", "reversal", "6", "2", "6 up / 0 down"],
    ["15v0", "return", "1", "1", "0 up / 1 down"],
    ["LRT", "any time effect", "19", "-", "time-varying genes"],
  ];
  const table = s.tables.add({ rows: rows.length, columns: 5, left: 118, top: 226, width: 1044, height: 270, values: rows });
  table.styleOptions = { headerRow: true, bandedRows: true };
  for (let c = 0; c < 5; c++) {
    table.getCell(0, c).fill = colors.navy;
    table.getCell(0, c).text.style = { fontSize: 15, bold: true, color: colors.white, typeface: "Aptos" };
  }
  table.borders.assign({ style: "solid", fill: colors.line, width: 1 });
  text(s, "Takeaway: single-gene changes are modest but time-structured, motivating LRT and GSEA as the main result layers.", { left: 170, top: 548, width: 940, height: 36 }, { size: 20, bold: true, alignment: "center" });
  footer(s, n, "Source: DEG CSV files and handmade slide 5");
  notes(s, ["This cleans up the DEG table and gives it one interpretation."]);
}

// 7
{
  const s = newSlide(); n++;
  title(s, "5-min differential expression", "The 5-min volcano plot identifies biologically interpretable acute anchors", "The small DEG set is coherent rather than random.");
  await image(s, assets.volcano, { left: 78, top: 198, width: 760, height: 430 }, "5v0 volcano plot");
  box(s, { left: 884, top: 236, width: 278, height: 316 }, colors.white, colors.line);
  text(s, "Highlighted modules", { left: 912, top: 264, width: 222, height: 28 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  bullets(s, ["IEG suppression: Fos", "Cytoskeleton: Rock1", "Splicing: Srsf5, Snrnp70", "Guidance: Cntn2", "NO-calcium: Nos1, Ryr3"], { left: 914, top: 316, width: 218, height: 170 }, { size: 16 });
  footer(s, n, "Source: results/03_DEG/04_volcano_5v0_v6.png");
  notes(s, ["This corresponds to handmade slide 6, but with a conclusion-style title and a cleaner right rail."]);
}

// 8
{
  const s = newSlide(); n++;
  title(s, "Key 5-min genes", "Representative DEGs point to a bidirectional acute program", "Guidance/signaling genes rise while IEG and RNA-processing genes fall.");
  const rows = [
    ["Gene", "log2FC", "padj", "Module"],
    ["Fos", "-2.35", "2.4e-3", "IEG suppression"],
    ["Rock1", "-0.43", "9.4e-6", "cytoskeleton"],
    ["Srsf5", "-0.31", "4.5e-5", "splicing"],
    ["Snrnp70", "-0.27", "1.2e-2", "splicing"],
    ["Cntn2", "+0.25", "1.4e-2", "axon guidance"],
    ["Nos1 / Ryr3", "+0.32 / +0.47", "3.5e-2 / 2.4e-2", "NO-calcium"],
    ["Tln2", "+0.39", "1.2e-2", "adhesion"],
  ];
  const table = s.tables.add({ rows: rows.length, columns: 4, left: 112, top: 206, width: 850, height: 394, values: rows });
  table.styleOptions = { headerRow: true, bandedRows: true };
  for (let c = 0; c < 4; c++) {
    table.getCell(0, c).fill = colors.navy;
    table.getCell(0, c).text.style = { fontSize: 14, bold: true, color: colors.white, typeface: "Aptos" };
  }
  table.borders.assign({ style: "solid", fill: colors.line, width: 1 });
  box(s, { left: 1008, top: 288, width: 150, height: 190 }, colors.paleGreen, colors.line);
  text(s, "Pattern", { left: 1030, top: 314, width: 106, height: 28 }, { size: 20, bold: true, color: colors.teal, alignment: "center" });
  text(s, "This table becomes the gene-level bridge into pathway analysis.", { left: 1028, top: 370, width: 110, height: 64 }, { size: 15.5, alignment: "center" });
  footer(s, n, "Source: DEG_5v0_ALL.csv and handmade slide 7");
  notes(s, ["This table is intentionally compact and readable at presentation scale."]);
}

// 9
{
  const s = newSlide(); n++;
  title(s, "5-min DEG heatmap", "The DEG set forms a coherent sample-level 5-min pattern", "This checks whether selected genes move together across samples.");
  await image(s, assets.heatmap, { left: 170, top: 202, width: 720, height: 430 }, "5v0 DEG heatmap");
  box(s, { left: 930, top: 264, width: 222, height: 226 }, colors.white, colors.line);
  text(s, "Readout", { left: 958, top: 294, width: 166, height: 28 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  text(s, "The heatmap supports a coordinated 5-min expression pattern rather than an isolated single-gene outlier.", { left: 958, top: 350, width: 166, height: 88 }, { size: 16.5, alignment: "center" });
  footer(s, n, "Source: results/03_DEG/06_DEG_heatmap_5v0_v4.png");
  notes(s, ["This replaces the more crowded handmade heatmap slide."]);
}

// 10
{
  const s = newSlide(); n++;
  title(s, "LRT result", "The LRT identifies 19 genes with significant time-dependent behavior", "For trajectories, row-scaled VST expression is the clearest y-axis.");
  box(s, { left: 110, top: 238, width: 300, height: 226 }, colors.white, colors.line);
  text(s, "LRT model", { left: 140, top: 268, width: 240, height: 30 }, { size: 23, bold: true, color: colors.navy, alignment: "center" });
  text(s, "Full: ~ replicate + timepoint\nReduced: ~ replicate", { left: 140, top: 340, width: 240, height: 62 }, { size: 20, alignment: "center" });
  box(s, { left: 490, top: 238, width: 300, height: 226 }, colors.paleGreen, colors.line);
  text(s, "Visualization", { left: 520, top: 268, width: 240, height: 30 }, { size: 23, bold: true, color: colors.teal, alignment: "center" });
  text(s, "Y-axis:\nZ-score of VST-normalized expression", { left: 520, top: 334, width: 240, height: 72 }, { size: 20, bold: true, alignment: "center" });
  kpi(s, "19", "LRT-significant genes", { left: 870, top: 266, width: 240, height: 154 }, colors.accent);
  text(s, "This makes the LRT slide scientifically explicit: it tests time dependence, not a single pairwise contrast.", { left: 208, top: 540, width: 864, height: 34 }, { size: 20, bold: true, alignment: "center" });
  footer(s, n, "Source: DEG_LRT_ALL.csv and LRT trajectory file");
  notes(s, ["This slide fills the weak handmade LRT slide, which had only a title."]);
}

// 11
{
  const s = newSlide(); n++;
  title(s, "LRT trajectories", "The 19 time-varying genes show coordinated 5-min deviation and recovery/rebound", "The trajectory plot emphasizes shape rather than absolute gene abundance.");
  await image(s, assets.lrt19, { left: 74, top: 184, width: 850, height: 454 }, "LRT 19 trajectory plot");
  box(s, { left: 960, top: 246, width: 214, height: 266 }, colors.paleGreen, colors.line);
  text(s, "Readout", { left: 988, top: 276, width: 158, height: 28 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  bullets(s, ["Rows are genes.", "Values are scaled per gene.", "Most profiles converge on a pulse-like shape.", "Fos/Npas4 support IEG suppression."], { left: 988, top: 326, width: 162, height: 140 }, { size: 15.5 });
  footer(s, n, "Source: results/objects/LRT_19_trajectory_VSTzscore_v1.png");
  notes(s, ["Use the y-axis wording exactly: Z-score of VST-normalized expression or row-scaled VST expression."]);
}

// 12
{
  const s = newSlide(); n++;
  title(s, "Temporal gene examples", "Representative genes and ROCK paralogues support a transient, selective response", "This slide keeps the gene-level story compact before moving to pathways.");
  await image(s, assets.trajectory, { left: 70, top: 214, width: 560, height: 370 }, "Representative gene trajectories");
  await image(s, assets.rock, { left: 690, top: 214, width: 500, height: 370 }, "ROCK1 versus ROCK2 trajectory");
  box(s, { left: 230, top: 612, width: 820, height: 42 }, colors.paleGreen, colors.line);
  text(s, "Rock1 is down at 5 min (padj 9.4e-6), while Rock2 is unchanged (padj ~1.0).", { left: 260, top: 623, width: 760, height: 20 }, { size: 17.5, bold: true, alignment: "center" });
  footer(s, n, "Source: results/03_DEG trajectory plots and handmade slide 8");
  notes(s, ["This merges two handmade concepts into one better-flowing result page."]);
}

// 13
{
  const s = newSlide(); n++;
  title(s, "5-min GO BP enrichment", "At 5 min, Netrin-1 activates neuron projection and axon guidance programs", "Pathway aggregation reveals coordination beyond the modest DEG count.");
  await image(s, assets.go5, { left: 84, top: 190, width: 810, height: 440 }, "5v0 GO BP GSEA");
  kpi(s, "313", "significant GO BP terms", { left: 930, top: 230, width: 220, height: 148 }, colors.green);
  kpi(s, "285 up", "positive NES terms", { left: 930, top: 414, width: 220, height: 148 }, colors.teal);
  footer(s, n, "Source: results/04_GSEA/GSEA_GO_BP_5v0.csv");
  notes(s, ["This is the central pathway result from handmade slide 10."]);
}

// 14
{
  const s = newSlide(); n++;
  title(s, "5-min KEGG enrichment", "Axon guidance is the top KEGG pathway in the acute response", "This connects the RNA-seq signal directly to canonical Netrin-1 biology.");
  await image(s, assets.kegg5, { left: 112, top: 190, width: 760, height: 430 }, "5v0 KEGG GSEA");
  box(s, { left: 918, top: 252, width: 234, height: 250 }, colors.white, colors.line);
  text(s, "Top KEGG", { left: 946, top: 282, width: 178, height: 28 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  text(s, "Axon guidance\nNES 2.16\nBH-adjusted p = 4.1e-7", { left: 944, top: 344, width: 182, height: 96 }, { size: 21, bold: true, alignment: "center" });
  footer(s, n, "Source: results/04_GSEA/GSEA_KEGG_5v0.csv");
  notes(s, ["This keeps the handmade KEGG result but reduces text clutter."]);
}

// 15
{
  const s = newSlide(); n++;
  title(s, "15v5 reversal", "By 15 min, the 5-min GO BP program is directionally flipped", "The same pathway themes reverse when 15 min is compared with 5 min.");
  await image(s, assets.go15v5, { left: 84, top: 190, width: 812, height: 440 }, "15v5 GO BP GSEA");
  kpi(s, "295", "significant GO BP terms", { left: 930, top: 230, width: 220, height: 148 }, colors.green);
  kpi(s, "264", "negative NES terms", { left: 930, top: 414, width: 220, height: 148 }, colors.red);
  footer(s, n, "Source: results/04_GSEA/GSEA_GO_BP_15v5.csv");
  notes(s, ["This makes the reversal logic explicit and avoids overcrowding the slide."]);
}

// 16
{
  const s = newSlide(); n++;
  title(s, "Pathway mirror", "Shared pathways show near-perfect mirror symmetry between 5v0 and 15v5", "This is the quantitative anchor for the transient-response claim.");
  await image(s, assets.mirror, { left: 86, top: 188, width: 800, height: 450 }, "GSEA mirror scatter");
  box(s, { left: 928, top: 252, width: 224, height: 250 }, colors.paleGreen, colors.line);
  text(s, "Mirror statistic", { left: 956, top: 284, width: 168, height: 28 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  text(s, "603 shared pathways\nNES correlation\nr = -0.991", { left: 952, top: 346, width: 176, height: 98 }, { size: 25, bold: true, alignment: "center" });
  footer(s, n, "Source: results/04_GSEA/13_GSEA_mirror_scatter_5v0_vs_15v5.png");
  notes(s, ["This should be one of the strongest slides in the results presentation."]);
}

// 17
{
  const s = newSlide(); n++;
  title(s, "15v0 endpoint", "15v0 supports return toward baseline, with a mild mitochondrial KEGG signal", "This keeps the interpretation accurate and avoids overclaiming complete silence.");
  await image(s, assets.kegg15v0, { left: 104, top: 198, width: 740, height: 430 }, "15v0 KEGG GSEA");
  box(s, { left: 900, top: 236, width: 252, height: 292 }, colors.white, colors.line);
  text(s, "Interpret carefully", { left: 928, top: 266, width: 196, height: 28 }, { size: 21, bold: true, color: colors.accent, alignment: "center" });
  bullets(s, ["GO BP: 0 significant terms", "DEG: 1 significant gene", "KEGG: OXPHOS/mitochondrial signal", "Disease labels reflect shared mitochondrial genes"], { left: 930, top: 316, width: 196, height: 142 }, { size: 15.5 });
  footer(s, n, "Source: GSEA_GO_BP_15v0.csv and GSEA_KEGG_15v0.csv");
  notes(s, ["This slide is scientifically important because it states the caveat clearly."]);
}

// 18
{
  const s = newSlide(); n++;
  title(s, "Integrated result", "Acute Netrin-1 engages a reversible transcriptional program", "The result is strongest when DEG, LRT and GSEA are interpreted together.");
  box(s, { left: 92, top: 246, width: 230, height: 132 }, colors.white, colors.line);
  text(s, "Netrin-1", { left: 126, top: 286, width: 162, height: 34 }, { size: 27, bold: true, color: colors.navy, alignment: "center" });
  text(s, "acute cue", { left: 126, top: 332, width: 162, height: 24 }, { size: 16, color: colors.muted, alignment: "center" });
  text(s, ">", { left: 342, top: 290, width: 42, height: 54 }, { size: 42, bold: true, color: colors.accent, alignment: "center" });
  box(s, { left: 410, top: 212, width: 326, height: 202 }, colors.paleGreen, colors.line);
  text(s, "5-min pulse", { left: 450, top: 248, width: 246, height: 32 }, { size: 25, bold: true, color: colors.teal, alignment: "center" });
  text(s, "guidance / projection up\nRNA processing / ribosome down\nIEG suppression", { left: 454, top: 314, width: 238, height: 78 }, { size: 19, alignment: "center" });
  text(s, ">", { left: 760, top: 290, width: 42, height: 54 }, { size: 42, bold: true, color: colors.accent, alignment: "center" });
  box(s, { left: 832, top: 246, width: 330, height: 132 }, colors.white, colors.line);
  text(s, "15-min reversal", { left: 868, top: 286, width: 258, height: 34 }, { size: 27, bold: true, color: colors.navy, alignment: "center" });
  text(s, "pathway mirror r = -0.991", { left: 868, top: 334, width: 258, height: 24 }, { size: 16, color: colors.muted, alignment: "center" });
  box(s, { left: 160, top: 506, width: 960, height: 70 }, colors.white, colors.line);
  text(s, "Take-home: the 5-min signal is modest at the DEG level but highly coordinated at the pathway level, and it is rapidly reversed by 15 min.", { left: 200, top: 528, width: 880, height: 28 }, { size: 20, bold: true, alignment: "center" });
  footer(s, n, "Integrated from DEG, LRT and GSEA result files");
  notes(s, ["End the results showcase with one clean model rather than a long discussion."]);
}

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(PREVIEW_DIR, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
}

await writeBlob(path.join(PREVIEW_DIR, "deck-montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(FINAL_PPTX);

const snapshot = await deck.inspect({ kind: "slide,textbox,image,table,shape,notes", maxChars: 12000 });
await fs.writeFile(path.join(QA_DIR, "inspect.ndjson"), snapshot.ndjson);

await fs.writeFile(path.join(QA_DIR, "visual-qa.txt"), [
  "Visual QA",
  `Final PPTX: ${FINAL_PPTX}`,
  `Slide count: ${deck.slides.items.length}`,
  "Generated PNG previews for every slide and a montage.",
  "All scientific figures are embedded from local result PNG files.",
  "Speaker notes are present on every slide.",
  "Known caveat retained: 15v0 GO BP has 0 significant terms but 15v0 has 1 DEG and a mild KEGG/OXPHOS signal."
].join("\n"));

console.log(JSON.stringify({
  finalPptx: FINAL_PPTX,
  slides: deck.slides.items.length,
  previewDir: PREVIEW_DIR,
  qa: path.join(QA_DIR, "visual-qa.txt"),
}, null, 2));

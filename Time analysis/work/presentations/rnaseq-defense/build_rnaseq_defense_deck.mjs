import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const artifactPath = require.resolve("@oai/artifact-tool");
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactPath).href);

const ROOT = "D:\\Dropbox\\Dropbox\\RNAseq 2025\\Time analysis";
const OUT_DIR = path.join(ROOT, "outputs");
const TMP_DIR = path.join(ROOT, "work", "presentations", "rnaseq-defense", "tmp");
const PREVIEW_DIR = path.join(TMP_DIR, "preview");
const LAYOUT_DIR = path.join(TMP_DIR, "layout");
const QA_DIR = path.join(TMP_DIR, "qa");
const FINAL_PPTX = path.join(OUT_DIR, "acute_netrin1_rnaseq_phd_defense.pptx");

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
  pcaBefore: path.join(ROOT, "results", "01_QC", "04_PCA_before_correction.png"),
  pcaAfter: path.join(ROOT, "results", "01_QC", "05_PCA_after_correction_FINAL.png"),
  markers: path.join(ROOT, "results", "02_composition", "07_celltype_marker_TPM.png"),
  volcano: path.join(ROOT, "results", "03_DEG", "04_volcano_5v0_v6.png"),
  trajectory: path.join(ROOT, "results", "03_DEG", "05_trajectory_6genes.png"),
  rock: path.join(ROOT, "results", "03_DEG", "05b_rock1_vs_rock2_trajectory.png"),
  heatmap: path.join(ROOT, "results", "03_DEG", "06_DEG_heatmap_5v0_v4.png"),
  go5: path.join(ROOT, "results", "04_GSEA", "08_GSEA_GO_BP_5v0_barplot.png"),
  kegg5: path.join(ROOT, "results", "04_GSEA", "09_GSEA_KEGG_5v0_barplot.png"),
  go15v5: path.join(ROOT, "results", "04_GSEA", "10_GSEA_GO_BP_15v5_barplot.png"),
  kegg15v0: path.join(ROOT, "results", "04_GSEA", "12_GSEA_KEGG_15v0_barplot.png"),
  mirror: path.join(ROOT, "results", "04_GSEA", "13_GSEA_mirror_scatter_5v0_vs_15v5.png"),
};

function px(n) {
  return Math.round(n);
}

async function blob(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

async function writeBlob(file, b) {
  await fs.writeFile(file, new Uint8Array(await b.arrayBuffer()));
}

function addShape(slide, position, fill = colors.white, line = colors.line, geometry = "roundRect") {
  return slide.shapes.add({
    geometry,
    position,
    fill,
    line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 },
    borderRadius: 8,
  });
}

function addText(slide, text, position, opts = {}) {
  const s = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  s.text = text;
  s.text.style = {
    typeface: opts.typeface ?? "Aptos",
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? colors.ink,
    alignment: opts.alignment ?? "left",
  };
  return s;
}

function addTitle(slide, kicker, title, subtitle) {
  addText(slide, kicker.toUpperCase(), { left: page.left, top: 34, width: 520, height: 24 }, {
    size: 12,
    bold: true,
    color: colors.teal,
  });
  addText(slide, title, { left: page.left, top: 66, width: 920, height: 86 }, {
    size: title.length > 72 ? 31 : 36,
    bold: true,
    color: colors.ink,
    typeface: "Aptos Display",
  });
  if (subtitle) {
    addText(slide, subtitle, { left: page.left, top: 144, width: 930, height: 34 }, {
      size: 17,
      color: colors.muted,
    });
  }
  slide.shapes.add({
    geometry: "rect",
    position: { left: page.left, top: 182, width: 144, height: 4 },
    fill: colors.accent,
    line: { style: "solid", fill: colors.accent, width: 0 },
  });
}

function addFooter(slide, n, source = "Acute Netrin-1 RNA-seq analysis") {
  addText(slide, source, { left: 64, top: 686, width: 880, height: 20 }, { size: 10.5, color: "#778395" });
  addText(slide, String(n).padStart(2, "0"), { left: 1168, top: 684, width: 48, height: 22 }, {
    size: 11,
    bold: true,
    color: "#778395",
    alignment: "right",
  });
}

async function addImage(slide, file, position, alt, opts = {}) {
  addShape(slide, {
    left: position.left - 8,
    top: position.top - 8,
    width: position.width + 16,
    height: position.height + 16,
  }, opts.frameFill ?? colors.white, opts.frameLine ?? colors.line);
  slide.images.add({
    blob: await blob(file),
    contentType: "image/png",
    alt,
    fit: opts.fit ?? "contain",
    position,
  });
}

function addBullets(slide, bullets, position, opts = {}) {
  const text = bullets.map((b) => `- ${b}`).join("\n");
  return addText(slide, text, position, { size: opts.size ?? 19, color: opts.color ?? colors.ink });
}

function addKpi(slide, value, label, position, color = colors.teal) {
  addShape(slide, position, colors.white, colors.line);
  addText(slide, value, { left: position.left + 22, top: position.top + 20, width: position.width - 44, height: 58 }, {
    size: 46,
    bold: true,
    color,
    alignment: "center",
    typeface: "Aptos Display",
  });
  addText(slide, label, { left: position.left + 18, top: position.top + 88, width: position.width - 36, height: 54 }, {
    size: 15,
    color: colors.muted,
    alignment: "center",
  });
}

function addNotes(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines);
  slide.speakerNotes.setVisible(true);
}

function addProcess(slide, steps, y = 278) {
  const start = 88;
  const w = 170;
  const gap = 26;
  steps.forEach((step, i) => {
    const left = start + i * (w + gap);
    addShape(slide, { left, top: y, width: w, height: 112 }, i % 2 ? colors.paleGreen : colors.white, colors.line);
    addText(slide, step[0], { left: left + 16, top: y + 18, width: w - 32, height: 30 }, {
      size: 18,
      bold: true,
      color: colors.navy,
      alignment: "center",
    });
    addText(slide, step[1], { left: left + 16, top: y + 52, width: w - 32, height: 42 }, {
      size: 13.5,
      color: colors.muted,
      alignment: "center",
    });
    if (i < steps.length - 1) {
      addText(slide, ">", { left: left + w + 4, top: y + 36, width: 20, height: 30 }, {
        size: 26,
        bold: true,
        color: colors.accent,
        alignment: "center",
      });
    }
  });
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function newSlide() {
  const s = presentation.slides.add();
  s.background.fill = colors.bg;
  return s;
}

let slideNo = 0;

// 1
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Defense roadmap", "Acute Netrin-1 induces a rapid, reversible transcriptional pulse", "The deck is organized as a question-to-evidence arc, not as a file-by-file result tour.");
  addKpi(s, "5 min", "main response window", { left: 88, top: 254, width: 232, height: 166 }, colors.accent);
  addKpi(s, "r = -0.991", "pathway reversal by 15 min", { left: 364, top: 254, width: 260, height: 166 }, colors.teal);
  addKpi(s, "313", "5v0 significant GO BP terms", { left: 668, top: 254, width: 232, height: 166 }, colors.green);
  addKpi(s, "0", "15v0 significant GO BP terms", { left: 944, top: 254, width: 232, height: 166 }, colors.navy);
  addText(s, "Central claim", { left: 110, top: 488, width: 190, height: 30 }, { size: 18, bold: true, color: colors.teal });
  addText(s, "Netrin-1 does not simply trigger local cytoskeletal signaling; within minutes, it engages a coordinated and transient transcriptional program in cortical neurons.", { left: 300, top: 480, width: 830, height: 64 }, { size: 22, color: colors.ink });
  addFooter(s, slideNo);
  addNotes(s, [
    "Start by stating the thesis in one sentence.",
    "Emphasize that the strongest claim is pathway-level and time-resolved: a 5-min pulse that reverses by 15 min.",
    "Tell the committee that the deck will move from design and QC to single-gene evidence, pathway evidence, and a model."
  ]);
}

// 2
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Biological context", "Netrin-1 is classically fast, local and guidance-related", "The open question is whether a minutes-scale transcriptional layer also exists.");
  addProcess(s, [
    ["Ligand", "Netrin-1 cue"],
    ["Receptors", "DCC / UNC5 axis"],
    ["Local response", "growth cone and cytoskeleton"],
    ["Known timescale", "seconds to minutes"],
    ["Unknown layer", "acute nuclear RNA response"],
    ["This study", "5 and 15 min RNA-seq"]
  ], 270);
  addBullets(s, [
    "Canonical Netrin-1 biology centers on axon guidance and growth-cone remodeling.",
    "Most transcriptomic studies resolve hour-to-day programs, not acute 5-15 min changes.",
    "This creates a testable gap: can a guidance cue rapidly reshape the neuronal transcriptome?"
  ], { left: 118, top: 474, width: 1010, height: 110 }, { size: 19 });
  addFooter(s, slideNo, "Source: thesis writing pack; literature citations to be added in manuscript");
  addNotes(s, [
    "Frame this as a conceptual gap, not as a claim that local mechanisms are insufficient.",
    "The experiment asks whether a transcriptional component runs in parallel with canonical local signaling."
  ]);
}

// 3
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Thesis question", "Is acute Netrin-1 stimulation transcriptionally visible within minutes?", "Three concrete questions define the analysis.");
  const qs = [
    ["Magnitude", "Are there detectable genes or pathways after only 5 min?"],
    ["Direction", "Which biological programs go up or down?"],
    ["Duration", "Does the response persist, or return toward baseline by 15 min?"]
  ];
  qs.forEach((q, i) => {
    const left = 108 + i * 360;
    addShape(s, { left, top: 244, width: 300, height: 250 }, i === 1 ? colors.paleGreen : colors.white, colors.line);
    addText(s, q[0], { left: left + 24, top: 278, width: 252, height: 42 }, { size: 28, bold: true, color: i === 1 ? colors.teal : colors.navy, alignment: "center" });
    addText(s, q[1], { left: left + 34, top: 352, width: 232, height: 96 }, { size: 20, color: colors.ink, alignment: "center" });
  });
  addText(s, "Working hypothesis: if an acute transcriptional program exists, it should be small at the DEG level but coherent at the pathway level.", { left: 170, top: 554, width: 940, height: 44 }, { size: 21, bold: true, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo);
  addNotes(s, [
    "Set up why GSEA matters before showing the data.",
    "A five-minute RNA-seq study should not be expected to produce hundreds of large-effect DEGs."
  ]);
}

// 4
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Experimental design", "A minimal acute time course tests the onset and reversal of transcriptional change", "Nine RNA-seq samples: three conditions with three biological replicates each.");
  addProcess(s, [
    ["E18 rat", "primary cortical culture"],
    ["Vehicle", "PBS, 5 min"],
    ["Netrin-1", "5 min"],
    ["Netrin-1", "15 min"],
    ["RNA-seq", "DRAGEN Salmon"],
    ["DESeq2", "replicate-adjusted"]
  ], 246);
  addBullets(s, [
    "Design: Vehicle, 5 min Netrin-1, and 15 min Netrin-1.",
    "n = 3 biological replicates per condition; each replicate is an independent well.",
    "Important limitation: the same Vehicle 5-min control anchors both Netrin timepoints."
  ], { left: 116, top: 468, width: 1010, height: 108 }, { size: 20 });
  addFooter(s, slideNo);
  addNotes(s, [
    "Be transparent about the design limitation early.",
    "This will make the later emphasis on 5v0 and 15v5 easier to defend."
  ]);
}

// 5
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Analysis workflow", "Differential expression used raw counts; batch correction was reserved for visualization", "This separation is important for statistical interpretability.");
  addProcess(s, [
    ["Quantify", "gene-level Salmon output"],
    ["Import", "tximport with length offset"],
    ["Filter", "32623 to 14161 genes"],
    ["Model", "~ replicate + timepoint"],
    ["Contrasts", "5v0, 15v0, 15v5"],
    ["GSEA", "GO BP and KEGG"]
  ], 228);
  addShape(s, { left: 166, top: 462, width: 420, height: 110 }, colors.white, colors.line);
  addText(s, "DE tests", { left: 190, top: 486, width: 372, height: 28 }, { size: 20, bold: true, color: colors.navy, alignment: "center" });
  addText(s, "Raw counts with replicate in the model", { left: 202, top: 524, width: 348, height: 28 }, { size: 18, color: colors.ink, alignment: "center" });
  addShape(s, { left: 694, top: 462, width: 420, height: 110 }, colors.paleGreen, colors.line);
  addText(s, "Visualizations", { left: 718, top: 486, width: 372, height: 28 }, { size: 20, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "Batch-corrected only where explicitly visualized", { left: 724, top: 524, width: 360, height: 28 }, { size: 18, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Methods: DESeq2, limma, clusterProfiler, org.Rn.eg.db");
  addNotes(s, [
    "Stress that replicate is modeled, not ignored.",
    "Explain relaxed and strict thresholds if asked: padj < 0.05, strict adds absolute log2FC > 0.585."
  ]);
}

// 6
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Sequencing QC", "Library size and detected genes are broadly comparable across samples", "No single sample drives the analysis by obvious sequencing-depth failure.");
  await addImage(s, assets.library, { left: 88, top: 216, width: 520, height: 338 }, "Library size QC");
  await addImage(s, assets.genes, { left: 672, top: 216, width: 520, height: 338 }, "Detected genes QC");
  addFooter(s, slideNo, "Source: results/01_QC");
  addNotes(s, [
    "Keep this slide short: the purpose is to reassure the committee before the biological slides.",
    "Mention that detailed QC files remain available in the results folder."
  ]);
}

// 7
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Replicate structure", "Sample correlation and PCA expose replicate effects that the model explicitly accounts for", "This is why replicate was included as a model term.");
  await addImage(s, assets.corr, { left: 86, top: 212, width: 456, height: 370 }, "Sample correlation heatmap");
  await addImage(s, assets.pcaBefore, { left: 626, top: 212, width: 540, height: 370 }, "PCA before correction");
  addFooter(s, slideNo, "Source: results/01_QC");
  addNotes(s, [
    "Acknowledge that replicate explains a large part of top-level variance.",
    "Then immediately connect this to the model: replicate was included in the design, so DE inference is adjusted."
  ]);
}

// 8
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Visualization after correction", "Removing replicate effects for PCA reveals the expected timepoint axis", "Batch correction is used here only to make the time structure visible.");
  await addImage(s, assets.pcaAfter, { left: 126, top: 204, width: 720, height: 420 }, "PCA after correction");
  addShape(s, { left: 900, top: 244, width: 250, height: 280 }, colors.white, colors.line);
  addText(s, "Interpretation", { left: 928, top: 274, width: 194, height: 30 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  addBullets(s, [
    "Timepoint becomes the dominant visible structure.",
    "This supports, but does not replace, the replicate-adjusted DE model.",
    "The key biological comparison remains 5v0 and 15v5."
  ], { left: 930, top: 326, width: 190, height: 146 }, { size: 16 });
  addFooter(s, slideNo, "Source: results/01_QC");
  addNotes(s, [
    "Use this slide to prevent a common concern: the analysis is not hiding batch effects.",
    "Clarify the distinction between visualization correction and statistical testing."
  ]);
}

// 9
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Culture composition", "Marker expression supports neuron-dominant, composition-stable cultures", "Cell-type markers do not suggest that the acute signal is driven by a change in composition.");
  await addImage(s, assets.markers, { left: 86, top: 202, width: 728, height: 420 }, "Cell-type marker TPM plot");
  addShape(s, { left: 874, top: 248, width: 276, height: 274 }, colors.paleGreen, colors.line);
  addText(s, "Key readout", { left: 902, top: 276, width: 220, height: 30 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "Pan-neuronal markers are high, while glial/endothelial markers are orders of magnitude lower and stable across conditions.", { left: 910, top: 334, width: 204, height: 108 }, { size: 18, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Source: results/02_composition");
  addNotes(s, [
    "Point to Tubb3, Stmn2 and Map2 as high neuronal markers.",
    "The main purpose is to argue that downstream changes are transcriptional, not culture-composition shifts."
  ]);
}

// 10
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Analysis strategy", "Minutes-scale transcriptional effects are expected to be small but coordinated", "Therefore single-gene and pathway-level evidence are interpreted together.");
  addKpi(s, "32", "5v0 relaxed DEGs", { left: 100, top: 236, width: 230, height: 160 }, colors.teal);
  addKpi(s, "5", "5v0 strict DEGs", { left: 380, top: 236, width: 230, height: 160 }, colors.accent);
  addKpi(s, "313", "5v0 GO BP terms", { left: 660, top: 236, width: 230, height: 160 }, colors.green);
  addKpi(s, "14", "5v0 KEGG pathways", { left: 940, top: 236, width: 230, height: 160 }, colors.navy);
  addText(s, "Interpretation rule", { left: 116, top: 482, width: 220, height: 30 }, { size: 20, bold: true, color: colors.teal });
  addText(s, "A modest DEG count is not a weak result when pathway ranks show coherent biological directionality across thousands of genes.", { left: 336, top: 478, width: 760, height: 54 }, { size: 22, color: colors.ink });
  addFooter(s, slideNo, "Values verified from DEG and GSEA CSV files");
  addNotes(s, [
    "This slide prevents the committee from over-focusing on the small number of strict DEGs.",
    "It also sets up why the GSEA slides are central evidence rather than secondary decoration."
  ]);
}

// 11
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Timing of response", "The strongest transcriptional change occurs at 5 min, not at 15 min versus Vehicle", "This supports an acute pulse rather than a persistent endpoint shift.");
  addKpi(s, "5v0", "32 relaxed DEGs; 5 strict DEGs", { left: 136, top: 250, width: 280, height: 170 }, colors.accent);
  addKpi(s, "15v0", "1 relaxed/strict DEG; 0 GO BP terms", { left: 500, top: 250, width: 280, height: 170 }, colors.teal);
  addKpi(s, "15v5", "6 relaxed DEGs; 295 GO BP terms", { left: 864, top: 250, width: 280, height: 170 }, colors.green);
  addText(s, "The informative temporal contrast is 15v5: it asks whether the 5-min state is actively reversed by 15 min.", { left: 180, top: 508, width: 920, height: 42 }, { size: 22, bold: true, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Values verified from DEG and GSEA CSV files");
  addNotes(s, [
    "Make the contrast logic explicit.",
    "15v0 alone is limited by the shared control design; 15v5 closes the temporal loop."
  ]);
}

// 12
{
  const s = newSlide(); slideNo++;
  addTitle(s, "5-min DEG evidence", "A small DEG set captures interpretable acute response genes", "The volcano plot identifies the strongest single-gene anchors for the pathway story.");
  await addImage(s, assets.volcano, { left: 78, top: 198, width: 760, height: 430 }, "5v0 volcano plot");
  addShape(s, { left: 884, top: 228, width: 278, height: 348 }, colors.white, colors.line);
  addText(s, "Highlighted genes", { left: 912, top: 256, width: 222, height: 28 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  addBullets(s, [
    "Fos: acute IEG suppression",
    "Rock1: cytoskeletal signaling",
    "Srsf5/Snrnp70: RNA processing",
    "Cntn2: axon guidance",
    "Nos1/Ryr3: NO-calcium module"
  ], { left: 914, top: 306, width: 218, height: 190 }, { size: 16 });
  addFooter(s, slideNo, "Source: results/03_DEG/04_volcano_5v0_v6.png");
  addNotes(s, [
    "The key is not the number of points; it is that the genes are biologically coherent.",
    "Use Fos and Rock1 as concrete anchors before moving to GSEA."
  ]);
}

// 13
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Representative genes", "The 5-min DEGs map to a bidirectional biological program", "Several modest log2FC values are highly significant because baseline expression is robust.");
  const rows = [
    ["Gene", "log2FC", "padj", "Module"],
    ["Fos", "-2.35", "2.4e-3", "IEG suppression"],
    ["Rock1", "-0.43", "9.4e-6", "cytoskeleton"],
    ["Srsf5", "-0.31", "4.5e-5", "splicing"],
    ["Cntn2", "+0.25", "1.4e-2", "axon guidance"],
    ["Nos1", "+0.32", "3.5e-2", "NO signaling"],
    ["Ryr3", "+0.47", "2.4e-2", "calcium release"],
  ];
  const table = s.tables.add({ rows: rows.length, columns: 4, left: 96, top: 212, width: 760, height: 340, values: rows });
  table.styleOptions = { headerRow: true, bandedRows: true };
  for (let c = 0; c < 4; c++) {
    table.getCell(0, c).fill = colors.navy;
    table.getCell(0, c).text.style = { fontSize: 15, bold: true, color: colors.white, typeface: "Aptos" };
  }
  table.borders.assign({ style: "solid", fill: colors.line, width: 1 });
  addShape(s, { left: 910, top: 252, width: 226, height: 240 }, colors.paleGreen, colors.line);
  addText(s, "Pattern", { left: 940, top: 284, width: 166, height: 34 }, { size: 24, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "Guidance and signaling genes rise, while immediate-early and RNA-processing genes fall.", { left: 934, top: 348, width: 178, height: 88 }, { size: 18, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Source: results/03_DEG/DEG_5v0_ALL.csv");
  addNotes(s, [
    "This table is designed for oral defense: you can point to one or two genes rather than reading every row.",
    "Mention Npas4 verbally as LRT-supported if the committee asks about IEGs."
  ]);
}

// 14
{
  const s = newSlide(); slideNo++;
  addTitle(s, "DEG heatmap", "The 5-min DEG set forms a coherent sample-level pattern", "The heatmap checks whether DEG behavior is distributed across samples rather than confined to one point.");
  await addImage(s, assets.heatmap, { left: 170, top: 200, width: 720, height: 430 }, "5v0 DEG heatmap");
  addShape(s, { left: 928, top: 254, width: 224, height: 250 }, colors.white, colors.line);
  addText(s, "Readout", { left: 956, top: 286, width: 168, height: 30 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "The selected DEGs separate the 5-min response while remaining consistent with the replicate-adjusted model.", { left: 958, top: 344, width: 164, height: 96 }, { size: 17, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Source: results/03_DEG/06_DEG_heatmap_5v0_v4.png");
  addNotes(s, [
    "Use this as a bridge from individual genes to temporal behavior.",
    "Avoid overclaiming clustering; the main claim is coherence, not perfect classification."
  ]);
}

// 15
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Temporal dynamics", "Representative genes show a 5-min deviation followed by partial or full return", "This supports pulse-like behavior at the gene level.");
  await addImage(s, assets.trajectory, { left: 82, top: 198, width: 772, height: 430 }, "Six-gene trajectory plot");
  addShape(s, { left: 900, top: 248, width: 252, height: 282 }, colors.white, colors.line);
  addText(s, "Important nuance", { left: 928, top: 278, width: 196, height: 30 }, { size: 21, bold: true, color: colors.accent, alignment: "center" });
  addBullets(s, [
    "Most LRT-significant genes behave like a pulse.",
    "Fos rebounds above Vehicle at 15 min.",
    "Vehicle variation for Fos is visible and should be stated honestly."
  ], { left: 930, top: 328, width: 194, height: 132 }, { size: 16 });
  addFooter(s, slideNo, "Source: results/03_DEG/05_trajectory_6genes.png");
  addNotes(s, [
    "This is a good place to show scientific caution.",
    "The pathway-level reversal is cleaner than every individual gene trajectory."
  ]);
}

// 16
{
  const s = newSlide(); slideNo++;
  addTitle(s, "ROCK specificity", "Rock1 decreases acutely, while Rock2 remains statistically unchanged", "This suggests selective regulation within a canonical cytoskeletal signaling family.");
  await addImage(s, assets.rock, { left: 140, top: 198, width: 700, height: 430 }, "Rock1 and Rock2 trajectory");
  addShape(s, { left: 902, top: 252, width: 236, height: 248 }, colors.paleGreen, colors.line);
  addText(s, "5v0 contrast", { left: 930, top: 286, width: 180, height: 28 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "Rock1: log2FC -0.43, padj 9.4e-6\nRock2: log2FC +0.07, padj 0.999", { left: 926, top: 348, width: 188, height: 82 }, { size: 18, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Source: results/03_DEG/05b_rock1_vs_rock2_trajectory.png");
  addNotes(s, [
    "This slide is useful for mechanism discussion because ROCK is close to canonical guidance signaling.",
    "Do not overstate causality: the RNA-seq shows selective transcriptional response, not protein activity."
  ]);
}

// 17
{
  const s = newSlide(); slideNo++;
  addTitle(s, "GO BP at 5 min", "Netrin-1 activates neuron projection and axon guidance programs within 5 min", "The strongest evidence is coordinated ranking across biological processes.");
  await addImage(s, assets.go5, { left: 84, top: 190, width: 810, height: 440 }, "5v0 GO BP GSEA barplot");
  addKpi(s, "313", "significant GO BP terms", { left: 930, top: 228, width: 220, height: 148 }, colors.green);
  addKpi(s, "285 up", "positive NES terms", { left: 930, top: 414, width: 220, height: 148 }, colors.teal);
  addFooter(s, slideNo, "Source: results/04_GSEA/GSEA_GO_BP_5v0.csv");
  addNotes(s, [
    "Point to central nervous system neuron differentiation, neuron migration, neuron projection guidance, and axon guidance.",
    "This is one of the main result slides."
  ]);
}

// 18
{
  const s = newSlide(); slideNo++;
  addTitle(s, "KEGG at 5 min", "Axon guidance is the top KEGG pathway in the acute response", "The pathway result aligns directly with Netrin-1 biology.");
  await addImage(s, assets.kegg5, { left: 112, top: 190, width: 760, height: 430 }, "5v0 KEGG GSEA barplot");
  addShape(s, { left: 918, top: 252, width: 234, height: 250 }, colors.white, colors.line);
  addText(s, "Top KEGG signal", { left: 944, top: 282, width: 182, height: 30 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "Axon guidance\nNES 2.16\nBH-adjusted p = 4.1e-7", { left: 944, top: 344, width: 182, height: 96 }, { size: 21, bold: true, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Source: results/04_GSEA/GSEA_KEGG_5v0.csv");
  addNotes(s, [
    "This slide connects the transcriptomic result back to the ligand's known function.",
    "Mention that calcium and adhesion-related pathways also appear."
  ]);
}

// 19
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Program architecture", "The 5-min response is bidirectional, not a generic activation signature", "Guidance-related pathways rise while RNA processing and biosynthetic modules fall.");
  addShape(s, { left: 106, top: 238, width: 470, height: 300 }, colors.paleGreen, colors.line);
  addText(s, "Up at 5 min", { left: 142, top: 276, width: 398, height: 42 }, { size: 30, bold: true, color: colors.green, alignment: "center" });
  addBullets(s, [
    "Neuron projection guidance",
    "Axon guidance",
    "Synapse assembly",
    "Cell adhesion / IgSF CAM",
    "NO-calcium signaling"
  ], { left: 166, top: 350, width: 350, height: 132 }, { size: 20 });
  addShape(s, { left: 704, top: 238, width: 470, height: 300 }, colors.white, colors.line);
  addText(s, "Down at 5 min", { left: 740, top: 276, width: 398, height: 42 }, { size: 30, bold: true, color: colors.red, alignment: "center" });
  addBullets(s, [
    "RNA processing",
    "mRNA splicing",
    "Ribosome biogenesis",
    "Translation-related programs",
    "Fatty-acid degradation signature"
  ], { left: 764, top: 350, width: 350, height: 132 }, { size: 20 });
  addFooter(s, slideNo, "Source: GSEA GO BP and KEGG 5v0 results");
  addNotes(s, [
    "This is a synthesis slide. It turns the gene and pathway lists into one interpretable program.",
    "Emphasize that the result is coordinated and bidirectional."
  ]);
}

// 20
{
  const s = newSlide(); slideNo++;
  addTitle(s, "15v5 reversal", "By 15 min, the 5-min GO BP program is directionally flipped", "The temporal contrast shows active reversal from the acute state.");
  await addImage(s, assets.go15v5, { left: 84, top: 190, width: 812, height: 440 }, "15v5 GO BP GSEA barplot");
  addKpi(s, "295", "significant GO BP terms", { left: 930, top: 228, width: 220, height: 148 }, colors.green);
  addKpi(s, "264", "negative NES terms", { left: 930, top: 414, width: 220, height: 148 }, colors.red);
  addFooter(s, slideNo, "Source: results/04_GSEA/GSEA_GO_BP_15v5.csv");
  addNotes(s, [
    "The important point is not that nothing happens by 15 min; rather, 15v5 shows reversal relative to the 5-min state.",
    "This is central to the transient pulse interpretation."
  ]);
}

// 21
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Quantitative reversal", "Shared pathways show near-perfect mirror symmetry between 5v0 and 15v5", "This is the strongest quantitative evidence for a transient program.");
  await addImage(s, assets.mirror, { left: 86, top: 188, width: 800, height: 450 }, "GSEA mirror scatter 5v0 versus 15v5");
  addShape(s, { left: 928, top: 252, width: 224, height: 250 }, colors.paleGreen, colors.line);
  addText(s, "Mirror statistic", { left: 956, top: 284, width: 168, height: 30 }, { size: 21, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "603 shared pathways\nNES correlation\nr = -0.991", { left: 952, top: 346, width: 176, height: 98 }, { size: 25, bold: true, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Source: results/04_GSEA/13_GSEA_mirror_scatter_5v0_vs_15v5.png");
  addNotes(s, [
    "Pause on this slide. It is the headline result.",
    "Explain that the same pathways that rise at 5 min tend to fall in 15v5, and vice versa."
  ]);
}

// 22
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Return toward baseline", "15v0 has no significant GO BP terms, with a mild mitochondrial KEGG signal", "This supports pathway-level return while preserving an honest caveat.");
  await addImage(s, assets.kegg15v0, { left: 104, top: 198, width: 740, height: 430 }, "15v0 KEGG GSEA barplot");
  addShape(s, { left: 900, top: 236, width: 252, height: 292 }, colors.white, colors.line);
  addText(s, "Interpret carefully", { left: 928, top: 266, width: 196, height: 30 }, { size: 21, bold: true, color: colors.accent, alignment: "center" });
  addBullets(s, [
    "GO BP: 0 significant terms",
    "KEGG: 6 significant terms",
    "OXPHOS leads the KEGG signal",
    "Disease labels reflect shared mitochondrial genes, not disease biology"
  ], { left: 930, top: 316, width: 196, height: 142 }, { size: 16 });
  addFooter(s, slideNo, "Source: results/04_GSEA/GSEA_GO_BP_15v0.csv and GSEA_KEGG_15v0.csv");
  addNotes(s, [
    "This slide is intentionally nuanced.",
    "Say that the transcriptional guidance program largely returns, while a late mitochondrial/OXPHOS signal remains detectable."
  ]);
}

// 23
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Integrated evidence", "Multiple result layers converge on the same transient program", "This table is the defense-ready summary of the core evidence chain.");
  const rows = [
    ["Module", "5 min", "By 15 min", "Evidence"],
    ["Axon guidance / projection", "up", "falls back", "GO BP, KEGG, Cntn2"],
    ["RNA processing / splicing", "down", "recovers", "Srsf5, Snrnp70, GO BP"],
    ["IEG response", "down", "rebound/return", "Fos, Npas4/LRT"],
    ["ROCK / cytoskeleton", "Rock1 down", "Rock2 stable", "DEG + trajectory"],
    ["NO-calcium / adhesion", "up", "falls back", "Nos1, Ryr3, Tln2"],
    ["Mitochondria / OXPHOS", "minor", "late rise", "15v0/15v5 KEGG"],
  ];
  const table = s.tables.add({ rows: rows.length, columns: 4, left: 74, top: 198, width: 1130, height: 408, values: rows });
  table.styleOptions = { headerRow: true, bandedRows: true };
  for (let c = 0; c < 4; c++) {
    table.getCell(0, c).fill = colors.navy;
    table.getCell(0, c).text.style = { fontSize: 14, bold: true, color: colors.white, typeface: "Aptos" };
  }
  table.borders.assign({ style: "solid", fill: colors.line, width: 1 });
  addFooter(s, slideNo, "Source: Phase6 summary table and verified CSV outputs");
  addNotes(s, [
    "This slide is useful if the committee asks you to summarize all results in one view.",
    "The table intentionally combines genes, trajectories and GSEA rather than separating them."
  ]);
}

// 24
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Proposed model", "Netrin-1 launches a short-lived transcriptional reallocation program", "The model integrates guidance activation with transient suppression of general RNA-processing machinery.");
  addShape(s, { left: 92, top: 254, width: 220, height: 132 }, colors.white, colors.line);
  addText(s, "Netrin-1", { left: 126, top: 292, width: 152, height: 38 }, { size: 28, bold: true, color: colors.navy, alignment: "center" });
  addText(s, "acute cue", { left: 126, top: 338, width: 152, height: 24 }, { size: 16, color: colors.muted, alignment: "center" });
  addText(s, ">", { left: 332, top: 296, width: 42, height: 54 }, { size: 42, bold: true, color: colors.accent, alignment: "center" });
  addShape(s, { left: 392, top: 220, width: 320, height: 200 }, colors.paleGreen, colors.line);
  addText(s, "5-min transcriptional pulse", { left: 426, top: 258, width: 252, height: 34 }, { size: 24, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "guidance / projection up\nRNA processing / ribosome down\nIEG suppression", { left: 430, top: 324, width: 244, height: 78 }, { size: 19, color: colors.ink, alignment: "center" });
  addText(s, ">", { left: 738, top: 296, width: 42, height: 54 }, { size: 42, bold: true, color: colors.accent, alignment: "center" });
  addShape(s, { left: 802, top: 254, width: 330, height: 132 }, colors.white, colors.line);
  addText(s, "15-min reversal", { left: 838, top: 292, width: 258, height: 38 }, { size: 28, bold: true, color: colors.navy, alignment: "center" });
  addText(s, "GO BP returns; 15v5 mirrors 5v0", { left: 838, top: 340, width: 258, height: 24 }, { size: 16, color: colors.muted, alignment: "center" });
  addText(s, "Mechanistic interpretation: acute guidance cues may transiently bias nuclear programs toward remodeling and away from broad biosynthetic processing, then rapidly reset.", { left: 150, top: 510, width: 980, height: 54 }, { size: 22, bold: true, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo, "Model synthesized from DEG, trajectory and GSEA results");
  addNotes(s, [
    "Use this as the conceptual payoff of the deck.",
    "Be clear that this is a proposed model, not proven causality."
  ]);
}

// 25
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Scientific significance", "The novelty is minutes-scale coordination, not simply another DEG list", "The data connect a classic axon guidance cue to a fast transcriptome-wide response.");
  const cards = [
    ["Acute transcription", "Shows that a guidance cue can be transcriptomically visible within 5 min."],
    ["Bidirectional program", "Guidance-related pathways rise while RNA processing and ribosome modules fall."],
    ["Quantified reversibility", "The response reverses with r = -0.991 across shared GSEA pathways."],
    ["Mechanistic anchors", "Fos/Npas4 suppression and Rock1 specificity provide hypotheses for follow-up."]
  ];
  cards.forEach((c, i) => {
    const left = 104 + (i % 2) * 540;
    const top = 224 + Math.floor(i / 2) * 170;
    addShape(s, { left, top, width: 470, height: 126 }, i % 2 ? colors.paleGreen : colors.white, colors.line);
    addText(s, c[0], { left: left + 28, top: top + 24, width: 414, height: 28 }, { size: 23, bold: true, color: i % 2 ? colors.teal : colors.navy });
    addText(s, c[1], { left: left + 28, top: top + 66, width: 414, height: 40 }, { size: 17, color: colors.ink });
  });
  addFooter(s, slideNo);
  addNotes(s, [
    "This is a discussion slide.",
    "Frame novelty conservatively: the dataset suggests a fast transcriptional layer that merits mechanistic validation."
  ]);
}

// 26
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Limitations", "The strongest conclusions are pathway-level and temporal, with clear design boundaries", "Being explicit here makes the defense more credible.");
  addBullets(s, [
    "n = 3 per condition: adequate for a focused RNA-seq pilot, but small for subtle single-gene effects.",
    "No independent PBS-15 min control: 15v0 is useful but should be interpreted with this design caveat.",
    "Only three timepoints: pulse shape is inferred from 0/5/15 min rather than dense time-course modeling.",
    "Bulk RNA-seq: marker analysis supports composition stability, but cell-type-specific responses remain unresolved.",
    "RNA abundance is not protein activity: ROCK, DCC/UNC5 and cytoskeletal mechanisms require orthogonal validation."
  ], { left: 130, top: 220, width: 1010, height: 260 }, { size: 20 });
  addShape(s, { left: 184, top: 536, width: 912, height: 60 }, colors.paleGreen, colors.line);
  addText(s, "Defensible conclusion: acute Netrin-1 produces a coherent, reversible transcriptional signature; mechanism and causality require targeted follow-up.", { left: 216, top: 552, width: 848, height: 30 }, { size: 19, bold: true, color: colors.ink, alignment: "center" });
  addFooter(s, slideNo);
  addNotes(s, [
    "This slide is meant to pre-empt the most likely committee critiques.",
    "Do not apologize for the study; define exactly what the design supports."
  ]);
}

// 27
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Next experiments", "Follow-up should test timing, mechanism, and cell specificity", "These experiments convert the RNA-seq signature into mechanistic biology.");
  const exps = [
    ["Dense time course", "0, 2, 5, 10, 15, 30 min qPCR/RNA-seq for Fos, Npas4, Rock1 and pathway markers."],
    ["Perturb receptors", "DCC/UNC5 blockade or knockdown to test whether the transcriptional pulse is receptor-dependent."],
    ["Protein/signaling", "ROCK1 protein, phospho-signaling and cytoskeletal readouts after acute stimulation."],
    ["Cell resolution", "Single-cell or sorted-neuron validation to localize the response within culture heterogeneity."]
  ];
  exps.forEach((e, i) => {
    const left = 108 + (i % 2) * 542;
    const top = 214 + Math.floor(i / 2) * 178;
    addShape(s, { left, top, width: 474, height: 132 }, i === 1 || i === 2 ? colors.paleGreen : colors.white, colors.line);
    addText(s, e[0], { left: left + 28, top: top + 24, width: 420, height: 28 }, { size: 23, bold: true, color: colors.teal });
    addText(s, e[1], { left: left + 28, top: top + 64, width: 420, height: 50 }, { size: 16.5, color: colors.ink });
  });
  addFooter(s, slideNo);
  addNotes(s, [
    "Use this slide to show that the project has a clear next phase.",
    "The most direct validation is dense time-course qPCR plus receptor perturbation."
  ]);
}

// 28
{
  const s = newSlide(); slideNo++;
  addTitle(s, "Final take-home", "Acute Netrin-1 stimulation reveals a fast, reversible neuronal transcriptional program", "The result expands the time scale on which guidance cues can be discussed.");
  addShape(s, { left: 112, top: 214, width: 1056, height: 300 }, colors.white, colors.line);
  addText(s, "One-sentence conclusion", { left: 152, top: 254, width: 976, height: 32 }, { size: 22, bold: true, color: colors.teal, alignment: "center" });
  addText(s, "Within 5 minutes, Netrin-1 activates guidance/projection programs and suppresses RNA-processing/biosynthetic modules, and by 15 minutes this pathway program is almost perfectly reversed.", { left: 178, top: 324, width: 924, height: 86 }, { size: 30, bold: true, color: colors.ink, alignment: "center", typeface: "Aptos Display" });
  addText(s, "Thank you", { left: 492, top: 548, width: 296, height: 48 }, { size: 34, bold: true, color: colors.navy, alignment: "center", typeface: "Aptos Display" });
  addFooter(s, slideNo);
  addNotes(s, [
    "End by returning to the central claim.",
    "Do not add new data here; leave the final sentence clean and memorable."
  ]);
}

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(PREVIEW_DIR, `${stem}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await layout.text());
}

await writeBlob(path.join(PREVIEW_DIR, "deck-montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 1 }));

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(FINAL_PPTX);

const snapshot = await presentation.inspect({ kind: "slide,textbox,image,table,shape,notes", maxChars: 12000 });
await fs.writeFile(path.join(QA_DIR, "inspect.ndjson"), snapshot.ndjson);

const qa = [
  "Visual QA draft",
  `Final PPTX: ${FINAL_PPTX}`,
  `Slide count: ${presentation.slides.items.length}`,
  "Generated previews: one PNG per slide plus deck-montage.webp.",
  "All scientific figures are embedded from local results PNG files.",
  "Speaker notes are included on every slide.",
  "Known caveat intentionally represented: 15v0 has 0 significant GO BP terms but a mild KEGG/OXPHOS signal; 15v0 also has 1 DEG in verified CSV outputs.",
].join("\n");
await fs.writeFile(path.join(QA_DIR, "visual-qa.txt"), qa);

console.log(JSON.stringify({
  finalPptx: FINAL_PPTX,
  slides: presentation.slides.items.length,
  previewDir: PREVIEW_DIR,
  qa: path.join(QA_DIR, "visual-qa.txt"),
}, null, 2));

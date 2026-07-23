import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const artifactPath = require.resolve("@oai/artifact-tool");
const { Presentation, PresentationFile } = await import(
  "file:///" + artifactPath.replace(/\\/g, "/")
);

const ROOT = "D:/Dropbox/Dropbox/RNAseq 2025/Claude analysis";
const TMP = path.join(ROOT, "outputs/hand_enhance/tmp");
const PREVIEW = path.join(TMP, "preview");
const LAYOUT = path.join(TMP, "layout");
const QA = path.join(TMP, "qa");
const OUT = path.join(ROOT, "Hand_enhanced.pptx");
const OUT_DATED = path.join(ROOT, "Hand_enhanced_2026-06-18.pptx");

await fs.mkdir(PREVIEW, { recursive: true });
await fs.mkdir(LAYOUT, { recursive: true });
await fs.mkdir(QA, { recursive: true });

const C = {
  ink: "#222832",
  muted: "#5C6470",
  light: "#F5F6F7",
  line: "#D9DDE3",
  red: "#C73E3E",
  blue: "#3B7AB8",
  orange: "#D88040",
  teal: "#4B9C9A",
  green: "#5B8F5A",
  purple: "#8E63A9",
  gold: "#C49A42",
  white: "#FFFFFF"
};

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

async function readImage(rel) {
  return await fs.readFile(path.join(ROOT, rel));
}

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

function addShape(slide, cfg) {
  return slide.shapes.add(cfg);
}

function text(slide, value, left, top, width, height, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name: style.name ?? "text",
    position: { left, top, width, height },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 }
  });
  shape.text = value;
  shape.text.style = {
    typeface: style.typeface ?? "Aptos",
    fontSize: style.fontSize ?? 18,
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    color: style.color ?? C.ink,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top"
  };
  return shape;
}

function line(slide, left, top, width, color = C.line, weight = 1) {
  addShape(slide, {
    geometry: "line",
    name: "rule",
    position: { left, top, width, height: 0 },
    fill: "none",
    line: { style: "solid", fill: color, width: weight }
  });
}

function box(slide, left, top, width, height, fill = C.white, stroke = C.line, name = "box") {
  return addShape(slide, {
    geometry: "roundRect",
    name,
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: stroke, width: 1 },
    borderRadius: 8
  });
}

function bg(slide) {
  slide.background.fill = C.white;
  addShape(slide, {
    geometry: "rect",
    name: "left-color-bar",
    position: { left: 0, top: 0, width: 12, height: 720 },
    fill: C.orange,
    line: { style: "solid", fill: C.orange, width: 0 }
  });
}

function header(slide, kicker, title, subtitle, n) {
  bg(slide);
  addShape(slide, {
    geometry: "rect",
    name: "kicker-square",
    position: { left: 54, top: 38, width: 12, height: 12 },
    fill: C.orange,
    line: { style: "solid", fill: C.orange, width: 0 },
    rotation: 45
  });
  text(slide, kicker.toUpperCase(), 84, 29, 520, 20, {
    name: "kicker",
    fontSize: 12,
    bold: true,
    color: C.muted
  });
  text(slide, title, 66, 74, 1060, 66, {
    name: "title",
    typeface: "Aptos Display",
    fontSize: 34,
    bold: true,
    color: C.ink
  });
  if (subtitle) {
    text(slide, subtitle, 68, 146, 1010, 26, { name: "subtitle", fontSize: 15, color: C.muted });
  }
  text(slide, String(n).padStart(2, "0"), 1168, 680, 44, 18, {
    name: "page-number",
    fontSize: 11,
    color: C.muted,
    alignment: "right"
  });
  text(slide, "Netrin-1 RNA-seq | group meeting", 66, 680, 360, 18, {
    name: "footer",
    fontSize: 11,
    color: C.muted
  });
}

async function img(slide, rel, left, top, width, height, alt, fit = "contain") {
  slide.images.add({
    blob: await readImage(rel),
    contentType: "image/png",
    alt,
    fit,
    position: { left, top, width, height }
  });
}

function metric(slide, value, label, left, top, color = C.orange, width = 170) {
  text(slide, value, left, top, width, 48, {
    typeface: "Aptos Display",
    fontSize: 38,
    bold: true,
    color
  });
  text(slide, label, left, top + 50, width, 42, { fontSize: 13.5, color: C.muted });
}

function noteCard(slide, heading, body, left, top, width, height, color = C.orange) {
  box(slide, left, top, width, height, C.white, C.line, "note-card");
  addShape(slide, {
    geometry: "rect",
    name: "note-card-rule",
    position: { left, top, width: 5, height },
    fill: color,
    line: { style: "solid", fill: color, width: 0 }
  });
  text(slide, heading, left + 24, top + 18, width - 44, 22, {
    fontSize: 16,
    bold: true,
    color
  });
  text(slide, body, left + 24, top + 50, width - 44, height - 62, {
    fontSize: 14.5,
    color: C.ink
  });
}

function notes(slide, value) {
  slide.speakerNotes.textFrame.setText(value);
  slide.speakerNotes.setVisible(true);
}

function section(n, label, title, subtitle) {
  const slide = deck.slides.add();
  slide.background.fill = C.white;
  addShape(slide, { geometry: "rect", name: "left-color-bar", position: { left: 0, top: 0, width: 12, height: 720 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
  text(slide, label.toUpperCase(), 74, 92, 540, 24, { fontSize: 13, bold: true, color: C.muted });
  text(slide, title, 74, 218, 940, 120, { typeface: "Aptos Display", fontSize: 48, bold: true, color: C.ink });
  text(slide, subtitle, 78, 374, 840, 34, { fontSize: 18, color: C.muted });
  line(slide, 76, 610, 900, C.orange, 4);
  text(slide, String(n).padStart(2, "0"), 1168, 680, 44, 18, { fontSize: 11, color: C.muted, alignment: "right" });
  return slide;
}

let s;

s = deck.slides.add();
s.background.fill = C.white;
addShape(s, { geometry: "rect", name: "left-color-bar", position: { left: 0, top: 0, width: 14, height: 720 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
text(s, "Netrin-1 RNA-seq", 74, 92, 720, 70, { typeface: "Aptos Display", fontSize: 56, bold: true });
text(s, "Results update for group meeting", 78, 170, 620, 34, { typeface: "Aptos Display", fontSize: 28, color: C.muted });
text(s, "Rat E18 cortical mixed culture | DIV1, DIV2, DIV2 + Netrin-1 | 3 conditions x 3 biological replicates", 80, 246, 890, 24, { fontSize: 16, color: C.muted });
metric(s, "25", "strict Netrin-responsive DEGs", 84, 470, C.orange, 230);
metric(s, "481 / 42", "GO BP / KEGG terms in C1 GSEA", 360, 470, C.teal, 270);
metric(s, "1,495", "strict DIV2 vs DIV1 DEGs", 708, 470, C.gold, 240);
text(s, "Enhanced from Hand.pptx | June 18, 2026", 82, 650, 420, 22, { fontSize: 13, color: C.muted });
notes(s, "开场：这版是在原来的 Hand.pptx 基础上重排和补充的组会 result 版。重点是先给大家看关键数字，然后按 C1 Netrin effect、C2 developmental context、cell-type interpretation 三条线讲。");

s = deck.slides.add();
header(s, "overview", "Key numbers at a glance", "Use this slide to orient the audience before showing individual figures.", 2);
box(s, 68, 210, 320, 148, "#FAFBFC", C.line);
box(s, 468, 210, 320, 148, "#FAFBFC", C.line);
box(s, 868, 210, 320, 148, "#FAFBFC", C.line);
metric(s, "32,623", "genes quantified by Salmon", 100, 236, C.muted, 210);
metric(s, "14,148", "genes after low-count filtering", 500, 236, C.orange, 230);
metric(s, "12,107", "genes ranked for GSEA", 900, 236, C.teal, 220);
box(s, 80, 428, 500, 130, C.white, C.line);
text(s, "C1: Netrin vs DIV2", 112, 454, 250, 24, { fontSize: 20, bold: true, color: C.orange });
text(s, "STRICT 25 = 7 up / 18 down\nRELAXED 66 = 10 up / 56 down\nGSEA: GO BP 481, KEGG 42", 112, 492, 380, 66, { fontSize: 17, color: C.ink });
box(s, 690, 428, 500, 130, C.white, C.line);
text(s, "C2: DIV2 vs DIV1", 722, 454, 250, 24, { fontSize: 20, bold: true, color: C.green });
text(s, "STRICT 1,495 = 1,098 up / 397 down\nRELAXED 4,636 = 2,603 up / 2,033 down\nGSEA: GO BP 534, KEGG 99", 722, 492, 400, 66, { fontSize: 17, color: C.ink });
notes(s, "这页是总览。强调 C1 是小而聚焦的 Netrin 响应，C2 是规模大得多的发育/时间背景。C1 的 GSEA 是双向平衡，C2 更偏 activation。");

s = deck.slides.add();
header(s, "methods", "Filtering and analysis workflow", "The analysis keeps statistics on raw counts and uses corrected matrices only for visualization.", 3);
const steps = [
  ["Quantification", "DRAGEN-Salmon\ngene-level counts"],
  ["Filtering", "Counts >=10 in >=3 samples\n14,148 genes retained"],
  ["DESeq2", "~ batch + condition\nBH FDR"],
  ["DEG tiers", "STRICT: padj<0.05 & |LFC|>0.585\nRELAXED: padj<0.05"],
  ["Enrichment", "GSEA on Wald ranking\nORA for large C2 DEG sets"]
];
steps.forEach((d, i) => {
  const x = 74 + i * 232;
  box(s, x, 270, 190, 132, i % 2 ? "#FFFFFF" : "#FAFBFC", C.line);
  text(s, d[0], x + 16, 294, 154, 24, { fontSize: 18, bold: true, color: i === 4 ? C.orange : C.ink, alignment: "center" });
  text(s, d[1], x + 18, 336, 150, 50, { fontSize: 13.5, color: C.muted, alignment: "center" });
  if (i < 4) addShape(s, { geometry: "chevron", name: "step-arrow", position: { left: x + 198, top: 318, width: 28, height: 34 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
});
noteCard(s, "Important clarification", "Batch correction is visualization-only. Differential expression statistics are run on the original count matrix with batch modeled as a covariate.", 186, 502, 860, 84, C.blue);
notes(s, "方法页。讲清楚过滤后 14,148 genes，DESeq2 设计是 batch + condition。批次校正只用于 PCA 和 heatmap 展示，不用于统计。GSEA 用 Wald statistic 排序。");

s = deck.slides.add();
header(s, "quality control", "Sample correlation analysis supports downstream interpretation", "All samples cluster tightly with high pairwise correlation.", 4);
await img(s, "results/01_QC/01_sample_correlation_heatmap.png", 88, 190, 610, 438, "Sample correlation heatmap");
noteCard(s, "QC result", "Pairwise sample correlations are high (r = 0.9861-0.9987), with no obvious outlier sample.", 760, 246, 350, 130, C.green);
noteCard(s, "Practical readout", "The data quality is sufficient for contrast-level interpretation and downstream GSEA.", 760, 424, 350, 112, C.orange);
notes(s, "QC 相关性页。这里不用讲太多技术细节，直接说样本之间相关性很高，没有 outlier；因此可以进入差异表达和通路分析。");

s = deck.slides.add();
header(s, "quality control", "PCA shows why visual batch correction is necessary", "After preserving condition effects, Netrin-1 separates from DIV2 on PC2.", 5);
await img(s, "results/01_QC/04_PCA_before_after_combined.png", 74, 192, 720, 430, "PCA before and after correction");
noteCard(s, "Discovery moment", "After batch-effect removal for visualization, DIV2 and DIV2 + Netrin-1 separate on PC2.", 842, 238, 310, 138, C.orange);
noteCard(s, "Guardrail", "Do not describe corrected VST as the statistical input. It is only a visualization lens.", 842, 424, 310, 116, C.blue);
notes(s, "PCA 页。校正前后对比说明 batch effect 存在，所以可视化需要 correction；但统计仍然在 raw counts 上做。重点是 Netrin 在 PC2 上可见。");

s = section(6, "Result 1", "C1: Netrin-1 response is focused and bidirectional.", "DIV2 + Netrin-1 vs DIV2 control.");
notes(s, "进入结果一：主对比 C1，也就是 Netrin 处理效应。");

s = deck.slides.add();
header(s, "C1 DEG", "Volcano plot from DIV2 + Netrin-1 vs DIV2", "Strict DEG threshold: padj < 0.05 and |LFC| > 0.585.", 7);
await img(s, "results/02_DEG/01_volcano_netrin_vs_div2_v3.png", 70, 190, 690, 430, "C1 volcano plot");
metric(s, "25", "STRICT DEGs", 820, 218, C.red, 150);
metric(s, "7 up / 18 down", "direction", 990, 218, C.blue, 210);
metric(s, "66", "RELAXED DEGs", 820, 374, C.orange, 160);
text(s, "Top up: C3 (+2.54, padj 1.6e-20)\nTop down: Olig1 (-1.00, padj 3.3e-14)", 820, 520, 350, 58, { fontSize: 16, color: C.ink });
notes(s, "火山图页。C1 的响应很聚焦：strict 25 个，7 上调 18 下调；relaxed 66 个。C3 是最显著上调，Olig1 是最显著下调。注意不要说 C3 是最高表达，只说最显著。");

s = deck.slides.add();
header(s, "C1 DEG", "Top single-gene hits separate into immune/glial and progenitor modules", "These genes are informative, but not all neuron-intrinsic.", 8);
await img(s, "results/02_DEG/02_boxplots_key_DEGs_v3.png", 66, 190, 710, 430, "Key DEG boxplots");
noteCard(s, "Up module", "C3, Apoe, Adgre1, Ncf1, Itgal, Acod1\nImmune / microglial signature.", 830, 224, 320, 128, C.red);
noteCard(s, "Down module", "Olig1, Olig2, Sparcl1, Ccnd1, Id1/Id3\nOPC / glial / progenitor-linked signature.", 830, 410, 320, 140, C.blue);
notes(s, "单基因页。上调模块偏 immune/microglial，下调模块偏 Olig/progenitor/glial。这里要主动承认 bulk mixed culture 的细胞来源问题，为后面的 marker 分析铺垫。");

s = deck.slides.add();
header(s, "C1 expression structure", "Heatmap and trajectory patterns of all 66 relaxed DEGs", "The pattern argues against a simple acceleration model.", 9);
await img(s, "results/02_DEG/04_heatmap_66_DEGs_main_final.png", 60, 194, 500, 400, "C1 heatmap");
await img(s, "results/02_DEG/03_pattern_trajectories_v5.png", 610, 194, 560, 400, "C1 trajectory patterns");
text(s, "Main heatmap: batch-corrected VST for visualization", 102, 612, 390, 22, { fontSize: 13.5, color: C.muted });
text(s, "Trajectory: P1 monotonic-up = 0; P5 peak at DIV2 dominates", 638, 612, 500, 22, { fontSize: 13.5, color: C.muted });
notes(s, "热图和 trajectory 合并页。左边看 66 个 relaxed DEG 的两模块结构；右边看表达轨迹。重点：P1=0，没有基因沿 DIV1→DIV2→Netrin 单调上升，所以不能简单说 Netrin 加速成熟。P5 最大，但 Olig1/2 是胶质 lineage marker。");

s = deck.slides.add();
header(s, "C1 GSEA", "Gene-set analysis reveals the neuronal program beneath the top genes", "Synaptic and axon-guidance programs rise; cell-cycle programs fall.", 10);
await img(s, "results/03_GSEA/01_GSEA_GO_BP_barplot_final.png", 56, 188, 570, 430, "C1 GO BP GSEA");
await img(s, "results/03_GSEA/02_GSEA_KEGG_barplot_final.png", 668, 188, 546, 430, "C1 KEGG GSEA");
text(s, "GO BP: 481 significant terms (255 activated / 226 suppressed)", 82, 632, 520, 22, { fontSize: 13.5, color: C.muted });
text(s, "KEGG: 42 significant pathways (20 activated / 22 suppressed)", 690, 632, 500, 22, { fontSize: 13.5, color: C.muted });
notes(s, "GSEA 是 C1 的核心结果。虽然单基因 DEG 数量少，但全排序显示神经元通路协同变化：synapse、axon guidance、exocytosis 上调；cell cycle 和 DNA replication 下调。");

s = deck.slides.add();
header(s, "C1 GSEA examples", "Representative enrichment curves anchor the two-module interpretation", "Axon guidance and synapse assembly are activated; cell-cycle terms are suppressed.", 11);
await img(s, "results/03_GSEA/03_enrichment_axon_guidance_final.png", 68, 194, 520, 250, "Axon guidance enrichment");
await img(s, "results/03_GSEA/04_enrichment_synapse_assembly_final.png", 660, 194, 520, 250, "Synapse assembly enrichment");
await img(s, "results/03_GSEA/06_enrichment_cell_cycle_final.png", 364, 456, 520, 184, "Cell cycle enrichment");
notes(s, "GSEA 曲线页。强调 axon guidance 是 Netrin 的经典通路，在 GO 和 KEGG 都显著；synapse assembly 同方向；cell cycle 相关通路被抑制。");

s = deck.slides.add();
header(s, "C1 interpretation", "Two modules explain the primary result", "Netrin-1 fine-tunes both neuronal signaling and progenitor/cell-cycle programs.", 12);
box(s, 96, 236, 430, 216, "#FFF8F4", "#EDC7AA");
text(s, "Activated module", 126, 268, 220, 24, { fontSize: 21, bold: true, color: C.red });
text(s, "Synapse / axon guidance", 126, 310, 320, 32, { typeface: "Aptos Display", fontSize: 28, bold: true });
text(s, "GO axon guidance NES +1.85\nKEGG axon guidance NES +1.72\nSynapse assembly NES +2.05", 126, 372, 320, 62, { fontSize: 16, color: C.ink });
box(s, 740, 236, 430, 216, "#F4F8FC", "#BFD3E6");
text(s, "Suppressed module", 770, 268, 240, 24, { fontSize: 21, bold: true, color: C.blue });
text(s, "Cell cycle / progenitor", 770, 310, 330, 32, { typeface: "Aptos Display", fontSize: 28, bold: true });
text(s, "KEGG Cell cycle NES -2.70\nDNA replication / repair suppressed\nOlig1/Olig2/Ccnd1 down", 770, 372, 330, 62, { fontSize: 16, color: C.ink });
noteCard(s, "Result framing", "The cleanest interpretation is bidirectional tuning, not broad developmental acceleration.", 260, 540, 760, 76, C.orange);
notes(s, "解释模型页。左边是神经元通路激活，右边是 cell-cycle/progenitor 抑制。最后一句很重要：这是 bidirectional tuning，不是 broad developmental acceleration。");

s = section(13, "Result 2", "C2: 24 h development provides scale and context.", "DIV2 vs DIV1.");
notes(s, "进入结果二：C2 发育/时间背景。");

s = deck.slides.add();
header(s, "C2 DEG", "Volcano plot from DIV2 vs DIV1", "The developmental contrast is much larger than the Netrin contrast.", 14);
await img(s, "results/02_DEG/05_volcano_div2_vs_div1_final.png", 70, 190, 690, 430, "C2 volcano plot");
metric(s, "1,495", "STRICT DEGs", 820, 218, C.red, 160);
metric(s, "1,098 up / 397 down", "direction", 998, 218, C.blue, 210);
metric(s, "4,636", "RELAXED DEGs", 820, 374, C.orange, 170);
text(s, "Olig1: +3.37 in C2 but -1.00 in C1\n→ Netrin reverses part of natural induction.", 820, 520, 350, 62, { fontSize: 16, color: C.ink });
notes(s, "C2 火山图。STRICT 1495，RELAXED 4636，远大于 C1。Olig1 在 C2 上调但在 C1 下调，这说明 Netrin 不是简单顺着发育方向推进。");

s = deck.slides.add();
header(s, "C2 DEG", "Top hits from DIV2 vs DIV1", "Developmental DEGs include neuronal maturation and cell-composition signals.", 15);
await img(s, "results/02_DEG/06_boxplots_div2_vs_div1.png", 72, 190, 700, 430, "C2 DEG boxplots");
noteCard(s, "Scale", "C2 contains ~60x more strict DEGs than C1, so it is a context contrast rather than the main treatment result.", 828, 236, 310, 154, C.green);
noteCard(s, "Caveat", "Because the culture is mixed, many large C2 DEGs can reflect changing cell composition.", 828, 444, 310, 120, C.blue);
notes(s, "C2 top hits 页。讲 C2 规模很大，是 24 小时发育/背景。这里开始提醒：混合培养导致细胞组成变化可能贡献很多 DEG。");

s = deck.slides.add();
header(s, "C2 ORA", "GO BP ORA confirms developmental maturation and immune/progenitor shifts", "ORA uses strict DEG input; GO terms are simplified to reduce redundancy.", 16);
await img(s, "results/04_ORA_div2_vs_div1/01_dotplot_GO_BP_up_simplified.png", 56, 188, 570, 430, "C2 GO BP ORA up");
await img(s, "results/04_ORA_div2_vs_div1/02_dotplot_GO_BP_down_simplified.png", 668, 188, 546, 430, "C2 GO BP ORA down");
text(s, "Input: 985 up strict genes with Entrez ID; simplified significant GO BP terms = 160", 74, 632, 550, 22, { fontSize: 13, color: C.muted });
text(s, "Input: 356 down strict genes with Entrez ID; simplified significant GO BP terms = 91", 686, 632, 550, 22, { fontSize: 13, color: C.muted });
notes(s, "C2 GO ORA 页。上调端偏神经成熟、GPCR、膜电位、突触、离子通道；下调端偏免疫反应、趋化、吞噬。注意 985/356 是输入基因数，不是 raw significant term 数。");

s = deck.slides.add();
header(s, "C2 ORA", "KEGG ORA provides pathway-level context for C2", "Disease-named KEGG pathways should be read as shared immune machinery, not disease states.", 17);
await img(s, "results/04_ORA_div2_vs_div1/03_dotplot_KEGG_up.png", 56, 188, 570, 430, "C2 KEGG ORA up");
await img(s, "results/04_ORA_div2_vs_div1/04_dotplot_KEGG_down.png", 668, 188, 546, 430, "C2 KEGG ORA down");
text(s, "UP: 58 significant KEGG pathways", 84, 632, 340, 22, { fontSize: 13.5, color: C.muted });
text(s, "DOWN: 11 significant KEGG pathways", 700, 632, 340, 22, { fontSize: 13.5, color: C.muted });
notes(s, "C2 KEGG ORA 页。上调端是 neurotransmitter receptor/synapse/Ca-cAMP 等神经相关通路；下调端有感染、补体、细胞因子等免疫机制。KEGG disease name 不代表样本处于疾病状态。");

s = deck.slides.add();
header(s, "C2 expression structure", "Heatmaps show development is the dominant expression axis", "DIV1 separates from both DIV2 states.", 18);
await img(s, "results/02_DEG/07_heatmap_div2_vs_div1_top60.png", 68, 190, 520, 430, "C2 top 60 heatmap");
await img(s, "results/02_DEG/08_heatmap_div2_vs_div1_all1495.png", 650, 190, 520, 430, "C2 all 1495 heatmap");
text(s, "Top 60 strict DEGs", 138, 632, 260, 22, { fontSize: 13.5, color: C.muted });
text(s, "All 1,495 strict DEGs", 722, 632, 260, 22, { fontSize: 13.5, color: C.muted });
notes(s, "C2 heatmap 页。列聚类显示 DIV1 单独分开，DIV2 和 DIV2+Netrin 更近；说明发育差异远大于 Netrin 处理效应。");

s = deck.slides.add();
header(s, "C2 GSEA", "DIV2 activates mature neuronal programs and suppresses precursor programs", "GSEA agrees with the DEG and ORA readout.", 19);
await img(s, "results/03_GSEA/03_GSEA_GO_BP_div2_vs_div1_barplot.png", 56, 188, 570, 430, "C2 GO BP GSEA");
await img(s, "results/03_GSEA/04_GSEA_KEGG_div2_vs_div1_barplot.png", 668, 188, 546, 430, "C2 KEGG GSEA");
text(s, "GO BP: 534 significant terms (410 activated / 124 suppressed)", 82, 632, 530, 22, { fontSize: 13.5, color: C.muted });
text(s, "KEGG: 99 significant pathways (89 activated / 10 suppressed)", 690, 632, 520, 22, { fontSize: 13.5, color: C.muted });
notes(s, "C2 GSEA 页。DIV2 富集 mature neuronal programs，包括 synaptic transmission、neurotransmitter transport、plasticity；DIV1 富集 chromatin remodeling、ribosome biogenesis、DNA repair 等前体程序。");

s = section(20, "Result 3", "Cell-type marker analysis changes how we read the bulk signal.", "This is the key guardrail for interpretation.");
notes(s, "进入结果三：细胞类型 marker 分析。这部分是解释 bulk signal 的关键。");

s = deck.slides.add();
header(s, "cell-type context", "Cell-type marker TPM confirms mixed-culture composition", "This supports cautious source attribution for bulk RNA-seq.", 21);
await img(s, "results/cell_type_marker_TPM_purity_final.png", 84, 190, 720, 430, "Cell-type marker TPM purity plot");
noteCard(s, "Why this matters", "Bulk RNA-seq signal is an average across neurons, macroglia, and microglia. Marker behavior is an inference, not direct cell counting.", 850, 250, 300, 190, C.blue);
notes(s, "细胞类型背景页。说明这是 mixed culture，bulk RNA-seq 不能直接分配细胞来源。这里的 marker 分析用于解释信号来源，但不是直接测量细胞数量。");

s = deck.slides.add();
header(s, "cell-type markers", "DIV2 vs DIV1 contains a strong composition shift", "Macroglia / OPC markers rise; microglia markers fall; neuronal markers are relatively stable.", 22);
await img(s, "results/02_DEG/09_celltype_marker_div2_vs_div1.png", 82, 188, 760, 440, "C2 cell-type marker plot");
noteCard(s, "C2 reading", "Many developmental DEGs likely reflect composition changes in mixed culture, not only neuron-intrinsic maturation.", 892, 250, 290, 160, C.green);
text(s, "No AraC mixed culture: marker behavior is inference, not direct cell counting.", 894, 468, 282, 56, { fontSize: 14.5, color: C.muted });
notes(s, "C2 marker 页。宏胶质/OPC 和 astrocyte marker 上升，microglia marker 下降，神经元 marker 相对稳定。解释：C2 的许多 DEG 很可能包含细胞组成变化。");

s = deck.slides.add();
header(s, "cell-type markers", "Netrin treatment does not show the same composition collapse", "Microglial effect genes rise; identity markers are mostly trends with wide uncertainty.", 23);
await img(s, "results/02_DEG/10_celltype_marker_netrin_vs_div2.png", 82, 188, 760, 440, "C1 cell-type marker plot");
noteCard(s, "C1 reading", "Immune genes are consistent with microglial activation, but identity markers do not prove a large increase in microglia number.", 892, 250, 290, 176, C.orange);
text(s, "Preferred wording: “consistent with microglial activation,” not “Netrin directly activates microglia.”", 894, 478, 282, 70, { fontSize: 14.5, color: C.muted });
notes(s, "C1 marker 页。microglia effect genes 上升，但身份 marker 只是趋势且误差大。因此最好说 consistent with microglial activation，不要说 Netrin 直接激活 microglia。");

s = deck.slides.add();
header(s, "working model", "Direct neuronal axis + indirect/source-limited immune axis", "This framing keeps the interpretation strong without over-claiming causality.", 24);
box(s, 90, 246, 260, 118, "#FFF8F4", "#EDC7AA");
box(s, 500, 202, 300, 126, "#FAFBFC", "#CAD6DC");
box(s, 500, 450, 300, 104, "#F4F8FC", "#BFD3E6");
box(s, 948, 300, 220, 126, "#FFFDF8", "#E4D4A6");
text(s, "Exogenous\nNetrin-1", 124, 276, 190, 52, { fontSize: 25, bold: true, color: C.orange, alignment: "center" });
text(s, "Cortical neurons", 536, 238, 230, 26, { fontSize: 24, bold: true, alignment: "center" });
text(s, "Neo1 / Dcc / Dscam / Unc5a", 538, 278, 226, 20, { fontSize: 13.5, color: C.muted, alignment: "center" });
text(s, "Synapse / axon guidance", 530, 486, 240, 24, { fontSize: 20, bold: true, color: C.red, alignment: "center" });
text(s, "Microglia", 990, 334, 140, 26, { fontSize: 24, bold: true, alignment: "center" });
text(s, "C3 / Apoe / Ncf1", 990, 374, 140, 20, { fontSize: 13.5, color: C.muted, alignment: "center" });
addShape(s, { geometry: "line", name: "direct-arrow", position: { left: 350, top: 304, width: 150, height: -42 }, fill: "none", line: { style: "solid", fill: C.orange, width: 3, endArrowType: "triangle" } });
addShape(s, { geometry: "line", name: "pathway-arrow", position: { left: 650, top: 330, width: 0, height: 116 }, fill: "none", line: { style: "solid", fill: C.red, width: 3, endArrowType: "triangle" } });
addShape(s, { geometry: "line", name: "indirect-arrow", position: { left: 800, top: 260, width: 148, height: 94 }, fill: "none", line: { style: "solid", fill: C.gold, width: 2, dash: "dash", endArrowType: "triangle" } });
text(s, "direct", 384, 258, 70, 18, { fontSize: 12, color: C.orange });
text(s, "indirect?", 830, 282, 80, 18, { fontSize: 12, color: C.gold });
box(s, 246, 584, 780, 86, C.white, C.line, "main-point-card");
addShape(s, { geometry: "rect", name: "main-point-rule", position: { left: 246, top: 584, width: 5, height: 86 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
text(s, "Main point", 280, 608, 160, 20, { fontSize: 16, bold: true, color: C.orange });
text(s, "Confident axis = neuronal pathways; immune axis = real but source-limited.", 280, 638, 670, 22, { fontSize: 14.5, color: C.ink });
notes(s, "工作模型页。最可信的是神经元直接轴：受体表达丰富，axon guidance/synapse 通路上调。免疫轴是真实信号，但来源和因果有限，更可能是间接或 source-limited。");

s = deck.slides.add();
header(s, "synthesis", "Netrin fine-tunes; development activates broadly", "The two contrasts differ in scale and direction balance.", 25);
const bars = [
  ["C1 GO", 255, 226, 122, 0.55],
  ["C2 GO", 410, 124, 410, 0.55],
  ["C1 KEGG", 20, 22, 730, 5.3],
  ["C2 KEGG", 89, 10, 990, 2.45]
];
for (const [lab, act, sup, x, scale] of bars) {
  const base = 520;
  addShape(s, { geometry: "rect", name: "act-bar", position: { left: x, top: base - act * scale, width: 56, height: act * scale }, fill: C.red, line: { style: "solid", fill: C.red, width: 0 } });
  addShape(s, { geometry: "rect", name: "sup-bar", position: { left: x + 78, top: base - sup * scale, width: 56, height: sup * scale }, fill: C.blue, line: { style: "solid", fill: C.blue, width: 0 } });
  text(s, String(act), x - 4, base - act * scale - 28, 64, 20, { fontSize: 15, bold: true, color: C.red, alignment: "center" });
  text(s, String(sup), x + 74, base - sup * scale - 28, 64, 20, { fontSize: 15, bold: true, color: C.blue, alignment: "center" });
  text(s, lab, x - 18, 542, 170, 24, { fontSize: 16, bold: true, alignment: "center" });
}
line(s, 80, 520, 1110, C.line, 1);
text(s, "activated", 520, 216, 90, 20, { fontSize: 14, bold: true, color: C.red });
text(s, "suppressed", 620, 216, 100, 20, { fontSize: 14, bold: true, color: C.blue });
noteCard(s, "Interpretation", "C1 is balanced and bidirectional; C2 is activation-skewed. This supports Netrin as tuning rather than broad developmental acceleration.", 250, 602, 780, 66, C.orange);
notes(s, "跨对比整合页。C1 的 GO/KEGG 激活和抑制大约平衡；C2 明显偏 activation。结论：发育是大规模开启神经程序，Netrin 是双向微调。");

s = deck.slides.add();
header(s, "next steps", "Take-home points and immediate next decisions", "Use this slide to guide the group discussion.", 26);
noteCard(s, "Takeaway 1", "Netrin-1 produces a focused 24 h transcriptional response: 25 strict DEGs and 66 relaxed DEGs.", 84, 210, 500, 92, C.red);
noteCard(s, "Takeaway 2", "GSEA reveals two modules: synapse / axon guidance activation and cell-cycle / progenitor suppression.", 684, 210, 500, 92, C.orange);
noteCard(s, "Takeaway 3", "Cell-type markers explain why bulk interpretation must separate direct neuronal and indirect microglial signals.", 84, 346, 500, 106, C.blue);
noteCard(s, "Next decisions", "Prioritize: scRNA-seq or sorted RNA-seq; IHC for microglia/composition; receptor perturbation; LPS/TLR controls.", 684, 346, 500, 106, C.green);
text(s, "Discussion prompt: which validation path is the fastest route to a defensible mechanism?", 174, 586, 930, 34, { typeface: "Aptos Display", fontSize: 26, bold: true, alignment: "center" });
notes(s, "最后总结页。建议把讨论引向下一步：单细胞或分选解决来源，IHC 验证 microglia 和组成变化，DCC/UNC5 扰动测试直接依赖，polymyxin B/TLR inhibitor 控制排除免疫污染。");

await fs.writeFile(
  path.join(TMP, "source-notes.txt"),
  [
    "Deck enhanced from Hand.pptx using local Claude analysis project files.",
    "Sources: Hand.pptx, netrin_handoff_FULL_2026-06-14_v4 (2).md, netrin_notes.txt, QC final table.xlsx, results/ exported PNG/PDF/CSV/RDS outputs.",
    "Primary facts: C1 strict 25 (7 up/18 down), relaxed 66; C1 GSEA GO BP 481 (255/226), KEGG 42 (20/22); C2 strict 1495 (1098/397), relaxed 4636; C2 GSEA GO BP 534 (410/124), KEGG 99 (89/10).",
    "All image assets are local result exports from the user workspace."
  ].join("\n")
);

await fs.writeFile(
  path.join(TMP, "edit-plan.txt"),
  [
    "Mode: create enhanced copy rather than direct import edit.",
    "Reason: Hand.pptx import/render through artifact-tool failed due a missing embedded Excel worksheet relationship, so the enhanced deck is rebuilt in the same visual style.",
    "Style preservation: white background, large black title, minimal text, large result figures, orange accent bar/page numbering.",
    "Enhancements: unified Aptos/Aptos Display typography, consistent headers/footers, complete speaker notes, added ORA/GSEA/cell-type synthesis/working model/next-steps slides."
  ].join("\n")
);

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(PREVIEW, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(LAYOUT, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
}
await writeBlob(path.join(PREVIEW, "contact-sheet.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(OUT);
await pptx.save(OUT_DATED);

await fs.writeFile(
  path.join(QA, "visual-qa.txt"),
  [
    "QA summary:",
    `Final PPTX: ${OUT}`,
    `Dated copy: ${OUT_DATED}`,
    `Slides rendered: ${deck.slides.items.length}`,
    "Preview PNGs and contact sheet generated.",
    "Original Hand.pptx was not overwritten.",
    "Known caveat: direct import of Hand.pptx failed due missing embedded Excel worksheet relationship; rebuilt enhanced copy instead."
  ].join("\n")
);

console.log(OUT);

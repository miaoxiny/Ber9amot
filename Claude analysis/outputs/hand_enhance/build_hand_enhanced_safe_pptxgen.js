const fs = require("fs");
const path = require("path");
require("module").Module._initPaths();
const pptxgen = require("pptxgenjs");

const ROOT = "D:/Dropbox/Dropbox/RNAseq 2025/Claude analysis";
const OUT = path.join(ROOT, "Hand_enhanced_nolines.pptx");
const OUT_DATED = path.join(ROOT, "Hand_enhanced_nolines_2026-06-18.pptx");
const NO_NOTES = process.env.NO_NOTES === "1";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex";
pptx.subject = "Netrin-1 RNA-seq group meeting";
pptx.title = "Hand enhanced safe";
pptx.company = "Group meeting";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US"
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

const C = {
  ink: "222832",
  muted: "5C6470",
  line: "D9DDE3",
  red: "C73E3E",
  blue: "3B7AB8",
  orange: "D88040",
  teal: "4B9C9A",
  green: "5B8F5A",
  gold: "C49A42",
  white: "FFFFFF",
  light: "FAFBFC",
  paleOrange: "FFF8F4",
  paleBlue: "F4F8FC"
};

const pt = (px) => px / 96;
const loc = (x, y, w, h) => ({ x: pt(x), y: pt(y), w: pt(w), h: pt(h) });
const imgPath = (rel) => path.join(ROOT, rel);

function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function contain(file, x, y, w, h) {
  const size = pngSize(file);
  if (!size) return loc(x, y, w, h);
  const scale = Math.min(w / size.width, h / size.height);
  const nw = size.width * scale;
  const nh = size.height * scale;
  return loc(x + (w - nw) / 2, y + (h - nh) / 2, nw, nh);
}

function addBg(slide) {
  slide.background = { color: C.white };
  slide.addShape(pptx.ShapeType.rect, {
    ...loc(0, 0, 12, 720),
    fill: { color: C.orange },
    line: { color: C.orange, transparency: 100 }
  });
}

function addText(slide, value, x, y, w, h, opt = {}) {
  slide.addText(value, {
    ...loc(x, y, w, h),
    fontFace: opt.fontFace || "Aptos",
    fontSize: opt.fontSize || 14,
    bold: !!opt.bold,
    italic: !!opt.italic,
    color: opt.color || C.ink,
    align: opt.align || "left",
    valign: opt.valign || "top",
    margin: opt.margin ?? 0.04,
    fit: "shrink",
    paraSpaceAfterPt: opt.paraSpaceAfterPt ?? 2
  });
}

function header(slide, kicker, title, subtitle, n) {
  addBg(slide);
  slide.addShape(pptx.ShapeType.rect, {
    ...loc(54, 38, 12, 12),
    fill: { color: C.orange },
    line: { color: C.orange, transparency: 100 },
    rotate: 45
  });
  addText(slide, kicker.toUpperCase(), 84, 29, 520, 20, { fontSize: 9, bold: true, color: C.muted, margin: 0 });
  addText(slide, title, 66, 74, 1060, 66, { fontFace: "Aptos Display", fontSize: 25, bold: true });
  if (subtitle) addText(slide, subtitle, 68, 146, 1010, 26, { fontSize: 11, color: C.muted });
  addText(slide, String(n).padStart(2, "0"), 1168, 680, 44, 18, { fontSize: 8, color: C.muted, align: "right", margin: 0 });
  addText(slide, "Netrin-1 RNA-seq | group meeting", 66, 680, 360, 18, { fontSize: 8, color: C.muted, margin: 0 });
}

function metric(slide, value, label, x, y, color = C.orange, w = 170) {
  addText(slide, value, x, y, w, 48, { fontFace: "Aptos Display", fontSize: 28, bold: true, color, margin: 0 });
  addText(slide, label, x, y + 50, w, 42, { fontSize: 10, color: C.muted, margin: 0 });
}

function box(slide, x, y, w, h, fill = C.white, line = C.line) {
  slide.addShape(pptx.ShapeType.roundRect, {
    ...loc(x, y, w, h),
    fill: { color: fill },
    line: { color: line, width: 0.8 },
    radius: 0.08
  });
}

function noteCard(slide, heading, body, x, y, w, h, color = C.orange) {
  box(slide, x, y, w, h);
  slide.addShape(pptx.ShapeType.rect, {
    ...loc(x, y, 5, h),
    fill: { color },
    line: { color, transparency: 100 }
  });
  addText(slide, heading, x + 24, y + 18, w - 44, 22, { fontSize: 12, bold: true, color, margin: 0 });
  addText(slide, body, x + 24, y + 50, w - 44, h - 62, { fontSize: 10.5, color: C.ink, margin: 0.02 });
}

function addImage(slide, rel, x, y, w, h, alt = "") {
  const file = imgPath(rel);
  slide.addImage({ path: file, ...contain(file, x, y, w, h), altText: alt });
}

function notes(slide, text) {
  if (NO_NOTES) return;
  slide.addNotes(text.trim());
}

function section(n, label, title, subtitle) {
  const slide = pptx.addSlide();
  addBg(slide);
  addText(slide, label.toUpperCase(), 74, 92, 540, 24, { fontSize: 10, bold: true, color: C.muted });
  addText(slide, title, 74, 218, 940, 120, { fontFace: "Aptos Display", fontSize: 36, bold: true });
  addText(slide, subtitle, 78, 374, 840, 34, { fontSize: 14, color: C.muted });
  slide.addShape(pptx.ShapeType.rect, {
    ...loc(76, 610, 900, 4),
    fill: { color: C.orange },
    line: { color: C.orange, transparency: 100 }
  });
  addText(slide, String(n).padStart(2, "0"), 1168, 680, 44, 18, { fontSize: 8, color: C.muted, align: "right", margin: 0 });
  return slide;
}

let s;

s = pptx.addSlide();
addBg(s);
addText(s, "Netrin-1 RNA-seq", 74, 92, 720, 70, { fontFace: "Aptos Display", fontSize: 42, bold: true });
addText(s, "Results update for group meeting", 78, 170, 620, 34, { fontFace: "Aptos Display", fontSize: 21, color: C.muted });
addText(s, "Rat E18 cortical mixed culture | DIV1, DIV2, DIV2 + Netrin-1 | 3 conditions x 3 biological replicates", 80, 246, 890, 24, { fontSize: 12, color: C.muted });
metric(s, "25", "strict Netrin-responsive DEGs", 84, 470, C.orange, 230);
metric(s, "481 / 42", "GO BP / KEGG terms in C1 GSEA", 360, 470, C.teal, 270);
metric(s, "1,495", "strict DIV2 vs DIV1 DEGs", 708, 470, C.gold, 240);
addText(s, "Enhanced from Hand.pptx | safe PowerPoint-compatible export | June 18, 2026", 82, 650, 600, 22, { fontSize: 10, color: C.muted });
notes(s, "开场：这版是安全兼容版，内容与增强版一致，但底层对象更保守，避免 PowerPoint 打开时要求修复。重点按 C1、C2、cell-type interpretation 三条线讲。");

s = pptx.addSlide();
header(s, "overview", "Key numbers at a glance", "Use this slide to orient the audience before showing individual figures.", 2);
box(s, 68, 210, 320, 148, C.light);
box(s, 468, 210, 320, 148, C.light);
box(s, 868, 210, 320, 148, C.light);
metric(s, "32,623", "genes quantified by Salmon", 100, 236, C.muted, 210);
metric(s, "14,148", "genes after low-count filtering", 500, 236, C.orange, 230);
metric(s, "12,107", "genes ranked for GSEA", 900, 236, C.teal, 220);
box(s, 80, 428, 500, 130);
addText(s, "C1: Netrin vs DIV2", 112, 454, 250, 24, { fontSize: 15, bold: true, color: C.orange });
addText(s, "STRICT 25 = 7 up / 18 down\nRELAXED 66 = 10 up / 56 down\nGSEA: GO BP 481, KEGG 42", 112, 492, 380, 66, { fontSize: 12.5 });
box(s, 690, 428, 500, 130);
addText(s, "C2: DIV2 vs DIV1", 722, 454, 250, 24, { fontSize: 15, bold: true, color: C.green });
addText(s, "STRICT 1,495 = 1,098 up / 397 down\nRELAXED 4,636 = 2,603 up / 2,033 down\nGSEA: GO BP 534, KEGG 99", 722, 492, 400, 66, { fontSize: 12.5 });
notes(s, "这页是总览。强调 C1 是小而聚焦的 Netrin 响应，C2 是规模大得多的发育/时间背景。C1 的 GSEA 是双向平衡，C2 更偏 activation。");

s = pptx.addSlide();
header(s, "methods", "Filtering and analysis workflow", "The analysis keeps statistics on raw counts and uses corrected matrices only for visualization.", 3);
[
  ["Quantification", "DRAGEN-Salmon\ngene-level counts"],
  ["Filtering", "Counts >=10 in >=3 samples\n14,148 genes retained"],
  ["DESeq2", "~ batch + condition\nBH FDR"],
  ["DEG tiers", "STRICT: padj<0.05 & |LFC|>0.585\nRELAXED: padj<0.05"],
  ["Enrichment", "GSEA on Wald ranking\nORA for large C2 DEG sets"]
].forEach((d, i) => {
  const x = 74 + i * 232;
  box(s, x, 270, 190, 132, i % 2 ? C.white : C.light);
  addText(s, d[0], x + 16, 294, 154, 24, { fontSize: 13.5, bold: true, color: i === 4 ? C.orange : C.ink, align: "center" });
  addText(s, d[1], x + 18, 336, 150, 50, { fontSize: 10, color: C.muted, align: "center" });
});
noteCard(s, "Important clarification", "Batch correction is visualization-only. Differential expression statistics are run on the original count matrix with batch modeled as a covariate.", 186, 502, 860, 84, C.blue);
notes(s, "方法页。过滤后 14,148 genes，DESeq2 设计是 batch + condition。批次校正只用于 PCA 和 heatmap 展示，不用于统计。GSEA 用 Wald statistic 排序。");

const slideSpecs = [
  [4, "quality control", "Sample correlation analysis supports downstream interpretation", "All samples cluster tightly with high pairwise correlation.", "results/01_QC/01_sample_correlation_heatmap.png", [88, 190, 610, 438], [
    ["QC result", "Pairwise sample correlations are high (r = 0.9861-0.9987), with no obvious outlier sample.", 760, 246, 350, 130, C.green],
    ["Practical readout", "The data quality is sufficient for contrast-level interpretation and downstream GSEA.", 760, 424, 350, 112, C.orange]
  ], "QC 相关性页。样本之间相关性很高，没有 outlier；因此可以进入差异表达和通路分析。"],
  [5, "quality control", "PCA shows why visual batch correction is necessary", "After preserving condition effects, Netrin-1 separates from DIV2 on PC2.", "results/01_QC/04_PCA_before_after_combined.png", [74, 192, 720, 430], [
    ["Discovery moment", "After batch-effect removal for visualization, DIV2 and DIV2 + Netrin-1 separate on PC2.", 842, 238, 310, 138, C.orange],
    ["Guardrail", "Do not describe corrected VST as the statistical input. It is only a visualization lens.", 842, 424, 310, 116, C.blue]
  ], "PCA 页。校正前后对比说明 batch effect 存在，所以可视化需要 correction；统计仍然在 raw counts 上做。"],
];
for (const spec of slideSpecs) {
  const [n, kicker, title, subtitle, rel, frame, cards, note] = spec;
  s = pptx.addSlide();
  header(s, kicker, title, subtitle, n);
  addImage(s, rel, ...frame, title);
  for (const card of cards) noteCard(s, ...card);
  notes(s, note);
}

s = section(6, "Result 1", "C1: Netrin-1 response is focused and bidirectional.", "DIV2 + Netrin-1 vs DIV2 control.");
notes(s, "进入结果一：主对比 C1，也就是 Netrin 处理效应。");

s = pptx.addSlide();
header(s, "C1 DEG", "Volcano plot from DIV2 + Netrin-1 vs DIV2", "Strict DEG threshold: padj < 0.05 and |LFC| > 0.585.", 7);
addImage(s, "results/02_DEG/01_volcano_netrin_vs_div2_v3.png", 70, 190, 690, 430, "C1 volcano plot");
metric(s, "25", "STRICT DEGs", 820, 218, C.red, 150);
metric(s, "7 up / 18 down", "direction", 990, 218, C.blue, 210);
metric(s, "66", "RELAXED DEGs", 820, 374, C.orange, 160);
addText(s, "Top up: C3 (+2.54, padj 1.6e-20)\nTop down: Olig1 (-1.00, padj 3.3e-14)", 820, 520, 350, 58, { fontSize: 12 });
notes(s, "火山图页。C1 的响应很聚焦：strict 25 个，7 上调 18 下调；relaxed 66 个。C3 是最显著上调，Olig1 是最显著下调。");

function twoImageSlide(n, kicker, title, subtitle, leftRel, rightRel, leftCap, rightCap, note) {
  const sl = pptx.addSlide();
  header(sl, kicker, title, subtitle, n);
  addImage(sl, leftRel, 56, 188, 570, 430, leftCap);
  addImage(sl, rightRel, 668, 188, 546, 430, rightCap);
  addText(sl, leftCap, 82, 632, 520, 22, { fontSize: 10, color: C.muted });
  addText(sl, rightCap, 690, 632, 500, 22, { fontSize: 10, color: C.muted });
  notes(sl, note);
  return sl;
}

s = pptx.addSlide();
header(s, "C1 DEG", "Top single-gene hits separate into immune/glial and progenitor modules", "These genes are informative, but not all neuron-intrinsic.", 8);
addImage(s, "results/02_DEG/02_boxplots_key_DEGs_v3.png", 66, 190, 710, 430, "Key DEG boxplots");
noteCard(s, "Up module", "C3, Apoe, Adgre1, Ncf1, Itgal, Acod1\nImmune / microglial signature.", 830, 224, 320, 128, C.red);
noteCard(s, "Down module", "Olig1, Olig2, Sparcl1, Ccnd1, Id1/Id3\nOPC / glial / progenitor-linked signature.", 830, 410, 320, 140, C.blue);
notes(s, "单基因页。上调模块偏 immune/microglial，下调模块偏 Olig/progenitor/glial。主动承认 bulk mixed culture 的细胞来源问题。");

twoImageSlide(9, "C1 expression structure", "Heatmap and trajectory patterns of all 66 relaxed DEGs", "The pattern argues against a simple acceleration model.", "results/02_DEG/04_heatmap_66_DEGs_main_final.png", "results/02_DEG/03_pattern_trajectories_v5.png", "Main heatmap: batch-corrected VST for visualization", "Trajectory: P1 monotonic-up = 0; P5 peak at DIV2 dominates", "热图和 trajectory 合并页。左边看两模块结构；右边看表达轨迹。重点：P1=0，不能简单说 Netrin 加速成熟。");
twoImageSlide(10, "C1 GSEA", "Gene-set analysis reveals the neuronal program beneath the top genes", "Synaptic and axon-guidance programs rise; cell-cycle programs fall.", "results/03_GSEA/01_GSEA_GO_BP_barplot_final.png", "results/03_GSEA/02_GSEA_KEGG_barplot_final.png", "GO BP: 481 significant terms (255 activated / 226 suppressed)", "KEGG: 42 significant pathways (20 activated / 22 suppressed)", "GSEA 是 C1 的核心结果。全排序显示神经元通路协同变化：synapse、axon guidance、exocytosis 上调；cell cycle 和 DNA replication 下调。");

s = pptx.addSlide();
header(s, "C1 GSEA examples", "Representative enrichment curves anchor the two-module interpretation", "Axon guidance and synapse assembly are activated; cell-cycle terms are suppressed.", 11);
addImage(s, "results/03_GSEA/03_enrichment_axon_guidance_final.png", 68, 194, 520, 250, "Axon guidance enrichment");
addImage(s, "results/03_GSEA/04_enrichment_synapse_assembly_final.png", 660, 194, 520, 250, "Synapse assembly enrichment");
addImage(s, "results/03_GSEA/06_enrichment_cell_cycle_final.png", 364, 456, 520, 184, "Cell cycle enrichment");
notes(s, "GSEA 曲线页。强调 axon guidance 是 Netrin 的经典通路，在 GO 和 KEGG 都显著；synapse assembly 同方向；cell cycle 相关通路被抑制。");

s = pptx.addSlide();
header(s, "C1 interpretation", "Two modules explain the primary result", "Netrin-1 fine-tunes both neuronal signaling and progenitor/cell-cycle programs.", 12);
box(s, 96, 236, 430, 216, C.paleOrange, "EDC7AA");
addText(s, "Activated module", 126, 268, 220, 24, { fontSize: 16, bold: true, color: C.red });
addText(s, "Synapse / axon guidance", 126, 310, 320, 32, { fontFace: "Aptos Display", fontSize: 21, bold: true });
addText(s, "GO axon guidance NES +1.85\nKEGG axon guidance NES +1.72\nSynapse assembly NES +2.05", 126, 372, 320, 62, { fontSize: 12 });
box(s, 740, 236, 430, 216, C.paleBlue, "BFD3E6");
addText(s, "Suppressed module", 770, 268, 240, 24, { fontSize: 16, bold: true, color: C.blue });
addText(s, "Cell cycle / progenitor", 770, 310, 330, 32, { fontFace: "Aptos Display", fontSize: 21, bold: true });
addText(s, "KEGG Cell cycle NES -2.70\nDNA replication / repair suppressed\nOlig1/Olig2/Ccnd1 down", 770, 372, 330, 62, { fontSize: 12 });
noteCard(s, "Result framing", "The cleanest interpretation is bidirectional tuning, not broad developmental acceleration.", 260, 540, 760, 76, C.orange);
notes(s, "解释模型页。左边是神经元通路激活，右边是 cell-cycle/progenitor 抑制。最后一句：这是 bidirectional tuning，不是 broad developmental acceleration。");

s = section(13, "Result 2", "C2: 24 h development provides scale and context.", "DIV2 vs DIV1.");
notes(s, "进入结果二：C2 发育/时间背景。");

s = pptx.addSlide();
header(s, "C2 DEG", "Volcano plot from DIV2 vs DIV1", "The developmental contrast is much larger than the Netrin contrast.", 14);
addImage(s, "results/02_DEG/05_volcano_div2_vs_div1_final.png", 70, 190, 690, 430, "C2 volcano plot");
metric(s, "1,495", "STRICT DEGs", 820, 218, C.red, 160);
metric(s, "1,098 up / 397 down", "direction", 998, 218, C.blue, 210);
metric(s, "4,636", "RELAXED DEGs", 820, 374, C.orange, 170);
addText(s, "Olig1: +3.37 in C2 but -1.00 in C1\n-> Netrin reverses part of natural induction.", 820, 520, 350, 62, { fontSize: 12 });
notes(s, "C2 火山图。STRICT 1495，RELAXED 4636，远大于 C1。Olig1 在 C2 上调但在 C1 下调，说明 Netrin 不是简单顺着发育方向推进。");

s = pptx.addSlide();
header(s, "C2 DEG", "Top hits from DIV2 vs DIV1", "Developmental DEGs include neuronal maturation and cell-composition signals.", 15);
addImage(s, "results/02_DEG/06_boxplots_div2_vs_div1.png", 72, 190, 700, 430, "C2 DEG boxplots");
noteCard(s, "Scale", "C2 contains about 60x more strict DEGs than C1, so it is a context contrast rather than the main treatment result.", 828, 236, 310, 154, C.green);
noteCard(s, "Caveat", "Because the culture is mixed, many large C2 DEGs can reflect changing cell composition.", 828, 444, 310, 120, C.blue);
notes(s, "C2 top hits 页。C2 规模很大，是 24 小时发育/背景。混合培养导致细胞组成变化可能贡献很多 DEG。");

twoImageSlide(16, "C2 ORA", "GO BP ORA confirms developmental maturation and immune/progenitor shifts", "ORA uses strict DEG input; GO terms are simplified to reduce redundancy.", "results/04_ORA_div2_vs_div1/01_dotplot_GO_BP_up_simplified.png", "results/04_ORA_div2_vs_div1/02_dotplot_GO_BP_down_simplified.png", "UP input: 985 strict genes with Entrez ID; simplified GO BP terms = 160", "DOWN input: 356 strict genes with Entrez ID; simplified GO BP terms = 91", "C2 GO ORA 页。上调端偏神经成熟、膜电位、突触、离子通道；下调端偏免疫反应、趋化、吞噬。");
twoImageSlide(17, "C2 ORA", "KEGG ORA provides pathway-level context for C2", "Disease-named KEGG pathways are shared immune machinery, not disease states.", "results/04_ORA_div2_vs_div1/03_dotplot_KEGG_up.png", "results/04_ORA_div2_vs_div1/04_dotplot_KEGG_down.png", "UP: 58 significant KEGG pathways", "DOWN: 11 significant KEGG pathways", "C2 KEGG ORA 页。上调端是神经递质受体、突触、Ca-cAMP 等；下调端有感染、补体、细胞因子等免疫机制。");
twoImageSlide(18, "C2 expression structure", "Heatmaps show development is the dominant expression axis", "DIV1 separates from both DIV2 states.", "results/02_DEG/07_heatmap_div2_vs_div1_top60.png", "results/02_DEG/08_heatmap_div2_vs_div1_all1495.png", "Top 60 strict DEGs", "All 1,495 strict DEGs", "C2 heatmap 页。DIV1 单独分开，DIV2 和 DIV2+Netrin 更近；发育差异远大于 Netrin 处理效应。");
twoImageSlide(19, "C2 GSEA", "DIV2 activates mature neuronal programs and suppresses precursor programs", "GSEA agrees with the DEG and ORA readout.", "results/03_GSEA/03_GSEA_GO_BP_div2_vs_div1_barplot.png", "results/03_GSEA/04_GSEA_KEGG_div2_vs_div1_barplot.png", "GO BP: 534 significant terms (410 activated / 124 suppressed)", "KEGG: 99 significant pathways (89 activated / 10 suppressed)", "C2 GSEA 页。DIV2 富集 mature neuronal programs；DIV1 富集 chromatin remodeling、ribosome biogenesis、DNA repair 等。");

s = section(20, "Result 3", "Cell-type marker analysis changes how we read the bulk signal.", "This is the key guardrail for interpretation.");
notes(s, "进入结果三：细胞类型 marker 分析。这部分是解释 bulk signal 的关键。");

s = pptx.addSlide();
header(s, "cell-type context", "Cell-type marker TPM confirms mixed-culture composition", "This supports cautious source attribution for bulk RNA-seq.", 21);
addImage(s, "results/cell_type_marker_TPM_purity_final.png", 84, 190, 720, 430, "Cell-type marker TPM purity plot");
noteCard(s, "Why this matters", "Bulk RNA-seq signal is an average across neurons, macroglia, and microglia. Marker behavior is an inference, not direct cell counting.", 850, 250, 300, 190, C.blue);
notes(s, "细胞类型背景页。说明这是 mixed culture，bulk RNA-seq 不能直接分配细胞来源。marker 分析用于解释信号来源，但不是直接测量细胞数量。");

s = pptx.addSlide();
header(s, "cell-type markers", "DIV2 vs DIV1 contains a strong composition shift", "Macroglia / OPC markers rise; microglia markers fall; neuronal markers are relatively stable.", 22);
addImage(s, "results/02_DEG/09_celltype_marker_div2_vs_div1.png", 82, 188, 760, 440, "C2 cell-type marker plot");
noteCard(s, "C2 reading", "Many developmental DEGs likely reflect composition changes in mixed culture, not only neuron-intrinsic maturation.", 892, 250, 290, 160, C.green);
addText(s, "No AraC mixed culture: marker behavior is inference, not direct cell counting.", 894, 468, 282, 56, { fontSize: 11, color: C.muted });
notes(s, "C2 marker 页。宏胶质/OPC 和 astrocyte marker 上升，microglia marker 下降，神经元 marker 相对稳定。C2 的许多 DEG 很可能包含细胞组成变化。");

s = pptx.addSlide();
header(s, "cell-type markers", "Netrin treatment does not show the same composition collapse", "Microglial effect genes rise; identity markers are mostly trends with wide uncertainty.", 23);
addImage(s, "results/02_DEG/10_celltype_marker_netrin_vs_div2.png", 82, 188, 760, 440, "C1 cell-type marker plot");
noteCard(s, "C1 reading", "Immune genes are consistent with microglial activation, but identity markers do not prove a large increase in microglia number.", 892, 250, 290, 176, C.orange);
addText(s, "Preferred wording: consistent with microglial activation, not Netrin directly activates microglia.", 894, 478, 282, 70, { fontSize: 11, color: C.muted });
notes(s, "C1 marker 页。microglia effect genes 上升，但身份 marker 只是趋势且误差大。因此最好说 consistent with microglial activation，不要说 Netrin 直接激活 microglia。");

s = pptx.addSlide();
header(s, "working model", "Direct neuronal axis + indirect/source-limited immune axis", "This framing keeps the interpretation strong without over-claiming causality.", 24);
box(s, 90, 246, 260, 118, C.paleOrange, "EDC7AA");
box(s, 500, 202, 300, 126, C.light, "CAD6DC");
box(s, 500, 450, 300, 104, C.paleBlue, "BFD3E6");
box(s, 948, 300, 220, 126, "FFFDF8", "E4D4A6");
addText(s, "Exogenous\nNetrin-1", 124, 276, 190, 52, { fontSize: 18, bold: true, color: C.orange, align: "center" });
addText(s, "Cortical neurons", 536, 238, 230, 26, { fontSize: 18, bold: true, align: "center" });
addText(s, "Neo1 / Dcc / Dscam / Unc5a", 538, 278, 226, 20, { fontSize: 10, color: C.muted, align: "center" });
addText(s, "Synapse / axon guidance", 530, 486, 240, 24, { fontSize: 15, bold: true, color: C.red, align: "center" });
addText(s, "Microglia", 990, 334, 140, 26, { fontSize: 18, bold: true, align: "center" });
addText(s, "C3 / Apoe / Ncf1", 990, 374, 140, 20, { fontSize: 10, color: C.muted, align: "center" });
// Use plain rectangles instead of connector/line shapes for maximum PowerPoint compatibility.
s.addShape(pptx.ShapeType.rect, { ...loc(350, 303, 150, 4), fill: { color: C.orange }, line: { color: C.orange, transparency: 100 } });
s.addShape(pptx.ShapeType.rect, { ...loc(648, 330, 4, 116), fill: { color: C.red }, line: { color: C.red, transparency: 100 } });
s.addShape(pptx.ShapeType.rect, { ...loc(800, 274, 148, 4), fill: { color: C.gold }, line: { color: C.gold, transparency: 100 } });
noteCard(s, "Main point", "Confident axis = neuronal pathways; immune axis = real but source-limited.", 246, 590, 780, 72, C.orange);
notes(s, "工作模型页。最可信的是神经元直接轴：受体表达丰富，axon guidance/synapse 通路上调。免疫轴是真实信号，但来源和因果有限。");

s = pptx.addSlide();
header(s, "synthesis", "Netrin fine-tunes; development activates broadly", "The two contrasts differ in scale and direction balance.", 25);
[
  ["C1 GO", 255, 226, 122, 0.55],
  ["C2 GO", 410, 124, 410, 0.55],
  ["C1 KEGG", 20, 22, 730, 5.3],
  ["C2 KEGG", 89, 10, 990, 2.45]
].forEach(([lab, act, sup, x, scale]) => {
  const base = 520;
  s.addShape(pptx.ShapeType.rect, { ...loc(x, base - act * scale, 56, act * scale), fill: { color: C.red }, line: { color: C.red, transparency: 100 } });
  s.addShape(pptx.ShapeType.rect, { ...loc(x + 78, base - sup * scale, 56, sup * scale), fill: { color: C.blue }, line: { color: C.blue, transparency: 100 } });
  addText(s, String(act), x - 4, base - act * scale - 28, 64, 20, { fontSize: 11, bold: true, color: C.red, align: "center", margin: 0 });
  addText(s, String(sup), x + 74, base - sup * scale - 28, 64, 20, { fontSize: 11, bold: true, color: C.blue, align: "center", margin: 0 });
  addText(s, lab, x - 18, 542, 170, 24, { fontSize: 12, bold: true, align: "center", margin: 0 });
});
s.addShape(pptx.ShapeType.rect, { ...loc(80, 520, 1110, 2), fill: { color: C.line }, line: { color: C.line, transparency: 100 } });
noteCard(s, "Interpretation", "C1 is balanced and bidirectional; C2 is activation-skewed. This supports Netrin as tuning rather than broad developmental acceleration.", 250, 602, 780, 66, C.orange);
notes(s, "跨对比整合页。C1 的 GO/KEGG 激活和抑制大约平衡；C2 明显偏 activation。结论：发育是大规模开启神经程序，Netrin 是双向微调。");

s = pptx.addSlide();
header(s, "next steps", "Take-home points and immediate next decisions", "Use this slide to guide the group discussion.", 26);
noteCard(s, "Takeaway 1", "Netrin-1 produces a focused 24 h transcriptional response: 25 strict DEGs and 66 relaxed DEGs.", 84, 210, 500, 92, C.red);
noteCard(s, "Takeaway 2", "GSEA reveals two modules: synapse / axon guidance activation and cell-cycle / progenitor suppression.", 684, 210, 500, 92, C.orange);
noteCard(s, "Takeaway 3", "Cell-type markers explain why bulk interpretation must separate direct neuronal and indirect microglial signals.", 84, 346, 500, 106, C.blue);
noteCard(s, "Next decisions", "Prioritize: scRNA-seq or sorted RNA-seq; IHC for microglia/composition; receptor perturbation; LPS/TLR controls.", 684, 346, 500, 106, C.green);
addText(s, "Discussion prompt: which validation path is the fastest route to a defensible mechanism?", 174, 586, 930, 34, { fontFace: "Aptos Display", fontSize: 19, bold: true, align: "center" });
notes(s, "最后总结页。建议把讨论引向下一步：单细胞或分选解决来源，IHC 验证 microglia 和组成变化，DCC/UNC5 扰动测试直接依赖，polymyxin B/TLR inhibitor 控制排除免疫污染。");

const out = NO_NOTES ? path.join(ROOT, "Hand_enhanced_safe_no_notes_TEST.pptx") : OUT;
const outDated = NO_NOTES ? path.join(ROOT, "Hand_enhanced_safe_no_notes_TEST_2026-06-18.pptx") : OUT_DATED;
pptx.writeFile({ fileName: out });
pptx.writeFile({ fileName: outDated });
console.log(OUT);

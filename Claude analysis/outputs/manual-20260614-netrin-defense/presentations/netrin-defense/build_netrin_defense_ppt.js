const fs = require("fs");
const path = require("path");
require("module").Module._initPaths();
const pptxgen = require("pptxgenjs");

const ROOT = path.resolve(__dirname, "../../../..");
const OUT = path.join(ROOT, "Netrin1_RNAseq_PhD_Defense_2026-06-14.pptx");
const img = (p) => path.join(ROOT, p);

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Codex / Xinyu";
pptx.company = "PhD defense draft";
pptx.subject = "Netrin-1 RNA-seq in primary rat cortical neurons";
pptx.title = "Netrin-1 RNA-seq PhD Defense";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US"
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";
pptx.margin = 0;

const C = {
  ink: "1F2733",
  muted: "5F6671",
  faint: "EEF0F2",
  paper: "F7F4EE",
  white: "FFFFFF",
  red: "C73E3E",
  blue: "3B7AB8",
  orange: "D88040",
  teal: "4B9C9A",
  green: "5B8F5A",
  gold: "C49A42",
  line: "D8D4CA",
  dark: "151B22"
};

function addBg(slide, tone = "paper") {
  slide.background = { color: tone === "dark" ? C.dark : C.paper };
  if (tone !== "dark") {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: C.orange }, line: { color: C.orange } });
  }
}

function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: opts.fontFace || "Aptos",
    fontSize: opts.fontSize || 18,
    color: opts.color || C.ink,
    bold: !!opts.bold,
    italic: !!opts.italic,
    breakLine: opts.breakLine,
    fit: opts.fit || "shrink",
    margin: opts.margin ?? 0.05,
    valign: opts.valign || "top",
    align: opts.align || "left",
    paraSpaceAfterPt: opts.paraSpaceAfterPt ?? 4,
    bullet: opts.bullet,
    rotate: opts.rotate
  });
}

function kicker(slide, label, n, tone = "light") {
  const color = tone === "dark" ? C.orange : C.orange;
  slide.addShape(pptx.ShapeType.rect, { x: 0.54, y: 0.38, w: 0.15, h: 0.15, fill: { color }, line: { color }, rotate: 45 });
  text(slide, `${String(n).padStart(2, "0")} / ${label.toUpperCase()}`, 0.78, 0.28, 4.0, 0.34, {
    fontSize: 8.5,
    color: tone === "dark" ? "C9CDD2" : C.muted,
    bold: true,
    valign: "mid",
    margin: 0
  });
}

function title(slide, value, subtitle, n, section = "Netrin-1 RNA-seq") {
  addBg(slide);
  kicker(slide, section, n);
  text(slide, value, 0.54, 0.82, 8.6, 0.88, { fontFace: "Aptos Display", fontSize: 31, bold: true, color: C.ink, margin: 0 });
  if (subtitle) text(slide, subtitle, 0.56, 1.58, 8.4, 0.38, { fontSize: 13.5, color: C.muted, margin: 0 });
  text(slide, `${n}`, 12.55, 6.96, 0.28, 0.16, { fontSize: 8, color: C.muted, align: "right", margin: 0 });
}

function note(slide, s) {
  slide.addNotes(s.trim().replace(/\n\s+/g, "\n"));
}

function chip(slide, label, x, y, color, w = 1.45) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.32, rectRadius: 0.04, fill: { color }, line: { color } });
  text(slide, label, x + 0.07, y + 0.055, w - 0.14, 0.18, { fontSize: 8.5, bold: true, color: C.white, align: "center", margin: 0, valign: "mid" });
}

function rule(slide, x, y, w, color = C.line) {
  slide.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color, width: 0.8 } });
}

function metric(slide, v, label, x, y, color = C.orange, w = 2.2) {
  text(slide, v, x, y, w, 0.45, { fontFace: "Aptos Display", fontSize: 28, bold: true, color, margin: 0, fit: "shrink" });
  text(slide, label, x, y + 0.48, w, 0.44, { fontSize: 10.5, color: C.muted, margin: 0 });
}

function bullets(slide, items, x, y, w, h, opts = {}) {
  const runs = [];
  for (const item of items) {
    runs.push({ text: item, options: { bullet: { type: "ul" }, breakLine: true } });
  }
  slide.addText(runs, {
    x, y, w, h,
    fontFace: "Aptos",
    fontSize: opts.fontSize || 15,
    color: opts.color || C.ink,
    fit: "shrink",
    breakLine: false,
    margin: 0.05,
    paraSpaceAfterPt: opts.paraSpaceAfterPt ?? 8,
    bullet: { indent: 14 }
  });
}

function image(slide, rel, x, y, w, h, opts = {}) {
  const p = img(rel);
  if (!fs.existsSync(p)) throw new Error(`Missing image: ${p}`);
  slide.addImage({ path: p, x, y, w, h, sizing: opts.sizing || { type: "contain", x, y, w, h } });
}

function panel(slide, x, y, w, h, fill = C.white, line = C.line) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.04, fill: { color: fill, transparency: 0 }, line: { color: line, transparency: 10, width: 0.7 } });
}

function sectionSlide(n, label, headline, sub, color = C.dark) {
  const s = pptx.addSlide();
  s.background = { color };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color }, line: { color } });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 6.88, w: 13.333, h: 0.62, fill: { color: C.orange }, line: { color: C.orange } });
  text(s, label.toUpperCase(), 0.74, 0.72, 4, 0.32, { fontSize: 9, color: "BFC5CD", bold: true, margin: 0 });
  text(s, headline, 0.72, 2.16, 10.7, 1.55, { fontFace: "Aptos Display", fontSize: 43, bold: true, color: C.white, margin: 0, fit: "shrink" });
  text(s, sub, 0.76, 4.05, 8.8, 0.6, { fontSize: 15, color: "D7DCE1", margin: 0 });
  text(s, `${n}`, 12.5, 6.98, 0.3, 0.14, { fontSize: 8, color: C.white, margin: 0, align: "right" });
  return s;
}

let s;

s = pptx.addSlide();
addBg(s, "dark");
s.background = { color: C.dark };
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.dark }, line: { color: C.dark } });
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: 7.5, fill: { color: C.orange }, line: { color: C.orange } });
text(s, "Transcriptomic response to Netrin-1", 0.74, 1.02, 9.3, 0.72, { fontFace: "Aptos Display", fontSize: 36, bold: true, color: C.white, margin: 0 });
text(s, "in primary rat cortical neurons", 0.76, 1.82, 8.2, 0.55, { fontFace: "Aptos Display", fontSize: 26, color: "E8E5DC", margin: 0 });
text(s, "Bulk RNA-seq across DIV1, DIV2 and DIV2 + Netrin-1", 0.78, 2.64, 7.2, 0.34, { fontSize: 14.5, color: "C9CDD2", margin: 0 });
metric(s, "3 x 3", "conditions x biological replicates", 0.78, 4.56, C.orange, 2.4);
metric(s, "24 h", "Netrin-1 treatment window", 3.25, 4.56, C.teal, 2.4);
metric(s, "14,148", "genes after filtering", 5.72, 4.56, C.gold, 2.4);
text(s, "[Presenter]  |  [Affiliation]  |  June 2026", 0.78, 6.62, 5.6, 0.24, { fontSize: 10.5, color: "BFC5CD", margin: 0 });
note(s, `开场用 30 秒定调：本研究用 bulk RNA-seq 研究 Netrin-1 对 E18 大鼠皮层原代神经元培养的 24 小时转录组影响。强调三个条件、三个生物学重复，以及这是混合培养体系，因此后面所有结果都要同时回答“转录响应是什么”和“信号来自哪类细胞”。`);

s = pptx.addSlide();
title(s, "Central thesis: Netrin-1 fine-tunes a neuronal program while exposing glial context.", "The defense is organized around a biological interpretation, not a list of figures.", 2, "Thesis");
panel(s, 0.7, 2.15, 3.4, 2.0); panel(s, 4.95, 2.15, 3.4, 2.0); panel(s, 9.2, 2.15, 3.4, 2.0);
text(s, "Focused response", 0.96, 2.42, 2.7, 0.34, { fontSize: 17, bold: true, color: C.red, margin: 0 });
text(s, "25 strict DEGs, but hundreds of coordinated gene sets.", 0.96, 2.92, 2.65, 0.72, { fontSize: 14, color: C.ink, margin: 0 });
text(s, "Two modules", 5.2, 2.42, 2.7, 0.34, { fontSize: 17, bold: true, color: C.blue, margin: 0 });
text(s, "Synapse / axon guidance activation paired with cell-cycle suppression.", 5.2, 2.92, 2.65, 0.72, { fontSize: 14, color: C.ink, margin: 0 });
text(s, "Cell-source honesty", 9.46, 2.42, 2.65, 0.34, { fontSize: 17, bold: true, color: C.orange, margin: 0 });
text(s, "Top single-gene hits are often glial or immune; neuronal signal is strongest at pathway level.", 9.46, 2.92, 2.75, 0.9, { fontSize: 13.5, color: C.ink, margin: 0 });
rule(s, 1.2, 5.1, 10.9);
text(s, "Answer in one sentence", 0.92, 5.52, 2.0, 0.28, { fontSize: 10, color: C.muted, bold: true, margin: 0 });
text(s, "Netrin-1 does not simply accelerate maturation; it engages canonical axon-guidance/synaptic programs while suppressing proliferative/progenitor programs, with immune signatures best interpreted as indirect microglial responses.", 2.7, 5.42, 8.8, 0.78, { fontFace: "Aptos Display", fontSize: 20, bold: true, color: C.ink, margin: 0 });
note(s, `这一页是答辩主线。建议直接告诉评委：我不会把结果讲成“一个 volcano 加几个 enrichment”，而是围绕一个结论展开。第一，Netrin 的 DEG 数不大但方向明确；第二，通路层面显示 synapse/axon guidance 上调、cell cycle 下调；第三，bulk 混合培养必须诚实区分神经元直接效应和 microglia/胶质间接信号。`);

s = pptx.addSlide();
title(s, "The open question: what is the 24 h transcriptional program after Netrin-1?", "Acute growth-cone effects are established; the later transcriptomic state is less defined.", 3, "Background");
bullets(s, [
  "Netrin-1 is a canonical axon-guidance ligand acting through DCC, UNC5 and Neogenin receptors.",
  "Rapid effects include growth-cone steering and local translation, but 24 h transcriptional outcomes in cortical neurons remain unclear.",
  "Primary cortical cultures are biologically realistic but mixed: neurons, macroglia and microglia all contribute RNA.",
  "The core analytical task is therefore response detection plus cell-source attribution."
], 0.86, 2.15, 5.7, 3.4, { fontSize: 15 });
panel(s, 7.25, 2.04, 4.9, 3.45, "FFFFFF");
text(s, "Interpretation risk", 7.62, 2.42, 2.7, 0.32, { fontSize: 11, bold: true, color: C.muted, margin: 0 });
text(s, "A strong DEG can be biologically real and still not be neuron-intrinsic.", 7.6, 2.9, 3.9, 0.8, { fontFace: "Aptos Display", fontSize: 23, bold: true, color: C.ink, margin: 0 });
text(s, "That distinction becomes central once immune and oligodendrocyte markers appear among the strongest hits.", 7.62, 4.22, 3.8, 0.62, { fontSize: 13.5, color: C.muted, margin: 0 });
note(s, `背景页不要铺文献太多。核心是问题意识：Netrin 急性功能很清楚，但 24 小时后转录组怎样变化不清楚。然后立刻交代 mixed culture 的挑战：bulk RNA-seq 看到的是总体 RNA，单个显著基因不一定来自神经元。这个提醒会让后面讲 microglia 和 Olig1/Olig2 时显得主动而不是被动辩解。`);

s = pptx.addSlide();
title(s, "Experimental design separates treatment from a 24 h developmental reference.", "The primary contrast asks the treatment question; the secondary contrast calibrates developmental scale.", 4, "Design");
chip(s, "DIV1", 1.0, 2.0, C.blue, 1.1); chip(s, "DIV2 vehicle", 3.2, 2.0, C.green, 1.55); chip(s, "DIV2 + Netrin-1", 5.75, 2.0, C.orange, 1.9);
for (let y of [2.72, 3.36, 4.0]) {
  s.addShape(pptx.ShapeType.line, { x: 1.55, y, w: 5.16, h: 0, line: { color: C.line, width: 1.2 } });
  s.addShape(pptx.ShapeType.chevron, { x: 2.28, y: y - 0.12, w: 0.26, h: 0.24, fill: { color: C.line }, line: { color: C.line } });
  s.addShape(pptx.ShapeType.chevron, { x: 4.92, y: y - 0.12, w: 0.26, h: 0.24, fill: { color: C.line }, line: { color: C.line } });
  text(s, "replicate", 0.92, y - 0.12, 0.8, 0.2, { fontSize: 8.5, color: C.muted, margin: 0 });
}
text(s, "C1: Netrin-1 effect", 8.05, 2.0, 3.2, 0.34, { fontSize: 17, bold: true, color: C.orange, margin: 0 });
text(s, "DIV2 + Netrin-1 vs DIV2", 8.06, 2.42, 3.1, 0.28, { fontSize: 13.5, color: C.ink, margin: 0 });
text(s, "C2: developmental context", 8.05, 3.35, 3.2, 0.34, { fontSize: 17, bold: true, color: C.green, margin: 0 });
text(s, "DIV2 vs DIV1", 8.06, 3.78, 2.4, 0.28, { fontSize: 13.5, color: C.ink, margin: 0 });
rule(s, 8.05, 4.62, 3.7);
text(s, "Model: DESeq2 ~ batch + condition\nBatch correction is used only for visualization; statistics remain on raw counts.", 8.05, 4.94, 3.6, 0.78, { fontSize: 12.5, color: C.muted, margin: 0 });
note(s, `方法设计页。强调两个对比：C1 是主问题，DIV2+Netrin-1 对 DIV2；C2 是背景问题，DIV2 对 DIV1，用来判断 24 小时自然发育/vehicle 的尺度。模型是 DESeq2 ~ batch + condition，batch 作为协变量进入统计模型。批次校正只用于 PCA 和 heatmap 可视化，不用于差异分析。`);

s = pptx.addSlide();
title(s, "Analysis pipeline uses strict gene calls and threshold-free pathway evidence.", "This makes single-gene and gene-set conclusions complementary rather than competing.", 5, "Methods");
const steps = [
  ["DRAGEN-Salmon", "gene-level quantification"],
  ["tximport", "32,623 genes x 9 samples"],
  ["filtering", "14,148 genes retained"],
  ["DESeq2", "Wald test, BH FDR"],
  ["GSEA + ORA", "pathway-level interpretation"]
];
steps.forEach((d, i) => {
  const x = 0.78 + i * 2.48;
  panel(s, x, 2.15, 1.78, 1.32, i % 2 ? "FFFFFF" : "F2F5F6");
  text(s, d[0], x + 0.15, 2.38, 1.45, 0.28, { fontSize: 12.5, bold: true, color: i === 4 ? C.orange : C.ink, margin: 0, align: "center" });
  text(s, d[1], x + 0.17, 2.78, 1.42, 0.34, { fontSize: 9.6, color: C.muted, margin: 0, align: "center" });
  if (i < steps.length - 1) s.addShape(pptx.ShapeType.chevron, { x: x + 1.93, y: 2.62, w: 0.24, h: 0.34, fill: { color: C.orange }, line: { color: C.orange } });
});
metric(s, "STRICT", "padj < 0.05 and |LFC| > 0.585", 1.0, 4.45, C.red, 3.0);
metric(s, "RELAXED", "padj < 0.05", 4.38, 4.45, C.blue, 2.6);
metric(s, "GSEA", "Wald-ranked, minGSSize = 15", 7.42, 4.45, C.orange, 3.2);
text(s, "Unshrunken log2FC is used for display and strict thresholds; GSEA is threshold-free and ranked by Wald statistic.", 1.0, 6.15, 10.6, 0.32, { fontSize: 12.5, color: C.muted, margin: 0 });
note(s, `这一页讲分析口径。STRICT 用于 volcano 高亮和 gene-level 图，RELAXED 用于热图/模式和辅助；GSEA 是无阈值主分析，用 Wald statistic 排序，避免只看强单基因而漏掉协同变化。说明使用 raw LFC，不做 apeglm shrinkage，这是为了避免火山图压缩，同时被审计过边界基因不是低表达噪音。`);

s = pptx.addSlide();
title(s, "QC supports high-confidence downstream inference.", "Replicates are tight, sequencing depth is sufficient, and no sample behaves as an outlier.", 6, "Quality Control");
image(s, "results/01_QC/01_sample_correlation_heatmap.png", 0.72, 1.98, 5.2, 3.92);
panel(s, 6.4, 2.0, 5.65, 3.9);
metric(s, "RIN >= 9", "8 of 9 samples have RIN = 10", 6.72, 2.35, C.green, 2.2);
metric(s, "22.95-36.11 M", "quantified reads per sample", 9.1, 2.35, C.orange, 2.6);
metric(s, "0.9861-0.9987", "sample correlation range", 6.72, 4.2, C.blue, 2.8);
metric(s, "0.0060", "median dispersion", 9.1, 4.2, C.red, 2.2);
text(s, "All 9 libraries passed QC; 16,451-17,093 genes detected per sample.", 6.72, 5.66, 4.8, 0.24, { fontSize: 11.2, color: C.muted, margin: 0 });
note(s, `QC 页讲得干净一点：样本质量很好，RIN、read depth、detected genes、相关性、dispersion 都支持后续分析。相关性热图说明没有离群样本。这里不要过度解释 batch，因为下一页 PCA 会单独讲 discovery moment。`);

s = pptx.addSlide();
title(s, "After preserving condition effects, the Netrin-1 signal emerges on PC2.", "Batch correction is used as a visualization lens, not as statistical preprocessing.", 7, "Quality Control");
image(s, "results/01_QC/04_PCA_before_after_combined.png", 0.72, 1.9, 7.15, 4.55);
panel(s, 8.32, 2.2, 3.65, 3.7, "FFFFFF");
text(s, "Discovery moment", 8.62, 2.56, 2.2, 0.3, { fontSize: 10.5, bold: true, color: C.muted, margin: 0 });
text(s, "DIV2 and DIV2 + Netrin-1 separate after batch-effect removal.", 8.6, 3.02, 2.88, 0.8, { fontFace: "Aptos Display", fontSize: 21, bold: true, color: C.ink, margin: 0 });
text(s, "PC1 shifts from 87.9% to 94.9%, while Netrin treatment becomes visible on PC2.", 8.62, 4.55, 2.8, 0.62, { fontSize: 12.2, color: C.muted, margin: 0 });
note(s, `PCA 页重点是说明为什么我们有信心寻找 Netrin 效应。校正前主要看到 batch/replicate 结构；保留 condition 设计后，DIV2 和 DIV2+Netrin 在 PC2 上分开。一定要强调：这不是拿校正后的矩阵做统计，只是可视化帮助发现信号。`);

s = sectionSlide(8, "Results I", "Netrin-1 triggers a focused but biologically structured response.", "Primary contrast: DIV2 + Netrin-1 vs DIV2 control.");
note(s, `这是第一部分结果的章节页，停顿 5 秒即可。告诉听众：接下来先讲主对比，也就是 Netrin-1 处理本身。`);

s = pptx.addSlide();
title(s, "The primary contrast is small in size but clearly bidirectional.", "Only 25 strict DEGs pass the combined statistical and effect-size threshold.", 9, "Primary Contrast");
image(s, "results/02_DEG/01_volcano_netrin_vs_div2_v3.png", 0.72, 1.84, 6.15, 4.7);
panel(s, 7.25, 2.05, 4.9, 4.0);
metric(s, "25", "STRICT DEGs", 7.62, 2.42, C.red, 1.6);
metric(s, "7 up / 18 down", "direction among strict DEGs", 9.42, 2.42, C.blue, 2.2);
metric(s, "66", "RELAXED DEGs", 7.62, 4.15, C.orange, 1.5);
text(s, "Most significant up: C3 (+2.54, padj 1.6e-20)\nMost significant down: Olig1 (-1.00, padj 3.3e-14)", 9.05, 4.1, 2.65, 0.76, { fontSize: 12.2, color: C.ink, margin: 0 });
text(s, "Interpretation: focused response, not a wholesale transcriptome reset.", 7.62, 5.48, 3.9, 0.32, { fontSize: 12.5, bold: true, color: C.muted, margin: 0 });
note(s, `火山图页。讲三个数字：RELAXED 66，STRICT 25，其中 7 上调、18 下调。强调这是聚焦而非大规模重塑。C3 是最显著上调，不说“最高表达”；Olig1 是最显著下调。这里埋下伏笔：这些 top genes 很多不是神经元基因，所以单基因层面要谨慎。`);

s = pptx.addSlide();
title(s, "The strongest single-gene hits point to immune and glial biology.", "This is a biological result, but not automatically a neuron-intrinsic result.", 10, "Primary Contrast");
image(s, "results/02_DEG/02_boxplots_key_DEGs_v3.png", 0.68, 1.78, 7.0, 4.85);
panel(s, 8.08, 2.02, 3.85, 4.2);
text(s, "Up-regulated module", 8.42, 2.36, 2.4, 0.3, { fontSize: 13.5, bold: true, color: C.red, margin: 0 });
text(s, "C3, Apoe, Adgre1, Ncf1, Itgal, Acod1", 8.42, 2.82, 2.8, 0.38, { fontSize: 12.5, color: C.ink, margin: 0 });
text(s, "Immune / microglial signature", 8.42, 3.28, 2.8, 0.25, { fontSize: 11, color: C.muted, margin: 0 });
rule(s, 8.4, 3.82, 2.9);
text(s, "Down-regulated module", 8.42, 4.18, 2.4, 0.3, { fontSize: 13.5, bold: true, color: C.blue, margin: 0 });
text(s, "Olig1, Olig2, Sparcl1, Ccnd1, Id1/3", 8.42, 4.62, 2.8, 0.38, { fontSize: 12.5, color: C.ink, margin: 0 });
text(s, "OPC / glial / progenitor-linked signature", 8.42, 5.08, 2.9, 0.3, { fontSize: 11, color: C.muted, margin: 0 });
note(s, `箱线图页的讲法要诚实。C3/Apoe/Adgre1/Ncf1 是免疫或 microglia 相关；Olig1/Olig2/Sparcl1/Ccnd1 更偏 OPC/胶质/祖细胞。结论不是“这些都是神经元直接响应”，而是“强单基因层面提醒我们 bulk 信号有细胞来源问题”。这会自然过渡到 GSEA：神经元程序更多是协同而不是单个大基因。`);

s = pptx.addSlide();
title(s, "Threshold-free GSEA reveals the neuronal program hidden beneath single-gene hits.", "Synaptic and axon-guidance programs rise while cell-cycle programs fall.", 11, "Primary Contrast");
image(s, "results/03_GSEA/01_GSEA_GO_BP_barplot_final.png", 0.62, 1.9, 5.9, 4.62);
image(s, "results/03_GSEA/02_GSEA_KEGG_barplot_final.png", 6.75, 1.9, 5.65, 4.62);
text(s, "GO BP: 481 significant terms (255 activated / 226 suppressed)", 0.9, 6.63, 4.6, 0.22, { fontSize: 10.5, color: C.muted, margin: 0 });
text(s, "KEGG: 42 significant pathways (20 activated / 22 suppressed)", 6.95, 6.63, 4.4, 0.22, { fontSize: 10.5, color: C.muted, margin: 0 });
note(s, `GSEA 结果是核心。讲两组数字：GO BP 481，其中 255 activated、226 suppressed；KEGG 42，其中 20/22。上调端是 synapse、axon guidance、exocytosis、learning/memory；下调端是 chromosome segregation、DNA replication、cell cycle。这里要点明：通路层面比单基因更适合看神经元协调响应。`);

s = pptx.addSlide();
title(s, "A two-module response explains the apparent contradiction.", "Netrin-1 engages canonical neuronal pathways while suppressing proliferative/progenitor programs.", 12, "Primary Contrast");
s.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 2.0, w: 4.7, h: 3.35, rectRadius: 0.05, fill: { color: "FFF7F2" }, line: { color: "E9C3A8", width: 1 } });
s.addShape(pptx.ShapeType.roundRect, { x: 7.73, y: 2.0, w: 4.7, h: 3.35, rectRadius: 0.05, fill: { color: "F3F7FB" }, line: { color: "BCD1E5", width: 1 } });
s.addShape(pptx.ShapeType.chevron, { x: 6.13, y: 3.05, w: 1.0, h: 1.2, fill: { color: C.orange }, line: { color: C.orange } });
text(s, "ACTIVATED", 1.2, 2.38, 2.0, 0.3, { fontSize: 11, bold: true, color: C.red, margin: 0 });
text(s, "Synapse / axon guidance", 1.2, 2.84, 3.5, 0.38, { fontFace: "Aptos Display", fontSize: 22, bold: true, color: C.ink, margin: 0 });
bullets(s, ["Synapse assembly", "Exocytosis", "Learning / memory", "GO + KEGG axon guidance convergence"], 1.18, 3.48, 3.55, 1.22, { fontSize: 12 });
text(s, "SUPPRESSED", 8.04, 2.38, 2.0, 0.3, { fontSize: 11, bold: true, color: C.blue, margin: 0 });
text(s, "Cell cycle / progenitor", 8.04, 2.84, 3.5, 0.38, { fontFace: "Aptos Display", fontSize: 22, bold: true, color: C.ink, margin: 0 });
bullets(s, ["Chromosome segregation", "DNA replication", "Cell-cycle KEGG NES -2.70", "Progenitor-linked gene programs"], 8.02, 3.48, 3.6, 1.22, { fontSize: 12 });
text(s, "Not simple acceleration; rather bidirectional tuning.", 3.63, 5.96, 5.95, 0.42, { fontFace: "Aptos Display", fontSize: 22, bold: true, color: C.ink, align: "center", margin: 0 });
note(s, `这是本答辩的第一张解释模型页。左边说 Netrin-1 激活 synapse/axon guidance；右边说抑制 cell cycle/progenitor 程序。把矛盾讲清楚：为什么 P1 没有单基因持续上升，但 GSEA 有神经元成熟相关通路？因为 Netrin 的作用是细微协同、双向调节，而不是把每个基因都往成熟方向推。`);

s = pptx.addSlide();
title(s, "Axon guidance convergence is the strongest pathway-level anchor.", "The Netrin-1 ligand transcriptionally reinforces its own canonical biological pathway.", 13, "Primary Contrast");
image(s, "results/03_GSEA/03_enrichment_axon_guidance_final.png", 0.72, 2.05, 5.3, 3.95);
image(s, "results/03_GSEA/04_enrichment_synapse_assembly_final.png", 6.75, 2.05, 5.3, 3.95);
text(s, "GO axon guidance: NES +1.85, padj 3.6e-5", 0.95, 6.25, 4.4, 0.24, { fontSize: 10.5, color: C.red, bold: true, margin: 0 });
text(s, "Synapse assembly: NES +2.05", 6.98, 6.25, 3.8, 0.24, { fontSize: 10.5, color: C.red, bold: true, margin: 0 });
note(s, `这页可以稍微多讲一点，因为它是“为什么这是 Netrin biology 而不是随机 enrichment”的关键。Axon guidance 在 GO BP 显著，而且 KEGG axon guidance 也显著；synapse assembly 同方向。说法是：Netrin-1 不只是一个外源刺激，它在转录层面 engage 自己的经典 pathway。`);

s = pptx.addSlide();
title(s, "Trajectory patterns argue against a simple acceleration model.", "The dominant pattern is developmental induction followed by partial Netrin reversal.", 14, "Primary Contrast");
image(s, "results/02_DEG/03_pattern_trajectories_v5.png", 0.72, 1.78, 6.85, 4.85);
panel(s, 8.0, 2.0, 3.95, 4.2);
metric(s, "P5 = 46", "peak at DIV2", 8.35, 2.38, C.orange, 1.8);
metric(s, "P1 = 0", "no monotonic acceleration genes", 10.15, 2.38, C.red, 1.8);
text(s, "Key caveat", 8.35, 4.2, 1.2, 0.26, { fontSize: 10.5, color: C.muted, bold: true, margin: 0 });
text(s, "P5 prototypes include Olig1/Olig2, which are oligodendrocyte-lineage markers. The pattern mainly tracks glial or composition-linked change, not neuron-intrinsic maturation.", 8.35, 4.58, 2.9, 0.98, { fontSize: 12.2, color: C.ink, margin: 0 });
note(s, `模式页一定要强调 P1=0，这是一个关键阴性结果：没有基因沿 DIV1 到 DIV2 到 Netrin 单调上升，所以不能说 Netrin 简单加速成熟。P5 最大，n=46，但代表基因 Olig1/Olig2 是少突胶质/OPC marker，所以这更像胶质或组成变化。这个页帮你防止评委质疑“你前面说成熟，为什么 trajectory 不支持”。`);

s = sectionSlide(15, "Results II", "Development provides the scale and the confounder.", "Secondary contrast: DIV2 vs DIV1.");
note(s, `第二部分章节页。告诉听众：现在转到 C2，不是因为它是主问题，而是因为它提供背景尺度，并帮助解释 bulk 细胞组成。`);

s = pptx.addSlide();
title(s, "The developmental contrast is two orders of magnitude larger than the Netrin effect.", "DIV2 vs DIV1 shows that 24 h development dominates transcriptome structure.", 16, "Developmental Contrast");
image(s, "results/02_DEG/05_volcano_div2_vs_div1_final.png", 0.72, 1.82, 6.12, 4.72);
panel(s, 7.25, 2.05, 4.9, 4.0);
metric(s, "1,495", "STRICT DEGs", 7.62, 2.42, C.red, 1.7);
metric(s, "1,098 up / 397 down", "direction among strict DEGs", 9.4, 2.42, C.blue, 2.5);
metric(s, "4,636", "RELAXED DEGs", 7.62, 4.15, C.orange, 1.7);
text(s, "Olig1 is +3.37 here but -1.00 under Netrin, showing Netrin reverses part of natural induction.", 9.2, 4.08, 2.6, 0.92, { fontSize: 12.2, color: C.ink, margin: 0 });
text(s, "Caveat: development and vehicle exposure are linked in this contrast.", 7.62, 5.5, 3.8, 0.28, { fontSize: 11.5, color: C.muted, margin: 0 });
note(s, `C2 火山图。讲数字：STRICT 1495，RELAXED 4636，比 C1 大很多。上调远多于下调，说明发育/时间效应大。Olig1 在 C2 是 +3.37，在 Netrin 对比是 -1.00，方向相反，支持 Netrin 不是简单顺着发育往前推，而是逆转某些胶质相关诱导。`);

s = pptx.addSlide();
title(s, "Development activates mature neuronal programs and suppresses precursor-like programs.", "This expected biology validates the secondary contrast while revealing composition shifts.", 17, "Developmental Contrast");
image(s, "results/03_GSEA/03_GSEA_GO_BP_div2_vs_div1_barplot.png", 0.62, 1.9, 5.9, 4.62);
image(s, "results/03_GSEA/04_GSEA_KEGG_div2_vs_div1_barplot.png", 6.75, 1.9, 5.65, 4.62);
text(s, "GO BP: 534 significant terms (410 DIV2-activated / 124 DIV1-enriched)", 0.9, 6.63, 4.85, 0.22, { fontSize: 10.5, color: C.muted, margin: 0 });
text(s, "KEGG: 99 significant pathways (89 DIV2-activated / 10 DIV1-enriched)", 6.95, 6.63, 4.78, 0.22, { fontSize: 10.5, color: C.muted, margin: 0 });
note(s, `C2 GSEA。DIV2 富集突触传递、递质转运、可塑性、GABAergic/glutamatergic synapse；DIV1 富集染色质重塑、核糖体生成、DNA 修复、stem-cell/pluripotency 等。这个结果符合从较早状态到更成熟状态的转变，说明分析方向是合理的。`);

s = pptx.addSlide();
title(s, "Developmental DEGs separate DIV1 from both DIV2 states.", "Heatmaps show development is the dominant axis; Netrin is a smaller perturbation within DIV2.", 18, "Developmental Contrast");
image(s, "results/02_DEG/07_heatmap_div2_vs_div1_top60.png", 0.66, 1.9, 5.55, 4.45);
image(s, "results/02_DEG/08_heatmap_div2_vs_div1_all1495.png", 6.67, 1.9, 5.55, 4.45);
text(s, "Top 60 strict DEGs", 0.92, 6.55, 2.4, 0.2, { fontSize: 10.5, color: C.muted, margin: 0 });
text(s, "All 1,495 strict DEGs", 6.92, 6.55, 2.4, 0.2, { fontSize: 10.5, color: C.muted, margin: 0 });
note(s, `热图页讲结构：列聚类里 DIV1 单独成支，DIV2 和 DIV2+Netrin 更接近。这说明发育差异大于 Netrin 处理效应。左图看 top60 的具体基因，右图看全部 1495 的规模。`);

s = pptx.addSlide();
title(s, "Cell-type marker analysis is the guardrail for interpreting bulk RNA-seq.", "C2 shows composition shift; C1 shows treatment without a comparable composition collapse.", 19, "Cell Source");
image(s, "results/02_DEG/09_celltype_marker_div2_vs_div1.png", 0.62, 1.86, 5.85, 4.75);
image(s, "results/02_DEG/10_celltype_marker_netrin_vs_div2.png", 6.82, 1.86, 5.85, 4.75);
note(s, `这是非常重要的一页。C2：macroglia/OPC/astrocyte marker 上升，microglia marker 下降，neuron marker 基本不变，说明发育对比里有细胞组成 shift。C1：整体 composition 稳定，microglia marker 只有趋势上升且误差大，不支持“microglia 数量大幅增加”。这页帮助你把 bulk 信号读得更稳。`);

s = pptx.addSlide();
title(s, "Signal attribution: direct neuronal response versus indirect microglial signature.", "The strongest interpretation separates pathway confidence from cell-source uncertainty.", 20, "Cell Source");
s.addShape(pptx.ShapeType.roundRect, { x: 0.88, y: 2.16, w: 3.0, h: 1.32, rectRadius: 0.05, fill: { color: "FFF7F2" }, line: { color: "E9C3A8" } });
s.addShape(pptx.ShapeType.roundRect, { x: 5.05, y: 1.78, w: 3.1, h: 1.64, rectRadius: 0.05, fill: { color: "F5F8FA" }, line: { color: "CAD6DC" } });
s.addShape(pptx.ShapeType.roundRect, { x: 5.05, y: 4.35, w: 3.1, h: 1.36, rectRadius: 0.05, fill: { color: "F3F7FB" }, line: { color: "BCD1E5" } });
s.addShape(pptx.ShapeType.roundRect, { x: 9.2, y: 2.7, w: 3.05, h: 1.85, rectRadius: 0.05, fill: { color: "FFFDF8" }, line: { color: "E4D4A6" } });
text(s, "Exogenous\nNetrin-1", 1.25, 2.55, 2.15, 0.48, { fontSize: 18, bold: true, color: C.orange, align: "center", margin: 0 });
text(s, "Cortical neurons", 5.45, 2.12, 2.25, 0.34, { fontSize: 18, bold: true, color: C.ink, align: "center", margin: 0 });
text(s, "Neo1 / Dcc / Dscam / Unc5a", 5.42, 2.64, 2.35, 0.24, { fontSize: 10.5, color: C.muted, align: "center", margin: 0 });
text(s, "Axon guidance / synapse", 5.42, 4.74, 2.35, 0.28, { fontSize: 15, bold: true, color: C.red, align: "center", margin: 0 });
text(s, "Microglia", 9.68, 3.08, 1.9, 0.32, { fontSize: 18, bold: true, color: C.ink, align: "center", margin: 0 });
text(s, "C3 / Apoe / Ncf1\nimmune complement", 9.56, 3.58, 2.15, 0.5, { fontSize: 10.5, color: C.muted, align: "center", margin: 0 });
s.addShape(pptx.ShapeType.line, { x: 3.88, y: 2.82, w: 1.12, h: -0.12, line: { color: C.orange, width: 2, beginArrowType: "none", endArrowType: "triangle" } });
s.addShape(pptx.ShapeType.line, { x: 6.6, y: 3.45, w: 0, h: 0.88, line: { color: C.red, width: 1.7, endArrowType: "triangle" } });
s.addShape(pptx.ShapeType.line, { x: 8.12, y: 2.72, w: 1.05, h: 0.72, line: { color: C.gold, width: 1.5, dash: "dash", endArrowType: "triangle" } });
text(s, "direct", 4.08, 2.38, 0.58, 0.18, { fontSize: 8.5, color: C.orange, margin: 0 });
text(s, "indirect?", 8.35, 2.86, 0.78, 0.18, { fontSize: 8.5, color: C.gold, margin: 0 });
text(s, "Use wording: “consistent with microglial activation,” not “Netrin activates microglia.”", 2.65, 6.28, 8.2, 0.32, { fontSize: 13.2, bold: true, color: C.muted, align: "center", margin: 0 });
note(s, `归因模型页。可靠主线是神经元：Netrin receptor 在神经元丰富，axon guidance/synapse 通路本身是神经元功能，glia confounder 小。免疫基因属于 microglia，更可能是间接的神经元介导旁分泌效应或激活状态变化。措辞红线：说 consistent with microglial activation，不说 Netrin directly activates microglia。`);

s = pptx.addSlide();
title(s, "Receptor expression supports neurons as the direct target.", "The cultures express Netrin receptors well above the median gene-level baseline.", 21, "Cell Source");
const receptorData = [
  ["Neo1", 9413.0, C.orange],
  ["Dcc", 3102.0, C.orange],
  ["Dscam", 1936.0, C.orange],
  ["Unc5a", 1591.0, C.orange],
  ["Unc5d", 1210.0, C.teal],
  ["Unc5c", 427.0, C.blue],
  ["Unc5b", 166.0, C.blue],
  ["Ntn1 ligand", 10.6, C.muted]
];
const maxLog = Math.log10(10000);
receptorData.forEach((d, i) => {
  const y = 1.92 + i * 0.48;
  const logv = Math.log10(d[1]);
  text(s, d[0], 1.0, y + 0.02, 1.15, 0.2, { fontSize: 11.5, bold: i < 4, color: C.ink, margin: 0 });
  s.addShape(pptx.ShapeType.rect, { x: 2.38, y: y, w: 6.8, h: 0.24, fill: { color: "E8E5DC" }, line: { color: "E8E5DC" } });
  s.addShape(pptx.ShapeType.rect, { x: 2.38, y, w: Math.max(0.08, (logv / maxLog) * 6.8), h: 0.24, fill: { color: d[2] }, line: { color: d[2] } });
  text(s, d[1].toLocaleString(undefined, { maximumFractionDigits: 1 }), 9.42, y - 0.02, 1.2, 0.22, { fontSize: 10.5, color: C.ink, margin: 0, align: "right" });
});
s.addShape(pptx.ShapeType.line, { x: 7.05, y: 1.72, w: 0, h: 4.0, line: { color: C.red, width: 1.2, dash: "dash" } });
text(s, "median = 705", 7.12, 5.88, 1.1, 0.18, { fontSize: 9.5, color: C.red, margin: 0 });
panel(s, 10.65, 2.2, 1.72, 2.7, "FFFFFF");
text(s, "Interpretation", 10.9, 2.55, 1.1, 0.22, { fontSize: 10.5, bold: true, color: C.muted, margin: 0 });
text(s, "Existing receptor abundance supports activation through pre-existing neuronal receptor machinery.", 10.88, 3.0, 1.05, 1.18, { fontSize: 12.5, color: C.ink, margin: 0, fit: "shrink" });
note(s, `受体表达页是支撑“神经元为直接靶点”的证据。Neo1、Dcc、Dscam、Unc5a 都高于 median 705，说明细胞有响应 Netrin 的受体基础。Ntn1 内源性 ligand 很低，约 10.6，所以外源 Netrin 是一个相对干净的刺激。C1 中受体本身不显著改变，符合通过既有受体激活，而不是先诱导受体。`);

s = sectionSlide(22, "Synthesis", "Netrin is balanced tuning; development is broad activation.", "The two contrasts together define the biological scale.");
note(s, `第三部分章节页。接下来做跨对比整合，告诉听众：主对比和发育对比不是两个孤立结果，它们合起来说明 Netrin 和发育的性质不同。`);

s = pptx.addSlide();
title(s, "Cross-contrast comparison separates Netrin fine-tuning from developmental activation.", "The direction balance is the key difference.", 23, "Synthesis");
const groups = [
  ["C1 Netrin\nGO BP", 255, 226],
  ["C2 Development\nGO BP", 410, 124],
  ["C1 Netrin\nKEGG", 20, 22],
  ["C2 Development\nKEGG", 89, 10]
];
groups.forEach((g, i) => {
  const x = 1.0 + i * 3.0;
  const scale = i < 2 ? 0.008 : 0.035;
  s.addShape(pptx.ShapeType.rect, { x: x, y: 5.45 - g[1] * scale, w: 0.52, h: g[1] * scale, fill: { color: C.red }, line: { color: C.red } });
  s.addShape(pptx.ShapeType.rect, { x: x + 0.72, y: 5.45 - g[2] * scale, w: 0.52, h: g[2] * scale, fill: { color: C.blue }, line: { color: C.blue } });
  text(s, `${g[1]}`, x - 0.05, 5.25 - g[1] * scale, 0.65, 0.2, { fontSize: 10, bold: true, color: C.red, align: "center", margin: 0 });
  text(s, `${g[2]}`, x + 0.66, 5.25 - g[2] * scale, 0.65, 0.2, { fontSize: 10, bold: true, color: C.blue, align: "center", margin: 0 });
  text(s, g[0], x - 0.36, 5.75, 1.9, 0.48, { fontSize: 11, color: C.ink, align: "center", margin: 0 });
});
rule(s, 0.8, 5.45, 11.5, C.line);
chip(s, "activated", 4.8, 1.72, C.red, 1.25);
chip(s, "suppressed", 6.25, 1.72, C.blue, 1.35);
text(s, "Netrin: ~1:1 bidirectional", 1.15, 2.34, 3.1, 0.34, { fontFace: "Aptos Display", fontSize: 23, bold: true, color: C.ink, margin: 0 });
text(s, "Development: activation-skewed", 7.3, 2.34, 3.25, 0.34, { fontFace: "Aptos Display", fontSize: 23, bold: true, color: C.ink, margin: 0 });
note(s, `跨对比图页。C1 Netrin 的 GO 和 KEGG 基本是双向平衡：255/226，20/22。C2 发育显著偏激活：410/124，89/10。解释为：发育是大规模开启神经程序，Netrin 是双向微调。这一页是 conclusions 前最重要的整合。`);

s = pptx.addSlide();
title(s, "The final model: Netrin-1 coordinates two transcriptional modules in a mixed culture.", "The direct neuronal axis is supported; immune signatures are biologically real but source-limited.", 24, "Synthesis");
panel(s, 0.85, 1.88, 5.15, 4.52, "FFF7F2", "E9C3A8");
panel(s, 7.28, 1.88, 5.15, 4.52, "F3F7FB", "BCD1E5");
text(s, "Direct / high-confidence axis", 1.22, 2.28, 3.2, 0.3, { fontSize: 12, bold: true, color: C.red, margin: 0 });
text(s, "Neurons respond through abundant Netrin receptors, with coordinated synaptic and axon-guidance pathway activation.", 1.22, 2.78, 3.85, 1.0, { fontFace: "Aptos Display", fontSize: 23, bold: true, color: C.ink, margin: 0 });
text(s, "Indirect / source-limited axis", 7.66, 2.28, 3.2, 0.3, { fontSize: 12, bold: true, color: C.blue, margin: 0 });
text(s, "Immune-complement genes are consistent with microglial activation, but bulk RNA-seq cannot prove direct causality.", 7.66, 2.78, 3.95, 1.08, { fontFace: "Aptos Display", fontSize: 23, bold: true, color: C.ink, margin: 0 });
text(s, "Shared conclusion", 1.22, 5.12, 1.6, 0.24, { fontSize: 10.5, bold: true, color: C.muted, margin: 0 });
text(s, "Netrin-1 is best framed as a focused bidirectional tuning cue, not a broad maturational accelerator.", 2.55, 5.02, 7.9, 0.46, { fontSize: 18, bold: true, color: C.ink, align: "center", margin: 0 });
note(s, `最终模型页。左侧是高置信度神经元轴：受体丰富，axon guidance/synapse 通路协同激活。右侧是 source-limited 的 microglia/immune 轴：这些基因真实上调，但 bulk 不能证明直接因果。把结论落到一句话：Netrin 是聚焦双向调节 cue，不是广泛加速成熟。`);

s = pptx.addSlide();
title(s, "Limitations define exactly what this study can and cannot claim.", "The claims are strong because the boundaries are explicit.", 25, "Limitations");
bullets(s, [
  "Mixed culture + bulk RNA-seq cannot directly assign cell of origin; source attribution is marker-based.",
  "The developmental contrast includes both 24 h development and vehicle exposure.",
  "C2 contains composition shifts, especially macroglia up and microglia down.",
  "Activation versus cell number, and direct versus indirect microglial effects, remain unresolved.",
  "Trace immune-stimulatory contamination is unlikely but cannot be fully excluded without polymyxin B / TLR-control experiments."
], 0.94, 1.98, 5.55, 3.65, { fontSize: 14.8 });
panel(s, 7.08, 2.18, 4.55, 3.15, "FFFFFF");
text(s, "Defense posture", 7.42, 2.58, 1.6, 0.26, { fontSize: 10.5, bold: true, color: C.muted, margin: 0 });
text(s, "The study identifies a robust transcriptomic signature and a testable model; it does not claim single-cell resolution or direct microglial causality.", 7.42, 3.02, 3.42, 1.25, { fontFace: "Aptos Display", fontSize: 22, bold: true, color: C.ink, margin: 0 });
note(s, `局限页。讲得主动、清楚。bulk 混合培养不能直接分配细胞来源；C2 有组成变化；microglia 激活和数量变化不能完全分开；免疫信号虽不太可能是 LPS 污染，但未来需要 polymyxin B 或 TLR inhibitor 控制。关键是把“不能 claim 的东西”说清楚，反而增强可信度。`);

s = pptx.addSlide();
title(s, "Future work converts the model into causal tests.", "Each next experiment targets one unresolved inference.", 26, "Future Work");
const fut = [
  ["scRNA-seq / sorted RNA-seq", "Resolve cell-type contributions."],
  ["Immunostaining", "Validate microglial activation and composition shift."],
  ["DCC / UNC5 perturbation", "Test receptor dependence of neuronal response."],
  ["Polymyxin B / TLR controls", "Exclude immune-stimulatory contamination."],
  ["Time-course RNA-seq", "Separate acute and delayed transcriptional phases."]
];
fut.forEach((d, i) => {
  const y = 1.82 + i * 0.82;
  s.addShape(pptx.ShapeType.rect, { x: 0.98, y: y + 0.14, w: 0.14, h: 0.14, fill: { color: [C.orange, C.red, C.blue, C.teal, C.gold][i] }, line: { color: [C.orange, C.red, C.blue, C.teal, C.gold][i] }, rotate: 45 });
  text(s, d[0], 1.32, y, 3.0, 0.28, { fontSize: 15.5, bold: true, color: C.ink, margin: 0 });
  text(s, d[1], 4.45, y + 0.02, 5.1, 0.26, { fontSize: 13.2, color: C.muted, margin: 0 });
});
panel(s, 9.85, 2.15, 2.05, 3.3, "FFFFFF");
text(s, "Priority", 10.18, 2.55, 1.1, 0.24, { fontSize: 10.5, bold: true, color: C.muted, margin: 0 });
text(s, "The most decisive next step is cell-type resolution, because it tests the central attribution claim.", 10.15, 3.0, 1.45, 1.2, { fontSize: 13.5, bold: true, color: C.ink, margin: 0 });
note(s, `未来方向页。每个 future work 都对应一个局限：scRNA-seq 或细胞分选解决来源；IHC 验证 microglia 激活和组成；DCC/UNC5 knockdown 测直接依赖；polymyxin B/TLR inhibitor 排除免疫污染；time course 分开急性和延迟反应。建议强调优先级：最关键是 cell-type resolution。`);

s = pptx.addSlide();
title(s, "Take-home conclusions.", "Four claims to leave with the committee.", 27, "Conclusion");
const claims = [
  ["1", "Netrin-1 induces a focused response", "25 strict DEGs and 66 relaxed DEGs after 24 h."],
  ["2", "The response is bidirectional", "Synapse/axon guidance activation plus cell-cycle/progenitor suppression."],
  ["3", "Neurons are the most plausible direct target", "Netrin receptors are abundant; pathway signal is neuronal."],
  ["4", "Immune signatures require careful attribution", "Consistent with microglial activation, likely indirect, not proven causal."]
];
claims.forEach((c, i) => {
  const x = i % 2 ? 6.95 : 0.92;
  const y = i < 2 ? 1.95 : 4.15;
  panel(s, x, y, 5.3, 1.42, i % 2 ? "F3F7FB" : "FFF7F2", i % 2 ? "BCD1E5" : "E9C3A8");
  text(s, c[0], x + 0.28, y + 0.36, 0.45, 0.38, { fontFace: "Aptos Display", fontSize: 24, bold: true, color: i % 2 ? C.blue : C.orange, margin: 0, align: "center" });
  text(s, c[1], x + 0.92, y + 0.28, 3.75, 0.28, { fontSize: 15.5, bold: true, color: C.ink, margin: 0 });
  text(s, c[2], x + 0.92, y + 0.72, 3.9, 0.28, { fontSize: 11.8, color: C.muted, margin: 0 });
});
note(s, `最后结论页。建议把四条一口气讲清：第一，Netrin 响应聚焦；第二，双向两模块；第三，神经元是最可能直接靶点；第四，免疫信号要谨慎归因。最后可以说：这个研究给出了一个可以被单细胞和功能扰动继续检验的模型。`);

s = pptx.addSlide();
addBg(s, "dark");
s.background = { color: C.dark };
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.dark }, line: { color: C.dark } });
text(s, "Thank you", 0.9, 1.25, 5.2, 0.65, { fontFace: "Aptos Display", fontSize: 42, bold: true, color: C.white, margin: 0 });
text(s, "Questions", 0.94, 2.06, 3.0, 0.42, { fontSize: 20, color: "D7DCE1", margin: 0 });
text(s, "Acknowledgments: [lab]  |  [funding]  |  [collaborators]", 0.95, 5.95, 6.4, 0.28, { fontSize: 12, color: "BFC5CD", margin: 0 });
text(s, "Netrin-1 RNA-seq  |  PhD defense", 0.95, 6.5, 3.4, 0.22, { fontSize: 9.5, color: "8D96A0", margin: 0 });
note(s, `致谢页。按你的实际情况替换实验室、经费、合作者。问答开始前可以主动说：我也准备了 QC、ORA 和补充热图备份页，方便回答技术细节。`);

s = sectionSlide(29, "Backup", "Appendix slides for methods and committee questions.", "Keep these after the main talk.");
note(s, `备份页开始。正式讲 40 分钟时可以不讲，除非评委问方法、ORA 或 QC 细节。`);

s = pptx.addSlide();
title(s, "Backup: DESeq2 diagnostics support model fit.", "Dispersion estimates follow the expected mean-variance trend.", 30, "Backup");
image(s, "results/01_QC/05_DESeq2_dispersion_plot.png", 1.3, 1.75, 5.0, 4.8);
bullets(s, [
  "Size factors: 0.74-1.16.",
  "Median dispersion: 0.0060.",
  "Statistics were run on raw counts with batch modeled as covariate."
], 7.0, 2.25, 4.4, 1.9, { fontSize: 14.2 });
note(s, `备份方法页。如果问 DESeq2 模型质量，就用这一页：dispersion trend 合理，size factor 范围可接受，统计在 raw counts 上进行并显式建模 batch。`);

s = pptx.addSlide();
title(s, "Backup: ORA confirms the developmental contrast with strict DEG input.", "ORA uses strict DEGs; GSEA remains the threshold-free primary pathway analysis.", 31, "Backup");
image(s, "results/04_ORA_div2_vs_div1/01_dotplot_GO_BP_up_simplified.png", 0.62, 1.86, 5.85, 4.75);
image(s, "results/04_ORA_div2_vs_div1/02_dotplot_GO_BP_down_simplified.png", 6.82, 1.86, 5.85, 4.75);
note(s, `备份 ORA 页。说明 ORA 输入是 strict DEG 的 entrez 子集：up 1098 个 strict 中 985 有 entrez，down 397 中 356 有 entrez。GO BP ORA 经 simplify 后 up 160、down 91。ORA 和 GSEA 互相印证，但 GSEA 是无阈值主分析。`);

s = pptx.addSlide();
title(s, "Backup: KEGG ORA highlights neuronal pathways up and immune pathways down in development.", "Disease-named KEGG terms are interpreted as shared immune machinery, not disease states.", 32, "Backup");
image(s, "results/04_ORA_div2_vs_div1/03_dotplot_KEGG_up.png", 0.62, 1.86, 5.85, 4.75);
image(s, "results/04_ORA_div2_vs_div1/04_dotplot_KEGG_down.png", 6.82, 1.86, 5.85, 4.75);
note(s, `备份 KEGG ORA 页。发育上调端富集神经递质受体、突触、Ca/cAMP；下调端是免疫、补体、细胞因子或感染相关 pathway。注意 disease-name caveat：KEGG 疾病名代表共享免疫机制，不表示样本处于疾病状态。`);

s = pptx.addSlide();
title(s, "Backup: the 66 relaxed Netrin-responsive genes cluster consistently.", "Batch-corrected and raw VST heatmaps are retained as complementary views.", 33, "Backup");
image(s, "results/02_DEG/04_heatmap_66_DEGs_main_final.png", 0.72, 1.8, 5.8, 4.85);
image(s, "results/02_DEG/04_heatmap_66_DEGs_suppl_final.png", 6.72, 1.8, 5.8, 4.85);
note(s, `备份热图页。如果有人问 batch correction 对热图的影响，可以展示 batch-corrected 主图和 raw VST 补充图。强调统计不依赖校正矩阵，这只是展示表达结构。`);

pptx.writeFile({ fileName: OUT });
console.log(OUT);

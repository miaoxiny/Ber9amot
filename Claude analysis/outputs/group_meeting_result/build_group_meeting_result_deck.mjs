import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const artifactPath = require.resolve("@oai/artifact-tool");
const { Presentation, PresentationFile } = await import(
  "file:///" + artifactPath.replace(/\\/g, "/")
);

const ROOT = path.resolve("D:/Dropbox/Dropbox/RNAseq 2025/Claude analysis");
const TMP = path.join(ROOT, "outputs/group_meeting_result/tmp");
const PREVIEW = path.join(TMP, "preview");
const LAYOUT = path.join(TMP, "layout");
const QA = path.join(TMP, "qa");
const OUT = path.join(ROOT, "Netrin1_RNAseq_group_meeting_results_2026-06-17.pptx");

await fs.mkdir(PREVIEW, { recursive: true });
await fs.mkdir(LAYOUT, { recursive: true });
await fs.mkdir(QA, { recursive: true });

const C = {
  ink: "#1F2733",
  muted: "#5F6671",
  faint: "#EEF0F2",
  paper: "#F7F4EE",
  white: "#FFFFFF",
  red: "#C73E3E",
  blue: "#3B7AB8",
  orange: "#D88040",
  teal: "#4B9C9A",
  green: "#5B8F5A",
  gold: "#C49A42",
  line: "#D8D4CA",
  dark: "#151B22",
  lavender: "#8E63A9"
};

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

async function bytes(rel) {
  return await fs.readFile(path.join(ROOT, rel));
}

function bg(slide, mode = "paper") {
  slide.background.fill = mode === "dark" ? C.dark : C.paper;
  if (mode !== "dark") {
    slide.shapes.add({
      geometry: "rect",
      name: "left-accent",
      position: { left: 0, top: 0, width: 13, height: 720 },
      fill: C.orange,
      line: { style: "solid", fill: C.orange, width: 0 }
    });
  }
}

function shape(slide, cfg) {
  return slide.shapes.add(cfg);
}

function box(slide, left, top, width, height, fill = C.white, line = C.line, name = "box") {
  return shape(slide, {
    geometry: "roundRect",
    name,
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: line, width: 1 },
    borderRadius: 10
  });
}

function txt(slide, value, left, top, width, height, style = {}) {
  const t = shape(slide, {
    geometry: "textbox",
    name: style.name || "text",
    position: { left, top, width, height },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 }
  });
  t.text = value;
  t.text.style = {
    typeface: style.typeface || "Aptos",
    fontSize: style.fontSize ?? 24,
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    color: style.color || C.ink,
    alignment: style.alignment || "left",
    verticalAlignment: style.verticalAlignment || "top"
  };
  return t;
}

function foot(slide, n, label = "Netrin-1 RNA-seq result update") {
  txt(slide, label, 58, 680, 650, 20, { fontSize: 11, color: C.muted, name: "footer" });
  txt(slide, String(n).padStart(2, "0"), 1182, 680, 40, 20, {
    fontSize: 11,
    color: C.muted,
    alignment: "right",
    name: "page-number"
  });
}

function title(slide, kicker, title, subtitle, n) {
  bg(slide);
  shape(slide, {
    geometry: "rect",
    name: "kicker-marker",
    position: { left: 58, top: 38, width: 12, height: 12 },
    fill: C.orange,
    line: { style: "solid", fill: C.orange, width: 0 },
    rotation: 45
  });
  txt(slide, kicker.toUpperCase(), 84, 30, 420, 22, {
    fontSize: 12,
    bold: true,
    color: C.muted,
    name: "kicker-label"
  });
  txt(slide, title, 58, 78, 890, 88, {
    typeface: "Aptos Display",
    fontSize: 36,
    bold: true,
    color: C.ink,
    name: "slide-title"
  });
  if (subtitle) {
    txt(slide, subtitle, 60, 154, 820, 34, { fontSize: 16, color: C.muted, name: "subtitle" });
  }
  foot(slide, n);
}

function metric(slide, value, label, left, top, color = C.orange, width = 160) {
  txt(slide, value, left, top, width, 48, {
    typeface: "Aptos Display",
    fontSize: 36,
    bold: true,
    color,
    name: "metric-value"
  });
  txt(slide, label, left, top + 50, width, 48, { fontSize: 14, color: C.muted, name: "metric-label" });
}

function claim(slide, heading, body, left, top, width, height, color = C.orange) {
  box(slide, left, top, width, height, C.white, C.line, "claim-card");
  shape(slide, {
    geometry: "rect",
    name: "claim-rule",
    position: { left, top, width: 5, height },
    fill: color,
    line: { style: "solid", fill: color, width: 0 }
  });
  txt(slide, heading, left + 24, top + 20, width - 42, 28, {
    fontSize: 17,
    bold: true,
    color,
    name: "claim-heading"
  });
  txt(slide, body, left + 24, top + 60, width - 44, height - 80, {
    fontSize: 15,
    color: C.ink,
    name: "claim-body"
  });
}

async function addImage(slide, rel, left, top, width, height, alt, fit = "contain") {
  slide.images.add({
    blob: await bytes(rel),
    contentType: "image/png",
    alt,
    fit,
    position: { left, top, width, height }
  });
}

function notes(slide, text) {
  slide.speakerNotes.textFrame.setText(text);
  slide.speakerNotes.setVisible(true);
}

function section(n, label, headline, sub) {
  const slide = deck.slides.add();
  bg(slide, "dark");
  shape(slide, {
    geometry: "rect",
    name: "bottom-band",
    position: { left: 0, top: 650, width: 1280, height: 70 },
    fill: C.orange,
    line: { style: "solid", fill: C.orange, width: 0 }
  });
  txt(slide, label.toUpperCase(), 72, 72, 440, 24, { fontSize: 13, bold: true, color: "#C9CDD2" });
  txt(slide, headline, 72, 210, 920, 118, {
    typeface: "Aptos Display",
    fontSize: 48,
    bold: true,
    color: C.white
  });
  txt(slide, sub, 76, 370, 780, 36, { fontSize: 18, color: "#D7DCE1" });
  txt(slide, String(n).padStart(2, "0"), 1168, 674, 40, 18, {
    fontSize: 11,
    color: C.white,
    alignment: "right"
  });
  return slide;
}

let s;

s = deck.slides.add();
bg(s, "dark");
shape(s, { geometry: "rect", name: "accent", position: { left: 0, top: 0, width: 15, height: 720 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
txt(s, "Netrin-1 RNA-seq", 70, 84, 580, 58, { typeface: "Aptos Display", fontSize: 52, bold: true, color: C.white });
txt(s, "Group Meeting Results Update", 72, 154, 620, 38, { typeface: "Aptos Display", fontSize: 30, color: "#E8E5DC" });
txt(s, "Primary rat cortical cultures  |  DIV1 / DIV2 / DIV2 + Netrin-1  |  bulk RNA-seq", 74, 232, 830, 30, { fontSize: 16, color: "#C9CDD2" });
metric(s, "25", "strict Netrin-responsive DEGs", 78, 462, C.orange, 210);
metric(s, "481 / 42", "GO BP / KEGG GSEA terms", 342, 462, C.teal, 260);
metric(s, "1,495", "strict developmental DEGs", 670, 462, C.gold, 240);
txt(s, "June 17, 2026", 74, 646, 220, 22, { fontSize: 13, color: "#BFC5CD" });
notes(s, "开场：这是一版组会 result update，不是完整答辩。重点讲目前 RNA-seq 分析已经完成到哪里、最关键结果是什么、以及下一步实验/分析怎么推进。");

s = deck.slides.add();
title(s, "Status", "What is now complete?", "The main Netrin contrast, developmental context, and cell-source interpretation are all ready for discussion.", 2);
claim(s, "Completed result blocks", "QC / PCA; C1 Netrin vs DIV2 DEG + GSEA; C2 DIV2 vs DIV1 DEG + ORA + GSEA; heatmaps; cell-type marker analysis.", 74, 218, 460, 220, C.green);
claim(s, "Main interpretation", "Netrin-1 produces a focused bidirectional response: synapse / axon-guidance programs rise while cell-cycle / progenitor programs fall.", 604, 218, 500, 220, C.orange);
claim(s, "Key caveat", "Bulk mixed culture means top single-gene hits must be interpreted with cell-source guardrails, especially microglia and oligodendrocyte markers.", 74, 486, 1030, 112, C.blue);
notes(s, "状态页。直接告诉大家：这次不是还在做 QC，而是主结果已经形成。要讨论的不是有没有信号，而是如何解释这个信号，尤其是 bulk mixed culture 的细胞来源问题。");

s = deck.slides.add();
title(s, "Study Setup", "Two contrasts answer two different questions.", "C1 is the treatment result; C2 provides developmental scale and context.", 3);
box(s, 78, 236, 190, 86, "#F3F7FB", "#BCD1E5");
box(s, 360, 236, 190, 86, "#F2F8F3", "#BFD7BF");
box(s, 642, 236, 240, 86, "#FFF7F2", "#E9C3A8");
txt(s, "DIV1", 116, 260, 110, 26, { fontSize: 24, bold: true, color: C.blue, alignment: "center" });
txt(s, "DIV2", 398, 260, 110, 26, { fontSize: 24, bold: true, color: C.green, alignment: "center" });
txt(s, "DIV2 + Netrin-1", 668, 260, 190, 26, { fontSize: 23, bold: true, color: C.orange, alignment: "center" });
txt(s, "n=3", 140, 294, 64, 18, { fontSize: 13, color: C.muted, alignment: "center" });
txt(s, "n=3", 422, 294, 64, 18, { fontSize: 13, color: C.muted, alignment: "center" });
txt(s, "n=3", 728, 294, 64, 18, { fontSize: 13, color: C.muted, alignment: "center" });
shape(s, { geometry: "chevron", name: "arrow-1", position: { left: 288, top: 260, width: 42, height: 34 }, fill: C.line, line: { style: "solid", fill: C.line, width: 0 } });
shape(s, { geometry: "chevron", name: "arrow-2", position: { left: 570, top: 260, width: 42, height: 34 }, fill: C.line, line: { style: "solid", fill: C.line, width: 0 } });
claim(s, "C1: Netrin effect", "DIV2 + Netrin-1 vs DIV2\nPrimary biological question.", 142, 424, 390, 118, C.orange);
claim(s, "C2: 24 h development", "DIV2 vs DIV1\nScale and composition context.", 642, 424, 390, 118, C.green);
txt(s, "DESeq2 model: ~ batch + condition; batch correction only for visualization.", 118, 618, 900, 22, { fontSize: 15, color: C.muted });
notes(s, "设计页。C1 是 Netrin treatment effect；C2 是 DIV1 到 DIV2 的 24 小时发育/vehicle 背景。统计模型里 batch 作为协变量，校正矩阵只用作 PCA 和 heatmap 可视化。");

s = deck.slides.add();
title(s, "QC", "The dataset is clean enough for contrast-level interpretation.", "High sample correlation and PCA separation support downstream analysis.", 4);
await addImage(s, "results/01_QC/01_sample_correlation_heatmap.png", 70, 198, 520, 370, "Sample correlation heatmap");
await addImage(s, "results/01_QC/04_PCA_before_after_combined.png", 642, 198, 500, 370, "PCA before and after correction");
txt(s, "r = 0.9861-0.9987; no sample outliers", 104, 586, 410, 24, { fontSize: 14, bold: true, color: C.muted });
txt(s, "After visual batch correction, Netrin separates on PC2", 682, 586, 410, 24, { fontSize: 14, bold: true, color: C.muted });
notes(s, "QC 只讲结论：样本相关性高，没有 outlier；PCA 校正后能看到 DIV2 与 DIV2+Netrin 在 PC2 分开，说明主对比有可见信号。");

s = section(5, "Result 1", "Netrin-1 response is focused and bidirectional.", "Primary contrast: DIV2 + Netrin-1 vs DIV2 control.");
notes(s, "过渡页。下面进入 C1 主结果。");

s = deck.slides.add();
title(s, "C1 DEG", "Netrin-1 changes a small, high-confidence gene set.", "Strict DEG threshold: padj < 0.05 and |LFC| > 0.585.", 6);
await addImage(s, "results/02_DEG/01_volcano_netrin_vs_div2_v3.png", 72, 190, 650, 440, "Volcano plot Netrin vs DIV2");
metric(s, "25", "strict DEGs", 784, 220, C.red, 150);
metric(s, "7 up / 18 down", "direction", 964, 220, C.blue, 210);
metric(s, "66", "relaxed DEGs", 784, 378, C.orange, 150);
txt(s, "Top up: C3 (+2.54, padj 1.6e-20)\nTop down: Olig1 (-1.00, padj 3.3e-14)", 784, 515, 360, 64, { fontSize: 16, color: C.ink });
notes(s, "火山图：C1 的 DEG 数量不大，STRICT 只有 25 个，7 上调 18 下调；RELAXED 66 个。结论是 focused response，不是全转录组大重塑。");

s = deck.slides.add();
title(s, "C1 Single Genes", "The strongest genes are biologically informative, but not all neuron-intrinsic.", "This is where cell-source interpretation becomes necessary.", 7);
await addImage(s, "results/02_DEG/02_boxplots_key_DEGs_v3.png", 66, 190, 690, 430, "Boxplots of key Netrin DEGs");
claim(s, "Up module", "C3, Apoe, Adgre1, Ncf1, Itgal, Acod1\nImmune / microglial signature.", 792, 214, 330, 140, C.red);
claim(s, "Down module", "Olig1, Olig2, Sparcl1, Ccnd1, Id1/3\nOPC / glial / progenitor-linked signature.", 792, 402, 330, 154, C.blue);
notes(s, "这页讲单基因模块。免疫相关基因上调，Olig/progenitor/glial 相关基因下调。重点提醒：这些 top gene 不是全都神经元内在信号，所以后面必须用 GSEA 和 marker 分析来归因。");

s = deck.slides.add();
title(s, "C1 GSEA", "Gene-set analysis reveals the neuronal program beneath the top genes.", "Synaptic and axon-guidance programs rise; cell-cycle programs fall.", 8);
await addImage(s, "results/03_GSEA/01_GSEA_GO_BP_barplot_final.png", 58, 188, 570, 430, "GO BP GSEA barplot for Netrin");
await addImage(s, "results/03_GSEA/02_GSEA_KEGG_barplot_final.png", 666, 188, 548, 430, "KEGG GSEA barplot for Netrin");
txt(s, "GO BP: 481 significant terms (255 activated / 226 suppressed)", 92, 632, 520, 22, { fontSize: 14, color: C.muted });
txt(s, "KEGG: 42 significant pathways (20 activated / 22 suppressed)", 690, 632, 500, 22, { fontSize: 14, color: C.muted });
notes(s, "GSEA 是主结论。虽然单个 DEG 不多，但全排序显示突触、axon guidance、exocytosis、learning/memory 上调；cell cycle、DNA replication、chromosome segregation 下调。");

s = deck.slides.add();
title(s, "C1 Mechanism", "Two modules explain the response.", "The result is bidirectional tuning, not simple maturation acceleration.", 9);
box(s, 80, 210, 460, 250, "#FFF7F2", "#E9C3A8");
box(s, 740, 210, 410, 250, "#F3F7FB", "#BCD1E5");
txt(s, "Activated", 116, 246, 160, 24, { fontSize: 20, bold: true, color: C.red });
txt(s, "Synapse / axon guidance", 116, 288, 330, 34, { typeface: "Aptos Display", fontSize: 28, bold: true, color: C.ink });
txt(s, "GO axon guidance NES +1.85\nKEGG axon guidance NES +1.72\nSynapse assembly NES +2.05", 116, 348, 340, 76, { fontSize: 17, color: C.ink });
txt(s, "Suppressed", 776, 246, 160, 24, { fontSize: 20, bold: true, color: C.blue });
txt(s, "Cell cycle / progenitor", 776, 288, 320, 34, { typeface: "Aptos Display", fontSize: 28, bold: true, color: C.ink });
txt(s, "KEGG Cell cycle NES -2.70\nDNA replication / repair suppressed\nOlig1/Olig2/Ccnd1 down", 776, 348, 320, 76, { fontSize: 17, color: C.ink });
shape(s, { geometry: "chevron", name: "middle-arrow", position: { left: 594, top: 294, width: 74, height: 80 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
claim(s, "Interpretation", "Netrin-1 appears to coordinate subtle neuronal pathway activation while suppressing proliferative/progenitor-associated programs.", 176, 536, 820, 86, C.orange);
notes(s, "模型页：把 C1 解释成 two-module response。上调端是神经元功能通路，尤其 axon guidance 跨 GO/KEGG 收敛；下调端是 cell cycle/progenitor。不要说简单加速成熟，要说 bidirectional tuning。");

s = deck.slides.add();
title(s, "C1 Pattern Check", "Trajectory patterns argue against a simple acceleration story.", "P1 monotonic-up genes are absent; the dominant pattern reflects DIV2 peak then Netrin reversal.", 10);
await addImage(s, "results/02_DEG/03_pattern_trajectories_v5.png", 64, 188, 690, 440, "Pattern trajectories for 66 relaxed DEGs");
metric(s, "P5 = 46", "peak at DIV2", 802, 234, C.orange, 180);
metric(s, "P1 = 0", "monotonic acceleration genes", 802, 374, C.red, 260);
txt(s, "Important: Olig1/Olig2 are glial-lineage markers; P5 should not be over-read as neuron-intrinsic maturation.", 802, 522, 338, 70, { fontSize: 16, color: C.ink });
notes(s, "Pattern 页强调阴性结果：P1=0，没有基因沿 DIV1→DIV2→Netrin 单调上升。P5 最大，但 Olig1/Olig2 是胶质/OPC marker，所以不能直接说神经元成熟被加速。");

s = section(11, "Result 2", "The 24 h developmental contrast gives scale and context.", "Secondary contrast: DIV2 vs DIV1.");
notes(s, "进入 C2。C2 不是主问题，但帮助理解 24 小时背景和细胞组成变化。");

s = deck.slides.add();
title(s, "C2 DEG", "Development dominates the transcriptome relative to Netrin treatment.", "The secondary contrast is much larger than the primary contrast.", 12);
await addImage(s, "results/02_DEG/05_volcano_div2_vs_div1_final.png", 72, 190, 650, 440, "Volcano plot DIV2 vs DIV1");
metric(s, "1,495", "strict DEGs", 784, 220, C.red, 160);
metric(s, "1,098 up / 397 down", "direction", 960, 220, C.blue, 235);
metric(s, "4,636", "relaxed DEGs", 784, 378, C.orange, 170);
txt(s, "Olig1: +3.37 in C2 but -1.00 in C1, suggesting Netrin reverses part of natural induction.", 784, 514, 360, 72, { fontSize: 16, color: C.ink });
notes(s, "C2 火山图：STRICT 1495，RELAXED 4636，比 C1 大得多。这个对比说明发育/时间效应是主轴。Olig1 在 C2 上调但在 C1 下调，支持 Netrin 不是沿发育方向简单推进。");

s = deck.slides.add();
title(s, "C2 Pathways", "DIV2 activates mature neuronal programs and suppresses precursor programs.", "GSEA and ORA agree on the developmental interpretation.", 13);
await addImage(s, "results/03_GSEA/03_GSEA_GO_BP_div2_vs_div1_barplot.png", 58, 188, 570, 430, "GO BP GSEA DIV2 vs DIV1");
await addImage(s, "results/03_GSEA/04_GSEA_KEGG_div2_vs_div1_barplot.png", 666, 188, 548, 430, "KEGG GSEA DIV2 vs DIV1");
txt(s, "GO BP: 534 significant terms (410 activated / 124 suppressed)", 92, 632, 520, 22, { fontSize: 14, color: C.muted });
txt(s, "KEGG: 99 significant pathways (89 activated / 10 suppressed)", 690, 632, 500, 22, { fontSize: 14, color: C.muted });
notes(s, "C2 pathway 页。DIV2 富集突触传递、递质转运、可塑性、GABA/glutamate synapse；DIV1 富集染色质、核糖体、DNA 修复等前体程序。这是合理的发育成熟背景。");

s = deck.slides.add();
title(s, "C2 Structure", "Heatmaps show development is the dominant expression axis.", "DIV1 separates from both DIV2 states; Netrin is a smaller perturbation within DIV2.", 14);
await addImage(s, "results/02_DEG/07_heatmap_div2_vs_div1_top60.png", 70, 190, 520, 430, "Top 60 C2 heatmap");
await addImage(s, "results/02_DEG/08_heatmap_div2_vs_div1_all1495.png", 650, 190, 520, 430, "All C2 strict heatmap");
txt(s, "Top 60 strict DEGs", 138, 632, 250, 22, { fontSize: 14, color: C.muted });
txt(s, "All 1,495 strict DEGs", 722, 632, 260, 22, { fontSize: 14, color: C.muted });
notes(s, "热图页：DIV1 独立，DIV2 与 DIV2+Netrin 更接近。说明发育主导整体结构，Netrin 是在 DIV2 状态上的较小扰动。");

s = section(15, "Result 3", "Cell-type marker analysis changes how we read the bulk signal.", "This is the interpretation guardrail.");
notes(s, "进入细胞来源分析。这里是组会上最值得讨论的部分。");

s = deck.slides.add();
title(s, "Cell-Type Markers", "C2 contains a strong composition shift.", "Macroglia / OPC markers rise; microglia markers fall; neuronal markers are relatively stable.", 16);
await addImage(s, "results/02_DEG/09_celltype_marker_div2_vs_div1.png", 82, 188, 740, 440, "Cell-type marker plot C2");
claim(s, "C2 reading", "Many developmental DEGs likely reflect composition changes in mixed culture, not only neuron-intrinsic maturation.", 870, 238, 290, 218, C.green);
txt(s, "No AraC mixed culture: marker behavior is inference, not direct cell counting.", 872, 492, 286, 56, { fontSize: 15, color: C.muted });
notes(s, "C2 marker 图：macroglia/OPC 和 astrocyte 相关 marker 上升，microglia marker 下降，neuron marker 近似稳定。这个结果提示 C2 的大量 DEG 包含细胞组成变化。");

s = deck.slides.add();
title(s, "Cell-Type Markers", "C1 does not show the same composition collapse.", "Microglial effect genes rise, while identity markers are mostly trends with wide uncertainty.", 17);
await addImage(s, "results/02_DEG/10_celltype_marker_netrin_vs_div2.png", 82, 188, 740, 440, "Cell-type marker plot C1");
claim(s, "C1 reading", "Immune genes are consistent with microglial activation, but identity markers do not prove a large increase in microglia number.", 870, 238, 290, 218, C.orange);
txt(s, "Preferred wording: “consistent with microglial activation,” not “Netrin directly activates microglia.”", 872, 492, 286, 66, { fontSize: 15, color: C.muted });
notes(s, "C1 marker 图：效应基因如 C3/Apoe 等显著，但 microglia 身份 marker 多为趋势并且误差大。因此最好说 consistent with microglial activation，而不是直接说 Netrin activates microglia。");

s = deck.slides.add();
title(s, "Working Model", "Netrin-1 has a direct neuronal axis and an indirect/source-limited immune axis.", "This framing keeps the result strong without over-claiming causality.", 18);
box(s, 86, 230, 260, 120, "#FFF7F2", "#E9C3A8");
box(s, 496, 188, 300, 132, "#F5F8FA", "#CAD6DC");
box(s, 496, 438, 300, 110, "#F3F7FB", "#BCD1E5");
box(s, 948, 286, 220, 130, "#FFFDF8", "#E4D4A6");
txt(s, "Exogenous\nNetrin-1", 128, 258, 176, 54, { fontSize: 25, bold: true, color: C.orange, alignment: "center" });
txt(s, "Cortical neurons", 536, 220, 220, 28, { fontSize: 24, bold: true, color: C.ink, alignment: "center" });
txt(s, "Neo1 / Dcc / Dscam / Unc5a", 536, 262, 220, 22, { fontSize: 14, color: C.muted, alignment: "center" });
txt(s, "Synapse / axon guidance", 526, 478, 240, 24, { fontSize: 21, bold: true, color: C.red, alignment: "center" });
txt(s, "Microglia", 990, 318, 138, 28, { fontSize: 24, bold: true, color: C.ink, alignment: "center" });
txt(s, "C3 / Apoe / Ncf1", 990, 360, 136, 22, { fontSize: 14, color: C.muted, alignment: "center" });
shape(s, { geometry: "line", name: "direct-arrow", position: { left: 346, top: 290, width: 146, height: -38 }, line: { style: "solid", fill: C.orange, width: 3, endArrowType: "triangle" }, fill: "none" });
shape(s, { geometry: "line", name: "pathway-arrow", position: { left: 646, top: 322, width: 0, height: 112 }, line: { style: "solid", fill: C.red, width: 3, endArrowType: "triangle" }, fill: "none" });
shape(s, { geometry: "line", name: "indirect-arrow", position: { left: 796, top: 250, width: 150, height: 88 }, line: { style: "solid", fill: C.gold, width: 2, dash: "dash", endArrowType: "triangle" }, fill: "none" });
txt(s, "direct", 378, 246, 70, 18, { fontSize: 12, color: C.orange });
txt(s, "indirect?", 828, 268, 86, 18, { fontSize: 12, color: C.gold });
box(s, 230, 584, 760, 82, C.white, C.line, "main-point-card");
shape(s, { geometry: "rect", name: "main-point-rule", position: { left: 230, top: 584, width: 5, height: 82 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
txt(s, "Main point", 264, 606, 160, 20, { fontSize: 16, bold: true, color: C.orange });
txt(s, "Use neuronal pathways as the confident axis; treat immune signals as source-limited.", 264, 634, 670, 24, { fontSize: 15, color: C.ink });
notes(s, "工作模型页。神经元轴最可靠：受体丰富，axon guidance/synapse 通路上调。免疫轴是真实信号，但来源和因果有限，可能是神经元介导的间接 microglia activation。");

s = deck.slides.add();
title(s, "Synthesis", "Netrin fine-tunes; development activates broadly.", "The two contrasts have different scale and direction balance.", 19);
const bars = [
  ["C1 GO", 255, 226, 120, 0.55],
  ["C2 GO", 410, 124, 410, 0.55],
  ["C1 KEGG", 20, 22, 730, 5.3],
  ["C2 KEGG", 89, 10, 990, 2.45]
];
for (const [lab, act, sup, x, scale] of bars) {
  const base = 530;
  shape(s, { geometry: "rect", name: "act-bar", position: { left: x, top: base - act * scale, width: 56, height: act * scale }, fill: C.red, line: { style: "solid", fill: C.red, width: 0 } });
  shape(s, { geometry: "rect", name: "sup-bar", position: { left: x + 78, top: base - sup * scale, width: 56, height: sup * scale }, fill: C.blue, line: { style: "solid", fill: C.blue, width: 0 } });
  txt(s, String(act), x - 4, base - act * scale - 28, 64, 20, { fontSize: 15, bold: true, color: C.red, alignment: "center" });
  txt(s, String(sup), x + 74, base - sup * scale - 28, 64, 20, { fontSize: 15, bold: true, color: C.blue, alignment: "center" });
  txt(s, lab, x - 18, 554, 170, 26, { fontSize: 16, bold: true, color: C.ink, alignment: "center" });
}
shape(s, { geometry: "line", name: "baseline", position: { left: 80, top: 530, width: 1110, height: 0 }, line: { style: "solid", fill: C.line, width: 1 }, fill: "none" });
txt(s, "activated", 522, 216, 92, 20, { fontSize: 14, bold: true, color: C.red });
txt(s, "suppressed", 620, 216, 110, 20, { fontSize: 14, bold: true, color: C.blue });
box(s, 246, 594, 780, 80, C.white, C.line, "interpretation-card");
shape(s, { geometry: "rect", name: "interpretation-rule", position: { left: 246, top: 594, width: 5, height: 80 }, fill: C.orange, line: { style: "solid", fill: C.orange, width: 0 } });
txt(s, "Interpretation", 280, 614, 180, 20, { fontSize: 16, bold: true, color: C.orange });
txt(s, "C1 is balanced and bidirectional; C2 is activation-skewed. This supports Netrin as tuning rather than broad developmental acceleration.", 280, 642, 690, 24, { fontSize: 15, color: C.ink });
notes(s, "整合页。C1 的 GO/KEGG 基本双向平衡；C2 明显偏激活。这一页把主结论落稳：development 是大规模 activation，Netrin 是双向微调。");

s = deck.slides.add();
title(s, "Takeaways / Next Steps", "What I would discuss today.", "The result is mature enough to decide the next validation experiments.", 20);
claim(s, "Takeaway 1", "Netrin-1 produces a focused 24 h transcriptional response: 25 strict DEGs, 66 relaxed DEGs.", 78, 206, 500, 100, C.red);
claim(s, "Takeaway 2", "GSEA reveals two coordinated modules: synapse / axon guidance up, cell-cycle / progenitor down.", 646, 206, 500, 100, C.orange);
claim(s, "Takeaway 3", "Cell-type markers show why bulk interpretation must separate direct neuronal and indirect microglial signals.", 78, 344, 500, 112, C.blue);
claim(s, "Next decisions", "Prioritize: scRNA-seq or sorted populations; IHC for microglia/composition; receptor perturbation; LPS/TLR controls.", 646, 344, 500, 112, C.green);
txt(s, "Group discussion prompt: which validation path is the fastest route to a defensible mechanism?", 160, 576, 900, 30, { typeface: "Aptos Display", fontSize: 26, bold: true, color: C.ink, alignment: "center" });
notes(s, "最后页。建议把讨论引向下一步：如果资源有限，哪个验证路线最快把模型变成机制？单细胞/分选解决来源，IHC 验证 marker，受体扰动验证直接依赖，LPS/TLR 控制排除免疫污染。");

// Backup slides for detailed questions
s = section(21, "Backup", "Additional result slides for questions.", "ORA and heatmap evidence kept at the end.");
notes(s, "备份页开始。正式组会可以不讲，问到 ORA 或热图细节时再用。");

s = deck.slides.add();
title(s, "Backup: C2 ORA GO BP", "ORA confirms neuronal maturation up and immune/progenitor programs down.", "Strict DEG input; GO terms simplified at cutoff 0.7.", 22);
await addImage(s, "results/04_ORA_div2_vs_div1/01_dotplot_GO_BP_up_simplified.png", 58, 188, 570, 430, "GO BP ORA up simplified");
await addImage(s, "results/04_ORA_div2_vs_div1/02_dotplot_GO_BP_down_simplified.png", 666, 188, 548, 430, "GO BP ORA down simplified");
notes(s, "备份 ORA GO。输入是 C2 strict DEG 的 entrez 子集：up 985、down 356；GO simplify 后 up 160、down 91。");

s = deck.slides.add();
title(s, "Backup: C2 ORA KEGG", "KEGG ORA provides pathway-level context for development.", "Disease-named KEGG terms are interpreted as shared immune machinery, not disease states.", 23);
await addImage(s, "results/04_ORA_div2_vs_div1/03_dotplot_KEGG_up.png", 58, 188, 570, 430, "KEGG ORA up");
await addImage(s, "results/04_ORA_div2_vs_div1/04_dotplot_KEGG_down.png", 666, 188, 548, 430, "KEGG ORA down");
notes(s, "备份 KEGG ORA。注意 KEGG disease-name caveat：不是疾病状态，而是共享免疫/补体/感染相关机制。");

s = deck.slides.add();
title(s, "Backup: C1 relaxed DEG heatmap", "The two-module structure is visible in both corrected and raw VST views.", "Batch correction is visualization-only; statistical testing remains on original counts.", 24);
await addImage(s, "results/02_DEG/04_heatmap_66_DEGs_main_final.png", 70, 190, 520, 430, "C1 heatmap batch corrected");
await addImage(s, "results/02_DEG/04_heatmap_66_DEGs_suppl_final.png", 650, 190, 520, 430, "C1 heatmap raw");
notes(s, "备份 C1 heatmap。可用于回答 batch correction 影响；主图和 raw VST 都能看到两模块结构。");

await fs.writeFile(
  path.join(TMP, "source-notes.txt"),
  [
    "Deck: Netrin-1 RNA-seq group meeting results update.",
    "Sources: netrin_handoff_FULL_2026-06-14_v4 (2).md; exported figures under results/; existing decks used only as content/style reference.",
    "Key facts used: C1 strict 25 (7 up/18 down), relaxed 66; C1 GSEA GO BP 481 (255/226), KEGG 42 (20/22); C2 strict 1495 (1098/397), relaxed 4636; C2 GSEA GO BP 534 (410/124), KEGG 99 (89/10).",
    "Assets: user-provided local result PNGs from results/ subfolders."
  ].join("\n")
);

await fs.writeFile(
  path.join(TMP, "slide-plan.txt"),
  [
    "Mode: create.",
    "Audience: lab group meeting; result update.",
    "Slide count: 20 main/backup combined.",
    "Style: warm paper background, dark ink typography, RNA-seq red/blue direction palette with orange accent.",
    "Fonts: Aptos Display for titles/numbers; Aptos for body.",
    "Structure: status -> design/QC -> C1 results -> C2 results -> cell-source interpretation -> synthesis/next steps -> backup."
  ].join("\n")
);

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(PREVIEW, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(LAYOUT, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text());
}
await writeBlob(path.join(PREVIEW, "contact-sheet.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(OUT);

await fs.writeFile(
  path.join(QA, "visual-qa.txt"),
  [
    "QA summary:",
    `Final PPTX: ${OUT}`,
    `Slides rendered: ${deck.slides.items.length}`,
    "Preview PNGs and contact sheet generated under outputs/group_meeting_result/tmp/preview.",
    "Manual review target: result-update structure, consistent footer/page markers, embedded PNG figures, no empty media expected.",
    "Caveat: 24hscripts folder was inaccessible in this session, so deck uses exported result figures and handoff text."
  ].join("\n")
);

console.log(OUT);

const fs = require("fs");
const path = require("path");
require("module").Module._initPaths();
const pptxgen = require("pptxgenjs");

const ROOT = "D:/Dropbox/Dropbox/RNAseq 2025/Claude analysis";
const OUT = path.join(ROOT, "Hand_enhanced_original_style_bilingual_notes.pptx");
const OUT_DATED = path.join(ROOT, "Hand_enhanced_original_style_bilingual_notes_2026-06-18.pptx");
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
  // PowerPoint-safe horizontal title rule, matching the source deck style.
  slide.addShape(pptx.ShapeType.rect, {
    ...loc(66, 178, 1048, 3),
    fill: { color: C.orange },
    line: { color: C.orange, transparency: 100 }
  });
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

const BILINGUAL_NOTES = [
String.raw`中文讲稿：
开场先说明这是一版组会 results update，核心问题是 Netrin-1 在 E18 rat cortical mixed culture 中到底带来怎样的转录响应。今天不把所有分析细节铺满，而是围绕三条主线展开：第一，C1 的直接 Netrin-responsive genes；第二，C2 的 DIV2 vs DIV1 时间/发育背景；第三，bulk mixed culture 中这些信号可能来自哪些细胞类型。
可以提醒听众，这版 PPT 的定位是组会讨论版，不是最终答辩完整版；所以重点是把结果逻辑讲清楚，并引出后续验证实验。

English talking points:
Open by framing this as a group-meeting results update on the transcriptional response to Netrin-1 in E18 rat cortical mixed cultures. The talk is organized around three layers: the direct Netrin-responsive contrast, the broader DIV2 versus DIV1 developmental background, and the cell-type interpretation of the bulk RNA-seq signal.
Emphasize that this is a discussion-oriented deck. The goal is not to exhaust every table, but to make the result logic clear and identify the most useful next validation steps.`,
String.raw`中文讲稿：
这页先给听众一个全局尺度感。C1 中 strict Netrin-responsive DEGs 只有 25 个，说明 Netrin 的差异表达响应不是大规模重塑，而是相对聚焦。与此相对，C2 中 strict DIV2 vs DIV1 DEGs 有 1,495 个，说明培养时间和发育进程本身带来更强的背景变化。
中间的 481 / 42 是 C1 GSEA 中显著的 GO BP 和 KEGG term 数量，提示虽然单基因数量不多，但 pathway 层面有清晰、系统性的方向。

English talking points:
Use this slide to anchor the scale of the analysis. In C1, only 25 genes pass the strict Netrin-responsive threshold, suggesting a focused rather than global transcriptional response. In contrast, C2 has 1,495 strict DEGs between DIV2 and DIV1, showing that time in culture and developmental progression dominate the overall transcriptomic landscape.
The 481 GO BP and 42 KEGG terms in C1 GSEA show that a small gene-level signal can still organize into coherent biological programs.`,
String.raw`中文讲稿：
这里交代分析流程。过滤后保留 14,148 个 expressed genes；差异分析用 DESeq2，模型中纳入 batch 和 condition，因此统计检验尽量控制批次影响。需要特别说明：batch correction 只用于 PCA 和 heatmap 这类可视化展示，不用于 DESeq2 统计本身。
后续结果分为 strict 和 relaxed 两个阈值。strict 用来讲最稳健的基因，relaxed 用来观察趋势和通路。GSEA 使用 Wald statistic 对全基因排序，这样可以利用低幅度但方向一致的信号。

English talking points:
This slide explains the analysis framework. After filtering, 14,148 expressed genes were retained. Differential expression was modeled with DESeq2 using batch plus condition, so the statistical tests account for batch structure. Batch-corrected values were used only for PCA and heatmap visualization, not as input for the DESeq2 tests.
The strict threshold supports robust gene-level claims, while the relaxed threshold helps inspect trends. GSEA was run on a Wald-statistic-ranked gene list, allowing subtle but coordinated changes to contribute to pathway-level interpretation.`,
String.raw`中文讲稿：
QC 的重点是样本之间相关性很高，没有明显离群样本。这里可以讲得快一点：相关性矩阵支持后续做组间比较，说明主要样本质量没有问题。
如果有人问为什么还要处理 batch，可以解释为：高相关性不代表没有批次结构；batch correction 是为了让 PCA 和 heatmap 更容易读，而统计模型本身已经把 batch 纳入设计。

English talking points:
The key QC message is that sample-to-sample correlations are high and there is no obvious outlier. This supports proceeding with group comparisons.
If asked about batch handling, clarify that high overall correlation does not mean batch structure is absent. Batch correction is used for visualization, while batch is modeled directly in the DESeq2 design for statistical testing.`,
String.raw`中文讲稿：
PCA 展示的是 batch-corrected expression，因此主要用于直观理解样本结构，而不是作为统计证据。这里可以强调 correction 后样本聚类更符合 biological grouping，说明批次影响没有主导最终解释。
这页也为后面两个比较做铺垫：C1 是处理效应，C2 是培养时间/发育效应。PCA 帮助说明这两个层面在数据中都可以被观察到。

English talking points:
The PCA is based on batch-corrected expression and should be treated as a visualization of sample structure rather than a statistical test. After correction, samples align more clearly with the expected biological grouping, suggesting that batch effects are not driving the main interpretation.
This slide also prepares the audience for the two central contrasts: C1 as the Netrin treatment effect and C2 as the time-in-culture or developmental effect.`,
String.raw`中文讲稿：
这一页作为章节过渡。告诉听众接下来先看最直接的问题：在相同培养背景下，Netrin-1 处理本身带来了哪些转录变化。
可以提醒大家，C1 的信号幅度不会像发育时间变化那么大，所以后面要同时关注单基因和 pathway 层面的证据。

English talking points:
Use this as a transition into the first result block. The next question is the direct one: within the same culture context, which transcriptional changes are associated with Netrin-1 treatment?
Set expectations that C1 is not as large as the developmental contrast, so both individual genes and pathway-level evidence are needed.`,
String.raw`中文讲稿：
火山图的结论是 C1 响应非常聚焦。strict 阈值下只有 25 个基因，其中 7 个上调、18 个下调；relaxed 阈值下有 66 个。这说明 Netrin-1 并没有造成广泛的转录扰动。
两个代表基因可以点一下：C3 是最显著上调，提示 complement/immune-related signal；Olig1 是最显著下调，提示 oligodendrocyte/progenitor-related program 可能被压低。这里不要过度解释细胞来源，因为后面 marker 分析会专门讨论。

English talking points:
The volcano plot shows that the C1 response is focused. At the strict threshold, only 25 genes are significant, with 7 up-regulated and 18 down-regulated; at the relaxed threshold, 66 genes are detected. This argues against a broad transcriptional disruption by Netrin-1.
Two genes are useful anchors: C3 is the strongest up-regulated gene, pointing to complement or immune-related signaling, while Olig1 is the strongest down-regulated gene, pointing to oligodendrocyte or progenitor-associated programs. Avoid over-assigning cell source here; that comes later with the marker analysis.`,
String.raw`中文讲稿：
这页把 C1 的 top hits 从火山图中拿出来，更方便讲 biological identity。上调基因整体偏 immune/microglial 或 complement-related，包括 C3 这类信号；下调基因更偏 Olig/progenitor/glial lineage。
关键表述建议是：Netrin-1 诱导了一个小而可解释的基因集合，而不是改变整个 transcriptome。由于是 bulk mixed culture，这些基因可能反映细胞状态变化，也可能反映细胞比例或少数细胞群贡献。

English talking points:
This slide pulls out the C1 top hits to make their biological identity easier to discuss. The up-regulated genes are enriched for immune, microglial, or complement-related signals, while the down-regulated genes lean toward oligodendrocyte, progenitor, or glial-lineage programs.
The main wording should be conservative: Netrin-1 induces a small but interpretable set of genes, rather than remodeling the whole transcriptome. Because this is bulk mixed culture, these changes may reflect cell state, cell proportion, or contributions from a minority population.`,
String.raw`中文讲稿：
这里用 heatmap 和 trajectory 展示 C1 gene set 的表达模式。重点不是逐个读基因，而是看整体模式是否支持前面的火山图结论。可以说，上调和下调模块在组间呈现一致方向，说明这些不是单个 outlier gene 驱动的现象。
讲的时候可以强调：这个结果支持 Netrin-1 对特定转录模块的双向调节，但不支持“整体发育加速”这种简单解释。

English talking points:
Use the heatmap and trajectory view to show that the C1 gene set has coherent expression behavior. The point is not to read every gene, but to confirm that the up- and down-regulated modules move consistently across samples.
This supports a bidirectional modulation of specific transcriptional modules by Netrin-1, rather than a simple global acceleration of development.`,
String.raw`中文讲稿：
这页是 C1 结果中很重要的一页。虽然 strict DEGs 只有 25 个，但 GSEA 捕捉到大量方向一致的 pathway：GO BP 中 481 个显著 term，KEGG 中 42 个显著 term，并且上调和下调方向都有。
讲法上可以把它总结为：单基因响应小，但通路层面组织性强。上调侧主要包括 axon guidance、synapse organization 等神经连接相关过程；下调侧包括 cell cycle/proliferation 相关过程。

English talking points:
This is one of the key C1 slides. Even though only 25 genes pass the strict DEG threshold, GSEA detects many coordinated pathways: 481 significant GO BP terms and 42 significant KEGG terms, with both up- and down-regulated directions.
The concise interpretation is: the gene-level response is small, but the pathway-level organization is strong. Up-regulated programs include axon guidance and synapse organization, while down-regulated programs include cell-cycle and proliferation-related processes.`,
String.raw`中文讲稿：
这里选几个代表性 GSEA curves。Axon guidance 是最符合 Netrin 生物学背景的结果，因为 Netrin 本身就是经典的 axon guidance cue；同时 synapse assembly 或 synaptic organization 的上调提示神经连接相关程序被增强。另一方面，cell-cycle 相关通路被压低，提示 proliferative/progenitor-like programs 下降。
这页可以作为 C1 的 mechanistic bridge：Netrin 可能不是简单让细胞“更多发育”，而是把神经连接程序往上推，同时把增殖/前体相关程序往下压。

English talking points:
These representative GSEA curves provide the mechanistic bridge for C1. Axon guidance is biologically coherent because Netrin is a canonical axon guidance cue. Up-regulation of synapse assembly or synaptic organization further suggests enhancement of neuronal connectivity programs. In parallel, suppression of cell-cycle pathways suggests a reduction in proliferative or progenitor-like programs.
The key point is that Netrin does not simply make the culture “more developed” in a broad sense; it pushes connectivity-related programs upward while suppressing proliferation-related programs.`,
String.raw`中文讲稿：
这页把 C1 的 pathway 结果整合成一个工作解释。左边是神经元相关轴：axon guidance、synapse organization 上调，符合 Netrin 的经典功能。右边是 cell-cycle/progenitor 轴：增殖和前体相关程序下降。
结论句建议这样讲：C1 更像是 bidirectional tuning，也就是对特定模块的双向微调，而不是 broad developmental acceleration。这句话可以为后面 C2 的对比埋伏笔。

English talking points:
This slide integrates the C1 pathway evidence into a working interpretation. On the left, neuronal connectivity programs such as axon guidance and synapse organization are up-regulated, consistent with known Netrin biology. On the right, cell-cycle and progenitor-associated programs are down-regulated.
The preferred summary phrase is “bidirectional tuning.” C1 looks like selective modulation of specific modules, not broad developmental acceleration. This sets up the contrast with C2.`,
String.raw`中文讲稿：
这里进入第二部分：DIV2 vs DIV1 的时间/发育背景。告诉听众这部分不是为了证明 Netrin 效应，而是为了建立 culture 在 24 小时内本身发生了什么变化。
这个背景很重要，因为如果不看 C2，很容易把所有变化都解释成 Netrin。C2 可以帮助我们区分“处理效应”和“培养时间效应”。

English talking points:
Transition into the second result block: the DIV2 versus DIV1 developmental or time-in-culture background. This section is not meant to prove the Netrin effect; it establishes what the culture does over time on its own.
This background is important because, without C2, it would be easy to over-interpret every expression change as Netrin-driven. C2 helps separate treatment-associated effects from time-in-culture effects.`,
String.raw`中文讲稿：
C2 火山图和 C1 完全不同。strict DEGs 有 1,495 个，relaxed DEGs 有 4,636 个，说明 DIV2 vs DIV1 的变化是大规模的。这个规模远大于 Netrin 的 C1 响应。
特别值得指出的是 Olig1：在 C2 中上调，但在 C1 中下调。这说明 Netrin 并不是简单沿着 DIV1 到 DIV2 的发育方向继续推进，而是在发育背景上施加了不同方向的调节。

English talking points:
The C2 volcano plot is very different from C1. There are 1,495 strict DEGs and 4,636 relaxed DEGs, indicating a large-scale shift from DIV1 to DIV2. This is much larger than the Netrin-associated C1 response.
Olig1 is especially informative: it is up-regulated in C2 but down-regulated in C1. This argues that Netrin is not simply pushing the culture further along the DIV1-to-DIV2 developmental trajectory; it imposes a distinct directional modulation on top of that background.`,
String.raw`中文讲稿：
这页展示 C2 的 top hits，可以帮助听众理解为什么 C2 会这么大。很多变化可能反映 24 小时培养期间的细胞成熟、应激适应、细胞组成变化，或不同细胞群的状态切换。
如果要一句话概括：C2 是发育/培养背景的主轴，幅度大约比 C1 强很多；它提供背景，但不能直接等同于 Netrin 机制。

English talking points:
The C2 top hits help explain why this contrast is so large. Many changes may reflect maturation, adaptation to culture, shifts in cell composition, or state transitions across different cell populations during the 24-hour interval.
A good one-sentence summary is: C2 represents the dominant developmental or culture-background axis. It provides context, but it should not be interpreted as the mechanism of Netrin treatment.`,
String.raw`中文讲稿：
GO ORA 这页强调 C2 的生物学范围非常广。输入基因中上调和下调集合都很大，因此 ORA 会捕捉到很多功能类别。需要注意，ORA 不是方向连续的 ranking 方法，它依赖阈值后的 gene list，所以解释时更适合说“哪些 biological categories 被富集”。
可以把结果讲成：C2 涉及 neuronal development、synaptic organization、cell adhesion、extracellular matrix、cell cycle 或 immune-related categories 等多个层面，反映 mixed culture 在一天内经历了系统性重排。

English talking points:
This GO ORA slide emphasizes the broad biological scope of C2. Because both the up- and down-regulated input gene sets are large, ORA detects many functional categories. Clarify that ORA is threshold-based rather than ranking-based, so it is best interpreted as enrichment of biological categories in the selected gene lists.
The result suggests that C2 spans neuronal development, synaptic organization, cell adhesion, extracellular matrix, cell cycle, and immune-related categories, consistent with systematic remodeling of the mixed culture over one day.`,
String.raw`中文讲稿：
KEGG ORA 提供一个更 pathway-oriented 的视角。这里如果出现疾病名称通路，不要按疾病本身解释，而要解释其中共享的分子模块，比如 synaptic signaling、ECM interaction、cell adhesion、calcium signaling 或 inflammatory signaling。
建议用保守表述：KEGG 结果支持 C2 包含神经成熟、结构重塑和细胞状态变化，而不是说明培养体系真正发生了某种疾病过程。

English talking points:
KEGG ORA gives a more pathway-oriented view of C2. If disease-named pathways appear, avoid interpreting them literally as disease processes. Instead, explain them through the shared molecular modules they contain, such as synaptic signaling, ECM interaction, cell adhesion, calcium signaling, or inflammatory signaling.
Use conservative wording: the KEGG results support neuronal maturation, structural remodeling, and cell-state changes in C2, not the presence of a disease process in the culture.`,
String.raw`中文讲稿：
heatmap 展示 C2 genes 可以看到 DIV1 和 DIV2 之间清晰分离，说明时间/发育效应非常强。这里的重点是 pattern 的稳定性和分组分离，而不是单个基因。
这页也帮助解释为什么后面必须做 cell-type marker 分析：当 C2 这么大时，bulk signal 很可能混合了细胞成熟、细胞比例变化和细胞状态变化。

English talking points:
The C2 heatmap shows clear separation between DIV1 and DIV2, reinforcing that the time or developmental effect is strong. The key message is the stability of the pattern and the separation of groups, not individual genes.
This slide also motivates the cell-type marker analysis. When C2 is this large, the bulk signal likely combines maturation, cell proportion changes, and cell-state changes.`,
String.raw`中文讲稿：
C2 的 GSEA 从排序角度补充 ORA。整体上可以讲成：DIV2 相比 DIV1 更偏向 mature neuronal or synaptic programs，同时一些 precursor/proliferation 或 early-state programs 下降。
这与 C1 的不同在于，C2 是大规模 developmental progression，而 C1 是小规模、方向更平衡的 Netrin modulation。这个对比是整套结果的主线。

English talking points:
C2 GSEA complements the ORA results from a ranked-list perspective. Broadly, DIV2 is enriched for more mature neuronal or synaptic programs, while precursor, proliferation, or early-state programs tend to decrease.
The contrast with C1 is central: C2 reflects large-scale developmental progression, whereas C1 reflects smaller and more balanced Netrin-associated modulation.`,
String.raw`中文讲稿：
这里进入第三部分：细胞类型 marker 分析。告诉听众，这部分不是为了把每个 DEG 精确分配给某种细胞，而是为了提高 bulk RNA-seq 解释的可信度。
关键问题是：C1 和 C2 中看到的 immune、glial、neuronal signals，究竟更像细胞状态变化，还是细胞组成变化，或者二者都有。

English talking points:
Transition into the third block: cell-type marker analysis. The goal is not to assign every DEG to a precise cell type, but to make the interpretation of bulk RNA-seq more credible.
The guiding question is whether the immune, glial, and neuronal signals in C1 and C2 are more consistent with cell-state changes, cell-composition changes, or both.`,
String.raw`中文讲稿：
这页先给 mixed culture 的限制。Bulk RNA-seq 测到的是所有细胞的平均转录信号，所以不能直接说某个细胞类型数量一定增加或减少。TPM marker analysis 只能提供背景线索。
建议强调三点：第一，marker 可以帮助判断 signal 可能来自哪些细胞；第二，marker 不能替代单细胞、分选或免疫染色；第三，后续结论会用“consistent with”而不是“proves”。

English talking points:
Start by stating the limitation of mixed-culture bulk RNA-seq. Bulk RNA-seq measures the average transcriptional signal across all cells, so it cannot directly prove that a cell type increased or decreased in number. TPM marker analysis provides contextual evidence, not cell counts.
Emphasize three points: markers help infer plausible signal sources; they do not replace single-cell, sorting, or immunostaining validation; and the interpretation should use “consistent with” rather than “proves.”`,
String.raw`中文讲稿：
C2 marker 结果说明 DIV2 相比 DIV1 可能伴随明显的细胞组成或细胞状态变化。宏胶质/OPC 和 astrocyte-related markers 上升，microglial markers 下降，而 neuronal markers 相对稳定。
这支持一个解释：C2 的大规模 DEG 不只是神经元成熟，也可能包含 glial lineage expansion、astrocytic features、以及 microglia-related signal 的相对降低。这里需要保守，因为 marker 不能直接等于细胞计数。

English talking points:
The C2 marker results suggest substantial cell-composition or cell-state changes from DIV1 to DIV2. Macroglial, OPC, and astrocyte-related markers increase, microglial markers decrease, and neuronal markers remain relatively stable.
This supports the idea that the large C2 DEG set is not only neuronal maturation. It may also include glial-lineage expansion, astrocytic features, and a relative reduction of microglia-related signal. Keep the wording conservative because markers are not direct cell counts.`,
String.raw`中文讲稿：
C1 marker 结果比 C2 更微妙。Netrin 处理中 microglia effect genes 上升，但 classic identity markers 只是趋势，且误差比较大。因此最稳妥的讲法是：C1 中存在与 microglial activation 或 immune response 一致的信号，但不能证明 Netrin 直接激活了 microglia。
这页也可以回应 C3 上调：C3 支持 complement/immune axis 的存在，但来源和因果还需要进一步验证。

English talking points:
The C1 marker result is more nuanced than C2. Microglia effect genes increase with Netrin treatment, but classic identity markers show only trends and relatively large variability. The safest interpretation is that C1 contains a signal consistent with microglial activation or immune response, but it does not prove that Netrin directly activates microglia.
This also helps interpret C3 up-regulation: C3 supports the presence of a complement or immune axis, but the cellular source and causality still require validation.`,
String.raw`中文讲稿：
这页是工作模型。最可信的一条轴是直接 neuronal axis：Netrin receptor/pathway biology 与 axon guidance、synapse organization 的 GSEA 上调相吻合。另一条轴是 indirect or source-limited immune axis：C3 和 microglia effect genes 上升，但因为是 bulk mixed culture，无法直接确定来源。
建议讲成一个层级模型：直接神经元机制是当前证据最强的部分；免疫/小胶质信号是真实观察到的转录特征，但需要用实验验证其细胞来源和因果关系。

English talking points:
This slide presents the working model. The strongest axis is a direct neuronal axis: Netrin receptor and pathway biology align with up-regulated axon guidance and synapse organization programs. The second axis is an indirect or source-limited immune axis: C3 and microglia effect genes increase, but bulk mixed culture prevents definitive source assignment.
Frame this as a layered model. The direct neuronal mechanism is currently best supported. The immune or microglial signal is a real transcriptional feature, but its cellular source and causal relationship need experimental validation.`,
String.raw`中文讲稿：
这页把 C1 和 C2 放在一起比较。C1 的 GO/KEGG 激活和抑制比较平衡，说明 Netrin 的作用是 selective and bidirectional。C2 则明显更偏 activation，并且 DEG 数量大很多，说明培养时间带来的是大规模 developmental remodeling。
核心结论可以这样说：发育背景是大潮流，Netrin 是在这个背景上进行模块化微调。它增强神经连接相关程序，同时压低 cell-cycle/progenitor 程序，并伴随需要进一步验证的 immune/complement signal。

English talking points:
This slide integrates C1 and C2 side by side. C1 has a more balanced mixture of activated and suppressed GO/KEGG pathways, supporting a selective and bidirectional Netrin effect. C2 is much larger and more activation-skewed, consistent with broad developmental remodeling over time in culture.
The main conclusion is that developmental background is the large-scale process, while Netrin performs modular tuning on top of that background. It enhances connectivity-related programs, suppresses cell-cycle or progenitor programs, and is accompanied by an immune or complement signal that requires further validation.`,
String.raw`中文讲稿：
最后用三句话收束。第一，Netrin-responsive DEGs 数量小，但 pathway signal 清楚，尤其是 axon guidance、synapse organization 上调和 cell-cycle/progenitor 程序下降。第二，DIV2 vs DIV1 是更大的发育/培养背景，不能和 Netrin 处理效应混在一起。第三，bulk marker 分析提示 immune/microglia 和 glial composition 可能参与解释，但需要实验验证。
下一步可以建议：用 IHC 或 IF 验证 microglia、astrocyte、OPC markers；用 single-cell 或 sorting 解决细胞来源；做 DCC/UNC5 pathway perturbation 测直接依赖；同时加入 endotoxin/immune contamination control，例如 polymyxin B 或 TLR inhibitor 相关控制。

English talking points:
Close with three take-home points. First, the Netrin-responsive DEG set is small, but the pathway signal is coherent, especially increased axon guidance and synapse organization together with reduced cell-cycle or progenitor programs. Second, DIV2 versus DIV1 is a much larger developmental or culture-background effect and should not be conflated with Netrin treatment. Third, bulk marker analysis suggests that immune, microglial, and glial-composition signals may contribute to interpretation, but they require validation.
Suggested next steps are immunostaining for microglia, astrocyte, and OPC markers; single-cell profiling or cell sorting to resolve source; DCC/UNC5 pathway perturbation to test direct dependence; and endotoxin or immune-contamination controls such as polymyxin B or TLR-inhibitor-related controls.`
];
let bilingualNoteIndex = 0;

function notes(slide, text) {
  if (NO_NOTES) return;
  const noteText = BILINGUAL_NOTES[bilingualNoteIndex] || text;
  bilingualNoteIndex += 1;
  slide.addNotes(noteText.trim());
}

function section(n, label, title, subtitle) {
  const slide = pptx.addSlide();
  addBg(slide);
  addText(slide, label.toUpperCase(), 74, 92, 540, 24, { fontSize: 10, bold: true, color: C.muted });
  addText(slide, title, 74, 218, 940, 120, { fontFace: "Aptos Display", fontSize: 36, bold: true });
  addText(slide, subtitle, 78, 374, 840, 34, { fontSize: 14, color: C.muted });
  slide.addShape(pptx.ShapeType.rect, {
    ...loc(74, 430, 940, 4),
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
// Cover uses the same title-underlining grammar as the rest of the deck.
s.addShape(pptx.ShapeType.rect, {
  ...loc(78, 214, 760, 4),
  fill: { color: C.orange },
  line: { color: C.orange, transparency: 100 }
});
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

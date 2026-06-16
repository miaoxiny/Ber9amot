# Thesis 写作交接包 — Acute Netrin-1 RNA-seq

> 本文档为写作上下文底稿。所有定量数字均从分析对象 live 核验。
> 文献引用处标记 [需补引用]——具体作者/年份/期刊需联网核实，勿编造。
> 配套：README.md（方法细节）、各 results 子目录图表、DEG/GSEA CSV。

---

## 0. 一句话总结（abstract 核心）

5 分钟 Netrin-1 刺激在 E18 大鼠皮层神经元中触发一个快速、协调、瞬态的转录重编程——激活神经元投射/轴突导向程序，同时抑制 RNA 加工与核糖体生物合成——到 15 分钟以 r = −0.99 的精度几乎完全回归基线。

---

## 1. 背景（Introduction 素材）

- Netrin-1 是经典轴突导向分子，通过 DCC/UNC5 受体引导生长锥；经典作用机制是翻译后/局部的（细胞骨架重排、局部翻译），数秒到数分钟级。 [需补引用：Netrin-DCC 轴突导向综述]
- 关于 Netrin 急性转录响应（分钟级）的研究很少——多数转录组研究关注更长时程（小时/天）。本研究填补这一空白：5min / 15min 急性时间课程。
- 研究问题：Netrin-1 急性刺激是否、以及如何快速改变神经元转录组？这种变化是瞬态还是持续？

---

## 2. 方法（Methods 章，可直接改写）

### 2.1 细胞培养与处理
- E18 大鼠皮层混合原代培养
- 3 条件：Vehicle（PBS, 5 min）、5min Netrin-1、15min Netrin-1
- 同一 PBS-5min 对照服务于两个 Netrin 时间点（无独立 PBS-15min 对照）——设计局限，影响 15v0 解读
- 3 生物学重复，每重复每条件为独立孔，共 9 样本

### 2.2 测序与定量
- DRAGEN Salmon，基因水平 quant.genes.sf
- tximport 导入（txIn=FALSE, txOut=FALSE, geneIdCol="Name"），length offset → DESeq2

### 2.3 过滤与归一化
- 两遍过滤：(a) counts>=10 在>=3 样本；(b) 去除任一时间点组全零的基因
- 32623 → 14161 基因
- 基因注释 org.Rn.eg.db，SYMBOL 映射率 85.6%

### 2.4 差异表达
- 模型 ~ replicate + timepoint（参考水平 = Vehicle）
- replicate 作为批次项（PCA 显示 replicate 解释顶层方差 ~52%，timepoint ~34%）
- 对比（Wald）：5v0、15v0、15v5；加 LRT（reduced ~ replicate）
- 显著性：RELAXED = padj<0.05；STRICT = padj<0.05 & |log2FC|>0.585（FC>1.5）
- independent filtering 保持开启
- 批校正仅用于可视化（limma::removeBatchEffect, batch=replicate, design=~timepoint）；DE 检验用 raw counts

### 2.5 通路富集（GSEA）
- clusterProfiler gseGO（ont=BP）+ gseKEGG（organism=rno）
- 排序统计量：DESeq2 Wald stat，降序；按 entrez 去重（保留 |stat| 最大）
- 参数：minGSSize=15, maxGSSize=500, pvalueCutoff=0.05, pAdjustMethod=BH, eps=0, nPermSimple=10000, seed=123
- post-hoc 过滤 setSize>=15；GO 用 simplify(cutoff=0.7) 去语义冗余

### 2.6 软件
R 4.6.0；DESeq2, tximport, limma, ComplexHeatmap, clusterProfiler, org.Rn.eg.db, ggplot2 等（完整版本见 sessionInfo_FINAL.txt）

---

## 3. 结果（Results 章，建议结构 + live 数字 + 配图）

### 3.1 培养物表征与质控
- 神经元为主：pan-neuronal marker（Tubb3 ~3900 TPM、Stmn2 ~1540、Map2 ~750）高出胶质/内皮 marker 2–4 个数量级（Vwf/Flt1 ~0.1）
- 三条件 marker 表达几乎重合 → 细胞组成未变，后续变化为真实转录响应
- replicate 为主要批次来源；批校正后 PC1 主要反映 timepoint
- 图：02_composition/07_celltype_marker_TPM；01_QC/相关热图、PCA-after

### 3.2 5min Netrin 诱导的差异表达（主结果）
- 5v0：RELAXED 32（↑14 / ↓18），STRICT 5（↑2 / ↓3）
- 核心 DEG（5v0，LFC / padj / baseMean）：
  - Fos −2.35 / 2.4e-3 / 537（最强 DEG，IEG↓）
  - Rock1 −0.43 / 9.4e-6 / 2812（细胞骨架）
  - Srsf5 −0.31 / 4.5e-5 / 4698（剪接）
  - Snrnp70 −0.27 / 1.2e-2 / 7932（剪接）
  - Cntn2 +0.25 / 1.4e-2 / 15129（轴突导向）
  - Nos1 +0.32 / 3.5e-2 / 3126；Ryr3 +0.47 / 2.4e-2 / 1067（NO-钙）
  - Tln2 +0.39 / 1.2e-2 / 1888（黏附）
- 图：03_DEG/04_volcano_5v0_v6；DEG CSV

### 3.3 瞬态时间动态
- LRT 19 基因随时间显著变化，绝大多数"5min 脉冲（偏离→回归）"
- Npas4：第二个被急性抑制的 IEG（5v0 中 LFC−1.75、padj=0.076 不显著，靠 LRT 显著）→ 与 Fos 共同构成"急性 IEG 抑制"
- ROCK1 特异：Rock1 −0.43（padj 9.4e-6）下调，Rock2 +0.07（padj 0.999）不动
- 写作注意：Fos 在 15min 反弹超过 Vehicle 基线（非单纯回归）；Fos 的 Vehicle 重复变异大（一个重复偏高），轨迹图误差带宽——如实说明
- 图：03_DEG/05_trajectory_6genes、05b_rock1_vs_rock2_trajectory、06_DEG_heatmap_5v0_v4；DEG_LRT_19_annotated.csv

### 3.4 通路层面的协调响应（GSEA）
- 5v0 GO BP 313 显著（↑285 / ↓28），KEGG 14
- 激活：轴突导向/突触组装/神经元投射（KEGG Axon guidance 居首，含 ephrin 平行通路）
- 抑制：剪接/mRNA 加工 + 核糖体生物合成/翻译
- GSEA 把 3.2 的单基因模块提升为全转录组协调信号
- 图：04_GSEA/08_GSEA_GO_BP_5v0_barplot（simplified）、09_GSEA_KEGG_5v0_barplot

### 3.5 15min 全面回归（时序闭环）
- 15v5：GO BP 295 显著（↑31 / ↓264）—— 方向相对 5v0 完全调转（轴突↓ / 生物合成↑）
- 15v0：GO BP 0 显著 → 15min 已回基线
- 镜像：5v0 vs 15v5 共同 603 通路，NES 相关 r = −0.991（瞬态回归的定量铁证）
- 晚发信号：线粒体/OXPHOS 在 15min 轻度上调（注意：KEGG 显示的 Prion/Huntington/Parkinson 等病名底层是共享线粒体基因，应解读为 OXPHOS 上调，非疾病通路）
- 图：04_GSEA/10_GSEA_GO_BP_15v5_barplot、13_GSEA_mirror_scatter_5v0_vs_15v5（封面级）、12_GSEA_KEGG_15v0_barplot

---

## 4. 主结果汇总表（Table 1 候选）

| 模块 | 5min | 到15min | 代表基因/证据 | 证据来源 |
|---|---|---|---|---|
| Splicing / RNA processing | down | recover | Srsf5, Snrnp70 | DEG+GSEA+LRT |
| Ribosome / translation | down | recover | ribosome biogenesis, rRNA, translation | GSEA+15v5镜像 |
| IEG | down | rebound | Fos −2.35, Npas4 −1.75(LRT) | DEG+LRT |
| Cytoskeleton / ROCK | down | recover | Rock1 −0.43 (Rock2 n.s.) | DEG+轨迹 |
| Axon guidance / projection | up | fall back | Cntn2 +0.25 | DEG+GSEA+KEGG |
| Synapse assembly | up | fall back | synapse/postsynapse assembly | GSEA |
| NO–calcium | up | fall back | Nos1 +0.32, Ryr3 +0.47 | DEG+KEGG |
| Adhesion | up | fall back | Tln2 +0.39 | DEG+KEGG |
| Mitochondria / OXPHOS | flat | late rise | OXPHOS, NADH dehydrogenase | GSEA 15v5/15v0 |

---

## 5. 讨论要点（Discussion 素材 + 5 个卖点）

1. 双 IEG（Fos + Npas4）急性抑制 —— 反常：IEG 通常被刺激快速激活。Netrin 急性下调 IEG 是 novel observation，机制待探讨。 [需补引用：Fos/Npas4 作为活动依赖 IEG 的常规行为]

2. 生物合成机器协调瞬态下调（剪接+核糖体+翻译）—— 提示急性刺激下细胞短暂下调通用生物合成，可能与局部翻译资源重分配相关。 [需补引用：Snrnp70 与轴突转录组、神经元局部翻译]

3. 轴突导向程序急性转录激活 —— Netrin 本行功能（DCC 介导），但在转录层面分钟级响应少见报道；与翻译后机制并行。ephrin 信号同时富集，提示导向系统协同。 [需补引用：Netrin 轴突导向；ephrin-Netrin 协同]

4. r = −0.99 的瞬态回归 —— 量化的近乎完美镜像，说明 5min 响应是被精确逆转的瞬态程序，而非持续重编程。本研究最有力的定量发现。

5. ROCK1 特异性下调 —— Rock1 下调而 Rock2 不变，提示 Netrin 对 ROCK 家族的精确选择性调控（Rock1 是 Netrin-DCC 经典下游）。 [需补引用：ROCK1 在 Netrin-DCC 信号中的角色]

局限性（要写）：
- n=3，急性信号弱（多数单基因 DEG 效应量小，故 GSEA/通路层面为主分析）
- 无独立 PBS-15min 对照 → 15v0 时长混杂，故主结果用 5v0 与 15v5
- 仅 3 时间点 → 时间动态用 LRT + 趋势分类，未用密集时序方法（ImpulseDE2 等不适用）
- Fos 的 Vehicle 重复变异较大
- bulk RNA-seq，非单细胞 → marker 反映整体表达非细胞比例

---

## 6. 图表清单（文件名对照）

Figures（建议）：
- Fig 1: 细胞组成 marker（02_composition/07_celltype_marker_TPM）+ QC（相关热图、PCA-after）
- Fig 2: 火山图 5v0（03_DEG/04_volcano_5v0_v6）
- Fig 3: 时序轨迹（05_trajectory_6genes）+ ROCK 对比（05b）
- Fig 4: DEG 热图（06_DEG_heatmap_5v0_v4）
- Fig 5: GSEA 5v0 barplot（08）+ KEGG（09）
- Fig 6: 时序 GSEA — 15v5 镜像（10）+ 镜像散点 r=−0.99（13，主图）
- Fig 7 / Graphical abstract: schematic（瞬态时序概念图）

Tables：
- Table 1: 主结果模块汇总（本文档第 4 节 / Phase6_master_summary_table.csv）
- Supp: DEG 全表、GSEA 全表（CSV）、LRT 19 基因表

---

## 7. 给 Cowork 的提示

- 本项目所有数字已 live 核验，写作时直接引用本文档数字即可。
- 文献引用（[需补引用] 处）需联网核实，勿编造作者/年份。
- 方法章可基于第 2 节直接展开；结果章按第 3 节结构；讨论按第 5 节。
- 配图在 results/ 各子目录（PNG 预览 / PDF 出版）。

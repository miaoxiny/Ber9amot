suppressPackageStartupMessages({
  library(dplyr)
})

gsea_dir <- "D:/Dropbox/Dropbox/RNAseq 2025/Time analysis/results/04_GSEA"

GSEA <- readRDS(file.path(gsea_dir, "GSEA_all_v2full.rds"))

bp5 <- GSEA[["5v0"]]$BP@result %>%
  filter(!is.na(p.adjust), p.adjust < 0.05)

top5_paths <- c(
  "central nervous system neuron differentiation",
  "neuron migration",
  "neuron projection guidance",
  "central nervous system neuron development",
  "axon guidance"
)

le_list <- lapply(top5_paths, function(p) {
  hit <- bp5 %>% filter(Description == p)
  
  if (nrow(hit) == 0) {
    cat("没找到:", p, "\n")
    return(character(0))
  }
  
  strsplit(hit$core_enrichment[1], "/")[[1]]
})

names(le_list) <- top5_paths

for (p in top5_paths) {
  hit <- bp5 %>% filter(Description == p)
  
  if (nrow(hit) == 0) next
  
  cat(sprintf(
    "\n=== %s ===\nNES=%.2f  setSize=%d  leading-edge=%d genes\n",
    p,
    hit$NES[1],
    hit$setSize[1],
    length(le_list[[p]])
  ))
  
  print(le_list[[p]])
}

all_genes <- sort(unique(unlist(le_list)))

short_names <- c(
  "CNSdiff",
  "migration",
  "projGuid",
  "CNSdev",
  "axonGuid"
)

summary_tab <- data.frame(
  gene_id = all_genes,
  n_pathways = sapply(all_genes, function(g) {
    sum(sapply(le_list, function(x) g %in% x))
  }),
  pathways = sapply(all_genes, function(g) {
    paste(short_names[sapply(le_list, function(x) g %in% x)], collapse = ", ")
  }),
  stringsAsFactors = FALSE
)

summary_tab <- summary_tab %>%
  arrange(desc(n_pathways), gene_id)

cat("\n=== 汇总: 并集", length(all_genes), "个基因, 按出现通路数排序 ===\n")
print(summary_tab, row.names = FALSE)

cat("\n=== 出现通路数分布 ===\n")
print(table(summary_tab$n_pathways))
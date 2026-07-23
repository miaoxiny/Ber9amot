suppressPackageStartupMessages({ library(dplyr); library(ggplot2); library(tidyr); library(DESeq2) })
obj_dir <- "D:/Dropbox/Dropbox/RNAseq 2025/Time analysis/results/objects"
ra   <- readRDS(file.path(obj_dir,"res_all.rds"))
anno <- read.csv(file.path(obj_dir,"gene_annotation.csv"), stringsAsFactors=FALSE)

g93 <- hub2$gene_id
ids <- anno$ensembl[match(g93, anno$symbol)]
fc5 <- as.data.frame(ra$res_5v0)[ids,"log2FoldChange"]; names(fc5) <- g93

labs <- c("CNSdiff","migration","projGuid","CNSdev","axonGuid")
M <- sapply(le_list, function(x) g93 %in% x); colnames(M) <- labs; rownames(M) <- g93

long <- as.data.frame(M) %>% mutate(symbol=g93) %>%
  pivot_longer(-symbol, names_to="pathway", values_to="member")
long$log2FC <- ifelse(long$member, fc5[long$symbol], NA)

ord <- g93[order(hub2$n_pathways, fc5[g93], decreasing=TRUE)]
long$symbol  <- factor(long$symbol, levels=rev(ord))
long$pathway <- factor(long$pathway, levels=labs)

p <- ggplot(long, aes(pathway, symbol)) +
  geom_point(data=subset(long, !member), color="grey88", size=1.4) +
  geom_point(data=subset(long, member), aes(color=log2FC), size=3) +
  scale_color_gradient(low="#FBD0C4", high="#9E2B25", name="5v0 log2FC") +
  scale_x_discrete(position="top") +
  labs(title="Leading-edge genes shared by activated GO BP top5 (n \u2265 2 pathways)",
       x=NULL, y=NULL) +
  theme_minimal(base_size=10) +
  theme(axis.text.y=element_text(size=5.5),
        axis.text.x=element_text(size=10, face="bold"),
        panel.grid.major=element_line(color="grey92", linewidth=0.3),
        panel.grid.minor=element_blank(),
        plot.title=element_text(face="bold", size=12, hjust=0.5),
        legend.position="right")

print(p)

import Navigation from '@/components/Navigation'

export default function Publications() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="border-b-4 border-foreground pb-4 mb-8">
          <h1 className="font-oswald text-4xl font-bold tracking-tight mb-2">
            Publications
          </h1>
          <div className="font-franklin text-sm text-muted-foreground">
            Please see my <a href="/cv" className="text-accent hover:text-accent/80 underline">resume</a> for a more up-to-date list.
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column - Publications */}
          <div className="space-y-6">
            <div className="border-4 border-foreground bg-card">
              <div className="bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2">
                PUBLICATIONS
              </div>
              <div className="p-6 space-y-6">
              
              {/* 2025 */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Unintentional Unalignment: Likelihood Displacement in Direct Preference Optimization</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  Noman Razin, Sadhika Malladi, <span className="font-bold">Adithya Bhaskar</span>, Danqi Chen, Sanjeev Arora, and Boris Hanin
                </div>
                <div className="font-franklin text-sm font-bold mb-2">ICLR 2025</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2410.08847" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-nlp/unintentional-unalignment" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Sometimes, preference optimization leads to the reduction in the likelihood of the preferred responses. We shed light on this curious phenomenon.
                </div>
              </div>

              {/* 2024 - Edge Pruning */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Finding Transformer Circuits with Edge Pruning</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  <span className="font-bold">Adithya Bhaskar</span>, Alexander Wettig, Dan Friedman, and Danqi Chen
                </div>
                <div className="font-franklin text-sm font-bold mb-2">NeurIPS 2024 (Spotlight)</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2406.16778" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-nlp/Edge-Pruning" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  A faster and more precise circuit-finding method that also scales to multi-billion parameter models.
                </div>
              </div>

              {/* 2024 - Heuristic Core */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">The Heuristic Core: Understanding Subnetwork Generalization in Pretrained Language Models</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  <span className="font-bold">Adithya Bhaskar</span>, Dan Friedman, and Danqi Chen
                </div>
                <div className="font-franklin text-sm font-bold mb-2">ACL 2024 (Oral)</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2403.03942" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-nlp/Heuristic-Core" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Structured pruning reveals surprising insights about how Pretrained LMs generalize.
                </div>
              </div>

              {/* 2023 - Text-to-SQL */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Benchmarking and Improving Text-to-SQL Generation Under Ambiguity</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  <span className="font-bold">Adithya Bhaskar*</span>, Tushar Tomar*, Ashutosh Sathe, and Sunita Sarawagi
                </div>
                <div className="font-franklin text-sm font-bold mb-2">EMNLP 2023 (Main)</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2310.13659v1" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/testzer0/ambiqt" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Current Text-to-SQL conversion systems fall flat on their face when faced with ambiguity. We demonstrate this by introducing a new benchmark (AmbiQT), then propose a novel method improving coverage by up to 2.5x.
                </div>
              </div>

              {/* 2023 - GPT-3.5 */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Prompted Opinion Summarization with GPT-3.5</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  <span className="font-bold">Adithya Bhaskar</span>, Alex Fabbri and Greg Durrett
                </div>
                <div className="font-franklin text-sm font-bold mb-2">ACL 2023 (Findings)</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://aclanthology.org/2023.findings-acl.591.pdf" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/testzer0/ZS-Summ-GPT3/" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Novel evaluation metrics for summarization in the GPT-3.5 era.
                </div>
              </div>

              {/* 2023 - LASSO */}
              <div>
                <h3 className="font-franklin text-lg font-bold mb-2">Performance Bounds for LASSO under Multiplicative Noise: Applications to Pooled RT-PCR Testing</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  Richeek Das, Aaron Jerry Ninan, <span className="font-bold">Adithya Bhaskar</span> and Ajit Rajwade
                </div>
                <div className="font-franklin text-sm font-bold mb-2">Signal Processing, Vol. 214, January 2024</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/pdf/2305.17429.pdf" className="text-accent hover:text-accent/80 underline">[paper]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Performance bounds for Group Testing of, e.g., COVID-19.
                </div>
              </div>

                          </div>
            </div>
          </div>

          {/* Right Column - Preprints */}
          <div className="space-y-6">
            <div className="border-4 border-foreground bg-card">
              <div className="bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2">
                PREPRINTS
              </div>
              <div className="p-6 space-y-6">
              
              {/* 2025 - Language Models That Think */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Language Models That Think, Chat Better</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  <span className="font-bold">Adithya Bhaskar*</span>, Xi Ye*, and Danqi Chen
                </div>
                <div className="font-franklin text-sm font-bold mb-2">arXiv preprint, arXiv:2509.20357</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2509.20357" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-pli/RLMT" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  We train language models that think before responding, and they outperform GPT-4o and rival Claude-3.7-Sonnet (thinking) on chat and creative writing benchmarks.
                </div>
              </div>

              {/* 2025 - Cache Me If You Can */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Cache Me If You Can: How Many KVs Do You Need for Effective Long-Context LMs?</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  <span className="font-bold">Adithya Bhaskar*</span>, Alexander Wettig*, Tianyu Gao, Yihe Dong, and Danqi Chen
                </div>
                <div className="font-franklin text-sm font-bold mb-2">arXiv preprint, arXiv:2506.17121</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2506.17121" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-pli/PruLong" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  How should we compare various KV compression methods? The answer turns out to be trickier than one thinks. We also introduce our own method, PruLong.
                </div>
              </div>

              {/* 2024 - Continual Memorization */}
              <div className="border-b border-muted pb-4">
                <h3 className="font-franklin text-lg font-bold mb-2">Continual Memorization of Factoids in Language Models</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  Howard Chen, Jiayi Geng, <span className="font-bold">Adithya Bhaskar</span>, Dan Friedman, and Danqi Chen
                </div>
                <div className="font-franklin text-sm font-bold mb-2">arXiv preprint, arXiv:2411.01715</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2411.07175" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-nlp/continual-factoid-memorization" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Finetuning LMs on facts makes them forget older facts. Surprisingly, mixing in generic data when finetuning prevents forgetting.
                </div>
              </div>

              {/* 2024 - Screenshots */}
              <div>
                <h3 className="font-franklin text-lg font-bold mb-2">Improving Language Understanding from Screenshots</h3>
                <div className="font-franklin text-sm text-muted-foreground mb-1">
                  Tianyu Gao, Zirui Wang, <span className="font-bold">Adithya Bhaskar</span>, and Danqi Chen
                </div>
                <div className="font-franklin text-sm font-bold mb-2">arXiv preprint, arXiv:2402.14073</div>
                <div className="font-franklin text-sm mb-2">
                  <a href="https://arxiv.org/abs/2402.14073" className="text-accent hover:text-accent/80 underline">[paper]</a> <a href="https://github.com/princeton-nlp/PTP" className="text-accent hover:text-accent/80 underline">[code]</a>
                </div>
                <div className="font-franklin text-sm italic">
                  Multimodal Language Models can't read well. We introduce a novel patch-and-text loss to remedy that.
                </div>
              </div>

                          </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 border-t-4 border-foreground pt-4">
          <div className="text-center font-franklin text-xs text-muted-foreground tracking-widest">
            FOR COMPLETE PUBLICATION LIST AND CITATION METRICS, PLEASE SEE CV
          </div>
        </div>
      </main>
    </div>
  )
} 
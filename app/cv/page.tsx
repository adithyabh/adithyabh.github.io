import Navigation from '@/components/Navigation'
import { FaGraduationCap, FaBook, FaChalkboardTeacher, FaTrophy, FaBriefcase, FaProjectDiagram, FaMicrophone, FaFileAlt, FaHandsHelping } from 'react-icons/fa'

export default function CV() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Newspaper Header */}
        <div className="text-center border-b-4 border-foreground pb-6 mb-8">
          <div className="font-oswald text-xs tracking-widest text-muted-foreground mb-2">
            PROFESSIONAL RECORD • COMPLETE DOCUMENTATION
          </div>
          <h1 className="font-oswald text-4xl font-bold tracking-tight mb-2">
            CURRICULUM VITAE
          </h1>
          <div className="font-franklin text-sm tracking-widest text-muted-foreground mb-2">
            ADITHYA BHASKAR • PRINCETON UNIVERSITY
          </div>
          <div className="font-franklin text-sm">
            <a href="/cv.pdf" className="text-accent hover:text-accent/80 underline" target="_blank" rel="noopener noreferrer">Download PDF Version</a>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Education */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaGraduationCap /> EDUCATION
              </div>
              <div className="p-6 space-y-4 font-franklin text-sm">
                <div>
                  <span className="font-bold">2023-Ongoing</span> <br/>
                  Ph.D. in Computer Science, Princeton University, USA <br/>
                  <span className="italic">Advised by Prof. Danqi Chen</span> (Specialization: Natural Language Processing)
                </div>
                <div>
                  <span className="font-bold">2019-23</span> <br/>
                  Bachelor of Technology in Computer Science and Engineering (Honors), IIT Bombay, India <br/>
                  <span className="italic">Bachelor's Thesis advised by Prof. Sunita Sarawagi</span>
                </div>
                <div>
                  <span className="font-bold">2017-19</span> <br/>
                  High School, Central Board of Secondary Education, India
                </div>
                <div>
                  <span className="font-bold">2017</span> <br/>
                  Senior Secondary School, Central Board of Secondary Education, India
                </div>
              </div>
            </section>

            {/* Publications */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaBook /> PUBLICATIONS
              </div>
              <div className="p-6 space-y-3 font-franklin text-sm">
                <div>
                  <span className="font-bold">2025</span> Unintentional Unalignment: Likelihood Displacement in Direct Preference Optimization, <span className="font-bold">ICLR 2025</span><br/>
                  <span className="italic">Noman Razin, Sadhika Malladi, <span className="font-bold">Adithya Bhaskar</span>, Danqi Chen, Sanjeev Arora, and Boris Hanin</span>
                </div>
                <div>
                  <span className="font-bold">2024</span> Finding Transformer Circuits With Edge Pruning, <span className="font-bold">NeurIPS 2024 (Spotlight)</span><br/>
                  <span className="italic"><span className="font-bold">Adithya Bhaskar</span>, Alexander Wettig, Dan Friedman, and Danqi Chen</span>
                </div>
                <div>
                  <span className="font-bold">2024</span> The Heuristic Core: Understanding Subnetwork Generalization in Pretrained Language Models, <span className="font-bold">ACL 2024 (Oral)</span><br/>
                  <span className="italic"><span className="font-bold">Adithya Bhaskar</span>, Dan Friedman, and Danqi Chen</span>
                </div>
                <div>
                  <span className="font-bold">2023</span> Benchmarking and Improving Text-to-SQL Generation under Ambiguity, <span className="font-bold">EMNLP 2023</span><br/>
                  <span className="italic"><span className="font-bold">Adithya Bhaskar*</span>, Tushar Tomar*, Ashutosh Sathe, and Sunita Sarawagi</span>
                </div>
                <div>
                  <span className="font-bold">2023</span> Prompted Opinion Summarization with GPT-3.5, <span className="font-bold">ACL 2023 (Findings)</span><br/>
                  <span className="italic"><span className="font-bold">Adithya Bhaskar</span>, Alexander R. Fabbri, and Greg Durrett</span>
                </div>
                <div>
                  <span className="font-bold">2023</span> Performance Bounds for LASSO under Multiplicative Noise: Applications to Pooled RT-PCR Testing, <span className="font-bold">Signal Processing, Vol. 214</span><br/>
                  <span className="italic">Richeek Das, Aaron Jerry Ninan, <span className="font-bold">Adithya Bhaskar</span>, and Ajit Rajwade</span>
                </div>
              </div>
            </section>

            {/* Preprints */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaFileAlt /> PREPRINTS
              </div>
              <div className="p-6 space-y-3 font-franklin text-sm">
                <div>
                  <span className="font-bold">2025</span> Language Models That Think, Chat Better, <span className="italic">arXiv preprint, arXiv:2509.20357</span><br/>
                  <span className="italic"><span className="font-bold">Adithya Bhaskar*</span>, Xi Ye*, and Danqi Chen</span>
                </div>
                <div>
                  <span className="font-bold">2025</span> Cache Me If You Can: How Many KVs Do You Need for Effective Long-Context LMs?, <span className="italic">arXiv preprint, arXiv:2506.17121</span><br/>
                  <span className="italic"><span className="font-bold">Adithya Bhaskar*</span>, Alexander Wettig*, Tianyu Gao, Yihe Dong, and Danqi Chen</span>
                </div>
                <div>
                  <span className="font-bold">2025</span> Extracting Rule-based Descriptions of Attention Features in Transformers, <span className="italic">arXiv preprint, arXiv:2510.18148</span><br/>
                  <span className="italic">Dan Friedman, <span className="font-bold">Adithya Bhaskar</span>, Alexander Wettig, and Danqi Chen</span>
                </div>
                <div>
                  <span className="font-bold">2024</span> Continual Memorization of Factoids in Language Models, <span className="italic">arXiv preprint, arXiv:2411.01715</span><br/>
                  <span className="italic">Howard Chen, Jiayi Geng, <span className="font-bold">Adithya Bhaskar</span>, Dan Friedman, and Danqi Chen</span>
                </div>
                <div>
                  <span className="font-bold">2024</span> Improving Language Understanding from Screenshots, <span className="italic">arXiv preprint, arXiv:2402.14073</span><br/>
                  <span className="italic">Tianyu Gao, Zirui Wang, <span className="font-bold">Adithya Bhaskar</span>, and Danqi Chen</span>
                </div>
              </div>
            </section>

            {/* Scholastic Achievements */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaTrophy /> SCHOLASTIC ACHIEVEMENTS
              </div>
              <div className="p-6 space-y-3 font-franklin text-sm">
                <div><span className="font-bold">2024</span> Recipient of the <span className="font-bold">Hisashi and Masae Kobayashi '67 Fellowship</span>.</div>
                <div><span className="font-bold">2023</span> Recipient of the <span className="font-bold">Thomas Dooie Class of 1974 Research Award</span>.</div>
                <div><span className="font-bold">2019</span> <span className="font-bold">All India Rank 18</span> in JEE Advanced 2019 among 240 thousand candidates.</div>
                <div><span className="font-bold">2019</span> <span className="font-bold">All India Rank 114</span> in JEE Mains 2019 among 1.1 million candidates.</div>
                <div><span className="font-bold">2018</span> Secured a position in the top 39 ranks in the <span className="font-bold">Indian National Physics Olympiad</span> and was invited to the Orientation-cum-Selection-Camp in Physics held in May-June 2018.</div>
                <div><span className="font-bold">2018</span> Secured a position in the top 49 ranks in the <span className="font-bold">Indian National Chemistry Olympiad</span> and was invited to the Orientation-cum-Selection-Camp in Chemistry held in May-June 2018.</div>
                <div><span className="font-bold">2016</span> Among the 39 students to clear the <span className="font-bold">Indian National Mathematical Olympiad</span>, becoming one of the youngest to ever be invited to the Orientation-cum-Selection-Camp in Mathematics aged 14.</div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Experience */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaBriefcase /> EXPERIENCE
              </div>
              <div className="p-6 space-y-4 font-franklin text-sm">
                <div>
                  <span className="font-bold">UT Austin, Summer 2022</span> <br/>
                  <span className="italic">Research Intern, Natural Language Processing, USA</span> <br/>
                  Advisor: Prof. Greg Durrett <br/>
                  <ul className="list-disc pl-6">
                    <li>Developed metrics to measure <span className="font-bold">factuality, faithfulness and specificity</span> for multi-document summarization.</li>
                    <li>Benchmarked <span className="font-bold">GPT-3.5</span> and showed hierarchical summarization of large text performs best on faithfulness and specificity.</li>
                    <li>Investigated <span className="font-bold">pre-clustering and pre-summarization</span> methods for improved correctness, faithfulness, and specificity.</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold">Uppsala University, Summer 2021</span> <br/>
                  <span className="italic">Research Intern, Formal Verification</span> <br/>
                  Advisor: Prof. Parosh Abdulla <br/>
                  <ul className="list-disc pl-6">
                    <li>Developed a <span className="font-bold">model and simulator</span> for programs running under the ARMv8 memory model.</li>
                    <li>Used <span className="font-bold">Context Bounded Model Checking</span> for State Reachability Analysis, achieving up to an order of magnitude speedup over existing checkers.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Invited Talks */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaMicrophone /> INVITED TALKS
              </div>
              <div className="p-6 space-y-3 font-franklin text-sm">
                <div>
                  <span className="font-bold">April 2024</span> The Heuristic Core: Understanding Subnetwork Generalization in Pretrained Language Models <br/>
                  <span className="italic">Host: Mathew Monfort, Amazon AWS</span>
                </div>
              </div>
            </section>

            {/* Teaching */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaChalkboardTeacher /> TEACHING
              </div>
              <div className="p-6 space-y-3 font-franklin text-sm">
                <div>
                  <span className="font-bold">Spring 2025</span> Graduate Teaching Assistant, COS 484: Natural Language Processing <br/>
                  <span className="italic">Instructors: Danqi Chen, Vikram Ramaswamy, and Tri Dao</span> <br/>
                  Princeton University
                </div>
                <div>
                  <span className="font-bold">Fall 2024</span> Graduate Teaching Assistant, COS 597R: Deep Dive into Large Language Models <br/>
                  <span className="italic">Instructors: Danqi Chen, and Sanjeev Arora</span> <br/>
                  Princeton University
                </div>
              </div>
            </section>

            {/* Service */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaHandsHelping /> SERVICE
              </div>
              <div className="p-6 space-y-3 font-franklin text-sm">
                <div><span className="font-bold">2025</span> NeurIPS 2025, Reviewer</div>
                <div><span className="font-bold">2025</span> ICML 2025 MOSS Workshop, Reviewer</div>
                <div><span className="font-bold">2024</span> NeurIPS 2024 ATTRIB Workshop, Reviewer</div>
              </div>
            </section>

            {/* Other Projects */}
            <section className="border-4 border-foreground bg-card">
              <div className="flex items-center gap-2 bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2 px-4">
                <FaProjectDiagram /> OTHER PROJECTS
              </div>
              <div className="p-6 space-y-4 font-franklin text-sm">
                <div>
                  <span className="font-bold">Robust Models, Spring 2023</span> <br/>
                  <span className="italic">Bachelor's Project, Natural Language Processing, Guide: Prof. Sunita Sarawagi</span>
                  <ul className="list-disc pl-6">
                    <li>Demonstrated that training a Text-to-SQL model on partially masked inputs leads to diversity in model outputs, including in columns/tables, string literals, integers, and aggregates.</li>
                    <li>Filtered outputs by model probabilities relative to the unmasked question.</li>
                    <li>Furnished questions for generated queries via an SQL-to-Text model. Data augmentation with pairs led to increases in accuracy and robustness.</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold">C Decompiler, Fall 2020</span> <br/>
                  <span className="italic">Course Project, Software Systems, Guide: Prof. Amitabh Sanyal</span>
                  <ul className="list-disc pl-6">
                    <li>Built a decompiler to convert Register Transfer Language to C for portability across architectures.</li>
                    <li>Utilized lex and bison to parse source code in RTL and identify program elements like assignments, arithmetic operations, conditional/looping constructs, function calls and memory accesses.</li>
                    <li>Performed local & global data flow analysis and control flow analysis to contextualize parsed code.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t-4 border-foreground pt-4 text-center">
          <div className="font-franklin text-xs text-muted-foreground tracking-widest">
            COMPLETE PUBLICATION RECORD AVAILABLE IN PUBLICATIONS SECTION
          </div>
        </div>
      </main>
    </div>
  )
}
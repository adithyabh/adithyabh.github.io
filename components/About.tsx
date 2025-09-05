import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope, FaMapMarkerAlt, FaUniversity, FaOrcid } from 'react-icons/fa';

// Google Scholar SVG icon component
function GoogleScholarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" width="1em" height="1em" {...props}>
      <g>
        <circle cx="24" cy="24" r="20" fill="#4285F4" />
        <path d="M24 13l10 8.5-3.5 2.5L24 17l-6.5 7.5L14 21.5z" fill="#fff" />
        <ellipse cx="24" cy="32" rx="7" ry="3.5" fill="#fff" />
      </g>
    </svg>
  );
}

export default function About() {
  // To add your picture:
  // 1. Place your image file (e.g., 'me.jpg') in the 'public' folder at the root of your project (create it if it doesn't exist).
  // 2. Replace '/me.jpg' in the <img> src below with your actual file name.
  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Newspaper Columns Layout */}
      <div className="grid md:grid-cols-4 gap-8">
        {/* Left Sidebar: Profile */}
        <div className="md:col-span-1 space-y-6">
          {/* Portrait */}
          <div className="border-4 border-foreground bg-card p-4">
            <div className="aspect-[3/4] bg-muted border-2 border-foreground mb-3 flex items-center justify-center">
              {/* Add your picture to the 'public' folder and update the src below */}
              {/* Example: <img src="/me.jpg" alt="Adithya Bhaskar" className="object-cover w-full h-full" /> */}
              <img src="/photo.jpeg" alt="Adithya Bhaskar" className="object-cover w-full h-full" />
            </div>
            <div className="text-center">
              <div className="font-oswald text-lg font-bold">Adithya Bhaskar</div>
              <div className="font-franklin text-xs text-muted-foreground">
                Second year PhD student at Princeton University
              </div>
            </div>
            <div className="mt-4 space-y-2 font-franklin text-sm">
              <div className="flex items-center gap-2"><FaMapMarkerAlt /> Princeton, NJ</div>
              <div className="flex items-center gap-2"><FaUniversity /> Princeton University</div>
              {/* <a href="mailto:your.email@princeton.edu" className="flex items-center gap-2 hover:underline" target="_blank" rel="noopener noreferrer"><FaEnvelope /> Email</a> */}
              <div className="flex items-center gap-2 hover:underline" rel="noopener noreferrer"><FaEnvelope /> [firstname]b@princeton.edu</div>
              <div className="text-xs text-muted-foreground ml-6">* I don't know why people do this - in this age bots are clearly smart enough to put the email together if they wanted to...</div>
              <a href="https://twitter.com/AdithyaNLP" className="flex items-center gap-2" target="_blank" rel="noopener noreferrer"><FaTwitter /> Twitter</a>
              {/* <a href="https://in.linkedin.com/in/adithya-bhaskar-702505209" className="flex items-center gap-2 hover:underline" target="_blank" rel="noopener noreferrer"><FaLinkedin /> LinkedIn</a> */}
              <a href="https://github.com/testzer0" className="flex items-center gap-2 hover:underline" target="_blank" rel="noopener noreferrer"><FaGithub /> Github</a>
              <a href="https://scholar.google.com/citations?user=TS0_Du0AAAAJ&hl=en" className="flex items-center gap-2 hover:underline" target="_blank" rel="noopener noreferrer"><GoogleScholarIcon /> Google Scholar</a>
              <a href="https://orcid.org/0009-0005-4772-6129" className="flex items-center gap-2 hover:underline" target="_blank" rel="noopener noreferrer"><FaOrcid /> ORCID</a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          {/* Welcome Section */}
          <section>
            <h2 className="font-oswald text-3xl font-bold tracking-tight mb-2">Welcome to my webpage</h2>
            <p className="font-franklin text-base leading-relaxed mb-4">
              Hello! I am Adithya Bhaskar, a third-year Ph.D. student at Princeton University, advised by <a href="https://www.cs.princeton.edu/~danqic/">Prof. Danqi Chen</a>. Prior to joining Princeton, I completed my B.Tech. in Computer Science from IIT Bombay, where I completed my Bachelor's Thesis under the supervision of <a href="https://www.cse.iitb.ac.in/~sunita/">Prof. Sunita Sarawagi</a>. I am fortunate to have previously interned under <a href="https://www.cs.utexas.edu/~gdurrett/">Prof. Greg Durrett</a> at UT Austin, where I was first exposed to Large Language Models. Prior to that, I interned at Uppsala University under <a href="https://user.it.uu.se/~parosha/">Prof. Parosh Abdulla</a>.
            </p>
          </section>

          {/* Research Interests */}
          <section>
            <h3 className="font-oswald text-2xl font-bold tracking-tight mb-2">Research Interests</h3>
            <p className="font-franklin text-base leading-relaxed mb-4">
              I am curious about the inner workings of language models. We can throw together a nice looking loss function, a reasonable training loop, some compute and lots of data - and voila! A model starts generating near-fluent text. But, <em>what</em> does it learn? Does it reverse-engineer rules of grammar? At the start of my PhD, I wrote my interests down as:
            </p>
            <ul className="list-disc pl-6 font-franklin text-base mb-4">
              <li>How can we best port human knowledge of Natural Language (e.g. linguistic structure, disambiguation of context, and so on) to a Language Model by modifying the model, training process and/or the data? More practically, can this lead us to better parameter and data efficiency?</li>
              <li>Humans find it hard to learn languages without any visual cues or explanations, but it is easy for LMs to do so. Do they know something we don't? Can we reverse engineer more efficient ways to think about Language from them?</li>
            </ul>
            <p className="font-franklin text-base leading-relaxed">
              Not all of my interests are this abstract: how do we best train a language model? What data mixes? What optimizer? What architecture? Does &lt;insert method&gt; work for &lt;insert desired outcome&gt;? I also find myself thinking about scaling laws, post-training and the social impacts of language models these days.
            </p>
          </section>

          {/* Updates Section */}
          <section>
            <h3 className="font-oswald text-2xl font-bold tracking-tight mb-2">Updates</h3>
            <ul className="font-franklin text-base space-y-2">
              <li><strong>[09/24]</strong> I will be at NeurIPS to present <a href="https://arxiv.org/abs/2409.10000">Edge Pruning</a> (spotlight)!</li>
              <li><strong>[06/24]</strong> I will present my <a href="https://arxiv.org/abs/2403.03942">Heuristic Core</a> paper at ACL (Oral, Main). See you there!</li>
              <li><strong>[04/24]</strong> Gave an invited talk at Amazon AWS (Responsible AI team).</li>
              <li><strong>[04/24]</strong> Named a Hisashi and Masae Kobayashi '67 Fellow.</li>
              <li><strong>[08/23]</strong> Joined Princeton University!</li>
              <li><strong>[08/23]</strong> Graduated from IIT Bombay with Honors.</li>
              <li><strong>[08/23]</strong> Happy to be awarded the <em>Thomas A. Dooie Class of 1974 Research Award</em> for my Bachelor's Thesis!</li>
              <li><strong>[05/22]</strong> Excited to intern with Prof. Greg Durrett at UT Austin over the summer!</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
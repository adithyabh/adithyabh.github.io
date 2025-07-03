import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center border-b-4 border-foreground pb-6 mb-8">
          <div className="font-oswald text-xs tracking-widest text-muted-foreground mb-2">
            THOUGHTS & REFLECTIONS • BAD WRITING, BETTER THOUGHTS
          </div>
          <h1 className="font-oswald text-4xl font-bold tracking-tight mb-2">
            BLOG
          </h1>
          <div className="font-franklin text-sm tracking-widest text-muted-foreground">
            THIS PAGE HAS WORDS. SEVERAL OF THEM.
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          
          {/* Featured Post */}
          <article className="border-4 border-foreground bg-card">
            <div className="bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2">
              FEATURED POST
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-franklin text-xs text-muted-foreground">
                  Published July 1, 2025
                </div>
                <div className="font-franklin text-xs text-accent font-bold">
                  BAD WRITING, BETTER THOUGHTS
                </div>
              </div>
              
              <Link href="/blog/hello-world" className="group">
                <h2 className="font-oswald text-2xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                  Bad writing, better thoughts
                </h2>
                
                <div className="font-franklin text-base leading-relaxed mb-4">
                  <p className="mb-3">
                    I am as of yet unsure of what goes here - perhaps musing about things that are not related to work. We will see.
                  </p>
                  
                  <p className="text-muted-foreground italic">
                    This is just a test post to get things started. Stay tuned for more substantive content coming soon...
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="font-franklin text-sm text-muted-foreground">
                    1 min read • Introduction
                  </div>
                  <div className="font-franklin text-sm text-accent font-bold group-hover:underline">
                    READ MORE →
                  </div>
                </div>
              </Link>
            </div>
          </article>

          {/* Upcoming/Coming Soon Posts */}
          <div className="border-4 border-foreground bg-card">
            <div className="bg-foreground text-background font-oswald text-sm font-bold tracking-widest text-center py-2">
              COMING SOON
            </div>
            <div className="p-6 text-center">
              <div className="font-franklin text-base text-muted-foreground">
                More posts at some point.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 border-t-4 border-foreground pt-4">
          <div className="text-center font-franklin text-xs text-muted-foreground tracking-widest">
            SUBSCRIBE FOR UPDATES ON NEW POSTS AND RESEARCH INSIGHTS
          </div>
        </div>
      </main>
    </div>
  )
} 
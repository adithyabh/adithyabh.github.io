import Navigation from '@/components/Navigation'
import Link from 'next/link'

export default function HelloWorldBlogPost() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="border-b-4 border-foreground pb-6 mb-8">
          <Link href="/blog" className="font-franklin text-sm text-accent hover:text-accent/80 underline mb-4 inline-block">
            ← Back to Blog
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div className="font-franklin text-xs text-muted-foreground">
              Published January 15, 2025
            </div>
            <div className="font-franklin text-xs text-accent font-bold">
              INTRODUCTION
            </div>
          </div>
          
          <h1 className="font-oswald text-4xl font-bold tracking-tight mb-4">
            Bad writing, better thoughts
          </h1>
          
          <div className="font-franklin text-sm text-muted-foreground">
            2 min read • Introduction • By Adithya Bhaskar
          </div>
        </div>

        {/* Article Content */}
        <article className="font-franklin text-base leading-relaxed space-y-6">
          
          <div className="border-l-4 border-accent pl-6 bg-card p-4">
            <p className="italic text-muted-foreground">
              <strong>Hello.</strong> This is my first blog post and a simple test to get things started. 
              Consider this a placeholder for now.
            </p>
          </div>

          <p>
            I am as of yet unsure of what goes here - perhaps musing about things that are not related to work. We will see.
          </p>
        </article>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t-4 border-foreground">
          <div className="flex justify-between items-center">
            <Link href="/blog" className="font-franklin text-sm text-accent hover:text-accent/80 underline">
              ← Back to All Posts
            </Link>
            <div className="font-franklin text-xs text-muted-foreground">
              More posts coming soon...
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
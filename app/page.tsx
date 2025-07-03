import Navigation from '@/components/Navigation'
import About from '@/components/About'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <About />
      </main>
    </div>
  )
}

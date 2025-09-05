'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/components/utils'

const navItems = [
  { href: '/', label: 'ABOUT' },
  { href: '/cv', label: 'CURRICULUM VITAE' },
  { href: '/publications', label: 'PUBLICATIONS' },
  { href: '/blog', label: 'BLOG' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="bg-background border-b-4 border-foreground">
      {/* Newspaper Masthead */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="text-center border-b-2 border-foreground pb-4 mb-4">
          <div className="font-oswald text-xs tracking-widest text-muted-foreground mb-2">
            ACADEMIC CHRONICLE • EST. 2022 • VOL. 4 NO. 9
          </div>
          <h1 className="font-oswald text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            ADITHYA BHASKAR
          </h1>
          <div className="font-franklin text-sm tracking-widest text-muted-foreground mt-2">
            NATURAL LANGUAGE PROCESSING • PRINCETON UNIVERSITY
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="border-t-2 border-b-2 border-foreground bg-foreground text-white">
          <div className="flex justify-center">
            <div className="hidden md:flex">
              {navItems.map((item, index) => (
                <div key={item.href} className="flex">
                  <Link
                    href={item.href}
                    className={cn(
                      "font-franklin text-sm font-bold tracking-wider px-6 py-3 transition-colors text-white",
                      "hover:bg-muted hover:text-foreground",
                      pathname === item.href && "bg-background text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                  {index < navItems.length - 1 && (
                    <div className="w-px bg-background"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile menu */}
            <div className="md:hidden w-full">
              <div className="grid grid-cols-2 gap-px">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "font-franklin text-xs font-bold tracking-wider px-4 py-3 text-center transition-colors text-white",
                      "hover:bg-muted hover:text-foreground",
                      pathname === item.href && "bg-background text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Date and Weather (decorative) */}
        <div className="flex justify-between items-center text-xs font-franklin text-muted-foreground mt-2">
          <div>TODAY: {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }).toUpperCase()}</div>
          <div>LATEST EDITION</div>
        </div>
      </div>
    </header>
  )
}
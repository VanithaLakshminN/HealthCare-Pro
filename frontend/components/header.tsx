"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky flex  items-center h-20 top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-lg p-2">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthCare</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="/appointments" className="text-foreground hover:text-primary transition-colors">
              Appointments
            </a>
            <a href="/pharmacy" className="text-foreground hover:text-primary transition-colors">
              Pharmacy
            </a>
            <a href="/ai" className="text-foreground hover:text-primary transition-colors">
              AI Chat
            </a>
            <a href="/records" className="text-foreground hover:text-primary transition-colors">
              Health Records
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <Button variant="outline" size="sm">
              Sign In
            </Button> */}
            <Button size="sm">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <a href="#home" className="block px-3 py-2 text-foreground hover:text-primary">
                Home
              </a>
              <a href="#appointments" className="block px-3 py-2 text-foreground hover:text-primary">
                Appointments
              </a>
              <a href="#pharmacy" className="block px-3 py-2 text-foreground hover:text-primary">
                Pharmacy
              </a>
              <a href="#ai-chat" className="block px-3 py-2 text-foreground hover:text-primary">
                AI Chat
              </a>
              <a href="#health-records" className="block px-3 py-2 text-foreground hover:text-primary">
                Health Records
              </a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Sign In
                </Button>
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

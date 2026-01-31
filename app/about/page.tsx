'use client'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield, Zap, Target, ArrowRight, Filter, Route } from 'lucide-react';

export default function About() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-200 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" strokeWidth={2} />
              <span className="text-lg font-medium text-gray-900">Clariseque</span>
            </Link>
            
            <div className="flex items-center space-x-8">
              <Link href="/about" className="text-sm text-blue-600 font-medium">About</Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Go to Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-normal mb-6 leading-tight text-gray-900 tracking-tight">
              About Clariseque
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-3xl">
              Bringing clarity to the cyber landscape through AI-driven vulnerability intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-normal mb-6 text-gray-900">The Problem We Solve</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              In an era of endless CVEs and constant security noise, the biggest threat to an organization isn't just the vulnerability itself—it's the complexity of the data. Security teams are drowning in alerts, advisories, and technical jargon that slows down response times and creates uncertainty.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Clariseque was born from a simple realization: security teams don't need more alerts; they need more answers. We leverage advanced AI to act as a bridge between raw vulnerability data and real-world remediation.
            </p>
            
            <div className="border-l-4 border-blue-600 pl-6 py-2 mb-16">
              <h3 className="text-xl font-medium text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To eliminate "vulnerability fatigue" by providing the context and clarity needed to protect modern digital infrastructure. With Clariseque, what was once a wall of complex data becomes a clear roadmap for defense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-normal mb-16 text-gray-900 text-center">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Intelligent Prioritization</h3>
              <p className="text-gray-600 leading-relaxed">
                We don't just list threats; our AI analyzes the context of your environment to tell you what matters most, right now. Stop chasing every "Critical" rating and focus on what's actually exploitable in your stack.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Actionable Remediation</h3>
              <p className="text-gray-600 leading-relaxed">
                Move beyond "what" is broken to "how" to fix it. For every vulnerability identified, Clariseque generates clear, step-by-step guidance that IT and DevOps teams can execute immediately.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Enterprise-Ready Clarity</h3>
              <p className="text-gray-600 leading-relaxed">
                Built to be accessible for stakeholders and precise for engineers. Bridge the gap between the server room and the boardroom with insights everyone can understand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-normal mb-16 text-gray-900 text-center">How Clariseque Works</h2>
          
          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Filter className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">1. Define Your Tech Stack</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select the technologies your project uses—frameworks, databases, servers, and libraries. This context allows Clariseque to provide vulnerability analysis that's specific to your environment, not generic advice.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">2. Ask About CVEs & Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enter a CVE number, paste vulnerability code, or ask any security question in natural language. Our conversational AI understands context and provides relevant answers—ask the way you'd ask a security expert colleague.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Route className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">3. Get Stack-Specific Solutions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive remediation guidance tailored to your exact tech stack. Clariseque identifies which files, configurations, and components in your environment are affected and provides step-by-step fixes you can implement immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-normal mb-6 text-white">Ready to bring clarity to your security workflow?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Stop triaging and start securing. Get actionable vulnerability intelligence today.
          </p>
          <Link href="/dashboard" className="bg-white text-blue-600 px-8 py-3 rounded-md text-base font-medium hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" strokeWidth={2} />
              <span className="text-sm font-medium text-gray-900">Clariseque</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Clariseque. Made in India.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

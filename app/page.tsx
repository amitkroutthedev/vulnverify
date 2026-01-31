'use client'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton,useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield, Zap, Target, ArrowRight, Filter, Route } from 'lucide-react';

export default function Home() {
  const currentUser = useAuth()
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  async function saveUserHandler(){
    setIsSavingUser(true);
    try {
      await fetch("/api/users",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },body:JSON.stringify({
          
        })
      });
    } catch(err) {
      console.log(err)
    } finally {
      setIsSavingUser(false);
    }
  }
  useEffect(()=>{
    if(currentUser.isSignedIn){
      saveUserHandler()
    }
  },[currentUser.isSignedIn])

 return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Loading Overlay */}
      {isSavingUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">Setting up your account...</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-200 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" strokeWidth={2} />
              <span className="text-lg font-medium text-gray-900">Clariseque</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/about" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">About</Link>
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
              <Link href={"/dashboard"} className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Go to Dashboard
              </Link>
              <UserButton/>
              </SignedIn>
            </div>

            {/* <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {/*mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-6 py-4 space-y-3">
              <a href="#features" className="block text-sm text-gray-700 hover:text-gray-900">Features</a>
              <a href="#api" className="block text-sm text-gray-700 hover:text-gray-900">API</a>
              <a href="#docs" className="block text-sm text-gray-700 hover:text-gray-900">Documentation</a>
              <button className="w-full bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium">
                Launch Console
              </button>
            </div>
          </div>
        )*/}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-normal mb-6 leading-tight text-gray-900 tracking-tight">
              Clariseque
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light max-w-3xl">
              From Data to Decisiveness: AI-Driven Vulnerability Intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={"/dashboard"} className="bg-blue-600 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="font-sans py-24 px-6 lg:px-8" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-normal mb-16 text-gray-900 text-center">Why Clariseque</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Intelligent Prioritization</h3>
              <p className="text-gray-600 leading-relaxed font-mono">
                We don't just list threats; our AI analyzes the context of your environment to tell you what matters most, right now.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Actionable Remediation</h3>
              <p className="text-gray-600 leading-relaxed font-mono">
                Move beyond "what" is broken to "how" to fix it with clear, step-by-step guidance for every identified CVE.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Enterprise-Ready Clarity</h3>
              <p className="text-gray-600 leading-relaxed font-mono">
                Built to be accessible for stakeholders and precise for engineers, ensuring everyone is on the same page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="font-sans py-24 px-6 lg:px-8 bg-gray-50" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-normal mb-6 text-gray-900 text-center">How It Works</h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Get tailored vulnerability insights in three simple steps.
          </p>
          
          <div className="space-y-16">
            {/* Step 1 - Select Tech Stack */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Filter className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Step 1</span>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">Define Your Tech Stack</h3>
                <p className="text-gray-600 leading-relaxed font-mono ">
                  Start by selecting the technologies your project uses—frameworks, databases, servers, and libraries. This context allows Clariseque to provide vulnerability analysis that's specific to your environment, not generic advice.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="text-sm font-medium text-gray-900 mb-4">Select Your Stack</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md">Next.js</span>
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md">PostgreSQL</span>
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md">Node.js</span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md border border-gray-200">React</span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md border border-gray-200">Docker</span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md border border-gray-200">Redis</span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md border border-gray-200">AWS</span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md border border-gray-200">MongoDB</span>
                </div>
                <p className="text-xs text-gray-500 mt-4">+ Add custom technologies</p>
              </div>
            </div>

            {/* Step 2 - Ask Questions */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-xl border border-gray-200 p-8">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">Chat</div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">"Is CVE-2024-21626 affecting my stack? How do I fix it?"</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">"What are the XSS vulnerabilities in Next.js 14?"</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">"How do I secure my PostgreSQL connection?"</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-400">
                      Ask about any CVE or security concern...
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Step 2</span>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">Ask About CVEs & Security</h3>
                <p className="text-gray-600 leading-relaxed font-mono">
                  Enter a CVE number, paste vulnerability code, or ask any security question. Our conversational AI understands natural language—ask the way you'd ask a security expert colleague.
                </p>
              </div>
            </div>

            {/* Step 3 - Get Tailored Solutions */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Route className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Step 3</span>
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">Get Stack-Specific Solutions</h3>
                <p className="text-gray-600 leading-relaxed font-mono">
                  Receive remediation guidance tailored to your exact tech stack. Clariseque identifies which files, configurations, and components in your environment are affected and provides step-by-step fixes you can implement immediately.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">AI Response</span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-3">Based on your <span className="font-medium text-gray-900">Next.js + PostgreSQL</span> stack:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-green-600">✓</span>
                        </div>
                        <span>Update <code className="bg-gray-100 px-1 rounded text-xs font-mono">pg</code> package to v8.11.0+</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-green-600">✓</span>
                        </div>
                        <span>Add parameterized queries in <code className="bg-gray-100 px-1 rounded text-xs font-mono">/lib/db.ts</code></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-green-600">✓</span>
                        </div>
                        <span>Enable SSL in connection config</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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


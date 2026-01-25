'use client'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton,useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield, Zap, Target, Code, Menu, X, ArrowRight } from 'lucide-react';

export default function Home() {
  const currentUser = useAuth()
   const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  function saveUserHandler(){
       fetch("/api/users",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },body:JSON.stringify({
          
        })
      }).then(res=>{
        //console.log(res)
      }).catch(err=>{
        console.log(err)
      })
  }
  useEffect(()=>{
    if(currentUser.isSignedIn){
      saveUserHandler()
    }
  },[currentUser.isSignedIn])
 /* return (
    <div>
      <nav className="border-b border-[#002829]/20 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-[#1b3a4b]">
                CVE Chat
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-lg px-4 py-2 text-sm font-medium text-[#1b3a4b] transition-colors hover:bg-[#006466]/10">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-[#006466] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#005052]">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-[#006466] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#005052]"
                >
                  Go to App
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

    </div>
     );*/
 return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-200 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" strokeWidth={2} />
              <span className="text-lg font-medium text-gray-900">VulnVerify</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {/* <a href="#features" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">Features</a> */}
              {/* <a href="#api" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">API</a> */}
              {/* <a href="#docs" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">Documentation</a> */}
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
      <section className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-normal mb-6 leading-tight text-gray-900 tracking-tight">
              The AI-powered platform that transforms vulnerability management
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light max-w-3xl">
              VulnVerify translates complex CVE data into clear, actionable insights. Get instant answers about security threats and remediation steps tailored to your infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={"/dashboard"} className="bg-blue-600 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-normal mb-6 text-gray-900">The challenge</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Information overload</h3>
                  <p className="text-gray-600 leading-relaxed">Security advisories are often technical, vague, or outdated. Teams waste valuable time deciphering what actually matters.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Alert fatigue</h3>
                  <p className="text-gray-600 leading-relaxed">Not every CVE impacts your stack. Hours spent investigating false positives delay real security work.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Slow response times</h3>
                  <p className="text-gray-600 leading-relaxed">Finding the right patch across vendor documentation and community forums creates unnecessary delays.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-normal mb-6 text-gray-900">Our approach</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Plain language explanations</h3>
                  <p className="text-gray-600 leading-relaxed">AI translates technical security language into clear, actionable information your entire team can understand.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Context-aware analysis</h3>
                  <p className="text-gray-600 leading-relaxed">Provide your tech stack details and receive precise impact assessments. Know immediately if you're affected.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Direct remediation guidance</h3>
                  <p className="text-gray-600 leading-relaxed">Get specific commands and configuration changes. No searching required—just implement and move forward.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-normal mb-16 text-gray-900">Built for security teams</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" strokeWidth={1.5} />}
              title="Conversational interface"
              description="Ask questions in natural language and receive direct answers without navigating multiple documentation sources."
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6" strokeWidth={1.5} />}
              title="Actionable remediation"
              description="Receive specific commands, patches, and configuration changes ready to implement immediately."
            />
            <FeatureCard 
              icon={<Code className="w-6 h-6" strokeWidth={1.5} />}
              title="Stack awareness"
              description="Filter vulnerabilities based on your specific operating systems, libraries, and dependency versions."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" strokeWidth={1.5} />}
              title="AI-powered analysis"
              description="Powered by advanced AI models to analyze and explain vulnerabilities in plain language."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-normal mb-16 text-gray-900">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <StepCard 
              number="1" 
              title="Input" 
              description="Provide a CVE identifier, security log excerpt, or dependency information through our chat interface."
            />
            <StepCard 
              number="2" 
              title="Analysis" 
              description="Our AI analyzes threats using your specific tech stack context to provide tailored security insights."
            />
            <StepCard 
              number="3" 
              title="Resolution" 
              description="Receive clear summaries, risk assessments, and exact remediation steps in plain language."
            />
          </div>
        </div>
      </section>

      {/* API Section */}
      {/* <section className="py-24 px-6 lg:px-8" id="api">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-normal mb-6 text-gray-900">Developer-first design</h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light mb-8">
              Integrate VulnVerify into your existing workflows. Automatically surface and explain vulnerabilities in pull requests, CI/CD pipelines, and security dashboards.
            </p>
            <button className="text-blue-600 font-medium hover:underline inline-flex items-center gap-2">
              Explore the API <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-medium mb-4 text-gray-900 text-sm">Product</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Features</a></li>
                {/* <li><a href="#" className="hover:text-gray-900 transition-colors">API</a></li> */}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-gray-900 text-sm">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-gray-900 text-sm">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4 text-gray-900 text-sm">Stay informed</h3>
              <p className="text-sm text-gray-600 mb-3">Weekly security intelligence delivered to your inbox.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-sm text-gray-500">
            © 2026 VulnVerify. Made in India.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div>
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-base font-medium mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div>
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-medium mb-4 text-white">
        {number}
      </div>
      <h3 className="text-base font-medium mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

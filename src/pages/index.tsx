import React from "react";
import Link from "next/link";
import { Tv, Zap, Shield, Globe, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="container-tesla flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl glass flex items-center justify-center glow-cyan">
              <Tv className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">CoPilot</span> TV
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="h-11 px-5 text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="h-11 px-5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-24">
        <div className="container-tesla">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-primary mb-6 animate-fade-in">
              <Zap className="w-3 h-3" />
              <span>Optimized for Tesla Dashboard</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up">
              Premium IPTV{" "}
              <span className="gradient-text">Streaming</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Live TV, movies, and series — all in one place. Built for the big screen with touch-optimized controls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-strong">
                  <Play className="w-5 h-5 mr-2" />
                  Start Watching
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-white/20 hover:bg-white/5">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 border-t border-white/5">
        <div className="container-tesla">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Dual Input"
              description="Connect via M3U playlist or Xtream Codes API. Flexibility for every provider."
              delay={0}
            />
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="Three Categories"
              description="Separate sections for Live TV, Movies, and Series with smart lazy loading."
              delay={0.1}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="No CORS Issues"
              description="Built-in server proxy handles mixed content and cross-origin restrictions."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="container-tesla flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">CoPilot TV</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 CoPilot TV. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <div
      className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
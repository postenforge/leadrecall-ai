import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import {
  Phone,
  MessageSquare,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Menu,
  X,
} from "lucide-react";

// ─── Navigation ────────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Demo", href: "#demo" },
    { label: "Pricing", href: "#pricing" },
    { label: "Results", href: "#results" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">LeadRecall AI</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact">
            <Button size="sm" className="font-semibold">
              Get Started
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border pb-4">
          <div className="container flex flex-col gap-3 pt-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full font-semibold mt-2">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Lead Recovery
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Stop Losing Leads to{" "}
            <span className="text-primary">Missed Calls</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            You&apos;re on a job site. Your phone rings. You can&apos;t answer. That
            customer calls the next contractor on Google.{" "}
            <span className="text-foreground font-medium">
              LeadRecall AI texts them back instantly
            </span>{" "}
            — so you never lose another lead.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#demo">
              <Button
                size="lg"
                className="text-base font-semibold px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 active:scale-[0.97]"
              >
                See It In Action
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="#pricing">
              <Button
                variant="outline"
                size="lg"
                className="text-base font-medium px-8 py-6 rounded-xl bg-transparent"
              >
                View Pricing
              </Button>
            </a>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No contracts. No setup fees. Start with a 7-Day Free Pilot.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      icon: Phone,
      title: "Missed Call Detected",
      description:
        "A customer calls while you're on a job. Our system instantly detects the missed call.",
      step: "01",
    },
    {
      icon: MessageSquare,
      title: "AI Texts Back",
      description:
        "Within seconds, the caller receives a personalized text from your business — no templates, pure AI.",
      step: "02",
    },
    {
      icon: CalendarCheck,
      title: "Lead Qualified & Booked",
      description:
        "The AI qualifies the lead, answers questions, and books them directly into your calendar.",
      step: "03",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps between a missed call and a booked appointment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}
              <Card className="p-8 bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Interactive Demo ──────────────────────────────────────────────────────────

function DemoSection() {
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDemo = () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setShowResult(true);
      setIsAnimating(false);
    }, 1500);
  };

  const resetDemo = () => {
    setShowResult(false);
    setBusinessName("");
    setPhoneNumber("");
  };

  return (
    <section id="demo" className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      <div className="container relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            See It In Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Enter a business name below and watch how LeadRecall AI responds to a
            missed call in real time.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="p-8 bg-card/80 border-border/50 backdrop-blur-sm">
            {!showResult ? (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Business Name
                  </label>
                  <Input
                    placeholder="e.g. Smith Plumbing & Repair"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-12 bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Customer Phone (simulated)
                  </label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 bg-background/50"
                  />
                </div>
                <Button
                  onClick={handleDemo}
                  disabled={isAnimating}
                  className="w-full h-12 text-base font-semibold rounded-xl active:scale-[0.97] transition-transform"
                >
                  {isAnimating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Simulating missed call...
                    </span>
                  ) : (
                    "Simulate Missed Call"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Phone mockup */}
                <div className="bg-background rounded-2xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {businessName || "Your Business"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To: {phoneNumber || "(555) 123-4567"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-xl rounded-tl-sm p-4">
                    <p className="text-sm leading-relaxed">
                      Hi! This is{" "}
                      <span className="font-semibold">
                        {businessName || "Your Business"}
                      </span>
                      . Sorry we missed your call — we&apos;re currently on a job! 🔧
                    </p>
                    <p className="text-sm leading-relaxed mt-2">
                      How can we help you today? Are you looking for:
                    </p>
                    <p className="text-sm leading-relaxed mt-1">
                      1️⃣ A quote for a new project
                      <br />
                      2️⃣ Emergency repair
                      <br />
                      3️⃣ Schedule a callback
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Sent instantly via LeadRecall AI
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">
                    Response sent in under 5 seconds
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={resetDemo}
                  className="w-full h-11 rounded-xl bg-transparent"
                >
                  Try Again
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ───────────────────────────────────────────────────────────

function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One plan. Everything included. No hidden fees.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="relative p-8 md:p-10 bg-card/80 border-primary/30 shadow-xl shadow-primary/5 overflow-hidden">
            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                7-Day Free Pilot
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">LeadRecall Pro</h3>
              <p className="text-muted-foreground text-sm">
                Everything you need to never miss a lead again.
              </p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-extrabold">$200</span>
              <span className="text-muted-foreground text-lg">/month</span>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                "Unlimited missed call responses",
                "AI-powered lead qualification",
                "Automatic calendar booking",
                "Custom business personality",
                "Real-time lead notifications",
                "Monthly performance reports",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="#contact">
              <Button className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.97] transition-transform">
                Start Your 7-Day Free Pilot
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>

            <p className="text-center text-xs text-muted-foreground mt-4">
              No credit card required. Cancel anytime.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof / Results ────────────────────────────────────────────────────

function ResultsSection() {
  const stats = [
    { value: "94%", label: "of leads responded within 5 minutes" },
    { value: "3.2x", label: "more leads captured vs. voicemail" },
    { value: "$4,800", label: "average revenue recovered per month" },
  ];

  return (
    <section id="results" className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
      <div className="container relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Results That Speak for Themselves
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Local businesses using LeadRecall AI are recovering thousands in lost
            revenue every month.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="p-8 text-center bg-card/50 border-border/50"
            >
              <p className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Testimonial placeholder */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 md:p-10 bg-card/50 border-border/50 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg italic text-foreground/90 mb-4 leading-relaxed">
              &ldquo;I was losing 3-4 calls a day while on jobs. LeadRecall AI
              texts them back before they even hang up. I&apos;ve booked 12 extra
              jobs this month alone.&rdquo;
            </p>
            <div>
              <p className="font-semibold text-sm">— Future Client Testimonial</p>
              <p className="text-xs text-muted-foreground mt-1">
                Placeholder for real reviews
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Contact / Lead Capture Form ───────────────────────────────────────────────

function ContactSection() {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.businessName ||
      !formData.ownerName ||
      !formData.phone ||
      !formData.email
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("We'll be in touch within 24 hours!");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to Stop Losing Leads?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Fill out the form below and we&apos;ll set up your 7-Day Free Pilot
            within 24 hours.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="p-8 bg-card/80 border-border/50">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">You&apos;re In!</h3>
                <p className="text-muted-foreground">
                  We&apos;ll reach out within 24 hours to set up your free pilot.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Business Name
                  </label>
                  <Input
                    placeholder="e.g. Smith Plumbing & Repair"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="h-12 bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Name
                  </label>
                  <Input
                    placeholder="John Smith"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    className="h-12 bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-12 bg-background/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@smithplumbing.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12 bg-background/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.97] transition-transform"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Start My 7-Day Free Pilot"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No credit card required. We&apos;ll reach out within 24 hours.
                </p>
              </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">LeadRecall AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LeadRecall AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <DemoSection />
      <PricingSection />
      <ResultsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

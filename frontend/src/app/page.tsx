"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { FileText, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Left panel slides in from left
      tl.fromTo(
        '[data-login="left-panel"]',
        { x: '-100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.8, ease: 'power2.out' }
      )
      // Logo fades in with subtle scale
      .fromTo(
        '[data-login="logo"]',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      // Tagline
      .fromTo(
        '[data-login="tagline"]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
      // Trust text
      .fromTo(
        '[data-login="trust"]',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.2'
      )
      // Stats
      .fromTo(
        '[data-login="stat"]',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.2'
      )
      // Right panel
      .fromTo(
        '[data-login="title"]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo(
        '[data-login="subtitle"]',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      )
      // Form fields stagger in
      .fromTo(
        '[data-login="field"]',
        { opacity: 0, y: 20, x: -10 },
        { opacity: 1, y: 0, x: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
        '-=0.2'
      )
      // Button
      .fromTo(
        '[data-login="button"]',
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
        '-=0.1'
      );

      // Continuous float on stats
      gsap.to('[data-login="stat"]', {
        y: -3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });
    }, containerRef.current);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <div
        data-login="left-panel"
        style={{
          width: '45%',
          background: 'var(--primary-950)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dot grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Logo */}
        <div data-login="logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '48px',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <FileText style={{ width: '24px', height: '24px', color: 'var(--accent-400)' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}>
            Smart Invoice
          </span>
        </div>

        {/* Tagline */}
        <p data-login="tagline" style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '24px',
          color: 'var(--stone-400)',
          letterSpacing: 'var(--tracking-wide)',
          textAlign: 'center',
          lineHeight: 1.4,
          marginBottom: '16px',
          maxWidth: '360px',
        }}>
          &ldquo;Precision in every invoice&rdquo;
        </p>

        {/* Trust line */}
        <p data-login="trust" style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--stone-500)',
          marginBottom: '48px',
        }}>
          ── Trusted by businesses since 2024
        </p>

        {/* Stats */}
        <div data-login="stats" style={{
          display: 'flex',
          gap: '32px',
        }}>
          {[
            { value: '48', label: 'INVOICES' },
            { value: '1.2K', label: 'SALES' },
            { value: '₹2.4L', label: 'AMOUNT' },
          ].map((stat) => (
            <div
              key={stat.label}
              data-login="stat"
              style={{
                textAlign: 'center',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--accent-400)',
                lineHeight: 1,
                marginBottom: '6px',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                color: 'var(--stone-500)',
                textTransform: 'uppercase' as const,
                letterSpacing: 'var(--tracking-widest)',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: '55%',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Title */}
          <h1 data-login="title" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '32px',
            fontWeight: 600,
            color: 'var(--stone-900)',
            marginBottom: '8px',
          }}>
            Smart Invoice
          </h1>

          <div data-login="subtitle" style={{ marginBottom: '40px' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--stone-700)',
              marginBottom: '4px',
            }}>
              Welcome back
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--stone-400)',
            }}>
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div data-login="field" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--stone-500)',
                marginBottom: '6px',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="input-refined"
              />
            </div>

            {/* Password */}
            <div data-login="field" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--stone-500)',
                marginBottom: '6px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-refined"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--stone-400)',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div data-login="field" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '28px',
            }}>
              <input
                type="checkbox"
                id="remember"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  accentColor: 'var(--primary-950)',
                }}
              />
              <label
                htmlFor="remember"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--stone-500)',
                  cursor: 'pointer',
                }}
              >
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              data-login="button"
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseDown={(e) => {
                gsap.to(e.currentTarget, { scale: 0.97, duration: 0.1 });
              }}
              onMouseUp={(e) => {
                gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
              }}
            >
              Sign In
              <ArrowRight style={{ width: '18px', height: '18px', transition: 'transform 0.2s' }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

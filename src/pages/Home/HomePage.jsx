import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #4f46e5;
    --primary-light: #818cf8;
    --primary-dark: #3730a3;
    --accent: #f43f5e;
    --gold: #f59e0b;
    --bg: #ffffff;
    --bg-alt: #f8f7ff;
    --text: #1e1b4b;
    --muted: #64748b;
    --border: #e2e8f0;
    --radius: 20px;
  }

  /* ── KEYFRAMES ── */
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-36px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(36px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-12px); }
  }

  @keyframes pulseDot {
    0%   { box-shadow: 0 0 0 0 rgba(79,70,229,0.55); }
    70%  { box-shadow: 0 0 0 9px rgba(79,70,229,0); }
    100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
  }

  @keyframes blobFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(28px, -20px) scale(1.05); }
    66%       { transform: translate(-20px, 14px) scale(0.95); }
  }

  @keyframes shimmerBg {
    0%   { background-position: -400% 0; }
    100% { background-position: 400% 0; }
  }

  @keyframes hiwLineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  @keyframes tagGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(79,70,229,0.0); }
    50%       { box-shadow: 0 0 16px 2px rgba(79,70,229,0.2); }
  }

  @keyframes statPop {
    from { transform: scale(0.6) translateY(10px); opacity: 0; }
    to   { transform: scale(1) translateY(0); opacity: 1; }
  }

  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(24px) rotate(-1deg); }
    to   { opacity: 1; transform: translateY(0) rotate(0deg); }
  }

  @keyframes navSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Scroll animations */
  .hp-animate {
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .hp-animate.visible { opacity: 1; transform: translateY(0); }
  .hp-animate-left {
    opacity: 0; transform: translateX(-32px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .hp-animate-left.visible { opacity: 1; transform: translateX(0); }
  .hp-animate-right {
    opacity: 0; transform: translateX(32px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .hp-animate-right.visible { opacity: 1; transform: translateX(0); }
  .hp-animate-scale {
    opacity: 0; transform: scale(0.88);
    transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1);
  }
  .hp-animate-scale.visible { opacity: 1; transform: scale(1); }

  .hp-animate-d1 { transition-delay: 0.1s; }
  .hp-animate-d2 { transition-delay: 0.2s; }
  .hp-animate-d3 { transition-delay: 0.3s; }
  .hp-animate-d4 { transition-delay: 0.4s; }
  .hp-animate-d5 { transition-delay: 0.5s; }

  .hp-root {
    font-family: 'Inter', sans-serif;
    color: var(--text); background: var(--bg);
    scroll-behavior: smooth; overflow-x: hidden;
  }

  /* ── NAV ── */
  .hp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(79,70,229,0.07);
    height: 68px; display: flex; align-items: center;
    padding: 0 4rem; justify-content: space-between;
    transition: box-shadow 0.3s, background 0.3s;
    animation: navSlide 0.5s ease both;
  }
  .hp-nav.scrolled {
    background: rgba(255,255,255,0.97);
    box-shadow: 0 4px 32px rgba(79,70,229,0.09);
  }

  .hp-nav-logo {
    font-size: 1.6rem; font-weight: 900; letter-spacing: -0.04em;
    background: linear-gradient(135deg, #4f46e5, #f43f5e);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; cursor: pointer; border: none;
    background-color: transparent; font-family: inherit; padding: 0;
    transition: transform 0.2s;
  }
  .hp-nav-logo:hover { transform: scale(1.05); }

  .hp-nav-links { display: flex; align-items: center; gap: 0.15rem; }

  .hp-nav-link {
    padding: 0.45rem 0.9rem; font-size: 0.875rem; font-weight: 500;
    color: var(--muted); background: none; border: none;
    cursor: pointer; font-family: inherit; border-radius: 10px;
    transition: color 0.15s, background 0.15s, transform 0.15s;
    position: relative;
  }
  .hp-nav-link:hover { color: var(--primary); background: rgba(79,70,229,0.07); transform: translateY(-1px); }
  .hp-nav-link.active { color: var(--primary); background: rgba(79,70,229,0.1); font-weight: 700; }
  .hp-nav-link.active::after {
    content: '';
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 16px; height: 2px; border-radius: 999px;
    background: var(--primary);
  }

  .hp-login-btn {
    height: 2.6rem; padding: 0 1.6rem;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: #fff; border: none; border-radius: 12px;
    font-size: 0.875rem; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 14px rgba(79,70,229,0.38);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
  }
  .hp-login-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 22px rgba(79,70,229,0.48); }

  /* ── HERO ── */
  .hp-hero {
    min-height: 100vh;
    display: grid; grid-template-columns: 1fr 1fr;
    padding-top: 68px;
    background: linear-gradient(-45deg, #f0f0ff, #fdf2f8, #f0f9ff, #fff7ed);
    background-size: 400% 400%;
    animation: gradientShift 10s ease infinite;
    position: relative; overflow: hidden;
  }

  /* Animated blobs */
  .hp-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.35; pointer-events: none;
    will-change: transform;
  }
  .hp-blob-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #818cf8, transparent);
    top: -15%; left: 10%;
    animation: blobFloat 14s ease-in-out infinite;
  }
  .hp-blob-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, #f9a8d4, transparent);
    bottom: 0%; right: 5%;
    animation: blobFloat 18s ease-in-out infinite reverse;
  }
  .hp-blob-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, #fde68a, transparent);
    top: 50%; left: -5%;
    animation: blobFloat 12s -5s ease-in-out infinite;
  }

  .hp-hero-left {
    display: flex; flex-direction: column; justify-content: center;
    padding: 5rem; position: relative; z-index: 1;
    animation: fadeInLeft 0.9s 0.1s ease both;
  }

  .hp-hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.14em; color: var(--primary);
    background: rgba(79,70,229,0.09);
    padding: 0.4rem 1rem; border-radius: 999px;
    margin-bottom: 1.75rem; width: fit-content;
    border: 1px solid rgba(79,70,229,0.18);
    animation: tagGlow 3s ease-in-out infinite;
  }

  .hp-hero-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--primary); display: inline-block;
    animation: pulseDot 2s infinite;
  }

  .hp-hero-title {
    font-size: 3.75rem; font-weight: 900; letter-spacing: -0.04em;
    line-height: 1.06; color: var(--text); margin-bottom: 1.5rem;
  }
  .hp-hero-title strong {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hp-hero-desc {
    font-size: 1.05rem; font-weight: 400; color: var(--muted);
    line-height: 1.8; margin-bottom: 2.5rem; max-width: 480px;
  }

  .hp-hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }

  .hp-cta-primary {
    height: 3.25rem; padding: 0 2.25rem;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: #fff; border: none; border-radius: 14px;
    font-size: 0.95rem; font-weight: 700; font-family: inherit;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(79,70,229,0.42);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .hp-cta-primary:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 14px 32px rgba(79,70,229,0.52); }

  .hp-cta-secondary {
    height: 3.25rem; padding: 0 2rem;
    background: #fff; color: var(--primary);
    border: 2px solid var(--primary); border-radius: 14px;
    font-size: 0.95rem; font-weight: 700; font-family: inherit;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .hp-cta-secondary:hover { background: var(--primary); color: #fff; transform: translateY(-4px); }

  .hp-hero-stats {
    display: flex; gap: 2rem; margin-top: 3rem; padding-top: 2rem;
    border-top: 1px solid rgba(79,70,229,0.1); flex-wrap: wrap;
  }
  .hp-stat { display: flex; flex-direction: column; gap: 4px; }
  .hp-stat-num {
    font-size: 1.85rem; font-weight: 900; line-height: 1;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: statPop 0.7s ease both;
  }
  .hp-stat:nth-child(1) .hp-stat-num { animation-delay: 0.8s; }
  .hp-stat:nth-child(2) .hp-stat-num { animation-delay: 0.95s; }
  .hp-stat:nth-child(3) .hp-stat-num { animation-delay: 1.1s; }
  .hp-stat:nth-child(4) .hp-stat-num { animation-delay: 1.25s; }
  .hp-stat-label { font-size: 0.7rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; }

  /* ── HERO RIGHT ── */
  .hp-hero-right { position: relative; overflow: hidden; animation: fadeInRight 0.9s 0.2s ease both; }

  .hp-hero-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.7s ease;
  }
  .hp-hero-right:hover .hp-hero-img { transform: scale(1.04); }

  .hp-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(79,70,229,0.05) 0%, rgba(30,27,75,0.58) 100%);
  }

  .hp-hero-caption {
    position: absolute; bottom: 2.5rem; left: 2.5rem; right: 2.5rem;
  }
  .hp-hero-caption h3 {
    font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;
    margin-bottom: 0.4rem; text-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }
  .hp-hero-caption p { font-size: 0.88rem; color: rgba(255,255,255,0.82); }

  .hp-hero-float {
    position: absolute; z-index: 2;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(16px);
    border-radius: 18px; padding: 1rem 1.25rem;
    box-shadow: 0 16px 44px rgba(30,27,75,0.2);
    border: 1px solid rgba(255,255,255,0.8);
  }
  .hp-hero-float.f1 { top: 14%; right: 7%; animation: float 4s ease-in-out infinite; }
  .hp-hero-float.f2 { bottom: 30%; left: 7%; animation: float 4s 1.8s ease-in-out infinite; }

  .hp-float-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 3px; }
  .hp-float-value { font-size: 1.05rem; font-weight: 900; color: var(--primary); }
  .hp-float-sub   { font-size: 0.7rem; color: var(--muted); margin-top: 2px; }

  /* ── WAVE DIVIDER ── */
  .hp-wave { position: relative; line-height: 0; overflow: hidden; }
  .hp-wave svg { display: block; width: 100%; height: 72px; }
  .hp-wave-flip { transform: scaleX(-1); }

  /* ── SECTIONS ── */
  .hp-section { padding: 6rem 5rem; }
  .hp-section-alt { background: var(--bg-alt); }

  .hp-section-tag {
    display: inline-block;
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.14em; color: var(--primary);
    background: rgba(79,70,229,0.09); padding: 0.35rem 0.875rem;
    border-radius: 999px; margin-bottom: 1.25rem;
    border: 1px solid rgba(79,70,229,0.18);
  }

  .hp-section-title {
    font-size: 2.5rem; font-weight: 900; letter-spacing: -0.03em;
    color: var(--text); margin-bottom: 1rem; line-height: 1.1;
  }
  .hp-section-title strong {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hp-section-lead {
    font-size: 1.05rem; font-weight: 400; color: var(--muted);
    line-height: 1.8; max-width: 640px; margin-bottom: 3rem;
  }

  /* ── ABOUT ── */
  .hp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  .hp-about-features { display: flex; flex-direction: column; gap: 1.1rem; }

  .hp-feature-item {
    display: flex; gap: 1rem; align-items: flex-start;
    padding: 1.25rem; border-radius: 16px;
    background: #fff; border: 1px solid var(--border);
    box-shadow: 0 4px 16px rgba(79,70,229,0.06);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .hp-feature-item:hover { transform: translateX(8px) translateY(-2px); box-shadow: 0 12px 32px rgba(79,70,229,0.14); }

  .hp-feature-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(79,70,229,0.14), rgba(244,63,94,0.1));
    display: flex; align-items: center; justify-content: center;
  }

  .hp-feature-text h4 { font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .hp-feature-text p  { font-size: 0.85rem; color: var(--muted); line-height: 1.6; }

  /* About image */
  .hp-about-img-wrap {
    position: relative; border-radius: 28px; overflow: hidden;
    height: 480px;
    box-shadow: 0 32px 64px rgba(79,70,229,0.2);
  }
  .hp-about-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.7s ease;
  }
  .hp-about-img-wrap:hover .hp-about-img { transform: scale(1.05); }
  .hp-about-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 40%, rgba(30,27,75,0.55) 100%);
  }

  .hp-about-chip {
    position: absolute;
    background: rgba(255,255,255,0.97); backdrop-filter: blur(14px);
    border-radius: 18px; padding: 1rem 1.25rem;
    box-shadow: 0 12px 36px rgba(30,27,75,0.18);
    border: 1px solid rgba(255,255,255,0.8);
  }
  .hp-about-chip.chip-1 { top: 1.5rem; right: 1.5rem; animation: float 4.5s ease-in-out infinite; }
  .hp-about-chip.chip-2 { bottom: 1.5rem; left: 1.5rem; animation: float 4.5s 2s ease-in-out infinite; }

  /* ── HOW IT WORKS ── */
  .hp-hiw-section {
    padding: 6rem 5rem;
    background: #fff;
    position: relative; overflow: hidden;
  }
  .hp-hiw-section::before {
    content: '';
    position: absolute; top: -30%; right: -10%;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .hp-hiw-section::after {
    content: '';
    position: absolute; bottom: -20%; left: -5%;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .hp-hiw-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2rem; position: relative;
  }
  .hp-hiw-grid::before {
    content: '';
    position: absolute; top: 4rem;
    left: calc(16.67% + 1rem);
    right: calc(16.67% + 1rem);
    height: 2px;
    background: linear-gradient(90deg, #4f46e5, #f43f5e);
    transform-origin: left; border-radius: 999px;
  }

  .hp-hiw-card {
    background: #fff; border: 1px solid var(--border);
    border-radius: 24px; padding: 2.5rem 2rem;
    text-align: center; position: relative; z-index: 1;
    box-shadow: 0 4px 24px rgba(79,70,229,0.07);
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s;
  }
  .hp-hiw-card:hover { transform: translateY(-12px) rotate(1deg); box-shadow: 0 24px 52px rgba(79,70,229,0.18); }
  .hp-hiw-card:nth-child(2):hover { transform: translateY(-12px) rotate(-1deg); }

  .hp-hiw-num {
    width: 5rem; height: 5rem;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff; font-size: 1.75rem; font-weight: 900;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 8px 28px rgba(79,70,229,0.4);
    letter-spacing: -0.03em;
  }
  .hp-hiw-card:nth-child(2) .hp-hiw-num {
    background: linear-gradient(135deg, #7c3aed, #f43f5e);
  }
  .hp-hiw-card:nth-child(3) .hp-hiw-num {
    background: linear-gradient(135deg, #f43f5e, #f59e0b);
  }

  .hp-hiw-icon { font-size: 2rem; margin-bottom: 1rem; }
  .hp-hiw-title { font-size: 1.1rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 0.75rem; }
  .hp-hiw-desc  { font-size: 0.875rem; color: var(--muted); line-height: 1.7; margin: 0; }

  /* ── VENUE CARDS ── */
  .hp-halls-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem; }

  .hp-hall-card {
    background: #fff; border: 1px solid var(--border);
    border-radius: 22px; overflow: hidden;
    text-align: left; cursor: pointer;
    font: inherit; width: 100%;
    box-shadow: 0 4px 16px rgba(79,70,229,0.06);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s;
  }
  .hp-hall-card:hover { transform: translateY(-12px) scale(1.01); box-shadow: 0 28px 56px rgba(79,70,229,0.18); }
  .hp-hall-card:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }

  .hp-hall-img-wrap {
    width: 100%; height: 210px; overflow: hidden; position: relative;
    background: linear-gradient(135deg, #e0e7ff, #fce7f3);
  }
  .hp-hall-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.55s ease; }
  .hp-hall-card:hover .hp-hall-img { transform: scale(1.12); }

  .hp-hall-img-badge {
    position: absolute; top: 0.8rem; right: 0.8rem;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(8px);
    border-radius: 999px; padding: 0.25rem 0.75rem;
    font-size: 0.7rem; font-weight: 700; color: var(--primary);
    border: 1px solid rgba(79,70,229,0.14);
  }

  .hp-hall-body { padding: 1.5rem; }
  .hp-hall-name { font-size: 1.05rem; font-weight: 800; color: var(--text); margin-bottom: 0.35rem; letter-spacing: -0.01em; }
  .hp-hall-cap  { font-size: 0.8rem; color: var(--muted); margin-bottom: 0.65rem; font-weight: 500; }
  .hp-hall-features { font-size: 0.85rem; color: var(--muted); line-height: 1.65; }

  .hp-hall-tag {
    display: inline-flex; align-items: center; margin-top: 1rem;
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; padding: 0.3rem 0.75rem;
    border-radius: 999px; background: rgba(79,70,229,0.08);
    color: var(--primary); border: 1px solid rgba(79,70,229,0.14);
  }
  .hp-hall-hint { display: block; margin-top: 0.75rem; font-size: 0.75rem; color: var(--primary); font-weight: 600; }

  /* ── CTA BANNER ── */
  .hp-cta-banner {
    background: linear-gradient(140deg, #4f46e5 0%, #7c3aed 45%, #f43f5e 100%);
    padding: 6rem 5rem; text-align: center;
    position: relative; overflow: hidden;
  }
  .hp-cta-banner::before {
    content: '';
    position: absolute; top: -50%; left: -20%;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%);
    pointer-events: none;
  }
  .hp-cta-banner::after {
    content: '';
    position: absolute; bottom: -40%; right: -10%;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%);
    pointer-events: none;
  }

  .hp-cta-banner-inner { position: relative; z-index: 1; }

  .hp-cta-banner h2 {
    font-size: 2.75rem; font-weight: 900; color: #fff;
    letter-spacing: -0.04em; margin: 0 0 1rem;
    line-height: 1.1;
  }
  .hp-cta-banner p {
    font-size: 1.1rem; color: rgba(255,255,255,0.84);
    max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.75;
  }
  .hp-cta-banner-btns {
    display: flex; align-items: center; justify-content: center;
    gap: 1rem; flex-wrap: wrap;
  }

  .hp-cta-white {
    height: 3.25rem; padding: 0 2.25rem;
    background: #fff; color: var(--primary);
    border: none; border-radius: 14px;
    font-size: 0.95rem; font-weight: 800;
    font-family: inherit; cursor: pointer;
    box-shadow: 0 6px 22px rgba(0,0,0,0.18);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .hp-cta-white:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 14px 36px rgba(0,0,0,0.22); }

  .hp-cta-ghost {
    height: 3.25rem; padding: 0 2rem;
    background: rgba(255,255,255,0.15); color: #fff;
    border: 2px solid rgba(255,255,255,0.5); border-radius: 14px;
    font-size: 0.95rem; font-weight: 700;
    font-family: inherit; cursor: pointer;
    backdrop-filter: blur(8px);
    transition: background 0.2s, border-color 0.2s, transform 0.3s;
  }
  .hp-cta-ghost:hover { background: rgba(255,255,255,0.25); border-color: #fff; transform: translateY(-3px); }

  /* ── MODAL ── */
  .hp-venue-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(30,27,75,0.55); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem; animation: fadeInUp 0.22s ease;
  }

  .hp-venue-panel {
    width: min(720px, 100%);
    background: #fff; border-radius: 24px;
    box-shadow: 0 32px 80px rgba(30,27,75,0.25);
    border: 1px solid rgba(79,70,229,0.1);
    overflow: hidden; max-height: 90vh; overflow-y: auto;
    animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .hp-venue-panel-head {
    display: flex; justify-content: space-between; gap: 1rem;
    align-items: flex-start; padding: 1.75rem 1.75rem 1.25rem;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, #f0f0ff 0%, #fdf2f8 100%);
    position: sticky; top: 0; z-index: 1;
  }

  .hp-venue-panel-title { font-size: 1.5rem; font-weight: 900; color: var(--text); letter-spacing: -0.03em; margin-bottom: 0.3rem; }
  .hp-venue-panel-subtitle { font-size: 0.875rem; color: var(--muted); font-weight: 500; }

  .hp-venue-close {
    border: 2px solid var(--border); background: #fff; color: var(--muted);
    width: 2.5rem; height: 2.5rem; border-radius: 10px;
    cursor: pointer; font-size: 1rem; font-family: inherit;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: background 0.18s, color 0.18s, transform 0.18s;
  }
  .hp-venue-close:hover { background: var(--accent); color: #fff; border-color: var(--accent); transform: rotate(90deg); }

  .hp-venue-body { padding: 1.75rem; }

  .hp-venue-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
  .hp-venue-chip {
    display: inline-flex; align-items: center; padding: 0.35rem 0.875rem;
    border-radius: 999px; background: rgba(79,70,229,0.08);
    color: var(--primary); font-size: 0.8rem; font-weight: 600;
    border: 1px solid rgba(79,70,229,0.14);
  }

  .hp-venue-description { font-size: 0.95rem; line-height: 1.8; color: var(--muted); margin-bottom: 1.5rem; }

  .hp-venue-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }

  .hp-venue-detail { padding: 1rem; background: var(--bg-alt); border-radius: 12px; border: 1px solid var(--border); }
  .hp-venue-detail-label { display: block; margin-bottom: 0.3rem; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--muted); }
  .hp-venue-detail-value { font-size: 0.95rem; color: var(--text); font-weight: 700; line-height: 1.5; }

  /* ── CONTACT ── */
  .hp-contact-grid { max-width: 680px; }

  .hp-contact-item {
    display: flex; align-items: flex-start; gap: 1rem;
    margin-bottom: 1.5rem; padding: 1.25rem; border-radius: 16px;
    background: #fff; border: 1px solid var(--border);
    box-shadow: 0 4px 16px rgba(79,70,229,0.05);
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .hp-contact-item:hover { transform: translateX(6px); box-shadow: 0 8px 28px rgba(79,70,229,0.12); }

  .hp-contact-icon {
    width: 44px; height: 44px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(79,70,229,0.1), rgba(244,63,94,0.07));
    border: 1px solid rgba(79,70,229,0.12); border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .hp-contact-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--primary); margin-bottom: 3px; }
  .hp-contact-value { font-size: 0.95rem; font-weight: 600; color: var(--text); }

  /* ── FOOTER ── */
  .hp-footer {
    background: linear-gradient(140deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%);
    padding: 3.5rem 5rem;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
    position: relative; overflow: hidden;
  }
  .hp-footer::before {
    content: '';
    position: absolute; top: -60%; right: -10%;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .hp-footer-brand {
    font-size: 1.75rem; font-weight: 900; color: #fff; letter-spacing: -0.03em;
    position: relative; z-index: 1;
  }

  .hp-footer-links { display: flex; gap: 1.5rem; position: relative; z-index: 1; }

  .hp-footer-link {
    font-size: 0.875rem; font-weight: 400; color: rgba(255,255,255,0.55);
    background: none; border: none; cursor: pointer;
    font-family: inherit; transition: color 0.15s, transform 0.15s; padding: 0;
  }
  .hp-footer-link:hover { color: #fff; transform: translateY(-2px); }

  .hp-footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.3); position: relative; z-index: 1; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .hp-nav { padding: 0 1.5rem; }
    .hp-hero { grid-template-columns: 1fr; min-height: auto; }
    .hp-hero-left { padding: 3rem 1.5rem; }
    .hp-hero-right { min-height: 320px; }
    .hp-hero-title { font-size: 2.5rem; }
    .hp-hero-float { display: none; }
    .hp-blob { display: none; }
    .hp-section { padding: 4rem 1.5rem; }
    .hp-hiw-section { padding: 4rem 1.5rem; }
    .hp-section-title { font-size: 2rem; }
    .hp-about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
    .hp-about-img-wrap { height: 300px; }
    .hp-halls-grid { grid-template-columns: 1fr; }
    .hp-hiw-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    .hp-hiw-grid::before { display: none; }
    .hp-footer { padding: 2.5rem 1.5rem; flex-direction: column; align-items: flex-start; }
    .hp-cta-banner { padding: 4rem 1.5rem; }
    .hp-cta-banner h2 { font-size: 2rem; }
    .hp-venue-detail-grid { grid-template-columns: 1fr; }
    .hp-venue-panel-head { padding: 1.25rem; }
    .hp-venue-body { padding: 1.25rem; }
  }

  @media (min-width: 901px) and (max-width: 1200px) {
    .hp-halls-grid { grid-template-columns: repeat(2, 1fr); }
    .hp-hero-left { padding: 4rem 3rem; }
  }
`

const VENUE_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
]

const howItWorks = [
  {
    num: '01',
    icon: '🔍',
    title: 'Browse & Discover',
    desc: 'Explore a curated list of venues across categories — from conference rooms to grand celebration halls.',
  },
  {
    num: '02',
    icon: '📋',
    title: 'Register & Connect',
    desc: 'Venue owners submit their company details through a smooth, professional guided registration process.',
  },
  {
    num: '03',
    icon: '🎉',
    title: 'Approve & Celebrate',
    desc: 'Admins review and approve applications quickly, making every event a seamless success.',
  },
]

const fallbackVenues = [
  {
    id: 1,
    name: 'Grand Celebration Hall',
    capacity: 500,
    city: 'Amman',
    description: 'Ideal for weddings, large celebrations, and premium evening events.',
    companyName: 'Eventes',
  },
  {
    id: 2,
    name: 'Executive Conference Space',
    capacity: 80,
    city: 'Amman',
    description: 'Perfect for meetings, presentations, workshops, and business discussions.',
    companyName: 'Eventes',
  },
  {
    id: 3,
    name: 'Seminar And Training Studio',
    capacity: 200,
    city: 'Amman',
    description: 'Designed for seminars, training programs, lectures, and community events.',
    companyName: 'Eventes',
  },
]

const navLinks = [
  { id: 'hero',   label: 'Home' },
  { id: 'about',  label: 'About' },
  { id: 'halls',  label: 'Venues' },
  { id: 'contact',label: 'Contact' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function formatVenuePrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  return `${amount} JOD`
}

function getVenueCompanyName(venue) { return venue.companyName || 'Eventes' }

function getVenueSummary(venue) {
  return (
    venue.description ||
    'A flexible venue prepared for business events, celebrations, and memorable guest experiences.'
  )
}

function useScrollAnimation() {
  useEffect(() => {
    const selectors = '.hp-animate, .hp-animate-left, .hp-animate-right, .hp-animate-scale'
    const elements = document.querySelectorAll(selectors)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function HomePage({ onNavigate, session }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [venues, setVenues] = useState(fallbackVenues)
  const [selectedVenue, setSelectedVenue] = useState(null)

  useScrollAnimation()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const sections = navLinks.map((link) => link.id)
      for (let index = sections.length - 1; index >= 0; index -= 1) {
        const section = document.getElementById(sections[index])
        if (section && window.scrollY + 80 >= section.offsetTop) {
          setActiveSection(sections[index])
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await apiRequest('/api/Venues/all')
        if (Array.isArray(data) && data.length > 0) setVenues(data)
      } catch {
        setVenues(fallbackVenues)
      }
    }
    loadVenues()
  }, [])

  useEffect(() => {
    if (!selectedVenue) return undefined
    const handleEscape = (e) => { if (e.key === 'Escape') setSelectedVenue(null) }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedVenue])

  return (
    <>
      <style>{styles}</style>
      <div className="hp-root">

        {/* ── NAV ── */}
        <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
          <button className="hp-nav-logo" onClick={() => scrollTo('hero')}>Eventes</button>

          <div className="hp-nav-links">
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={`hp-nav-link${activeSection === link.id ? ' active' : ''}`}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
            <button className="hp-nav-link" onClick={() => onNavigate('add-hall')}>Register Company</button>
          </div>

          <button className="hp-login-btn" onClick={() => onNavigate(session ? 'venues' : 'auth')}>
            {session ? 'Dashboard' : 'Log In'}
          </button>
        </nav>

        {/* ── HERO ── */}
        <section id="hero" className="hp-hero">
          {/* Animated blobs */}
          <div className="hp-blob hp-blob-1" />
          <div className="hp-blob hp-blob-2" />
          <div className="hp-blob hp-blob-3" />

          <div className="hp-hero-left">
            <span className="hp-hero-badge">
              <span className="hp-hero-badge-dot" />
              Smart Venue &amp; Event Management
            </span>

            <h1 className="hp-hero-title">
              Find The Right Venue.{' '}
              <strong>Plan Better Events</strong>{' '}
              With Confidence
            </h1>

            <p className="hp-hero-desc">
              Eventes connects users with the best venues, helps companies register professionally,
              and gives admins full control — all in one powerful platform.
            </p>

            <div className="hp-hero-cta">
              <button className="hp-cta-primary" onClick={() => onNavigate('add-hall')}>
                🏢 Register Company
              </button>
              <button className="hp-cta-secondary" onClick={() => scrollTo('halls')}>
                Explore Venues →
              </button>
            </div>

            <div className="hp-hero-stats">
              <div className="hp-stat">
                <span className="hp-stat-num">{venues.length}+</span>
                <span className="hp-stat-label">Venues</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-num">1</span>
                <span className="hp-stat-label">Platform</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-num">24/7</span>
                <span className="hp-stat-label">Online</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-num">Fast</span>
                <span className="hp-stat-label">Review</span>
              </div>
            </div>
          </div>

          <div className="hp-hero-right">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"
              alt="Elegant event venue"
              className="hp-hero-img"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.style.background =
                  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #f43f5e 100%)'
              }}
            />
            <div className="hp-hero-overlay" />
            <div className="hp-hero-caption">
              <h3>Professional spaces, smoother planning</h3>
              <p>From meetings to celebrations — find and book with confidence.</p>
            </div>

            <div className="hp-hero-float f1">
              <div className="hp-float-label">Available Now</div>
              <div className="hp-float-value">500+ Guests</div>
              <div className="hp-float-sub">Grand Celebration Hall</div>
            </div>

            <div className="hp-hero-float f2">
              <div className="hp-float-label">Top Rated</div>
              <div className="hp-float-value">⭐ 4.9 / 5</div>
              <div className="hp-float-sub">By event planners</div>
            </div>
          </div>
        </section>

        {/* ── WAVE 1 ── */}
        <div className="hp-wave" style={{ background: '#ffffff' }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" fill="#f8f7ff" />
          </svg>
        </div>

        {/* ── ABOUT ── */}
        <section id="about" className="hp-section hp-section-alt">
          <div className="hp-about-grid">
            <div>
              <span className="hp-section-tag hp-animate">About Eventes</span>
              <h2 className="hp-section-title hp-animate-left hp-animate-d1">
                A Smarter Way To <br /><strong>Manage Events</strong>
              </h2>
              <p className="hp-section-lead hp-animate hp-animate-d2">
                Eventes simplifies every step of the event journey — from discovering
                the perfect venue to finalizing registrations, all managed through one
                beautiful, connected platform.
              </p>

              <div className="hp-about-features">
                {[
                  {
                    title: 'Easy Venue Discovery',
                    desc: 'Browse venues by capacity, city, and type — all in one clean interface.',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4f46e5" strokeWidth="1.6">
                        <path d="M10 2L18 6.5v7L10 18l-8-4.5v-7L10 2z" strokeLinejoin="round" />
                      </svg>
                    ),
                    delay: 'd2',
                  },
                  {
                    title: 'Simple Company Registration',
                    desc: 'Venue owners submit details professionally through a guided process.',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#f43f5e" strokeWidth="1.6">
                        <rect x="2" y="3.5" width="16" height="11" rx="1.5" />
                        <path d="M6 17h8M10 14.5V17" strokeLinecap="round" />
                      </svg>
                    ),
                    delay: 'd3',
                  },
                  {
                    title: 'Organized Admin Control',
                    desc: 'Admins manage requests, approve companies, and keep data structured.',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#f59e0b" strokeWidth="1.6">
                        <circle cx="10" cy="10" r="8" />
                        <path d="M10 6v4.5l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                    delay: 'd4',
                  },
                ].map((feature) => (
                  <div key={feature.title} className={`hp-feature-item hp-animate hp-animate-${feature.delay}`}>
                    <div className="hp-feature-icon">{feature.icon}</div>
                    <div className="hp-feature-text">
                      <h4>{feature.title}</h4>
                      <p>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About image with floating chips */}
            <div className="hp-about-img-wrap hp-animate-right hp-animate-d2">
              <img
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
                alt="Event planning"
                className="hp-about-img"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="hp-about-img-overlay" />

              <div className="hp-about-chip chip-1">
                <div className="hp-float-label">Active Venues</div>
                <div className="hp-float-value">{venues.length}+ Listings</div>
              </div>

              <div className="hp-about-chip chip-2">
                <div className="hp-float-label">✓ Verified</div>
                <div className="hp-float-value">Company Network</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WAVE 2 ── */}
        <div className="hp-wave" style={{ background: '#f8f7ff' }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,36 C360,0 1080,72 1440,36 L1440,72 L0,72 Z" fill="#ffffff" />
          </svg>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="hp-hiw-section">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="hp-section-tag hp-animate">How It Works</span>
            <h2 className="hp-section-title hp-animate hp-animate-d1" style={{ textAlign: 'center' }}>
              Three Steps To <strong>Your Perfect Event</strong>
            </h2>
            <p className="hp-section-lead hp-animate hp-animate-d2" style={{ margin: '0 auto', textAlign: 'center' }}>
              Getting started on Eventes is quick, straightforward, and designed
              to get you from discovery to celebration as fast as possible.
            </p>
          </div>

          <div className="hp-hiw-grid">
            {howItWorks.map((step, index) => (
              <div
                key={step.num}
                className={`hp-hiw-card hp-animate-scale hp-animate-d${index + 2}`}
              >
                <div className="hp-hiw-num">{step.num}</div>
                <div className="hp-hiw-icon">{step.icon}</div>
                <h3 className="hp-hiw-title">{step.title}</h3>
                <p className="hp-hiw-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WAVE 3 ── */}
        <div className="hp-wave" style={{ background: '#ffffff' }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,36 C480,72 960,0 1440,36 L1440,72 L0,72 Z" fill="#f8f7ff" />
          </svg>
        </div>

        {/* ── VENUES ── */}
        <section id="halls" className="hp-section hp-section-alt">
          <span className="hp-section-tag hp-animate">Featured Venues</span>
          <h2 className="hp-section-title hp-animate hp-animate-d1">
            Spaces Designed For <br /><strong>Real Events</strong>
          </h2>
          <p className="hp-section-lead hp-animate hp-animate-d2">
            Explore venues for conferences, seminars, celebrations, and private gatherings.
            Compare options quickly with clear, structured information.
          </p>

          <div className="hp-halls-grid">
            {venues.map((venue, index) => (
              <button
                key={venue.id ?? venue.name}
                type="button"
                className={`hp-hall-card hp-animate hp-animate-d${Math.min(index + 1, 4)}`}
                onClick={() => setSelectedVenue(venue)}
              >
                <div className="hp-hall-img-wrap">
                  <img
                    src={VENUE_IMAGES[index % VENUE_IMAGES.length]}
                    alt={venue.name}
                    className="hp-hall-img"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <span className="hp-hall-img-badge">
                    Up to {venue.capacity ?? 0} guests
                  </span>
                </div>
                <div className="hp-hall-body">
                  <p className="hp-hall-name">{venue.name}</p>
                  <p className="hp-hall-cap">📍 {venue.city || 'Amman'}</p>
                  <p className="hp-hall-features">{getVenueSummary(venue)}</p>
                  <span className="hp-hall-tag">{getVenueCompanyName(venue)}</span>
                  <span className="hp-hall-hint">View details →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── VENUE MODAL ── */}
        {selectedVenue ? (
          <div className="hp-venue-overlay" onClick={() => setSelectedVenue(null)}>
            <div className="hp-venue-panel" onClick={(e) => e.stopPropagation()}>
              <div className="hp-venue-panel-head">
                <div>
                  <h3 className="hp-venue-panel-title">{selectedVenue.name || 'Venue Details'}</h3>
                  <p className="hp-venue-panel-subtitle">
                    {getVenueCompanyName(selectedVenue)} · {selectedVenue.city || 'Amman'}
                  </p>
                </div>
                <button type="button" className="hp-venue-close" onClick={() => setSelectedVenue(null)} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className="hp-venue-body">
                <div className="hp-venue-meta">
                  <span className="hp-venue-chip">👥 Up to {selectedVenue.capacity ?? 0} guests</span>
                  <span className="hp-venue-chip">💰 From {formatVenuePrice(selectedVenue.minimalPrice)}</span>
                  <span className="hp-venue-chip">📍 {selectedVenue.city || 'Amman'}</span>
                </div>

                <p className="hp-venue-description">{getVenueSummary(selectedVenue)}</p>

                <div className="hp-venue-detail-grid">
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Hosted By</span>
                    <span className="hp-venue-detail-value">{getVenueCompanyName(selectedVenue)}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Guest Capacity</span>
                    <span className="hp-venue-detail-value">{selectedVenue.capacity ?? 0} guests</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">City</span>
                    <span className="hp-venue-detail-value">{selectedVenue.city || 'Amman'}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Address</span>
                    <span className="hp-venue-detail-value">
                      {selectedVenue.address || 'Available from venue provider'}
                    </span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Starting Price</span>
                    <span className="hp-venue-detail-value">{formatVenuePrice(selectedVenue.minimalPrice)}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Venue Name</span>
                    <span className="hp-venue-detail-value">{selectedVenue.name || '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── CTA BANNER ── */}
        <section className="hp-cta-banner">
          <div className="hp-cta-banner-inner">
            <h2 className="hp-animate">Ready To Find Your Perfect Venue?</h2>
            <p className="hp-animate hp-animate-d1">
              Join Eventes and discover the ideal space for your next event — conferences,
              weddings, seminars, and everything in between.
            </p>
            <div className="hp-cta-banner-btns hp-animate hp-animate-d2">
              <button className="hp-cta-white" onClick={() => onNavigate('add-hall')}>
                Register Your Company
              </button>
              <button className="hp-cta-ghost" onClick={() => scrollTo('halls')}>
                Explore All Venues
              </button>
            </div>
          </div>
        </section>

        {/* ── WAVE 4 ── */}
        <div className="hp-wave" style={{ background: 'linear-gradient(140deg, #4f46e5, #7c3aed 45%, #f43f5e)' }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,36 C360,72 1080,0 1440,36 L1440,72 L0,72 Z" fill="#f8f7ff" />
          </svg>
        </div>

        {/* ── CONTACT ── */}
        <section id="contact" className="hp-section hp-section-alt">
          <span className="hp-section-tag hp-animate">Contact</span>
          <h2 className="hp-section-title hp-animate hp-animate-d1">
            Get In Touch With <strong>Eventes</strong>
          </h2>

          <div className="hp-contact-grid">
            <p className="hp-section-lead hp-animate hp-animate-d2">
              Want to know more or register your venue? Reach out and we will
              get back to you as quickly as possible.
            </p>

            {[
              {
                label: 'Email',
                value: 'eventes@gmail.com',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#4f46e5" strokeWidth="1.5">
                    <rect x="1.5" y="3.5" width="15" height="11" rx="1.5" />
                    <path d="M1.5 5.5l7.5 5.5 7.5-5.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: 'Phone',
                value: '0782182081',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#f43f5e" strokeWidth="1.5">
                    <path d="M3.5 2A1 1 0 0 0 2.5 3v1.5C2.5 11.404 7.096 16 14 16h1.5a1 1 0 0 0 1-1v-1.75a1 1 0 0 0-.7-0.955l-2.3-.766a1 1 0 0 0-1.1.383l-.6.9a9 9 0 0 1-4.11-4.11l.9-.6a1 1 0 0 0 .383-1.1l-.766-2.3A1 1 0 0 0 7.25 4H3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                label: 'Location',
                value: 'Amman, Jordan',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                    <path d="M9 1.5A5.5 5.5 0 0 0 3.5 7c0 3.5 5.5 9.5 5.5 9.5S14.5 10.5 14.5 7A5.5 5.5 0 0 0 9 1.5z" />
                    <circle cx="9" cy="7" r="2" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={item.label} className={`hp-contact-item hp-animate hp-animate-d${i + 2}`}>
                <div className="hp-contact-icon">{item.icon}</div>
                <div>
                  <p className="hp-contact-label">{item.label}</p>
                  <p className="hp-contact-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="hp-footer">
          <span className="hp-footer-brand">Eventes</span>
          <div className="hp-footer-links">
            {navLinks.map((link) => (
              <button key={link.id} className="hp-footer-link" onClick={() => scrollTo(link.id)}>
                {link.label}
              </button>
            ))}
            <button className="hp-footer-link" onClick={() => onNavigate('add-hall')}>Register Company</button>
          </div>
          <span className="hp-footer-copy">© 2026 Eventes. All rights reserved.</span>
        </footer>

      </div>
    </>
  )
}

export default HomePage

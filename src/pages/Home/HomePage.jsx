import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'
import { getVenuePhotoSet } from '../../lib/venueMedia'
import {
  formatVenueTimeSlot,
  getVenueTimeSlots,
  parseTimeToMinutes,
} from '../../lib/venueTimeSlots'

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
  .hp-venue-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  .hp-venue-filter-group {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }
  .hp-venue-filter {
    border: 1.5px solid rgba(79,70,229,0.15);
    background: #fff;
    color: var(--muted);
    padding: 0.65rem 1rem;
    border-radius: 999px;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s;
  }
  .hp-venue-filter:hover {
    color: var(--primary);
    border-color: rgba(79,70,229,0.28);
    transform: translateY(-1px);
  }
  .hp-venue-filter.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }
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
  .hp-hall-price {
    margin: 0.8rem 0 0;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--primary);
  }

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
  .hp-venue-cover {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
    border-radius: 18px;
    margin-bottom: 1.25rem;
    background: linear-gradient(135deg, #e0e7ff, #fce7f3);
  }

  .hp-venue-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
  .hp-venue-chip {
    display: inline-flex; align-items: center; padding: 0.35rem 0.875rem;
    border-radius: 999px; background: rgba(79,70,229,0.08);
    color: var(--primary); font-size: 0.8rem; font-weight: 600;
    border: 1px solid rgba(79,70,229,0.14);
  }

  .hp-venue-description { font-size: 0.95rem; line-height: 1.8; color: var(--muted); margin-bottom: 1.5rem; }
  .hp-venue-gallery-title {
    margin: 1.5rem 0 0.85rem;
    font-size: 0.92rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .hp-venue-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }
  .hp-venue-gallery-item {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
    border-radius: 14px;
    background: var(--bg-alt);
    border: 1px solid var(--border);
  }

  .hp-venue-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }

  .hp-venue-detail { padding: 1rem; background: var(--bg-alt); border-radius: 12px; border: 1px solid var(--border); }
  .hp-venue-detail-label { display: block; margin-bottom: 0.3rem; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: var(--muted); }
  .hp-venue-detail-value { font-size: 0.95rem; color: var(--text); font-weight: 700; line-height: 1.5; }
  .hp-booking-panel {
    margin-top: 1.5rem;
    padding: 1.25rem;
    border-radius: 18px;
    border: 1px solid rgba(79,70,229,0.14);
    background: linear-gradient(135deg, rgba(79,70,229,0.04), rgba(244,63,94,0.03));
  }
  .hp-booking-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .hp-booking-title {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .hp-booking-copy {
    margin: 0;
    color: var(--muted);
    font-size: 0.86rem;
    line-height: 1.6;
  }
  .hp-booking-stepper {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .hp-booking-step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 0.95rem;
    border-radius: 14px;
    border: 1.5px solid rgba(79,70,229,0.12);
    background: rgba(255,255,255,0.82);
  }
  .hp-booking-step.active {
    border-color: rgba(79,70,229,0.28);
    background: rgba(79,70,229,0.09);
    box-shadow: 0 10px 24px rgba(79,70,229,0.08);
  }
  .hp-booking-step.done {
    border-color: rgba(245,158,11,0.24);
    background: rgba(245,158,11,0.08);
  }
  .hp-booking-step-num {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(79,70,229,0.12);
    color: var(--primary);
    font-size: 0.82rem;
    font-weight: 900;
  }
  .hp-booking-step.active .hp-booking-step-num {
    background: linear-gradient(135deg, #4f46e5, #3730a3);
    color: #fff;
  }
  .hp-booking-step.done .hp-booking-step-num {
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: #fff;
  }
  .hp-booking-step-copy {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }
  .hp-booking-step-label {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--text);
  }
  .hp-booking-step-desc {
    font-size: 0.74rem;
    color: var(--muted);
    line-height: 1.4;
  }
  .hp-booking-stage {
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid rgba(79,70,229,0.1);
    background: rgba(255,255,255,0.78);
  }
  .hp-booking-stage-head {
    margin-bottom: 1rem;
  }
  .hp-booking-stage-title {
    margin: 0 0 0.2rem;
    font-size: 0.98rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .hp-booking-stage-copy {
    margin: 0;
    color: var(--muted);
    font-size: 0.82rem;
    line-height: 1.6;
  }
  .hp-booking-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }
  .hp-booking-grid.wide {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .hp-booking-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .hp-booking-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .hp-booking-input {
    height: 2.85rem;
    border: 2px solid var(--border);
    background: #fff;
    color: var(--text);
    border-radius: 12px;
    padding: 0 0.9rem;
    font: inherit;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .hp-booking-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
  }
  .hp-booking-input.file {
    height: auto;
    min-height: 2.85rem;
    padding: 0.68rem 0.9rem;
  }
  .hp-booking-note {
    margin-top: 1rem;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    border: 1.5px dashed rgba(79,70,229,0.16);
    background: rgba(79,70,229,0.04);
    color: var(--muted);
    font-size: 0.82rem;
    line-height: 1.6;
  }
  .hp-booking-slot-list {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .hp-booking-slot-card {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
  }
  .hp-booking-slot-card.selected {
    border-color: rgba(79,70,229,0.28);
    background: rgba(79,70,229,0.05);
  }
  .hp-booking-slot-main {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .hp-booking-slot-main input {
    margin-top: 0.2rem;
  }
  .hp-booking-slot-title {
    margin: 0 0 0.2rem;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--text);
  }
  .hp-booking-slot-copy {
    margin: 0;
    font-size: 0.8rem;
    color: var(--muted);
  }
  .hp-booking-slot-price {
    white-space: nowrap;
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--primary);
  }
  .hp-booking-option-list {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .hp-booking-option-card {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 0.95rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
  }
  .hp-booking-option-card.selected {
    border-color: rgba(79,70,229,0.28);
    background: rgba(79,70,229,0.05);
  }
  .hp-booking-option-main {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .hp-booking-option-main input {
    margin-top: 0.2rem;
  }
  .hp-booking-option-title {
    margin: 0 0 0.2rem;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--text);
  }
  .hp-booking-option-copy {
    margin: 0;
    font-size: 0.8rem;
    color: var(--muted);
    line-height: 1.55;
  }
  .hp-booking-option-price {
    white-space: nowrap;
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--primary);
  }
  .hp-booking-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .hp-booking-summary-card {
    padding: 0.95rem 1rem;
    border-radius: 14px;
    border: 1.5px solid var(--border);
    background: #fff;
  }
  .hp-booking-summary-label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .hp-booking-summary-value {
    font-size: 0.96rem;
    font-weight: 800;
    color: var(--text);
    line-height: 1.45;
  }
  .hp-booking-review-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .hp-booking-file-meta {
    margin-top: 0.35rem;
    font-size: 0.76rem;
    color: var(--muted);
  }
  .hp-booking-success {
    padding: 1.1rem;
    border-radius: 16px;
    border: 1.5px solid rgba(16,185,129,0.2);
    background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(79,70,229,0.06));
  }
  .hp-booking-success-title {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 900;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .hp-booking-success-copy {
    margin: 0;
    color: var(--muted);
    font-size: 0.84rem;
    line-height: 1.6;
  }
  .hp-booking-status {
    margin-top: 1rem;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    border: 1.5px solid rgba(79,70,229,0.18);
    background: rgba(79,70,229,0.06);
    color: var(--primary);
    font-size: 0.85rem;
    line-height: 1.6;
  }
  .hp-booking-status.error {
    border-color: rgba(244,63,94,0.22);
    background: rgba(244,63,94,0.07);
    color: #be123c;
  }
  .hp-booking-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }
  .hp-booking-btn {
    height: 2.85rem;
    padding: 0 1.25rem;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #4f46e5, #3730a3);
    color: #fff;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(79,70,229,0.22);
  }
  .hp-booking-btn.secondary {
    background: rgba(79,70,229,0.08);
    color: var(--primary);
    border: 1.5px solid rgba(79,70,229,0.2);
    box-shadow: none;
  }
  .hp-booking-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

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
    .hp-booking-stepper { grid-template-columns: 1fr; }
    .hp-booking-grid, .hp-booking-grid.wide, .hp-booking-summary-grid, .hp-booking-review-grid { grid-template-columns: 1fr; }
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
    desc: 'Venue owners submit their business details through a smooth and guided registration process.',
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
    address: 'Airport Road',
    description: 'Ideal for weddings, large celebrations, and premium evening events.',
    companyName: 'Eventes',
    category: 'WeddingHall',
    pricingType: 'Hourly',
    pricePerHour: 180,
  },
  {
    id: 2,
    name: 'Garden Wedding Farm',
    capacity: 350,
    city: 'Amman',
    address: 'Jerash Road',
    description: 'Open-air farm venue prepared for outdoor weddings, receptions, and private parties.',
    companyName: 'Eventes',
    category: 'Farm',
    pricingType: 'FixedSlots',
    pricePerHour: 900,
  },
  {
    id: 3,
    name: 'Skyline Wedding Hall',
    capacity: 240,
    city: 'Amman',
    address: 'Mecca Street',
    description: 'Modern indoor hall with flexible seating for engagement parties and wedding ceremonies.',
    companyName: 'Eventes',
    category: 'WeddingHall',
    pricingType: 'Hourly',
    pricePerHour: 120,
  },
]

const navLinks = [
  { id: 'hero',   label: 'Home' },
  { id: 'halls',  label: 'Venues' },
  { id: 'contact',label: 'Contact' },
  { id: 'about',  label: 'About' },
]

const emptyBookingForm = {
  date: '',
  timeSlotId: '',
  startTime: '',
  endTime: '',
  guestsCount: '',
  venueServiceOptionIds: [],
  brideIdDocumentDataUrl: '',
  bridegroomIdDocumentDataUrl: '',
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function formatVenuePrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  return `${amount} JOD`
}

function formatBookingDate(value) {
  if (!value) return '--'

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })
}

function getVenueCategoryValue(venue) {
  const rawValue = venue?.category ?? venue?.Category ?? 'WeddingHall'

  if (rawValue === 2 || rawValue === 'Farm') {
    return 'Farm'
  }

  return 'WeddingHall'
}

function getVenueCategoryLabel(value) {
  return value === 'Farm' || value === 2 ? 'Farm' : 'Wedding Hall'
}

function getPricingTypeValue(venue) {
  const rawValue = venue?.pricingType ?? venue?.PricingType ?? 'Hourly'

  if (rawValue === 2 || rawValue === 'FixedSlots') {
    return 'FixedSlots'
  }

  return 'Hourly'
}

function getPricingTypeLabel(value) {
  return value === 'FixedSlots' || value === 2 ? 'Fixed Slots' : 'Hourly'
}

function getVenuePriceValue(venue) {
  const amount = Number(venue?.pricePerHour ?? venue?.PricePerHour)
  return Number.isFinite(amount) ? amount : null
}

function getVenuePriceSummary(venue) {
  const pricingType = getPricingTypeValue(venue)
  const priceValue = getVenuePriceValue(venue)

  if (pricingType === 'Hourly' && priceValue !== null) {
    return `${formatVenuePrice(priceValue)} / hour`
  }

  if (pricingType === 'FixedSlots' && priceValue !== null) {
    return `${formatVenuePrice(priceValue)} / slot`
  }

  return pricingType === 'FixedSlots' ? 'Fixed slot pricing' : 'Price available on request'
}

function getVenueBusinessName(venue) {
  return venue?.companyName ?? venue?.CompanyName ?? 'Eventes'
}

function getVenueSummary(venue) {
  return (
    venue.description ||
    'A flexible venue prepared for weddings, celebrations, and memorable guest experiences.'
  )
}

function getVenueCoverPhoto(venue, fallbackIndex = 0) {
  const { coverPhotoUrl } = getVenuePhotoSet(venue)
  return coverPhotoUrl || VENUE_IMAGES[fallbackIndex % VENUE_IMAGES.length]
}

function useScrollAnimation(watchValue) {
  useEffect(() => {
    const selectors = '.hp-animate, .hp-animate-left, .hp-animate-right, .hp-animate-scale'
    const elements = Array.from(document.querySelectorAll(selectors))

    if (elements.length === 0) {
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('visible'))
      return undefined
    }

    const revealIfVisible = (element) => {
      const rect = element.getBoundingClientRect()
      if (rect.top <= window.innerHeight * 0.9 && rect.bottom >= 0) {
        element.classList.add('visible')
      }
    }

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

    elements.forEach((element) => {
      observer.observe(element)
      revealIfVisible(element)
    })

    return () => observer.disconnect()
  }, [watchValue])
}

function HomePage({ onNavigate, onStartBooking, session }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [venues, setVenues] = useState(fallbackVenues)
  const [venueTypeFilter, setVenueTypeFilter] = useState('All')
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingForm, setBookingForm] = useState(emptyBookingForm)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingLoadingOptions, setBookingLoadingOptions] = useState(false)
  const [bookingServiceOptions, setBookingServiceOptions] = useState([])
  const [bookingDocumentNames, setBookingDocumentNames] = useState({
    bride: '',
    bridegroom: '',
  })
  const [bookingFeedback, setBookingFeedback] = useState({ tone: 'idle', message: '' })
  const isBookingUser = session?.role === 'User'
  const bookingSteps = [
    { number: 1, label: 'Details', desc: 'Date, guests, and time' },
    { number: 2, label: 'Add-ons', desc: 'Optional venue services' },
    { number: 3, label: 'Review', desc: 'Documents and confirmation' },
  ]

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

  const resetBookingWizard = () => {
    setBookingStep(1)
    setBookingForm(emptyBookingForm)
    setBookingSubmitting(false)
    setBookingLoadingOptions(false)
    setBookingServiceOptions([])
    setBookingDocumentNames({ bride: '', bridegroom: '' })
    setBookingFeedback({ tone: 'idle', message: '' })
  }

  const closeVenueDetails = () => {
    setSelectedVenue(null)
    resetBookingWizard()
  }

  useEffect(() => {
    if (!selectedVenue) return undefined
    const handleEscape = (e) => {
      if (e.key !== 'Escape') {
        return
      }

      setSelectedVenue(null)
      setBookingStep(1)
      setBookingForm(emptyBookingForm)
      setBookingSubmitting(false)
      setBookingLoadingOptions(false)
      setBookingServiceOptions([])
      setBookingDocumentNames({ bride: '', bridegroom: '' })
      setBookingFeedback({ tone: 'idle', message: '' })
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedVenue])

  const displayedVenues = useMemo(() => {
    if (venueTypeFilter === 'All') {
      return venues
    }

    return venues.filter((venue) => getVenueCategoryValue(venue) === venueTypeFilter)
  }, [venueTypeFilter, venues])

  useScrollAnimation(displayedVenues)

  const selectedVenueTimeSlots = useMemo(() => {
    return selectedVenue ? getVenueTimeSlots(selectedVenue, { activeOnly: true }) : []
  }, [selectedVenue])

  const selectedBookingSlot = useMemo(() => {
    return (
      selectedVenueTimeSlots.find((slot) => String(slot.id) === String(bookingForm.timeSlotId)) ?? null
    )
  }, [bookingForm.timeSlotId, selectedVenueTimeSlots])

  const selectedVenuePhotoSet = useMemo(
    () =>
      selectedVenue
        ? getVenuePhotoSet(selectedVenue)
        : { coverPhotoUrl: '', galleryPhotoUrls: [], photoUrls: [] },
    [selectedVenue],
  )

  useEffect(() => {
    if (!selectedVenue?.id || !isBookingUser) {
      setBookingServiceOptions([])
      return undefined
    }

    let isCancelled = false

    const loadBookingServiceOptions = async () => {
      setBookingLoadingOptions(true)

      try {
        const data = await apiRequest(`/api/venues/${selectedVenue.id}/service-options`, {
          token: session?.token,
        })

        if (isCancelled) return

        const nextOptions = Array.isArray(data) ? data : []
        setBookingServiceOptions(nextOptions)
        setBookingForm((currentForm) => ({
          ...currentForm,
          venueServiceOptionIds: currentForm.venueServiceOptionIds.filter((optionId) =>
            nextOptions.some((option) => String(option.id) === String(optionId)),
          ),
        }))
      } catch {
        if (!isCancelled) {
          setBookingServiceOptions([])
        }
      } finally {
        if (!isCancelled) {
          setBookingLoadingOptions(false)
        }
      }
    }

    loadBookingServiceOptions()

    return () => {
      isCancelled = true
    }
  }, [isBookingUser, selectedVenue?.id, session?.token])

  const selectedBookingServices = useMemo(() => {
    return bookingServiceOptions.filter((option) =>
      bookingForm.venueServiceOptionIds.some((selectedId) => String(selectedId) === String(option.id)),
    )
  }, [bookingForm.venueServiceOptionIds, bookingServiceOptions])

  const servicesTotal = useMemo(() => {
    return selectedBookingServices.reduce((sum, option) => sum + Number(option.price || 0), 0)
  }, [selectedBookingServices])

  const estimatedBasePrice = useMemo(() => {
    if (!selectedVenue) return null

    if (selectedVenueTimeSlots.length > 0) {
      return selectedBookingSlot ? Number(selectedBookingSlot.price || 0) : null
    }

    const pricingType = getPricingTypeValue(selectedVenue)
    const pricePerHour = getVenuePriceValue(selectedVenue)

    if (pricingType !== 'Hourly' || pricePerHour === null || pricePerHour <= 0) {
      return null
    }

    const startMinutes = parseTimeToMinutes(bookingForm.startTime)
    const endMinutes = parseTimeToMinutes(bookingForm.endTime)

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      return null
    }

    return ((endMinutes - startMinutes) / 60) * pricePerHour
  }, [
    bookingForm.endTime,
    bookingForm.startTime,
    selectedBookingSlot,
    selectedVenue,
    selectedVenueTimeSlots.length,
  ])

  const estimatedTotal =
    estimatedBasePrice === null ? null : estimatedBasePrice + servicesTotal

  const selectedBookingTimeLabel = useMemo(() => {
    if (selectedBookingSlot) {
      return formatVenueTimeSlot(selectedBookingSlot)
    }

    if (bookingForm.startTime && bookingForm.endTime) {
      return formatVenueTimeSlot({
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
      })
    }

    return '--'
  }, [bookingForm.endTime, bookingForm.startTime, selectedBookingSlot])

  const clearBookingFeedback = () => {
    setBookingFeedback({ tone: 'idle', message: '' })
  }

  const openVenueDetails = (venue) => {
    resetBookingWizard()
    setSelectedVenue(venue)
  }

  const handleBookingFieldChange = ({ target: { name, value } }) => {
    clearBookingFeedback()
    setBookingForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleBookingOptionToggle = (optionId) => {
    clearBookingFeedback()
    setBookingForm((currentForm) => {
      const alreadySelected = currentForm.venueServiceOptionIds.some(
        (selectedId) => String(selectedId) === String(optionId),
      )

      return {
        ...currentForm,
        venueServiceOptionIds: alreadySelected
          ? currentForm.venueServiceOptionIds.filter(
              (selectedId) => String(selectedId) !== String(optionId),
            )
          : [...currentForm.venueServiceOptionIds, optionId],
      }
    })
  }

  const handleBookingDocumentChange = async (kind, event) => {
    const file = event.target.files?.[0]

    if (!file) {
      clearBookingFeedback()
      setBookingDocumentNames((currentNames) => ({ ...currentNames, [kind]: '' }))
      setBookingForm((currentForm) => ({
        ...currentForm,
        [kind === 'bride' ? 'brideIdDocumentDataUrl' : 'bridegroomIdDocumentDataUrl']: '',
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setBookingFeedback({
        tone: 'error',
        message: 'Each document must be 5 MB or smaller.',
      })
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)

      clearBookingFeedback()
      setBookingDocumentNames((currentNames) => ({ ...currentNames, [kind]: file.name }))
      setBookingForm((currentForm) => ({
        ...currentForm,
        [kind === 'bride' ? 'brideIdDocumentDataUrl' : 'bridegroomIdDocumentDataUrl']:
          dataUrl,
      }))
    } catch (error) {
      setBookingFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to read the document.',
      })
    }
  }

  const validateBookingDetailsStep = () => {
    if (!selectedVenue?.id) {
      return 'Choose a venue before continuing.'
    }

    if (!bookingForm.date) {
      return 'Choose a booking date before continuing.'
    }

    const guestsCount = Number(bookingForm.guestsCount)

    if (!Number.isFinite(guestsCount) || guestsCount <= 0) {
      return 'Enter a valid guests count before continuing.'
    }

    if (selectedVenueTimeSlots.length > 0 && !selectedBookingSlot) {
      return 'Choose one of the active venue time slots before continuing.'
    }

    if (selectedVenueTimeSlots.length === 0) {
      const startMinutes = parseTimeToMinutes(bookingForm.startTime)
      const endMinutes = parseTimeToMinutes(bookingForm.endTime)

      if (startMinutes === null || endMinutes === null) {
        return 'Enter both start and end times before continuing.'
      }

      if (endMinutes <= startMinutes) {
        return 'End time must be later than start time.'
      }
    }

    return null
  }

  const goToBookingStep = (nextStep) => {
    const validationMessage = validateBookingDetailsStep()

    if (validationMessage) {
      setBookingFeedback({
        tone: 'error',
        message: validationMessage,
      })
      return
    }

    clearBookingFeedback()
    setBookingStep(nextStep)
  }

  const startVenueBookingFlow = () => {
    if (isBookingUser) {
      goToBookingStep(2)
      return
    }

    if (!selectedVenue?.id) {
      return
    }

    if (!bookingForm.date) {
      setBookingFeedback({
        tone: 'error',
        message: 'Choose a booking date before continuing.',
      })
      return
    }

    if (selectedVenueTimeSlots.length > 0 && !selectedBookingSlot) {
      setBookingFeedback({
        tone: 'error',
        message: 'Choose one of the active venue time slots before continuing.',
      })
      return
    }

    const bookingDraft = {
      venueId: Number(selectedVenue.id),
      venueCategory: getVenueCategoryValue(selectedVenue),
      date: bookingForm.date,
      ...(selectedBookingSlot ? { timeSlotId: Number(selectedBookingSlot.id) } : {}),
    }

    clearBookingFeedback()
    closeVenueDetails()
    onStartBooking?.(bookingDraft)
  }

  const submitVenueBooking = async () => {
    if (!selectedVenue?.id || !isBookingUser) {
      return
    }

    const validationMessage = validateBookingDetailsStep()

    if (validationMessage) {
      setBookingFeedback({
        tone: 'error',
        message: validationMessage,
      })
      return
    }

    if (!bookingForm.brideIdDocumentDataUrl || !bookingForm.bridegroomIdDocumentDataUrl) {
      setBookingFeedback({
        tone: 'error',
        message: 'Upload both the bride and bridegroom ID documents before submitting.',
      })
      return
    }

    setBookingSubmitting(true)

    try {
      await apiRequest('/api/bookings', {
        method: 'POST',
        token: session?.token,
        body: {
          venueId: Number(selectedVenue.id),
          date: `${bookingForm.date}T00:00:00Z`,
          guestsCount: Number(bookingForm.guestsCount),
          ...(selectedBookingSlot
            ? { timeSlotId: Number(selectedBookingSlot.id) }
            : {
                startTime: bookingForm.startTime,
                endTime: bookingForm.endTime,
              }),
          venueServiceOptionIds: bookingForm.venueServiceOptionIds,
          brideIdDocumentDataUrl: bookingForm.brideIdDocumentDataUrl,
          bridegroomIdDocumentDataUrl: bookingForm.bridegroomIdDocumentDataUrl,
        },
      })

      setBookingFeedback({
        tone: 'idle',
        message: 'Booking created successfully. You can now review it in My Bookings.',
      })
      setBookingStep(4)
    } catch (error) {
      setBookingFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to create the booking.',
      })
    } finally {
      setBookingSubmitting(false)
    }
  }

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
            <button className="hp-nav-link" onClick={() => onNavigate('add-hall')}>Register Business</button>
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
              Eventes connects users with the best venues, helps businesses register professionally,
              and gives admins full control — all in one powerful platform.
            </p>

            <div className="hp-hero-cta">
              <button className="hp-cta-primary" onClick={() => onNavigate('add-hall')}>
                Register Business
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

            {false && <div className="hp-hero-float f1">
              <div className="hp-float-label">Available Now</div>
              <div className="hp-float-value">500+ Guests</div>
              <div className="hp-float-sub">Grand Celebration Hall</div>
            </div>}

            {false && <div className="hp-hero-float f2">
              <div className="hp-float-label">Top Rated</div>
              <div className="hp-float-value">⭐ 4.9 / 5</div>
              <div className="hp-float-sub">By event planners</div>
            </div>}
          </div>
        </section>

        {/* ── WAVE 1 ── */}
        <div className="hp-wave" style={{ background: '#ffffff' }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" fill="#ffffff" />
          </svg>
        </div>

        {/* ── ABOUT ── */}
        <section id="about-hidden" className="hp-section hp-section-alt" style={{ display: 'none' }}>
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
                    title: 'Simple Business Registration',
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
                    desc: 'Admins manage requests, approve businesses, and keep data structured.',
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

              {false && <div className="hp-about-chip chip-1">
              <div className="hp-float-label">Active Venues</div>
              <div className="hp-float-value">{venues.length}+ Listings</div>
              </div>}

              {false && <div className="hp-about-chip chip-2">
                <div className="hp-float-label">✓ Verified</div>
                <div className="hp-float-value">Business Network</div>
              </div>}
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
            Explore wedding halls and farms for celebrations, outdoor events, and private gatherings.
            Compare options quickly with clear, structured information.
          </p>

          <div className="hp-venue-toolbar">
            <div className="hp-venue-filter-group">
              {[
                { value: 'All', label: 'All Venues' },
                { value: 'WeddingHall', label: 'Wedding Halls' },
                { value: 'Farm', label: 'Farms' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`hp-venue-filter${venueTypeFilter === option.value ? ' active' : ''}`}
                  onClick={() => setVenueTypeFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className="hp-hall-cap">{displayedVenues.length} venues shown</span>
          </div>

          <div className="hp-halls-grid">
            {displayedVenues.map((venue, index) => (
              <button
                key={venue.id ?? venue.name}
                type="button"
                className={`hp-hall-card hp-animate hp-animate-d${Math.min(index + 1, 4)}`}
                onClick={() => openVenueDetails(venue)}
              >
                <div className="hp-hall-img-wrap">
                  <img
                    src={getVenueCoverPhoto(venue, index)}
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
                  <p className="hp-hall-cap">
                    {getVenueCategoryLabel(getVenueCategoryValue(venue))} | {getPricingTypeLabel(getPricingTypeValue(venue))}
                  </p>
                  <p className="hp-hall-features">{getVenueSummary(venue)}</p>
                  <p className="hp-hall-price">{getVenuePriceSummary(venue)}</p>
                  <span className="hp-hall-tag">{getVenueBusinessName(venue)}</span>
                  <span className="hp-hall-hint">View details →</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── VENUE MODAL ── */}
        {selectedVenue ? (
          <div className="hp-venue-overlay" onClick={closeVenueDetails}>
            <div className="hp-venue-panel" onClick={(e) => e.stopPropagation()}>
              <div className="hp-venue-panel-head">
                <div>
                  <h3 className="hp-venue-panel-title">{selectedVenue.name || 'Venue Details'}</h3>
                  <p className="hp-venue-panel-subtitle">
                    {getVenueBusinessName(selectedVenue)} | {selectedVenue.city || 'Amman'}
                  </p>
                </div>
                <button type="button" className="hp-venue-close" onClick={closeVenueDetails} aria-label="Close">
                  ✕
                </button>
              </div>

              <div className="hp-venue-body">
                <img
                  src={selectedVenuePhotoSet.coverPhotoUrl || getVenueCoverPhoto(selectedVenue)}
                  alt={selectedVenue.name || 'Venue cover'}
                  className="hp-venue-cover"
                />

                <div className="hp-venue-meta">
                  <span className="hp-venue-chip">👥 Up to {selectedVenue.capacity ?? 0} guests</span>
                  <span className="hp-venue-chip">{getVenueCategoryLabel(getVenueCategoryValue(selectedVenue))}</span>
                  <span className="hp-venue-chip">{getPricingTypeLabel(getPricingTypeValue(selectedVenue))}</span>
                  <span className="hp-venue-chip">{getVenuePriceSummary(selectedVenue)}</span>
                  <span className="hp-venue-chip">📍 {selectedVenue.city || 'Amman'}</span>
                </div>

                <p className="hp-venue-description">{getVenueSummary(selectedVenue)}</p>

                <div className="hp-venue-detail-grid">
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Business</span>
                    <span className="hp-venue-detail-value">{getVenueBusinessName(selectedVenue)}</span>
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
                    <span className="hp-venue-detail-value">{getVenuePriceSummary(selectedVenue)}</span>
                  </div>
                  <div className="hp-venue-detail">
                    <span className="hp-venue-detail-label">Venue Name</span>
                    <span className="hp-venue-detail-value">{selectedVenue.name || '--'}</span>
                  </div>
                </div>

                <div className="hp-booking-panel">
                  <div className="hp-booking-head">
                    <div>
                      <p className="hp-booking-title">Start Booking</p>
                      <p className="hp-booking-copy">
                        Complete the booking inside this dialog step by step, then open My Bookings once everything is submitted.
                      </p>
                    </div>
                  </div>

                  {isBookingUser ? (
                    <>
                      <div className="hp-booking-stepper">
                        {bookingSteps.map((step) => (
                          <div
                            key={step.number}
                            className={`hp-booking-step${bookingStep === step.number ? ' active' : ''}${bookingStep > step.number ? ' done' : ''}`}
                          >
                            <span className="hp-booking-step-num">{step.number}</span>
                            <div className="hp-booking-step-copy">
                              <span className="hp-booking-step-label">{step.label}</span>
                              <span className="hp-booking-step-desc">{step.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {bookingStep === 1 ? (
                        <div className="hp-booking-stage">
                          <div className="hp-booking-stage-head">
                            <p className="hp-booking-stage-title">Step 1: Event Details</p>
                            <p className="hp-booking-stage-copy">
                              Pick the booking date, add the guest count, then choose a slot or manual time range.
                            </p>
                          </div>

                          <div className="hp-booking-grid wide">
                            <div className="hp-booking-field">
                              <label className="hp-booking-label">Date</label>
                              <input
                                className="hp-booking-input"
                                type="date"
                                name="date"
                                value={bookingForm.date}
                                onChange={handleBookingFieldChange}
                              />
                            </div>

                            <div className="hp-booking-field">
                              <label className="hp-booking-label">Guests Count</label>
                              <input
                                className="hp-booking-input"
                                type="number"
                                min="1"
                                name="guestsCount"
                                value={bookingForm.guestsCount}
                                onChange={handleBookingFieldChange}
                              />
                            </div>

                            <div className="hp-booking-field">
                              <label className="hp-booking-label">Selected Price</label>
                              <input
                                className="hp-booking-input"
                                value={
                                  selectedBookingSlot
                                    ? formatVenuePrice(selectedBookingSlot.price)
                                    : estimatedBasePrice !== null
                                      ? formatVenuePrice(estimatedBasePrice)
                                      : selectedVenueTimeSlots.length > 0
                                        ? 'Choose a slot'
                                        : 'Enter time to estimate'
                                }
                                readOnly
                              />
                            </div>

                            {selectedVenueTimeSlots.length === 0 ? (
                              <>
                                <div className="hp-booking-field">
                                  <label className="hp-booking-label">Start Time</label>
                                  <input
                                    className="hp-booking-input"
                                    type="time"
                                    name="startTime"
                                    value={bookingForm.startTime}
                                    onChange={handleBookingFieldChange}
                                  />
                                </div>

                                <div className="hp-booking-field">
                                  <label className="hp-booking-label">End Time</label>
                                  <input
                                    className="hp-booking-input"
                                    type="time"
                                    name="endTime"
                                    value={bookingForm.endTime}
                                    onChange={handleBookingFieldChange}
                                  />
                                </div>
                              </>
                            ) : null}
                          </div>

                          {selectedVenueTimeSlots.length > 0 ? (
                            <div className="hp-booking-slot-list">
                              {selectedVenueTimeSlots.map((slot) => {
                                const isSelected = String(bookingForm.timeSlotId) === String(slot.id)

                                return (
                                  <label
                                    key={slot.id}
                                    className={`hp-booking-slot-card${isSelected ? ' selected' : ''}`}
                                  >
                                    <div className="hp-booking-slot-main">
                                      <input
                                        type="radio"
                                        name="home-time-slot"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleBookingFieldChange({
                                            target: {
                                              name: 'timeSlotId',
                                              value: String(slot.id),
                                            },
                                          })
                                        }
                                      />
                                      <div>
                                        <p className="hp-booking-slot-title">{formatVenueTimeSlot(slot)}</p>
                                        <p className="hp-booking-slot-copy">
                                          Active owner-defined slot available for this booking.
                                        </p>
                                      </div>
                                    </div>
                                    <span className="hp-booking-slot-price">{formatVenuePrice(slot.price)}</span>
                                  </label>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="hp-booking-note">
                              This venue does not have owner-defined slots yet. Use manual start and end times to continue.
                            </div>
                          )}
                        </div>
                      ) : null}

                      {bookingStep === 2 ? (
                        <div className="hp-booking-stage">
                          <div className="hp-booking-stage-head">
                            <p className="hp-booking-stage-title">Step 2: Optional Add-ons</p>
                            <p className="hp-booking-stage-copy">
                              Choose any extra services configured for this venue. These are added on top of the venue booking price.
                            </p>
                          </div>

                          {bookingLoadingOptions ? (
                            <div className="hp-booking-note">
                              Loading available add-ons for this venue...
                            </div>
                          ) : bookingServiceOptions.length > 0 ? (
                            <div className="hp-booking-option-list">
                              {bookingServiceOptions.map((option) => {
                                const isSelected = bookingForm.venueServiceOptionIds.some(
                                  (selectedId) => String(selectedId) === String(option.id),
                                )

                                return (
                                  <label
                                    key={option.id}
                                    className={`hp-booking-option-card${isSelected ? ' selected' : ''}`}
                                  >
                                    <div className="hp-booking-option-main">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleBookingOptionToggle(option.id)}
                                      />
                                      <div>
                                        <p className="hp-booking-option-title">{option.serviceName}</p>
                                        <p className="hp-booking-option-copy">
                                          Optional venue add-on charged on top of the base booking price.
                                        </p>
                                      </div>
                                    </div>
                                    <span className="hp-booking-option-price">
                                      + {formatVenuePrice(option.price)}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="hp-booking-note">
                              This venue does not have configured add-ons yet.
                            </div>
                          )}

                          <div className="hp-booking-summary-grid">
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Base Estimate</span>
                              <span className="hp-booking-summary-value">
                                {estimatedBasePrice === null ? 'Depends on selected time' : formatVenuePrice(estimatedBasePrice)}
                              </span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Add-ons</span>
                              <span className="hp-booking-summary-value">{formatVenuePrice(servicesTotal)}</span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Estimated Total</span>
                              <span className="hp-booking-summary-value">
                                {estimatedTotal === null ? 'Calculated after submit' : formatVenuePrice(estimatedTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {bookingStep === 3 ? (
                        <div className="hp-booking-stage">
                          <div className="hp-booking-stage-head">
                            <p className="hp-booking-stage-title">Step 3: Documents & Review</p>
                            <p className="hp-booking-stage-copy">
                              Upload both ID documents, review your booking summary, then submit from this dialog.
                            </p>
                          </div>

                          <div className="hp-booking-grid">
                            <div className="hp-booking-field">
                              <label className="hp-booking-label">Bride ID Document</label>
                              <input
                                className="hp-booking-input file"
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(event) => handleBookingDocumentChange('bride', event)}
                              />
                              {bookingDocumentNames.bride ? (
                                <span className="hp-booking-file-meta">{bookingDocumentNames.bride}</span>
                              ) : null}
                            </div>

                            <div className="hp-booking-field">
                              <label className="hp-booking-label">Bridegroom ID Document</label>
                              <input
                                className="hp-booking-input file"
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(event) => handleBookingDocumentChange('bridegroom', event)}
                              />
                              {bookingDocumentNames.bridegroom ? (
                                <span className="hp-booking-file-meta">{bookingDocumentNames.bridegroom}</span>
                              ) : null}
                            </div>
                          </div>

                          <div className="hp-booking-review-grid">
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Venue</span>
                              <span className="hp-booking-summary-value">{selectedVenue.name || '--'}</span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Date</span>
                              <span className="hp-booking-summary-value">{formatBookingDate(bookingForm.date)}</span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Guests</span>
                              <span className="hp-booking-summary-value">{bookingForm.guestsCount || '--'} guests</span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Time</span>
                              <span className="hp-booking-summary-value">{selectedBookingTimeLabel}</span>
                            </div>
                          </div>

                          <div className="hp-booking-summary-grid">
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Base Estimate</span>
                              <span className="hp-booking-summary-value">
                                {estimatedBasePrice === null ? 'Depends on selected time' : formatVenuePrice(estimatedBasePrice)}
                              </span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Selected Add-ons</span>
                              <span className="hp-booking-summary-value">
                                {selectedBookingServices.length > 0
                                  ? selectedBookingServices.map((option) => option.serviceName).join(', ')
                                  : 'No add-ons'}
                              </span>
                            </div>
                            <div className="hp-booking-summary-card">
                              <span className="hp-booking-summary-label">Estimated Total</span>
                              <span className="hp-booking-summary-value">
                                {estimatedTotal === null ? 'Calculated after submit' : formatVenuePrice(estimatedTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {bookingStep === 4 ? (
                        <div className="hp-booking-success">
                          <p className="hp-booking-success-title">Booking Submitted</p>
                          <p className="hp-booking-success-copy">
                            Your booking for {selectedVenue.name || 'this venue'} on {formatBookingDate(bookingForm.date)} was created successfully. Open My Bookings to track the status.
                          </p>
                        </div>
                      ) : null}

                      {bookingFeedback.message ? (
                        <div className={`hp-booking-status${bookingFeedback.tone === 'error' ? ' error' : ''}`}>
                          {bookingFeedback.message}
                        </div>
                      ) : null}

                      <div className="hp-booking-actions">
                        {bookingStep === 1 ? (
                          <>
                            <button
                              type="button"
                              className="hp-booking-btn"
                              onClick={startVenueBookingFlow}
                            >
                              Continue to Add-ons
                            </button>
                            <button
                              type="button"
                              className="hp-booking-btn secondary"
                              onClick={closeVenueDetails}
                            >
                              Cancel
                            </button>
                          </>
                        ) : null}

                        {bookingStep === 2 ? (
                          <>
                            <button
                              type="button"
                              className="hp-booking-btn"
                              onClick={() => goToBookingStep(3)}
                            >
                              Continue to Review
                            </button>
                            <button
                              type="button"
                              className="hp-booking-btn secondary"
                              onClick={() => setBookingStep(1)}
                            >
                              Back
                            </button>
                          </>
                        ) : null}

                        {bookingStep === 3 ? (
                          <>
                            <button
                              type="button"
                              className="hp-booking-btn"
                              onClick={submitVenueBooking}
                              disabled={bookingSubmitting}
                            >
                              {bookingSubmitting ? 'Submitting...' : 'Submit Booking'}
                            </button>
                            <button
                              type="button"
                              className="hp-booking-btn secondary"
                              onClick={() => setBookingStep(2)}
                              disabled={bookingSubmitting}
                            >
                              Back
                            </button>
                          </>
                        ) : null}

                        {bookingStep === 4 ? (
                          <>
                            <button
                              type="button"
                              className="hp-booking-btn"
                              onClick={() => {
                                closeVenueDetails()
                                onNavigate('bookings')
                              }}
                            >
                              Open My Bookings
                            </button>
                            <button
                              type="button"
                              className="hp-booking-btn secondary"
                              onClick={closeVenueDetails}
                            >
                              Close
                            </button>
                          </>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="hp-booking-stage">
                        <div className="hp-booking-stage-head">
                          <p className="hp-booking-stage-title">Choose Date & Time</p>
                          <p className="hp-booking-stage-copy">
                            Pick the booking date and slot here. After login with a user account, the rest of the flow will continue.
                          </p>
                        </div>

                        <div className="hp-booking-grid">
                          <div className="hp-booking-field">
                            <label className="hp-booking-label">Date</label>
                            <input
                              className="hp-booking-input"
                              type="date"
                              name="date"
                              value={bookingForm.date}
                              onChange={handleBookingFieldChange}
                            />
                          </div>

                          <div className="hp-booking-field">
                            <label className="hp-booking-label">Selected Price</label>
                            <input
                              className="hp-booking-input"
                              value={
                                selectedBookingSlot
                                  ? formatVenuePrice(selectedBookingSlot.price)
                                  : selectedVenueTimeSlots.length > 0
                                    ? 'Choose a slot'
                                    : 'Continue after login'
                              }
                              readOnly
                            />
                          </div>
                        </div>

                        {selectedVenueTimeSlots.length > 0 ? (
                          <div className="hp-booking-slot-list">
                            {selectedVenueTimeSlots.map((slot) => {
                              const isSelected = String(bookingForm.timeSlotId) === String(slot.id)

                              return (
                                <label
                                  key={slot.id}
                                  className={`hp-booking-slot-card${isSelected ? ' selected' : ''}`}
                                >
                                  <div className="hp-booking-slot-main">
                                    <input
                                      type="radio"
                                      name="home-time-slot"
                                      checked={isSelected}
                                      onChange={() =>
                                        handleBookingFieldChange({
                                          target: {
                                            name: 'timeSlotId',
                                            value: String(slot.id),
                                          },
                                        })
                                      }
                                    />
                                    <div>
                                      <p className="hp-booking-slot-title">{formatVenueTimeSlot(slot)}</p>
                                      <p className="hp-booking-slot-copy">
                                        Active owner-defined slot prepared for direct booking.
                                      </p>
                                    </div>
                                  </div>
                                  <span className="hp-booking-slot-price">{formatVenuePrice(slot.price)}</span>
                                </label>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="hp-booking-note">
                            Manual time selection will continue after login from the booking page.
                          </div>
                        )}
                      </div>

                      <div className={`hp-booking-status${session ? '' : ' error'}`}>
                        {session
                          ? 'Bookings can only be completed from user accounts. Switch account to continue.'
                          : 'Log in with a user account to continue the booking flow.'}
                      </div>

                      {bookingFeedback.message ? (
                        <div className={`hp-booking-status${bookingFeedback.tone === 'error' ? ' error' : ''}`}>
                          {bookingFeedback.message}
                        </div>
                      ) : null}

                      <div className="hp-booking-actions">
                        <button
                          type="button"
                          className="hp-booking-btn"
                          onClick={startVenueBookingFlow}
                        >
                          {session ? 'Switch Account to Book' : 'Log In to Continue'}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {selectedVenuePhotoSet.galleryPhotoUrls.length > 0 ? (
                  <>
                    <p className="hp-venue-gallery-title">Additional Photos</p>
                    <div className="hp-venue-gallery">
                      {selectedVenuePhotoSet.galleryPhotoUrls.map((photoUrl, index) => (
                        <img
                          key={`${selectedVenue.id ?? selectedVenue.name ?? 'venue'}-${index}`}
                          src={photoUrl}
                          alt={`${selectedVenue.name || 'Venue'} photo ${index + 2}`}
                          className="hp-venue-gallery-item"
                        />
                      ))}
                    </div>
                  </>
                ) : null}
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
                Register Your Business
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
        <div className="hp-wave" style={{ background: '#f8f7ff' }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,36 C360,0 1080,72 1440,36 L1440,72 L0,72 Z" fill="#ffffff" />
          </svg>
        </div>

        <section id="about" className="hp-section">
          <div className="hp-about-grid">
            <div>
              <span className="hp-section-tag hp-animate">About Eventes</span>
              <h2 className="hp-section-title hp-animate-left hp-animate-d1">
                A Smarter Way To <br /><strong>Manage Events</strong>
              </h2>
              <p className="hp-section-lead hp-animate hp-animate-d2">
                Eventes simplifies every step of the event journey from discovering the
                right venue to reviewing registrations in one connected platform.
              </p>

              <div className="hp-about-features">
                {[
                  {
                    title: 'Easy Venue Discovery',
                    desc: 'Browse venues by city, guest capacity, and type in one clean interface.',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4f46e5" strokeWidth="1.6">
                        <path d="M10 2L18 6.5v7L10 18l-8-4.5v-7L10 2z" strokeLinejoin="round" />
                      </svg>
                    ),
                    delay: 'd2',
                  },
                  {
                    title: 'Optional Venue Add-ons',
                    desc: 'Businesses can configure optional services that users select during booking.',
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#f43f5e" strokeWidth="1.6">
                        <path d="M5 10h10M10 5v10" strokeLinecap="round" />
                        <rect x="2.5" y="2.5" width="15" height="15" rx="3" />
                      </svg>
                    ),
                    delay: 'd3',
                  },
                  {
                    title: 'Organized Admin Control',
                    desc: 'Admins review requests, approve businesses, and keep data structured.',
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

            <div className="hp-about-img-wrap hp-animate-right hp-animate-d2">
              <img
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
                alt="Event planning"
                className="hp-about-img"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="hp-about-img-overlay" />

              {false && <div className="hp-about-chip chip-1">
              <div className="hp-float-label">Active Venues</div>
              <div className="hp-float-value">{venues.length}+ Listings</div>
              </div>}

              {false && <div className="hp-about-chip chip-2">
                <div className="hp-float-label">Verified</div>
                <div className="hp-float-value">Business Network</div>
              </div>}
            </div>
          </div>
        </section>

        <footer className="hp-footer">
          <span className="hp-footer-brand">Eventes</span>
          <div className="hp-footer-links">
            {navLinks.map((link) => (
              <button key={link.id} className="hp-footer-link" onClick={() => scrollTo(link.id)}>
                {link.label}
              </button>
            ))}
            <button className="hp-footer-link" onClick={() => onNavigate('add-hall')}>Register Business</button>
          </div>
          <span className="hp-footer-copy">© 2026 Eventes. All rights reserved.</span>
        </footer>

      </div>
    </>
  )
}

export default HomePage

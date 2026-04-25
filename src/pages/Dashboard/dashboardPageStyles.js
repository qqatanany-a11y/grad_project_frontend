export function makeDashStyles(p) {
  return `
    @keyframes ${p}FadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ${p}FadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .${p}-toolbar, .${p}-inline {
      display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem;
      animation: ${p}FadeIn 0.4s ease both;
    }

    .${p}-input, .${p}-select, .${p}-textarea {
      border: 2px solid #e2e8f0; background: #fff; color: #1e1b4b;
      font: inherit; font-family: 'Inter', sans-serif; box-sizing: border-box;
      border-radius: 10px; outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .${p}-input, .${p}-select { height: 2.75rem; padding: 0 0.85rem; }
    .${p}-textarea { min-height: 5rem; padding: 0.8rem 0.85rem; resize: vertical; }
    .${p}-search { flex: 1; min-width: 240px; }
    .${p}-input:focus, .${p}-select:focus, .${p}-textarea:focus {
      border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
    }

    .${p}-button {
      height: 2.75rem; padding: 0 1.25rem;
      background: linear-gradient(135deg, #4f46e5, #3730a3);
      color: #fff; border: none; border-radius: 10px;
      font: inherit; font-weight: 700; font-size: 0.875rem;
      cursor: pointer; white-space: nowrap;
      box-shadow: 0 4px 14px rgba(79,70,229,0.3);
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    }
    .${p}-button:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(79,70,229,0.42); }
    .${p}-button:active { transform: translateY(0); }
    .${p}-button:disabled { opacity: 0.5; cursor: wait; transform: none; }
    .${p}-button.secondary {
      background: rgba(79,70,229,0.08); color: #4f46e5;
      border: 1.5px solid rgba(79,70,229,0.22); box-shadow: none;
    }
    .${p}-button.secondary:hover { background: rgba(79,70,229,0.14); transform: translateY(-1px); }
    .${p}-button.danger {
      background: linear-gradient(135deg, #f43f5e, #be123c);
      box-shadow: 0 4px 14px rgba(244,63,94,0.3);
    }
    .${p}-button.danger:hover { box-shadow: 0 8px 22px rgba(244,63,94,0.42); }

    .${p}-status {
      margin-bottom: 1rem; padding: 0.875rem 1.1rem;
      border: 1.5px solid rgba(79,70,229,0.2);
      background: rgba(79,70,229,0.06); color: #4338ca;
      border-radius: 12px; font-size: 0.875rem; font-weight: 500;
      animation: ${p}FadeIn 0.3s ease both;
    }
    .${p}-status.error {
      border-color: rgba(244,63,94,0.25); background: rgba(244,63,94,0.07); color: #be123c;
    }

    .${p}-panel {
      margin-bottom: 1.25rem; padding: 1.5rem;
      border: 1.5px solid rgba(79,70,229,0.14);
      background: #fff; border-radius: 16px;
      box-shadow: 0 4px 24px rgba(79,70,229,0.08);
      animation: ${p}FadeUp 0.35s ease both;
    }
    .${p}-panel-title {
      margin: 0 0 1.25rem; font-size: 1rem; font-weight: 800;
      color: #1e1b4b; letter-spacing: -0.02em;
    }

    .${p}-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem; }
    .${p}-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem; }
    .${p}-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }

    .${p}-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .${p}-label {
      font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase; color: #64748b;
    }

    .${p}-actions { display: flex; gap: 0.7rem; margin-top: 1.25rem; flex-wrap: wrap; }

    .${p}-cards {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(290px,1fr)); gap: 1.25rem;
    }

    .${p}-card {
      padding: 1.5rem; border: 1.5px solid #e2e8f0;
      background: #fff; border-radius: 16px;
      box-shadow: 0 4px 16px rgba(79,70,229,0.07);
      transition: box-shadow 0.2s, transform 0.2s;
      animation: ${p}FadeUp 0.4s ease both;
    }
    .${p}-card:hover { box-shadow: 0 12px 36px rgba(79,70,229,0.15); transform: translateY(-3px); }
    .${p}-card-title {
      margin: 0 0 0.4rem; font-size: 1rem; font-weight: 800;
      color: #1e1b4b; letter-spacing: -0.02em;
    }
    .${p}-card-copy { margin: 0 0 0.75rem; color: #64748b; line-height: 1.6; font-size: 0.875rem; }
    .${p}-card-actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }

    .${p}-chip {
      display: inline-flex; align-items: center;
      padding: 0.25rem 0.7rem; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700;
      background: rgba(79,70,229,0.08); color: #4f46e5;
      margin-right: 0.4rem; margin-bottom: 0.4rem;
      border: 1px solid rgba(79,70,229,0.16);
    }
    .${p}-chip.active { background: rgba(22,163,74,0.1); color: #15803d; border-color: rgba(22,163,74,0.22); }
    .${p}-chip.inactive { background: rgba(244,63,94,0.08); color: #be123c; border-color: rgba(244,63,94,0.2); }

    .${p}-table {
      border: 1.5px solid #e2e8f0; background: #fff;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 16px rgba(79,70,229,0.07);
      animation: ${p}FadeUp 0.4s ease both;
    }
    .${p}-row {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr 160px;
      gap: 1rem; align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;
    }
    .${p}-row:last-child { border-bottom: none; }
    .${p}-row:not(.header):hover { background: rgba(79,70,229,0.03); }
    .${p}-row.header { background: #f8f7ff; padding: 0.7rem 1.25rem; }
    .${p}-label-row {
      margin: 0; font-size: 0.65rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8;
    }
    .${p}-main { margin: 0 0 0.2rem; font-size: 0.9rem; font-weight: 700; color: #1e1b4b; }
    .${p}-copy { margin: 0; font-size: 0.82rem; color: #64748b; }

    .${p}-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 88px; padding: 0.28rem 0.75rem; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700;
      background: rgba(79,70,229,0.08); color: #4f46e5;
      border: 1px solid rgba(79,70,229,0.16);
    }
    .${p}-badge.pending { background: rgba(245,158,11,0.1); color: #b45309; border-color: rgba(245,158,11,0.22); }
    .${p}-badge.confirmed, .${p}-badge.approved {
      background: rgba(22,163,74,0.1); color: #15803d; border-color: rgba(22,163,74,0.22);
    }
    .${p}-badge.rejected { background: rgba(244,63,94,0.08); color: #be123c; border-color: rgba(244,63,94,0.2); }

    .${p}-inline-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }

    .${p}-empty {
      padding: 3rem 1rem; text-align: center; color: #94a3b8;
      border: 2px dashed rgba(79,70,229,0.16);
      background: rgba(79,70,229,0.03); border-radius: 16px;
      font-size: 0.9rem; font-weight: 500;
      animation: ${p}FadeIn 0.4s ease both;
    }

    @media (max-width: 760px) {
      .${p}-grid, .${p}-grid-2, .${p}-grid-3 { grid-template-columns: 1fr; }
      .${p}-row { grid-template-columns: 1fr; }
      .${p}-row.header { display: none; }
    }
  `
}

const authPageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  @keyframes maSlideLeft {
    from { opacity: 0; transform: translateX(-28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes maSlideRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .ma-page {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background: #ffffff;
    font-family: 'Inter', sans-serif;
    color: #1e1b4b;
  }

  .ma-image-panel {
    display: none;
    position: relative;
    width: 50%;
    flex-shrink: 0;
    animation: maSlideLeft 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @media (min-width: 1024px) {
    .ma-image-panel { display: block; }
  }

  .ma-image-panel img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ma-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(79,70,229,0.3) 0%, rgba(30,27,75,0.75) 100%);
    z-index: 1;
  }

  .ma-image-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 3rem;
    color: #fff;
  }

  .ma-image-text h1 {
    font-size: clamp(2rem, 3vw, 2.75rem);
    font-weight: 900;
    letter-spacing: -0.03em;
    margin: 0 0 0.75rem;
    line-height: 1.1;
    color: #fff;
  }

  .ma-image-text p {
    font-size: 1rem;
    font-weight: 400;
    color: rgba(255,255,255,0.8);
    margin: 0;
    max-width: 380px;
    line-height: 1.7;
  }

  .ma-form-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 2rem;
    background: #ffffff;
    animation: maSlideRight 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @media (min-width: 1024px) {
    .ma-form-panel { padding: 3rem 5rem; }
  }

  .ma-form-inner {
    width: 100%;
    max-width: 448px;
    margin: 0 auto;
  }

  .ma-form-header {
    margin-bottom: 2.5rem;
  }

  .ma-form-header h2 {
    font-size: 2.25rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
    color: #1e1b4b;
  }

  .ma-form-header p {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 400;
    margin: 0;
  }

  .ma-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .ma-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .ma-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .ma-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #64748b;
  }

  .ma-input {
    width: 100%;
    height: 3rem;
    padding: 0 0.875rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    font-size: 0.9rem;
    color: #1e1b4b;
    font-family: inherit;
    font-weight: 500;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
  }

  .ma-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.12);
  }

  .ma-input[aria-invalid='true'] {
    border-color: #f43f5e;
    box-shadow: 0 0 0 4px rgba(244,63,94,0.1);
  }

  .ma-error {
    font-size: 0.75rem;
    color: #f43f5e;
    margin: 0;
    font-weight: 500;
  }

  .ma-submit {
    width: 100%;
    height: 3.25rem;
    background: linear-gradient(135deg, #4f46e5, #3730a3);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(79,70,229,0.38);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 0.25rem;
  }

  .ma-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(79,70,229,0.48);
  }

  .ma-submit:active {
    transform: translateY(0);
  }

  .ma-submit:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 3px;
  }

  .ma-submit:disabled {
    opacity: 0.55;
    cursor: wait;
    transform: none;
  }

  .ma-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
    margin-bottom: 2rem;
    transition: color 0.15s;
  }

  .ma-back-btn:hover {
    color: #4f46e5;
  }

  .ma-toggle-wrap {
    margin-top: 2rem;
    text-align: center;
  }

  .ma-toggle-btn {
    background: none;
    border: none;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4f46e5;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    padding: 0;
    transition: color 0.15s;
  }

  .ma-toggle-btn:hover {
    color: #3730a3;
  }

  .ma-lang {
    position: fixed;
    top: 1rem;
    right: auto;
    inset-inline-end: 1rem;
    z-index: 5;
  }
`

export default authPageStyles

function OverlayPanel({ side, title, description, buttonLabel, onClick }) {
  return (
    <div className={`overlay-panel ${side}`}>
      <h1>{title}</h1>
      <p>{description}</p>
      <button type="button" className="ghost" onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  )
}

export default OverlayPanel

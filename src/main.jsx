import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowUpRight, Command, Maximize2, Sparkles } from 'lucide-react'
import './styles.css'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState(false)
  return <main className="workspace">
    <header className="topbar">
      <div className="brand">
        <div className="brand-image"><img src="/Lenstore.jpg" alt="Lenstore" onError={e => {e.currentTarget.style.display='none'; e.currentTarget.parentElement.classList.add('fallback')}}/><span>LS</span></div>
        <div><div className="brand-name">LENSTORE<span className="brand-dot">.</span></div><div className="brand-caption">MANAGEMENT WORKSPACE</div></div>
      </div>
      <div className="top-center"><span className="live-dot"/><span>WORKSPACE ACTIVE</span><i/> <span className="subtle">ADMIN CONSOLE</span></div>
      <div className="top-actions"><span className="version"><Sparkles size={13}/> PREMIUM INTERFACE</span><button className="icon-button" title="Buka aplikasi layar penuh" onClick={()=>setExpanded(v=>!v)}><Maximize2 size={16}/></button></div>
    </header>
    <section className={`app-frame ${expanded?'expanded':''}`}>
      <div className="frame-heading"><div><span className="eyebrow">CONTROL CENTER</span><h1>Workspace overview</h1><p>Semua operasional Lenstore dalam satu ruang kerja.</p></div><div className="frame-meta"><span><Activity size={14}/> Live dashboard</span><ArrowUpRight size={16}/></div></div>
      <div className="legacy-wrap">
        <iframe title="Lenstore Management Dashboard" src="/legacy.html" onLoad={()=>setLoaded(true)} />
        {!loaded && <div className="loading"><div className="loader"/><span>Menyiapkan workspace Lenstore…</span></div>}
      </div>
    </section>
    <footer><span><Command size={12}/> LENSTORE WORKSPACE</span><span>Designed for clarity · Built for daily operations</span></footer>
  </main>
}
createRoot(document.getElementById('root')).render(<App />)

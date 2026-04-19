import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Download, ChevronDown, ChevronUp, ArrowLeft, MessageSquare, Columns } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_ANALYSIS, RISK_COLORS } from '../../utils/mockData';
import './AnalysisPage.css';

const RISK_ICON = {
  safe: '✓',
  caution: '⚠',
  unsafe: '✕',
};

function ScoreRing({ score, size = 120 }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score / 100);
  const color = score >= 80 ? 'var(--safe)' : score >= 55 ? 'var(--caution)' : 'var(--unsafe)';
  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color}
          strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="score-ring__value" style={{ color }}>{score}</div>
    </div>
  );
}

function ClauseCard({ clause, index }) {
  const [open, setOpen] = useState(index < 3);
  const [showOriginal, setShowOriginal] = useState(false);
  const ref = useRef(null);
  const colors = RISK_COLORS[clause.risk];

  const scrollTo = () => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={ref}
      className={`clause-card clause-card--${clause.risk} ${open ? 'clause-card--open' : ''}`}
      style={{ '--risk-border': colors.border, '--risk-bg': colors.bg, '--risk-text': colors.text }}
    >
      <button className="clause-card__header" onClick={() => { setOpen(o => !o); if (!open) scrollTo(); }}>
        <div className="clause-card__meta">
          <span className={`clause-badge clause-badge--${clause.risk}`}>
            {RISK_ICON[clause.risk]} {colors.label}
          </span>
          <span className="clause-card__number">§ {clause.number}</span>
        </div>
        <div className="clause-card__title-row">
          <h3 className="clause-card__title">{clause.title}</h3>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="clause-card__body">
          <div className="clause-card__toggle">
            <button
              className={`toggle-btn ${!showOriginal ? 'toggle-btn--active' : ''}`}
              onClick={() => setShowOriginal(false)}
            >
              Plain English
            </button>
            <button
              className={`toggle-btn ${showOriginal ? 'toggle-btn--active' : ''}`}
              onClick={() => setShowOriginal(true)}
            >
              Original Text
            </button>
          </div>

          {showOriginal ? (
            <div className="clause-card__original">
              <p>{clause.originalText}</p>
            </div>
          ) : (
            <div className="clause-card__plain">
              <p>{clause.plainEnglish}</p>
            </div>
          )}

          {clause.legalNote && (
            <div className={`clause-card__legal-note clause-card__legal-note--${clause.risk}`}>
              <div className="legal-note__label">⚖ Legal Note</div>
              <p>{clause.legalNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { analysisResult } = useApp();
  const result = analysisResult || MOCK_ANALYSIS;
  const [filter, setFilter] = useState('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hi! I've analyzed your contract. Ask me anything about it — I'll give you a straight answer in plain English." }
  ]);
  const [chatInput, setChatInput] = useState('');

  const filteredClauses = result.clauses.filter(c => filter === 'all' || c.risk === filter);

  const verdictConfig = {
    safe: { color: 'var(--safe)', bg: 'var(--safe-bg)', label: '✓ All Clear' },
    caution: { color: 'var(--caution)', bg: 'var(--caution-bg)', label: '⚠ Needs Attention' },
    unsafe: { color: 'var(--unsafe)', bg: 'var(--unsafe-bg)', label: '✕ High Risk' },
  }[result.verdictColor] || {};

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(m => [...m, { role: 'user', text: userMsg }]);
    setTimeout(() => {
      setChatMessages(m => [...m, {
        role: 'assistant',
        text: "That's a great question about your contract. Based on my analysis, this clause appears to be one of the more concerning aspects of the agreement. I recommend consulting with an employment attorney before signing. Would you like me to explain any other clause?"
      }]);
    }, 1200);
  };

  return (
    <div className="analysis-page">
      <div className="analysis-page__inner">
        {/* Breadcrumb */}
        <div className="analysis-breadcrumb">
          <button className="analysis-back" onClick={() => navigate('/documents')}>
            <ArrowLeft size={16} /> My Documents
          </button>
          <span className="analysis-breadcrumb__sep">›</span>
          <span>Analysis</span>
        </div>

        {/* Doc header */}
        <div className="analysis-doc-header">
          <div>
            <span className="analysis-type-badge">{result.contractType?.toUpperCase() || 'EMPLOYMENT'}</span>
            <h1 className="analysis-doc-title">{result.documentName}</h1>
            <span className="analysis-doc-meta">Scanned just now</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/analysis/side-by-side" className="btn-export" style={{ textDecoration: 'none' }}>
              <Columns size={16} />
              Side-by-Side
            </Link>
            <button className="btn-export" onClick={() => alert('Export feature — connect your PDF generation backend here')}>
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="analysis-summary">
          <div className="verdict-card">
            <div className="verdict-card__label">Safety Verdict</div>
            <ScoreRing score={result.safetyScore} size={110} />
            <div className="verdict-badge" style={{ background: verdictConfig.bg, color: verdictConfig.color }}>
              {verdictConfig.label}
            </div>
            <p className="verdict-card__desc">{result.summary}</p>
          </div>

          <div className="stat-cards">
            <div className="stat-card stat-card--safe">
              <div className="stat-card__icon">✓</div>
              <div className="stat-card__info">
                <div className="stat-card__label">Safe</div>
                <div className="stat-card__desc">Clauses identified as standard and low-risk.</div>
                <div className="stat-card__value">{result.stats.safe.toString().padStart(2, '0')}</div>
              </div>
            </div>
            <div className="stat-card stat-card--caution">
              <div className="stat-card__icon">⚠</div>
              <div className="stat-card__info">
                <div className="stat-card__label">Caution</div>
                <div className="stat-card__desc">Clauses requiring your careful review.</div>
                <div className="stat-card__value">{result.stats.caution.toString().padStart(2, '0')}</div>
              </div>
            </div>
            <div className="stat-card stat-card--unsafe">
              <div className="stat-card__icon">✕</div>
              <div className="stat-card__info">
                <div className="stat-card__label">Unsafe</div>
                <div className="stat-card__desc">Critical red flags detected in legal text.</div>
                <div className="stat-card__value">{result.stats.unsafe.toString().padStart(2, '0')}</div>
              </div>
            </div>
            <div className="analysis-dive-card">
              <div className="analysis-dive-card__title">Ready for a Deep Dive?</div>
              <p className="analysis-dive-card__desc">Our AI has mapped every paragraph. Use the chat below to understand the impact of every word.</p>
              <button className="btn-chat" onClick={() => setChatOpen(true)}>
                <MessageSquare size={16} />
                Ask AI Lawyer
              </button>
            </div>
          </div>
        </div>

        {/* Clause list */}
        <div className="clauses-section">
          <div className="clauses-section__header">
            <div>
              <h2 className="clauses-section__title">Clause-by-Clause Analysis</h2>
              <p className="clauses-section__sub">Click any clause to expand the full explanation</p>
            </div>
            <div className="clause-filter">
              {['all', 'unsafe', 'caution', 'safe'].map(f => (
                <button
                  key={f}
                  className={`clause-filter__btn clause-filter__btn--${f} ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="clause-filter__count">
                    {f === 'all' ? result.clauses.length : result.clauses.filter(c => c.risk === f).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="clauses-list">
            {filteredClauses.map((clause, i) => (
              <ClauseCard key={clause.id} clause={clause} index={i} />
            ))}
          </div>
        </div>

        {/* Chat overlay */}
        {chatOpen && (
          <div className="chat-overlay" onClick={(e) => e.target === e.currentTarget && setChatOpen(false)}>
            <div className="chat-modal">
              <div className="chat-modal__header">
                <div>
                  <div className="chat-modal__title">Ask AI Lawyer</div>
                  <div className="chat-modal__sub">Have a specific question about this contract?</div>
                </div>
                <button className="chat-modal__close" onClick={() => setChatOpen(false)}>✕</button>
              </div>
              <div className="chat-messages">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`chat-message chat-message--${m.role}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="Ask a question about this contract…"
                />
                <button className="chat-send" onClick={handleChat}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

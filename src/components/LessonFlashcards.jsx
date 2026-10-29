import { useState } from 'react';

/**
 * Bộ thẻ ghi nhớ lật mặt (Flashcards) giúp học Sử siêu nhanh và nhớ dai.
 * cards: [{ q: 'Câu hỏi / Sự kiện', a: 'Đáp án / Mốc thời gian', hint?: 'Gợi ý' }]
 */
export default function LessonFlashcards({ cards = [] }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());

  if (!cards || cards.length === 0) return null;

  const card = cards[current];
  const isDone = mastered.has(current);

  const next = () => {
    setFlipped(false);
    setCurrent((c) => (c + 1) % cards.length);
  };

  const prev = () => {
    setFlipped(false);
    setCurrent((c) => (c - 1 + cards.length) % cards.length);
  };

  const toggleMastered = () => {
    setMastered((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(current)) nextSet.delete(current);
      else nextSet.add(current);
      return nextSet;
    });
  };

  return (
    <div className="flashcards-widget">
      <div className="fc-header">
        <div className="row">
          <span className="fc-icon">🃏</span>
          <div>
            <b>Thẻ ghi nhớ nhanh (Active Recall)</b>
            <div className="small muted">
              Thẻ {current + 1}/{cards.length} · Đã thuộc {mastered.size}/{cards.length} thẻ 💕
            </div>
          </div>
        </div>
        <button
          className={`btn sm ${isDone ? 'primary' : 'ghost'}`}
          onClick={toggleMastered}
          title="Đánh dấu đã thuộc"
        >
          {isDone ? '✅ Đã thuộc' : '⚪ Chưa thuộc'}
        </button>
      </div>

      <div className={`fc-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        <div className="fc-inner">
          <div className="fc-front">
            <span className="fc-tag">❓ CÂU HỎI</span>
            <p className="fc-text">{card.q}</p>
            {card.hint && <small className="fc-hint">💡 Gợi ý: {card.hint}</small>}
            <span className="fc-flip-tip">Chạm để lật đáp án 👆</span>
          </div>
          <div className="fc-back">
            <span className="fc-tag ans">✨ ĐÁP ÁN</span>
            <p className="fc-text">{card.a}</p>
            <span className="fc-flip-tip">Chạm để quay lại 👆</span>
          </div>
        </div>
      </div>

      <div className="fc-controls">
        <button className="btn sm ghost" onClick={prev}>
          ← Câu trước
        </button>
        <div className="fc-dots">
          {cards.map((_, idx) => (
            <span
              key={idx}
              className={`fc-dot ${idx === current ? 'active' : ''} ${mastered.has(idx) ? 'done' : ''}`}
              onClick={() => {
                setFlipped(false);
                setCurrent(idx);
              }}
            />
          ))}
        </div>
        <button className="btn sm primary" onClick={next}>
          Câu tiếp →
        </button>
      </div>
    </div>
  );
}

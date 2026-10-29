import { useState } from 'react';

/**
 * Rose Milk Editorial Folio — Active Recall Strip
 * Liền khối, tinh giản, không emoji trẻ con.
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
    <div className="folio-recall-strip">
      <div className="recall-header">
        <div className="recall-lead">
          <span className="idx-badge">{current + 1}</span>
          <div>
            <h4 className="recall-title">Ghi nhớ trọng tâm · Active Recall</h4>
            <div className="small muted">
              Thẻ {current + 1} trên {cards.length} · Đã ghi nhớ {mastered.size}/{cards.length}
            </div>
          </div>
        </div>
        <button
          className={`ios-btn sm ${isDone ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
          onClick={toggleMastered}
        >
          {isDone ? 'Đã ghi nhớ' : 'Chưa thuộc'}
        </button>
      </div>

      <div
        className={`recall-card-box ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="recall-card-inner">
          <div className="recall-front">
            <span className="recall-tag">TRỌNG TÂM CÂU HỎI</span>
            <p className="recall-question-text">{card.q}</p>
            {card.hint && (
              <div style={{ marginTop: '12px' }}>
                <span className="hint-chip">
                  <span>Mốc định hướng:</span>
                  <b>{card.hint}</b>
                </span>
              </div>
            )}
            <span className="recall-tip">Chạm mặt thẻ để lật đáp án</span>
          </div>

          <div className="recall-back">
            <span className="recall-tag ans">NỘI DUNG ĐÁP ÁN</span>
            <p className="recall-question-text">{card.a}</p>
            <span className="recall-tip">Chạm mặt thẻ để quay lại</span>
          </div>
        </div>
      </div>

      <div className="recall-nav">
        <button className="ios-btn sm ios-btn-secondary" onClick={prev}>
          ← Câu trước
        </button>
        <div className="recall-dots">
          {cards.map((_, idx) => (
            <span
              key={idx}
              className={`recall-dot ${idx === current ? 'active' : ''} ${mastered.has(idx) ? 'done' : ''}`}
              onClick={() => {
                setFlipped(false);
                setCurrent(idx);
              }}
            />
          ))}
        </div>
        <button className="ios-btn sm ios-btn-primary" onClick={next}>
          Câu tiếp theo →
        </button>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { STATUS_LABEL, KIND_LABEL, dueText } from '../lib/format';

export function Crumbs({ items }) {
  return (
    <div className="crumbs">
      <Link to="/">Trang chủ</Link>
      {items.filter(Boolean).map((it, i) => (
        <span key={i}>
          <span className="sep">›</span>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <b>{it.label}</b>}
        </span>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  if (!status) return <span className="badge todo">Chưa làm</span>;
  return <span className={`badge ${status}`}>{STATUS_LABEL[status] || status}</span>;
}

export function KindBadge({ kind }) {
  return <span className={`badge kind-${kind}`}>{KIND_LABEL[kind] || kind}</span>;
}

export function DueBadge({ due }) {
  if (!due) return null;
  const late = new Date(due) < new Date();
  return <span className={`badge ${late ? 'late' : 'due'}`}>{dueText(due)}</span>;
}

export function Loading() {
  return <div className="empty">Đang tải dữ liệu…</div>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="error">{error}</div>;
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Hearts({ n }) {
  if (!n) return null;
  return <span className="badge" style={{ background: '#FFE4E8', color: '#BE123C', borderColor: '#FECDD6' }}>+{n} điểm thưởng</span>;
}

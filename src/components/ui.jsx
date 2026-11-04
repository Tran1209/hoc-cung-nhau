import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { STATUS_LABEL, KIND_LABEL, dueText } from '../lib/format';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="card" style={{ padding: '24px', margin: '16px 0', borderColor: '#FECDD6', background: '#FFF5F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>⚠️</span>
            <div>
              <h3 style={{ margin: 0, color: '#BE123C', fontSize: '18px', fontWeight: 700 }}>
                {this.props.title || 'Tạm thời không thể hiển thị nội dung này'}
              </h3>
              <p style={{ margin: '4px 0 0', color: '#881337', fontSize: '14px' }}>
                Đã xảy ra sự cố khi hiển thị phần này. Các phần khác của bài học vẫn hoạt động bình thường.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ios-btn sm ios-btn-primary"
              onClick={this.handleReset}
            >
              🔄 Thử tải lại phần này
            </button>
            <button
              type="button"
              className="ios-btn sm ios-btn-secondary"
              onClick={() => window.location.reload()}
            >
              Tải lại trang web
            </button>
          </div>

          {this.state.error && (
            <details style={{ marginTop: '16px', fontSize: '12px', color: '#9F1239' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Chi tiết kỹ thuật</summary>
              <pre style={{ marginTop: '8px', padding: '12px', background: '#FFF', borderRadius: '8px', border: '1px solid #FECDD6', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

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

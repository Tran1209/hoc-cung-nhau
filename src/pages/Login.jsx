import { useState } from 'react';
import { data } from '../data';
import { IS_CLOUD } from '../config';

export default function Login() {
  const [tab, setTab] = useState('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (!IS_CLOUD) {
    return (
      <div className="login-wrap">
        <div className="folio-sheet login" style={{ maxWidth: '420px', padding: '36px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <span className="brand-dot" style={{ width: '14px', height: '14px' }} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Học Cùng Nhau</h1>
          <p className="muted" style={{ marginBottom: '24px' }}>Không gian học tập chuẩn Rose Milk Editorial Folio</p>
          <div className="stack" style={{ gap: '12px' }}>
            <button className="ios-btn ios-btn-primary big" onClick={() => data.auth.signInDemo('teacher')}>
              Vào với vai trò <b>Anh</b> (Quản lý)
            </button>
            <button className="ios-btn ios-btn-secondary big" onClick={() => data.auth.signInDemo('student')}>
              Vào với vai trò <b>Em</b> (Học viên)
            </button>
          </div>
          <p className="small muted" style={{ marginTop: '20px' }}>
            Chế độ DEMO cục bộ. Cấu hình Supabase theo tài liệu khi cần đồng bộ dữ liệu giữa 2 thiết bị.
          </p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      if (tab === 'in') {
        await data.auth.signIn(email.trim(), password);
      } else {
        const r = await data.auth.signUp(email.trim(), password, name.trim());
        if (r.needConfirm) setMsg('Đã tạo tài khoản! Mở email để xác nhận rồi đăng nhập nhé.');
      }
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="folio-sheet login" onSubmit={submit} style={{ maxWidth: '420px', padding: '36px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <span className="brand-dot" style={{ width: '14px', height: '14px' }} />
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Học Cùng Nhau</h1>
        <div className="tabs">
          <button type="button" className={tab === 'in' ? 'on' : ''} onClick={() => setTab('in')}>Đăng nhập</button>
          <button type="button" className={tab === 'up' ? 'on' : ''} onClick={() => setTab('up')}>Tạo tài khoản</button>
        </div>
        {tab === 'up' && (
          <>
            <p className="small muted">
              Người tạo tài khoản <b>đầu tiên</b> là người quản lý (anh), người <b>thứ hai</b> là học viên (em).
              Web chỉ cho phép đúng 2 tài khoản.
            </p>
            <label className="field">
              <span>Tên hiển thị</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Anh / Em / biệt danh…" required />
            </label>
          </>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={tab === 'in' ? 'current-password' : 'new-password'}
          />
        </label>
        {err && <div className="error">{err}</div>}
        {msg && <div className="ok">{msg}</div>}
        <button className="ios-btn ios-btn-primary" style={{ width: '100%', padding: '12px' }} disabled={busy}>
          {busy ? 'Đang xử lý…' : tab === 'in' ? 'Đăng nhập vào học' : 'Tạo tài khoản'}
        </button>
      </form>
    </div>
  );
}

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
        <div className="card login">
          <div className="login-logo">📚💕</div>
          <h1>Học cùng nhau</h1>
          <p className="muted">Chế độ DEMO — chọn vai để xem thử</p>
          <div className="stack">
            <button className="btn primary big" onClick={() => data.auth.signInDemo('teacher')}>
              👨‍🏫 Vào với vai <b>Anh</b> (quản lý)
            </button>
            <button className="btn big" onClick={() => data.auth.signInDemo('student')}>
              👩‍🎓 Vào với vai <b>Em</b> (học viên)
            </button>
          </div>
          <p className="small muted">
            Muốn đồng bộ 2 máy & không mất dữ liệu: cấu hình Supabase theo README rồi khởi động lại web.
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
      <form className="card login" onSubmit={submit}>
        <div className="login-logo">📚💕</div>
        <h1>Học cùng nhau</h1>
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
        <button className="btn primary big" disabled={busy}>
          {busy ? 'Đợi xíu…' : tab === 'in' ? 'Vào học thôi 💪' : 'Tạo tài khoản'}
        </button>
      </form>
    </div>
  );
}

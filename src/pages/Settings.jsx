import { useRef, useState } from 'react';
import { data } from '../data';
import { useAuth } from '../context/AuthContext';
import { APP_SCHEMA_VERSION, APP_VERSION, IS_CLOUD } from '../config';

export default function Settings() {
  const { user, isTeacher, partner } = useAuth();
  const [name, setName] = useState(user.display_name);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const saveName = async () => {
    setErr('');
    try {
      await data.updateProfile({ display_name: name.trim() });
      setMsg('Đã cập nhật tên hiển thị thành công');
    } catch (e) {
      setErr(e.message);
    }
  };

  const doExport = async () => {
    setBusy(true);
    setErr('');
    try {
      const json = await data.exportAll();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `hoc-cung-nhau-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      localStorage.setItem('hcn-last-backup', new Date().toISOString());
      setMsg('Đã tải xuống tệp sao lưu dữ liệu an toàn');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!confirm('Nhập file sao lưu sẽ THAY THẾ toàn bộ dữ liệu demo hiện tại. Tiếp tục?')) return;
    setBusy(true);
    try {
      await data.importAll(JSON.parse(await f.text()));
      setMsg('Đã khôi phục dữ liệu từ tệp sao lưu');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const last = localStorage.getItem('hcn-last-backup');

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <div className="folio-breadcrumbs">
            <span>Hệ thống</span>
            <span className="sep">/</span>
            <span style={{ color: '#E11D48', fontWeight: 700 }}>Thiết lập ứng dụng</span>
          </div>
          <div className="folio-title-row">
            <div>
              <h1 className="folio-title">Thiết lập & Sao lưu dữ liệu</h1>
              <p className="muted" style={{ margin: '6px 0 0' }}>Cấu hình hồ sơ cá nhân và quản lý dữ liệu an toàn</p>
            </div>
          </div>
          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {/* Section 1: Hồ sơ */}
        <section style={{ marginBottom: '32px' }}>
          <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
            <span className="idx-badge">1</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Hồ sơ tài khoản</h3>
              <div className="small muted">
                Vai trò: <b>{isTeacher ? 'Người quản lý (Anh)' : 'Học viên (Em)'}</b>
                {partner && <> · Người đồng hành: <b>{partner.display_name}</b></>}
                {user.email && <> · {user.email}</>}
              </div>
            </div>
          </div>

          <label className="field" style={{ maxWidth: '480px' }}>
            <span className="small muted">Tên hiển thị trên hệ thống</span>
            <div className="row" style={{ marginTop: '4px' }}>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <button className="ios-btn ios-btn-primary" onClick={saveName}>Lưu thay đổi</button>
            </div>
          </label>
        </section>

        <hr className="folio-divider" />

        {/* Section 2: Sao lưu */}
        <section style={{ marginBottom: '32px' }}>
          <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
            <span className="idx-badge">2</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Sao lưu dữ liệu học tập</h3>
              <div className="small muted">
                {IS_CLOUD
                  ? 'Dữ liệu được lưu trữ an toàn trên máy chủ đám mây Supabase.'
                  : 'Chế độ Demo: Dữ liệu đang được lưu trữ an toàn trong trình duyệt.'}
              </div>
            </div>
          </div>

          <p className="small muted">
            Lần sao lưu gần nhất trên thiết bị này: {last ? new Date(last).toLocaleString('vi-VN') : 'Chưa có bản sao lưu nào'}
          </p>

          <div className="row" style={{ marginTop: '14px' }}>
            <button className="ios-btn ios-btn-primary" disabled={busy} onClick={doExport}>
              Tải tệp sao lưu (.json)
            </button>
            {!IS_CLOUD && (
              <>
                <input ref={fileRef} type="file" accept="application/json" hidden onChange={doImport} />
                <button className="ios-btn ios-btn-secondary" disabled={busy} onClick={() => fileRef.current.click()}>
                  Khôi phục từ tệp
                </button>
              </>
            )}
          </div>
        </section>

        <hr className="folio-divider" />

        {/* Section 3: Thông tin */}
        <section>
          <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
            <span className="idx-badge">3</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Thông số hệ thống</h3>
              <div className="small muted">Phiên bản nền tảng và cơ sở dữ liệu</div>
            </div>
          </div>

          <div style={{ background: '#FFFDFE', border: '1.5px solid rgba(253, 164, 175, 0.4)', borderRadius: '16px', padding: '16px 20px', maxWidth: '480px' }}>
            <div className="row between" style={{ padding: '6px 0', borderBottom: '1px solid rgba(253, 164, 175, 0.3)' }}>
              <span className="small muted">Chế độ vận hành:</span>
              <span className="small font-bold">{IS_CLOUD ? 'Cloud (Supabase)' : 'Demo (IndexedDB Local)'}</span>
            </div>
            <div className="row between" style={{ padding: '6px 0' }}>
              <span className="small muted">Phiên bản ứng dụng:</span>
              <span className="small font-bold">{APP_VERSION} (Schema v{APP_SCHEMA_VERSION})</span>
            </div>
          </div>
        </section>

        {msg && <div className="ok" style={{ marginTop: '20px' }}>{msg}</div>}
        {err && <div className="error" style={{ marginTop: '20px' }}>{err}</div>}
      </div>
    </div>
  );
}

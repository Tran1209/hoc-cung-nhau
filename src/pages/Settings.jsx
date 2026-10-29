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
      setMsg('Đã lưu tên ✔');
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
      setMsg('Đã tải file sao lưu ✔ — cất vào Google Drive cho chắc nhé.');
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
      setMsg('Đã khôi phục dữ liệu ✔');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const last = localStorage.getItem('hcn-last-backup');

  return (
    <div className="page">
      <h1>⚙️ Cài đặt</h1>

      <section className="card form">
        <h2>👤 Hồ sơ</h2>
        <p className="small muted">
          Vai trò: <b>{isTeacher ? 'Người quản lý (anh)' : 'Học viên (em)'}</b>
          {partner && <> · Người kia: <b>{partner.display_name}</b></>}
          {user.email && <> · {user.email}</>}
        </p>
        <label className="field">
          <span>Tên hiển thị</span>
          <div className="row">
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn primary" onClick={saveName}>Lưu</button>
          </div>
        </label>
      </section>

      <section className="card">
        <h2>💾 Sao lưu dữ liệu</h2>
        <p className="small">
          {IS_CLOUD
            ? 'Dữ liệu đang được lưu an toàn trên Supabase. Nên tải thêm 1 bản sao lưu mỗi thứ 7 trước khi cập nhật web.'
            : 'Chế độ demo: dữ liệu nằm trong trình duyệt này. Xoá lịch sử duyệt web có thể làm mất dữ liệu!'}
        </p>
        <p className="small muted">Lần sao lưu gần nhất trên máy này: {last ? new Date(last).toLocaleString('vi-VN') : 'chưa có'}</p>
        <div className="row">
          <button className="btn primary" disabled={busy} onClick={doExport}>⬇️ Tải file sao lưu (.json)</button>
          {!IS_CLOUD && (
            <>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={doImport} />
              <button className="btn" disabled={busy} onClick={() => fileRef.current.click()}>⬆️ Khôi phục từ file</button>
            </>
          )}
        </div>
      </section>

      <section className="card">
        <h2>ℹ️ Thông tin</h2>
        <ul className="small">
          <li>Chế độ: <b>{IS_CLOUD ? 'Cloud (Supabase) — đồng bộ 2 máy' : 'Demo (trình duyệt)'}</b></li>
          <li>Phiên bản web: <b>{APP_VERSION}</b> · Database cần: <b>v{APP_SCHEMA_VERSION}</b></li>
        </ul>
      </section>

      {msg && <div className="ok">{msg}</div>}
      {err && <div className="error">{err}</div>}
    </div>
  );
}

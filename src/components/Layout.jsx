import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { data } from '../data';
import { useLive } from '../data/useLive';
import { APP_SCHEMA_VERSION, IS_CLOUD } from '../config';

export default function Layout({ children }) {
  const { user, isTeacher } = useAuth();
  const nav = useNavigate();
  const [dbVersion, setDbVersion] = useState(null);

  useEffect(() => {
    data.schemaVersion().then(setDbVersion);
  }, []);

  const pending = useLive(
    () => (isTeacher ? data.list('submissions', { where: { status: 'submitted' } }) : Promise.resolve([])),
    [isTeacher],
  );
  const pendingCount = pending.data?.length || 0;

  const logout = async () => {
    await data.auth.signOut();
    nav('/');
  };

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-dot" />
          <span>Học Cùng Nhau</span>
          <span className="brand-tag">Folio</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>Tổng quan</NavLink>
          <NavLink to="/mon-hoc">Môn học</NavLink>
          {isTeacher && (
            <NavLink to="/cham">
              Chấm bài
              {pendingCount > 0 && <b className="pill">{pendingCount}</b>}
            </NavLink>
          )}
          <NavLink to="/cai-dat">Thiết lập</NavLink>
        </nav>
        <div className="me">
          <span className={`role-dot ${user.role}`} title={isTeacher ? 'Quản lý' : 'Học viên'} />
          <span className="me-name">{user.display_name}</span>
          <button className="btn ghost sm" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      {!IS_CLOUD && (
        <div className="banner warn">
          <b>Chế độ DEMO</b>: Dữ liệu chỉ lưu trên trình duyệt này, chưa đồng bộ 2 máy. Làm theo README để bật
          Supabase (miễn phí) trước khi dùng thật.
        </div>
      )}
      {IS_CLOUD && dbVersion !== null && dbVersion < APP_SCHEMA_VERSION && (
        <div className="banner danger">
          <b>Thông báo hệ thống:</b> Database đang ở phiên bản {dbVersion}, web cần phiên bản {APP_SCHEMA_VERSION}. Hãy chạy các file migration
          mới trong <code>supabase/migrations</code>.
        </div>
      )}

      <main className="container">{children}</main>
      <footer className="footer">Học Cùng Nhau · Rose Milk Editorial Folio · Sổ tay học tập liền khối chuẩn Apple</footer>
    </div>
  );
}

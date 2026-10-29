import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import ChapterPage from './pages/ChapterPage';
import LessonPage from './pages/LessonPage';
import AssignmentPage from './pages/AssignmentPage';
import AssignmentEditor from './pages/AssignmentEditor';
import SubmissionPage from './pages/SubmissionPage';
import GradingInbox from './pages/GradingInbox';
import Settings from './pages/Settings';

export default function App() {
  const { user } = useAuth();

  if (user === undefined) return <div className="splash">📚 Đang tải…</div>;
  if (!user) return <Login />;
  if (user.missingProfile) {
    return (
      <div className="splash">
        <div className="card narrow">
          <h2>Tài khoản chưa có hồ sơ</h2>
          <p>
            Tài khoản <b>{user.email}</b> chưa có trong bảng <code>profiles</code>. Hãy chắc chắn bạn đã chạy file
            <code> supabase/migrations/0001_init.sql</code> <b>trước</b> khi tạo tài khoản (xem README).
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mon/:id" element={<SubjectPage />} />
        <Route path="/chuong/:id" element={<ChapterPage />} />
        <Route path="/bai/:id" element={<LessonPage />} />
        <Route path="/bt/:id" element={<AssignmentPage />} />
        <Route path="/bt/:id/sua" element={<AssignmentEditor />} />
        <Route path="/nop/:id" element={<SubmissionPage />} />
        <Route path="/cham" element={<GradingInbox />} />
        <Route path="/cai-dat" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useAuth } from '../context/AuthContext';
import { Gallery } from './Gallery';
import Uploader from './Uploader';

/** Em chụp ảnh bài làm và nộp. Bản nháp được giữ lại nếu lỡ tải lại trang. */
export default function UploadSubmit({ assignment }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const key = `hcn-draft-${assignment.id}`;
  const [files, setFiles] = useState(() => JSON.parse(localStorage.getItem(key) || '{}').files || []);
  const [note, setNote] = useState(() => JSON.parse(localStorage.getItem(key) || '{}').note || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ files, note }));
  }, [key, files, note]);

  const submit = async () => {
    if (!files.length && !note.trim()) return setErr('Em chưa thêm ảnh bài làm nào.');
    setBusy(true);
    setErr('');
    try {
      const s = await data.insert('submissions', {
        assignment_id: assignment.id,
        student_id: user.id,
        status: 'submitted',
        files,
        note,
        submitted_at: new Date().toISOString(),
      });
      localStorage.removeItem(key);
      await logActivity('submission', `Nộp bài: ${assignment.title} (${files.length} ảnh)`, `/nop/${s.id}`);
      nav(`/nop/${s.id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', color: '#380718' }}>Nộp bài làm</h2>
      <p className="small muted">Chụp rõ từng trang bài làm. Có thể chọn nhiều ảnh cùng lúc.</p>
      <Gallery
        items={files.map((p) => ({ path: p }))}
        onDelete={(it) => setFiles(files.filter((p) => p !== it.path))}
        empty="Chưa có ảnh nào."
      />
      <div className="mt-sm">
        <Uploader folder={`submissions/${assignment.id}`} label="+ Chọn tệp ảnh bài làm"
          onUploaded={(paths) => setFiles((f) => [...f, ...paths])} />
      </div>
      <label className="field mt">
        <span>Ghi chú bài nộp (tuỳ chọn)</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú cho bài tập này..." />
      </label>
      {err && <div className="error">{err}</div>}
      <button className="ios-btn ios-btn-primary" style={{ marginTop: '16px', padding: '12px 24px' }} disabled={busy} onClick={submit}>
        {busy ? 'Đang nộp…' : 'Xác nhận nộp bài'}
      </button>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { Crumbs, Empty, ErrorBox, Loading } from '../components/ui';
import { sortByPos } from '../lib/format';
import { latestByAssignment } from '../lib/progress';

const CHAPTER_FIELDS = [
  { name: 'title', label: 'Tên chương', required: true, autoFocus: true, placeholder: 'VD: Chương 1 — Hàm số' },
  { name: 'description', label: 'Mô tả', type: 'textarea', rows: 3 },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

export default function SubjectPage() {
  const { id } = useParams();
  const { isTeacher } = useAuth();
  const nav = useNavigate();
  const [dialog, setDialog] = useState(null);

  const { data: d, loading, error } = useLive(async () => {
    const subject = await data.get('subjects', id);
    const chapters = await data.list('chapters', { where: { subject_id: id } });
    const chIds = chapters.map((c) => c.id);
    const [lessons, assignments, submissions] = await Promise.all([
      data.list('lessons', { where: { chapter_id: chIds } }),
      data.list('assignments', { where: { chapter_id: chIds } }),
      data.list('submissions'),
    ]);
    return { subject, chapters, lessons, assignments, submissions };
  }, [id]);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;
  if (!d.subject) return <Empty>Không tìm thấy môn học.</Empty>;

  const { subject, chapters, lessons, assignments, submissions } = d;
  const latest = latestByAssignment(submissions);

  const save = async (vals, existing) => {
    if (existing) await data.update('chapters', existing.id, vals);
    else {
      const c = await data.insert('chapters', { ...vals, subject_id: id, position: vals.position || chapters.length + 1 });
      logActivity('chapter', `Thêm ${c.title}`, `/chuong/${c.id}`);
    }
  };

  const delSubject = async () => {
    if (!confirm(`Xoá môn "${subject.title}" và TOÀN BỘ chương, bài, bài tập bên trong? Không thể hoàn tác!`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('subjects', id);
    nav('/');
  };

  return (
    <div className="page">
      <Crumbs items={[{ label: subject.title }]} />
      <div className="row between">
        <h1>{subject.icon} {subject.title}</h1>
        {isTeacher && (
          <div className="row">
            <button className="btn primary" onClick={() => setDialog({})}>+ Thêm chương</button>
            <button className="btn danger ghost" onClick={delSubject}>Xoá môn</button>
          </div>
        )}
      </div>
      {subject.description && <p className="muted pre">{subject.description}</p>}

      {chapters.length === 0 ? (
        <Empty>Chưa có chương nào.</Empty>
      ) : (
        <div className="stack">
          {sortByPos(chapters).map((c) => {
            const ls = sortByPos(lessons.filter((l) => l.chapter_id === c.id));
            const as = assignments.filter((a) => a.chapter_id === c.id);
            const done = as.filter((a) => latest[a.id]?.status === 'graded').length;
            return (
              <div key={c.id} className="card chapter">
                <div className="row between">
                  <Link to={`/chuong/${c.id}`}><h2>{c.title}</h2></Link>
                  <div className="row">
                    <span className="small muted">{done}/{as.length} bài tập đã chấm</span>
                    {isTeacher && <button className="btn ghost sm" onClick={() => setDialog({ existing: c })}>✏️</button>}
                  </div>
                </div>
                {c.description && <p className="small muted pre">{c.description}</p>}
                <div className="chips">
                  {ls.map((l) => (
                    <Link key={l.id} to={`/bai/${l.id}`} className="chip">{l.title}</Link>
                  ))}
                  <Link to={`/chuong/${c.id}`} className="chip accent">Xem chương →</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dialog && (
        <FormDialog
          title={dialog.existing ? 'Sửa chương' : 'Thêm chương'}
          fields={CHAPTER_FIELDS}
          initial={dialog.existing || { title: `Chương ${chapters.length + 1}: `, position: chapters.length + 1 }}
          onSubmit={(v) => save(v, dialog.existing)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

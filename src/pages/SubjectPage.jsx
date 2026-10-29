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
  { name: 'title', label: 'Tên chương', required: true, autoFocus: true, placeholder: 'VD: Chủ đề 1 — Thế giới trong và sau Chiến tranh lạnh' },
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
    if (!confirm(`Xoá môn "${subject.title}" cùng toàn bộ chương bài bên trong? Không thể hoàn tác!`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('subjects', id);
    nav('/');
  };

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <Crumbs items={[{ label: subject.title }]} />
          <div className="folio-title-row" style={{ marginTop: '12px' }}>
            <div>
              <div className="subject-pill-tag">{subject.title.toUpperCase()}</div>
              <h1 className="folio-title">{subject.title}</h1>
              {subject.description && <p className="muted" style={{ margin: '6px 0 0' }}>{subject.description}</p>}
            </div>
            {isTeacher && (
              <div className="row">
                <button className="ios-btn sm ios-btn-primary" onClick={() => setDialog({})}>+ Thêm chương</button>
                <button className="ios-btn sm" style={{ color: '#E11D48', borderColor: '#FDA4AF' }} onClick={delSubject}>Xoá môn</button>
              </div>
            )}
          </div>
          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {chapters.length === 0 ? (
          <Empty>Chưa có chương nào trong môn học này.</Empty>
        ) : (
          <div className="stack" style={{ gap: '18px' }}>
            {sortByPos(chapters).map((c, idx) => {
              const ls = sortByPos(lessons.filter((l) => l.chapter_id === c.id));
              const as = assignments.filter((a) => a.chapter_id === c.id);
              const done = as.filter((a) => latest[a.id]?.status === 'graded').length;
              return (
                <div key={c.id} style={{ background: '#FFFDFE', border: '1.5px solid rgba(253, 164, 175, 0.45)', borderRadius: '20px', padding: '22px 26px', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.05)' }}>
                  <div className="row between">
                    <div className="row" style={{ gap: '12px' }}>
                      <span className="idx-badge">{idx + 1}</span>
                      <Link to={`/chuong/${c.id}`}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#380718' }}>{c.title}</h2>
                      </Link>
                    </div>
                    <div className="row">
                      <span className="small muted">{done}/{as.length} bài tập đã chấm</span>
                      {isTeacher && <button className="ios-btn sm ios-btn-secondary" onClick={() => setDialog({ existing: c })}>Sửa</button>}
                    </div>
                  </div>
                  {c.description && <p className="small muted pre" style={{ margin: '10px 0 14px 42px' }}>{c.description}</p>}
                  <div className="chips" style={{ marginLeft: '42px', marginTop: '12px' }}>
                    {ls.map((l) => (
                      <Link key={l.id} to={`/bai/${l.id}`} className="chip">
                        {l.title}
                      </Link>
                    ))}
                    {ls.length === 0 && <span className="small muted">Chưa có bài học trong chương này.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {dialog && (
          <FormDialog
            title={dialog.existing ? 'Sửa chương học' : 'Thêm chương học'}
            fields={CHAPTER_FIELDS}
            initial={dialog.existing || { position: chapters.length + 1 }}
            onSubmit={(v) => save(v, dialog.existing)}
            onClose={() => setDialog(null)}
          />
        )}
      </div>
    </div>
  );
}

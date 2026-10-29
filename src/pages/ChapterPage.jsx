import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import AssignmentList from '../components/AssignmentList';
import { Crumbs, Empty, ErrorBox, Loading } from '../components/ui';
import { sortByPos } from '../lib/format';
import { latestByAssignment } from '../lib/progress';

const LESSON_FIELDS = [
  { name: 'title', label: 'Tên bài', required: true, autoFocus: true, placeholder: 'VD: Bài 1 — Sự đồng biến, nghịch biến' },
  { name: 'content', label: 'Ghi chú / tóm tắt lý thuyết', type: 'textarea', rows: 6 },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];
const CHAPTER_FIELDS = [
  { name: 'title', label: 'Tên chương', required: true },
  { name: 'description', label: 'Mô tả', type: 'textarea', rows: 3 },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

export default function ChapterPage() {
  const { id } = useParams();
  const { isTeacher } = useAuth();
  const nav = useNavigate();
  const [dialog, setDialog] = useState(null);

  const { data: d, loading, error } = useLive(async () => {
    const chapter = await data.get('chapters', id);
    if (!chapter) return { chapter: null };
    const [subject, lessons, assignments, submissions, images] = await Promise.all([
      data.get('subjects', chapter.subject_id),
      data.list('lessons', { where: { chapter_id: id } }),
      data.list('assignments', { where: { chapter_id: id } }),
      data.list('submissions'),
      data.list('lesson_images'),
    ]);
    return { chapter, subject, lessons, assignments, submissions, images };
  }, [id]);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;
  if (!d.chapter) return <Empty>Không tìm thấy chương.</Empty>;

  const { chapter, subject, lessons, assignments, submissions, images } = d;
  const latest = latestByAssignment(submissions);
  const review = assignments.filter((a) => !a.lesson_id);

  const saveLesson = async (vals) => {
    const l = await data.insert('lessons', { ...vals, chapter_id: id, position: vals.position || lessons.length + 1 });
    logActivity('lesson', `Thêm ${l.title}`, `/bai/${l.id}`);
  };

  const delChapter = async () => {
    if (!confirm(`Xoá "${chapter.title}" cùng toàn bộ bài học, bài tập, bài nộp bên trong? Không thể hoàn tác!`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('chapters', id);
    nav(`/mon/${chapter.subject_id}`);
  };

  return (
    <div className="page">
      <Crumbs items={[subject && { label: subject.title, to: `/mon/${subject.id}` }, { label: chapter.title }]} />
      <div className="row between">
        <h1>{chapter.title}</h1>
        {isTeacher && (
          <div className="row">
            <button className="btn ghost" onClick={() => setDialog('chapter')}>✏️ Sửa</button>
            <button className="btn danger ghost" onClick={delChapter}>Xoá chương</button>
          </div>
        )}
      </div>
      {chapter.description && <p className="muted pre">{chapter.description}</p>}

      <section className="card">
        <div className="row between">
          <h2>📖 Các bài học</h2>
          {isTeacher && <button className="btn primary" onClick={() => setDialog('lesson')}>+ Thêm bài</button>}
        </div>
        {lessons.length === 0 ? (
          <Empty>Chưa có bài học nào.</Empty>
        ) : (
          <ul className="lessons">
            {sortByPos(lessons).map((l) => {
              const as = assignments.filter((a) => a.lesson_id === l.id);
              const done = as.filter((a) => latest[a.id]?.status === 'graded').length;
              const imgs = images.filter((i) => i.lesson_id === l.id);
              return (
                <li key={l.id}>
                  <Link to={`/bai/${l.id}`} className="lesson-item">
                    <b>{l.title}</b>
                    <span className="small muted">
                      🧠 {imgs.filter((i) => i.kind === 'mindmap').length} · 📸 {imgs.filter((i) => i.kind === 'work').length} ·
                      📝 {done}/{as.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card review">
        <h2>🔁 Ôn tập & kiểm tra cả chương</h2>
        <AssignmentList
          assignments={review}
          latest={latest}
          chapterId={id}
          lessonId={null}
          defaultTitle={`Ôn tập ${chapter.title}`}
          emptyText="Chưa có bài ôn tập cho chương này."
        />
      </section>

      {dialog === 'lesson' && (
        <FormDialog
          title="Thêm bài học"
          fields={LESSON_FIELDS}
          initial={{ title: `Bài ${lessons.length + 1}: `, position: lessons.length + 1 }}
          onSubmit={saveLesson}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'chapter' && (
        <FormDialog
          title="Sửa chương"
          fields={CHAPTER_FIELDS}
          initial={chapter}
          onSubmit={(v) => data.update('chapters', id, v)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

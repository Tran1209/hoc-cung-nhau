import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { Gallery } from '../components/Gallery';
import Uploader from '../components/Uploader';
import AssignmentList from '../components/AssignmentList';
import { Crumbs, Empty, ErrorBox, Loading } from '../components/ui';
import { fmtDate } from '../lib/format';
import { latestByAssignment } from '../lib/progress';

const LESSON_FIELDS = [
  { name: 'title', label: 'Tên bài', required: true },
  { name: 'content', label: 'Ghi chú / tóm tắt lý thuyết', type: 'textarea', rows: 8 },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

const SECTIONS = [
  { kind: 'mindmap', title: '🧠 Sơ đồ tư duy', empty: 'Chưa có sơ đồ tư duy.' },
  { kind: 'work', title: '📸 Bài em đã làm', empty: 'Chưa có ảnh bài làm nào.' },
  { kind: 'doc', title: '📎 Tài liệu', empty: 'Chưa có tài liệu.' },
];

export default function LessonPage() {
  const { id } = useParams();
  const { user, isTeacher, nameOf } = useAuth();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data: d, loading, error } = useLive(async () => {
    const lesson = await data.get('lessons', id);
    if (!lesson) return { lesson: null };
    const chapter = await data.get('chapters', lesson.chapter_id);
    const [subject, images, assignments, submissions] = await Promise.all([
      chapter ? data.get('subjects', chapter.subject_id) : null,
      data.list('lesson_images', { where: { lesson_id: id }, order: 'created_at' }),
      data.list('assignments', { where: { lesson_id: id } }),
      data.list('submissions'),
    ]);
    return { lesson, chapter, subject, images, assignments, submissions };
  }, [id]);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;
  if (!d.lesson) return <Empty>Không tìm thấy bài học.</Empty>;

  const { lesson, chapter, subject, images, assignments, submissions } = d;
  const latest = latestByAssignment(submissions);

  const addImages = async (kind, paths) => {
    for (const path of paths) {
      await data.insert('lesson_images', { lesson_id: id, kind, path, uploaded_by: user.id });
    }
    const label = SECTIONS.find((s) => s.kind === kind).title.replace(/^\S+\s/, '');
    logActivity('lesson_images', `Thêm ${paths.length} ảnh "${label}" vào ${lesson.title}`, `/bai/${id}`);
  };

  const delImage = async (img) => {
    if (!confirm('Xoá ảnh này?')) return;
    await data.remove('lesson_images', img.id);
    await data.removeFile(img.path);
  };

  const editCaption = async (img) => {
    const c = prompt('Ghi chú cho ảnh:', img.caption || '');
    if (c !== null) await data.update('lesson_images', img.id, { caption: c });
  };

  const delLesson = async () => {
    if (!confirm(`Xoá "${lesson.title}" cùng toàn bộ ảnh, bài tập, bài nộp? Không thể hoàn tác!`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('lessons', id);
    nav(`/chuong/${lesson.chapter_id}`);
  };

  return (
    <div className="page">
      <Crumbs
        items={[
          subject && { label: subject.title, to: `/mon/${subject.id}` },
          chapter && { label: chapter.title, to: `/chuong/${chapter.id}` },
          { label: lesson.title },
        ]}
      />
      <div className="row between">
        <h1>{lesson.title}</h1>
        {isTeacher && (
          <div className="row">
            <button className="btn ghost" onClick={() => setEditing(true)}>✏️ Sửa</button>
            <button className="btn danger ghost" onClick={delLesson}>Xoá bài</button>
          </div>
        )}
      </div>
      {lesson.content && <div className="card note pre">{lesson.content}</div>}

      {SECTIONS.map((sec) => {
        const items = images
          .filter((i) => i.kind === sec.kind)
          .map((i) => ({
            ...i,
            meta: `${nameOf(i.uploaded_by)} · ${fmtDate(i.created_at, false)}`,
            canDelete: isTeacher || i.uploaded_by === user.id,
          }));
        return (
          <section key={sec.kind} className="card">
            <div className="row between">
              <h2>{sec.title} <small className="muted">({items.length})</small></h2>
              <Uploader folder={`lessons/${id}/${sec.kind}`} onUploaded={(p) => addImages(sec.kind, p)} />
            </div>
            <Gallery items={items} onDelete={delImage} empty={sec.empty} />
            {items.some((i) => i.canDelete) && (
              <details className="small muted">
                <summary>Sửa ghi chú ảnh</summary>
                <div className="chips">
                  {items.filter((i) => i.canDelete).map((i, idx) => (
                    <button key={i.id} className="chip" onClick={() => editCaption(i)}>
                      Ảnh {idx + 1}{i.caption ? `: ${i.caption}` : ''}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </section>
        );
      })}

      <section className="card">
        <h2>📝 Bài tập của bài này</h2>
        <AssignmentList
          assignments={assignments}
          latest={latest}
          chapterId={lesson.chapter_id}
          lessonId={id}
          defaultTitle={`Bài tập ${lesson.title}`}
          emptyText="Chưa có bài tập nào."
        />
      </section>

      {editing && (
        <FormDialog
          title="Sửa bài học"
          fields={LESSON_FIELDS}
          initial={lesson}
          onSubmit={(v) => data.update('lessons', id, v)}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

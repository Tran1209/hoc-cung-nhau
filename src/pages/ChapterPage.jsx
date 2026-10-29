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
  { name: 'title', label: 'Tên bài', required: true, autoFocus: true, placeholder: 'VD: Bài 1: Liên hợp quốc' },
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

  const { chapter, subject, lessons, assignments, submissions } = d;
  const latest = latestByAssignment(submissions);
  const review = assignments.filter((a) => !a.lesson_id);

  const saveLesson = async (vals) => {
    const l = await data.insert('lessons', { ...vals, chapter_id: id, position: vals.position || lessons.length + 1 });
    logActivity('lesson', `Thêm ${l.title}`, `/bai/${l.id}`);
  };

  const delChapter = async () => {
    if (!confirm(`Xoá "${chapter.title}" cùng toàn bộ bài học, bài tập bên trong? Không thể hoàn tác!`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('chapters', id);
    nav(`/mon/${chapter.subject_id}`);
  };

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <Crumbs items={[subject && { label: subject.title, to: `/mon/${subject.id}` }, { label: chapter.title }]} />
          <div className="folio-title-row" style={{ marginTop: '12px' }}>
            <div>
              <div className="subject-pill-tag">CHUYÊN ĐỀ</div>
              <h1 className="folio-title">{chapter.title}</h1>
              {chapter.description && <p className="muted" style={{ margin: '6px 0 0' }}>{chapter.description}</p>}
            </div>
            {isTeacher && (
              <div className="row">
                <button className="ios-btn sm ios-btn-secondary" onClick={() => setDialog('chapter')}>Sửa chương</button>
                <button className="ios-btn sm" style={{ color: '#E11D48', borderColor: '#FDA4AF' }} onClick={delChapter}>Xoá chương</button>
              </div>
            )}
          </div>
          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {/* Section: Danh mục bài học */}
        <section>
          <div className="row between" style={{ marginBottom: '16px' }}>
            <div className="row" style={{ gap: '10px' }}>
              <span className="idx-badge">1</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Danh mục bài học</h3>
                <div className="small muted">Các bài học lý thuyết chi tiết theo sách giáo khoa</div>
              </div>
            </div>
            {isTeacher && <button className="ios-btn sm ios-btn-primary" onClick={() => setDialog('lesson')}>+ Thêm bài</button>}
          </div>

          {lessons.length === 0 ? (
            <Empty>Chưa có bài học nào trong chương này.</Empty>
          ) : (
            <ul className="lessons">
              {sortByPos(lessons).map((l, idx) => {
                const as = assignments.filter((a) => a.lesson_id === l.id);
                const done = as.filter((a) => latest[a.id]?.status === 'graded').length;
                return (
                  <li key={l.id}>
                    <Link to={`/bai/${l.id}`} className="aitem">
                      <div className="row" style={{ gap: '12px' }}>
                        <span className="small muted" style={{ fontWeight: 700, minWidth: '24px' }}>0{idx + 1}</span>
                        <b>{l.title}</b>
                      </div>
                      <div className="aright">
                        <span className="badge">{done}/{as.length} bài tập</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <hr className="folio-divider" />

        {/* Section: Ôn tập & Đề kiểm tra chung */}
        <section>
          <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
            <span className="idx-badge">2</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Đề ôn tập & Kiểm tra chương</h3>
              <div className="small muted">Đánh giá tổng hợp kiến thức toàn bộ chuyên đề</div>
            </div>
          </div>

          <AssignmentList
            assignments={review}
            latest={latest}
            chapterId={id}
            lessonId={null}
            defaultTitle={`Ôn tập ${chapter.title}`}
            emptyText="Chưa có đề ôn tập chung cho chương này."
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
    </div>
  );
}

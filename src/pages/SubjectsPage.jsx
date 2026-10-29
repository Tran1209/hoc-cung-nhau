import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { Empty, ErrorBox, Loading } from '../components/ui';
import { sortByPos } from '../lib/format';
import { latestByAssignment } from '../lib/progress';
import { seedHistoryCurriculum } from '../data/historyCurriculum';

const SUBJECT_FIELDS = [
  { name: 'title', label: 'Tên môn', required: true, autoFocus: true, placeholder: 'VD: Lịch Sử 12' },
  { name: 'description', label: 'Mô tả', type: 'textarea', rows: 2 },
  { name: 'color', label: 'Màu nhận diện', type: 'color', default: '#e11d48' },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

export default function SubjectsPage() {
  const { isTeacher } = useAuth();
  const nav = useNavigate();
  const [dialog, setDialog] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [filterGrade, setFilterGrade] = useState('all'); // 'all' | '12' | '11' | '10'

  const handleSeedHistory = async () => {
    setSeeding(true);
    try {
      await seedHistoryCurriculum(data);
      logActivity('curriculum', 'Nạp chương trình Lịch Sử 10, 11, 12');
    } catch (e) {
      alert('Lỗi nạp môn: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const { data: d, loading, error } = useLive(async () => {
    const [subjects, chapters, assignments, submissions] = await Promise.all([
      data.list('subjects'),
      data.list('chapters'),
      data.list('assignments'),
      data.list('submissions'),
    ]);
    return { subjects, chapters, assignments, submissions };
  }, []);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;

  const { subjects, chapters, assignments, submissions } = d;
  const latest = latestByAssignment(submissions);

  const openAssignments = assignments.filter(
    (a) => a.is_published && (!a.publish_at || new Date(a.publish_at) <= new Date()),
  );

  const saveSubject = async (vals, existing) => {
    if (existing) await data.update('subjects', existing.id, vals);
    else {
      const s = await data.insert('subjects', { ...vals, position: vals.position || subjects.length });
      logActivity('subject', `Thêm môn mới: ${s.title}`, `/mon/${s.id}`);
    }
  };

  const filteredSubjects = sortByPos(subjects).filter((s) => {
    if (filterGrade === 'all') return true;
    return s.title.includes(filterGrade);
  });

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <div className="folio-breadcrumbs">
            <span>Không gian học tập</span>
            <span className="sep">/</span>
            <span style={{ color: '#E11D48', fontWeight: 700 }}>Danh mục môn học</span>
          </div>

          <div className="folio-title-row">
            <div>
              <h1 className="folio-title">Chương trình & Môn học</h1>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '1rem' }}>
                Lựa chọn môn học để xem chi tiết các chương đề, bài học sách giáo khoa số và bài tập thực hành
              </p>
            </div>

            {isTeacher && (
              <div className="row">
                <button
                  className="ios-btn sm ios-btn-secondary"
                  onClick={handleSeedHistory}
                  disabled={seeding}
                >
                  {seeding ? 'Đang nạp...' : 'Nạp giáo trình Lịch Sử'}
                </button>
                <button className="ios-btn sm ios-btn-primary" onClick={() => setDialog({})}>
                  + Thêm môn học
                </button>
              </div>
            )}
          </div>

          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {/* Bộ lọc nhanh khối lớp */}
        <div className="row" style={{ marginTop: '24px', gap: '8px' }}>
          {[
            { id: 'all', label: 'Tất cả môn học' },
            { id: '12', label: 'Lịch Sử 12 (Trọng tâm)' },
            { id: '11', label: 'Lịch Sử 11' },
            { id: '10', label: 'Lịch Sử 10' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`ios-btn sm ${filterGrade === tab.id ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
              onClick={() => setFilterGrade(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Danh sách thẻ môn học */}
        <section style={{ marginTop: '24px' }}>
          {filteredSubjects.length === 0 ? (
            <Empty>
              {subjects.length === 0
                ? 'Chưa có môn học nào. Hãy bấm "Nạp giáo trình Lịch Sử" để bắt đầu.'
                : 'Không tìm thấy môn học phù hợp với bộ lọc.'}
            </Empty>
          ) : (
            <div className="cards">
              {filteredSubjects.map((s) => {
                const chs = chapters.filter((c) => c.subject_id === s.id);
                const chIds = new Set(chs.map((c) => c.id));
                const as = openAssignments.filter((a) => chIds.has(a.chapter_id));
                const done = as.filter((a) => latest[a.id]?.status === 'graded').length;
                const pct = as.length ? Math.round((done / as.length) * 100) : 0;
                return (
                  <div
                    key={s.id}
                    className="subject"
                    style={{ '--c': s.color }}
                    onClick={() => nav(`/mon/${s.id}`)}
                  >
                    <div className="subject-pill-tag">{s.title.toUpperCase()}</div>
                    <h3 style={{ margin: '2px 0 6px', fontSize: '1.2rem' }}>{s.title}</h3>
                    {s.description && <p className="small muted clamp">{s.description}</p>}
                    <div className="small muted" style={{ marginTop: 'auto', paddingTop: '10px' }}>
                      {chs.length} chương · {as.length} bài tập
                    </div>
                    <div className="bar">
                      <div style={{ width: `${pct}%` }} />
                    </div>
                    <div className="small" style={{ color: '#BE123C', fontWeight: 700 }}>
                      Hoàn thành {pct}%
                    </div>
                    {isTeacher && (
                      <div className="corner" onClick={(e) => e.stopPropagation()}>
                        <button className="btn ghost sm" onClick={() => setDialog({ existing: s })}>
                          Sửa
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {dialog && (
          <FormDialog
            title={dialog.existing ? 'Sửa môn học' : 'Thêm môn học'}
            fields={SUBJECT_FIELDS}
            initial={dialog.existing || { color: '#E11D48', position: subjects.length }}
            onSubmit={(v) => saveSubject(v, dialog.existing)}
            onClose={() => setDialog(null)}
          />
        )}
      </div>
    </div>
  );
}

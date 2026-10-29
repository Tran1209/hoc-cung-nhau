import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { DueBadge, ErrorBox, KindBadge, Loading, Empty } from '../components/ui';
import { maxScoreOf, nextSaturday, sortByPos, timeAgo, fmtDate } from '../lib/format';
import { avgScore, isTodo, latestByAssignment } from '../lib/progress';
import { seedHistoryCurriculum } from '../data/historyCurriculum';

const SUBJECT_FIELDS = [
  { name: 'title', label: 'Tên môn', required: true, autoFocus: true, placeholder: 'VD: Lịch Sử 12' },
  { name: 'description', label: 'Mô tả', type: 'textarea', rows: 2 },
  { name: 'color', label: 'Màu nhận diện', type: 'color', default: '#e11d48' },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

export default function Dashboard() {
  const { user, isTeacher, partner, nameOf } = useAuth();
  const nav = useNavigate();
  const [dialog, setDialog] = useState(null);
  const [seeding, setSeeding] = useState(false);

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
    const [subjects, chapters, assignments, questions, submissions, activity] = await Promise.all([
      data.list('subjects'),
      data.list('chapters'),
      data.list('assignments'),
      data.list('questions'),
      data.list('submissions'),
      data.list('activity', { order: 'created_at', asc: false, limit: 15 }),
    ]);
    return { subjects, chapters, assignments, questions, submissions, activity };
  }, []);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;

  const { subjects, chapters, assignments, questions, submissions, activity } = d;
  const aById = Object.fromEntries(assignments.map((a) => [a.id, a]));
  const qByA = {};
  questions.forEach((q) => (qByA[q.assignment_id] ||= []).push(q));
  const latest = latestByAssignment(submissions);
  const avg = avgScore(submissions, aById, (a) => maxScoreOf(a, qByA[a?.id]));
  const hearts = submissions.reduce((s, x) => s + Number(x.hearts || 0), 0);
  const chapterTitle = Object.fromEntries(chapters.map((c) => [c.id, c.title]));

  const openAssignments = assignments.filter(
    (a) => a.is_published && (!a.publish_at || new Date(a.publish_at) <= new Date()),
  );
  const todo = openAssignments
    .filter((a) => isTodo(a, latest[a.id]))
    .sort((x, y) => String(x.due_at || '9999').localeCompare(String(y.due_at || '9999')));
  const toGrade = submissions
    .filter((s) => s.status === 'submitted')
    .sort((x, y) => String(x.submitted_at).localeCompare(String(y.submitted_at)));

  const sat = nextSaturday(20);
  const daysToSat = Math.ceil((sat - new Date()) / 86400000);

  const saveSubject = async (vals, existing) => {
    if (existing) await data.update('subjects', existing.id, vals);
    else {
      const s = await data.insert('subjects', { ...vals, position: vals.position || subjects.length });
      logActivity('subject', `Thêm môn mới: ${s.title}`, `/mon/${s.id}`);
    }
  };

  return (
    <div className="page">
      {/* SINGLE UNIFIED FOLIO SHEET (Rose Milk Editorial Folio) */}
      <div className="folio-sheet">
        {/* Folio Header */}
        <header className="folio-header">
          <div className="folio-breadcrumbs">
            <span>Không gian học tập</span>
            <span className="sep">/</span>
            <span style={{ color: '#E11D48', fontWeight: 700 }}>Tổng quan tuần này</span>
          </div>

          <div className="folio-title-row">
            <div>
              <h1 className="folio-title">
                {isTeacher ? 'Kế hoạch giảng dạy & Quản lý' : 'Tổng quan & Kế hoạch học tập'}
              </h1>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '1rem' }}>
                {isTeacher
                  ? `Đang đồng hành cùng ${partner?.display_name || 'học viên'} · Kiểm tra bài nộp và tiến độ ôn tập`
                  : `Chào ${user.display_name} · Kế hoạch học tập và nhiệm vụ bài vở hôm nay`}
              </p>
            </div>

            <div className="sat" style={{ minWidth: '180px' }}>
              <div className="sat-num">{daysToSat === 0 ? 'Hôm nay' : `${daysToSat} ngày nữa`}</div>
              <div className="small muted">Buổi học Thứ 7 ({fmtDate(sat.toISOString(), false)})</div>
            </div>
          </div>

          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {/* Integrated Metric Strip (Dải chỉ số liền khối bên trong Folio, không hộp lơ lửng, không emoji) */}
        <div className="folio-metric-strip">
          {isTeacher ? (
            <>
              <Link to="/cham" className="folio-metric-cell">
                <div className="folio-metric-val">{toGrade.length}</div>
                <div className="folio-metric-lbl">Bài chờ chấm</div>
              </Link>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{todo.length}</div>
                <div className="folio-metric-lbl">Bài em chưa làm</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{avg ?? '—'}</div>
                <div className="folio-metric-lbl">Điểm trung bình</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{hearts}</div>
                <div className="folio-metric-lbl">Điểm thưởng đã trao</div>
              </div>
            </>
          ) : (
            <>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{todo.length}</div>
                <div className="folio-metric-lbl">Nhiệm vụ cần làm</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{submissions.filter((s) => s.status === 'submitted').length}</div>
                <div className="folio-metric-lbl">Bài đang chờ chấm</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{avg ?? '—'}</div>
                <div className="folio-metric-lbl">Điểm trung bình</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{hearts}</div>
                <div className="folio-metric-lbl">Điểm thưởng tích luỹ</div>
              </div>
            </>
          )}
        </div>

        {/* Hai phân mục liền khối: Nhiệm vụ & Hoạt động */}
        <div className="grid2">
          {/* Left: Nhiệm vụ */}
          <div>
            <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
              <span className="idx-badge">1</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>
                  {isTeacher ? 'Bài tập cần chấm điểm' : 'Nhiệm vụ học tập cần hoàn thành'}
                </h3>
                <div className="small muted">Nhiệm vụ theo hạn nộp và mức độ ưu tiên</div>
              </div>
            </div>

            {isTeacher ? (
              toGrade.length === 0 ? (
                <Empty>Hiện tại không có bài tập nào đang chờ chấm.</Empty>
              ) : (
                <ul className="list">
                  {toGrade.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <Link to={`/nop/${s.id}`} className="aitem">
                        <div>
                          <b>{aById[s.assignment_id]?.title || 'Bài tập'}</b>
                          <div className="small muted">Thời gian nộp: {timeAgo(s.submitted_at)}</div>
                        </div>
                        <span className="badge submitted">Chờ chấm</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              todo.length === 0 ? (
                <Empty>Đã hoàn thành toàn bộ bài tập được giao.</Empty>
              ) : (
                <ul className="list">
                  {todo.map((a) => (
                    <li key={a.id}>
                      <Link to={`/bt/${a.id}`} className="aitem">
                        <div>
                          <b>{a.title}</b>
                          <div className="small muted">{chapterTitle[a.chapter_id]}</div>
                        </div>
                        <div className="aright">
                          <KindBadge kind={a.kind} />
                          <DueBadge due={a.due_at} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          {/* Right: Hoạt động */}
          <div>
            <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
              <span className="idx-badge">2</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Nhật ký hoạt động</h3>
                <div className="small muted">Ghi nhận tiến trình học tập gần đây</div>
              </div>
            </div>

            {activity.length === 0 ? (
              <Empty>Chưa có hoạt động mới nào được ghi nhận.</Empty>
            ) : (
              <ul
                className="feed"
                style={{
                  background: '#FFFDFE',
                  border: '1.5px solid rgba(253, 164, 175, 0.4)',
                  borderRadius: '18px',
                  padding: '16px 20px',
                }}
              >
                {activity.slice(0, 6).map((x) => (
                  <li key={x.id} style={{ padding: '10px 0' }}>
                    <span className="who" style={{ color: '#BE123C' }}>
                      {nameOf(x.actor_id)}
                    </span>{' '}
                    {x.link ? <Link to={x.link}>{x.message}</Link> : <span>{x.message}</span>}
                    <div className="small muted">{timeAgo(x.created_at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <hr className="folio-divider" />

        {/* Bottom: Chương trình môn học */}
        <section>
          <div className="row between" style={{ marginBottom: '18px' }}>
            <div className="row" style={{ gap: '10px' }}>
              <span className="idx-badge">3</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Chương trình môn học</h3>
                <div className="small muted">Giáo trình và các chuyên đề trọng tâm</div>
              </div>
            </div>

            {isTeacher && (
              <div className="row">
                <button className="ios-btn sm ios-btn-secondary" onClick={handleSeedHistory} disabled={seeding}>
                  {seeding ? 'Đang nạp...' : 'Nạp giáo trình Lịch Sử'}
                </button>
                <button className="ios-btn sm ios-btn-primary" onClick={() => setDialog({})}>
                  + Thêm môn học
                </button>
              </div>
            )}
          </div>

          {subjects.length === 0 ? (
            <Empty>Chưa có môn học nào. Hãy bấm "Nạp giáo trình Lịch Sử" để bắt đầu.</Empty>
          ) : (
            <div className="cards">
              {sortByPos(subjects).map((s) => {
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
                    <h3 style={{ margin: '2px 0 6px', fontSize: '1.18rem' }}>{s.title}</h3>
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

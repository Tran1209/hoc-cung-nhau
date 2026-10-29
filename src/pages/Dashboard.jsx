import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { DueBadge, ErrorBox, KindBadge, Loading, StatusBadge, Empty } from '../components/ui';
import { maxScoreOf, nextSaturday, sortByPos, timeAgo, fmtDate } from '../lib/format';
import { avgScore, isTodo, latestByAssignment } from '../lib/progress';

const SUBJECT_FIELDS = [
  { name: 'icon', label: 'Biểu tượng (emoji)', placeholder: '📘' },
  { name: 'title', label: 'Tên môn', required: true, autoFocus: true, placeholder: 'VD: Toán 12' },
  { name: 'description', label: 'Mô tả', type: 'textarea', rows: 2 },
  { name: 'color', label: 'Màu', type: 'color', default: '#ff7aa2' },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

export default function Dashboard() {
  const { user, isTeacher, partner, nameOf } = useAuth();
  const nav = useNavigate();
  const [dialog, setDialog] = useState(null);

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
  const scheduled = assignments.filter((a) => a.is_published && a.publish_at && new Date(a.publish_at) > new Date());
  const drafts = assignments.filter((a) => !a.is_published);

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
      <section className="hero">
        <div>
          <h1>Chào {user.display_name} 👋</h1>
          <p className="muted">
            {isTeacher
              ? `Hôm nay giao gì cho ${partner?.display_name || 'em'} học đây?`
              : `Cố lên nha, ${partner?.display_name || 'anh'} đang chờ chấm bài đó 😘`}
          </p>
        </div>
        <div className="sat">
          <div className="sat-num">{daysToSat === 0 ? 'Hôm nay!' : `${daysToSat} ngày`}</div>
          <div className="small">tới buổi học thứ 7 ({fmtDate(sat.toISOString(), false)})</div>
        </div>
      </section>

      <section className="stats">
        {isTeacher ? (
          <>
            <Stat n={toGrade.length} label="bài chờ chấm" to="/cham" />
            <Stat n={todo.length} label="bài em chưa làm" />
            <Stat n={avg ?? '—'} label="điểm TB (thang 10)" />
            <Stat n={`${hearts} ❤️`} label="tim đã thưởng" />
          </>
        ) : (
          <>
            <Stat n={todo.length} label="bài cần làm" />
            <Stat n={submissions.filter((s) => s.status === 'submitted').length} label="bài chờ chấm" />
            <Stat n={avg ?? '—'} label="điểm TB (thang 10)" />
            <Stat n={`${hearts} ❤️`} label="tim nhận được" />
          </>
        )}
      </section>

      <div className="grid2">
        <section className="card">
          {isTeacher ? (
            <>
              <h2>✅ Cần chấm</h2>
              {toGrade.length === 0 ? (
                <Empty>Không có bài nào chờ chấm 🎉</Empty>
              ) : (
                <ul className="list">
                  {toGrade.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <Link to={`/nop/${s.id}`}>
                        <b>{aById[s.assignment_id]?.title || 'Bài tập'}</b>
                        <small className="muted"> · nộp {timeAgo(s.submitted_at)}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {(scheduled.length > 0 || drafts.length > 0) && (
                <>
                  <h3 className="mt">🗓️ Đã hẹn giờ / bản nháp</h3>
                  <ul className="list">
                    {[...scheduled, ...drafts].slice(0, 6).map((a) => (
                      <li key={a.id}>
                        <Link to={`/bt/${a.id}`}>
                          <b>{a.title}</b>{' '}
                          <small className="muted">
                            {a.is_published ? `· mở lúc ${fmtDate(a.publish_at)}` : '· nháp (em chưa thấy)'}
                          </small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              <h2>📌 Việc cần làm</h2>
              {todo.length === 0 ? (
                <Empty>Hết bài rồi, giỏi quá 🥰</Empty>
              ) : (
                <ul className="list">
                  {todo.map((a) => (
                    <li key={a.id}>
                      <Link to={`/bt/${a.id}`}>
                        <b>{a.title}</b> <KindBadge kind={a.kind} /> <DueBadge due={a.due_at} />{' '}
                        {latest[a.id] && <StatusBadge status={latest[a.id].status} />}
                        <div className="small muted">{chapterTitle[a.chapter_id]}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2>💬 Hoạt động gần đây</h2>
          {activity.length === 0 ? (
            <Empty>Chưa có hoạt động nào.</Empty>
          ) : (
            <ul className="feed">
              {activity.map((x) => (
                <li key={x.id}>
                  <span className="who">{nameOf(x.actor_id)}</span>{' '}
                  {x.link ? <Link to={x.link}>{x.message}</Link> : x.message}
                  <small className="muted"> · {timeAgo(x.created_at)}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <div className="row between">
          <h2>📚 Môn học</h2>
          {isTeacher && (
            <button className="btn primary" onClick={() => setDialog({})}>+ Thêm môn</button>
          )}
        </div>
        {subjects.length === 0 ? (
          <Empty>
            {isTeacher ? 'Bắt đầu bằng việc thêm một môn học nhé!' : 'Anh chưa thêm môn học nào.'}
          </Empty>
        ) : (
          <div className="cards">
            {sortByPos(subjects).map((s) => {
              const chs = chapters.filter((c) => c.subject_id === s.id);
              const chIds = new Set(chs.map((c) => c.id));
              const as = openAssignments.filter((a) => chIds.has(a.chapter_id));
              const done = as.filter((a) => latest[a.id]?.status === 'graded').length;
              const pct = as.length ? Math.round((done / as.length) * 100) : 0;
              return (
                <div key={s.id} className="subject" style={{ '--c': s.color }} onClick={() => nav(`/mon/${s.id}`)}>
                  <div className="subject-icon">{s.icon || '📘'}</div>
                  <h3>{s.title}</h3>
                  {s.description && <p className="small muted clamp">{s.description}</p>}
                  <div className="small">{chs.length} chương · {as.length} bài tập</div>
                  <div className="bar"><div style={{ width: `${pct}%` }} /></div>
                  <div className="small muted">Hoàn thành {pct}%</div>
                  {isTeacher && (
                    <div className="corner" onClick={(e) => e.stopPropagation()}>
                      <button className="btn ghost sm" onClick={() => setDialog({ existing: s })}>✏️</button>
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
          initial={dialog.existing || { icon: '📘', color: '#ff7aa2', position: subjects.length }}
          onSubmit={(v) => saveSubject(v, dialog.existing)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

function Stat({ n, label, to }) {
  const body = (
    <>
      <div className="stat-n">{n}</div>
      <div className="stat-l">{label}</div>
    </>
  );
  return to ? <Link to={to} className="stat">{body}</Link> : <div className="stat">{body}</div>;
}

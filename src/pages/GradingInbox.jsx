import { Link } from 'react-router-dom';
import { data } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { Empty, ErrorBox, Hearts, KindBadge, Loading, StatusBadge } from '../components/ui';
import { fmtDate, scoreText, timeAgo } from '../lib/format';

export default function GradingInbox() {
  const { isTeacher } = useAuth();
  const { data: d, loading, error } = useLive(async () => {
    const [subs, assignments, chapters] = await Promise.all([
      data.list('submissions', { order: 'submitted_at', asc: false }),
      data.list('assignments'),
      data.list('chapters'),
    ]);
    return { subs, assignments, chapters };
  }, []);

  if (!isTeacher) return <Empty>Trang này dành cho người quản lý.</Empty>;
  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;

  const aById = Object.fromEntries(d.assignments.map((a) => [a.id, a]));
  const chTitle = Object.fromEntries(d.chapters.map((c) => [c.id, c.title]));
  const pending = d.subs.filter((s) => s.status === 'submitted').reverse(); // cũ nhất lên trước
  const history = d.subs.filter((s) => s.status === 'graded' || s.status === 'redo').slice(0, 30);

  const Row = ({ s }) => {
    const a = aById[s.assignment_id];
    return (
      <li>
        <Link to={`/nop/${s.id}`} className="aitem">
          <div>
            <b>{a?.title || 'Bài tập'}</b>
            <div className="badges">
              {a && <KindBadge kind={a.kind} />}
              <span className="small muted">{chTitle[a?.chapter_id]}</span>
              <span className="small muted">· {s.status === 'submitted' ? `nộp ${timeAgo(s.submitted_at)}` : fmtDate(s.graded_at)}</span>
              {s.files?.length > 0 && <span className="small muted">· {s.files.length} ảnh</span>}
            </div>
          </div>
          <div className="aright">
            <StatusBadge status={s.status} />
            {s.status === 'graded' && <div className="score">{scoreText(s.score)} <Hearts n={s.hearts} /></div>}
          </div>
        </Link>
      </li>
    );
  };

  return (
    <div className="page">
      <h1>✅ Chấm bài</h1>
      <section className="card">
        <h2>Chờ chấm ({pending.length})</h2>
        {pending.length === 0 ? <Empty>Hết bài để chấm rồi 🎉</Empty> : <ul className="alist">{pending.map((s) => <Row key={s.id} s={s} />)}</ul>}
      </section>
      <section className="card">
        <h2>Đã xử lý gần đây</h2>
        {history.length === 0 ? <Empty>Chưa có.</Empty> : <ul className="alist">{history.map((s) => <Row key={s.id} s={s} />)}</ul>}
      </section>
    </div>
  );
}

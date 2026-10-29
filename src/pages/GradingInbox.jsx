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
  const pending = d.subs.filter((s) => s.status === 'submitted').reverse();
  const history = d.subs.filter((s) => s.status === 'graded' || s.status === 'redo').slice(0, 30);

  const Row = ({ s }) => {
    const a = aById[s.assignment_id];
    return (
      <li>
        <Link to={`/nop/${s.id}`} className="aitem">
          <div>
            <b>{a?.title || 'Bài tập'}</b>
            <div className="badges" style={{ marginTop: '4px' }}>
              {a && <KindBadge kind={a.kind} />}
              <span className="small muted">{chTitle[a?.chapter_id]}</span>
              <span className="small muted">· {s.status === 'submitted' ? `nộp ${timeAgo(s.submitted_at)}` : fmtDate(s.graded_at)}</span>
              {s.files?.length > 0 && <span className="small muted">· {s.files.length} ảnh bài làm</span>}
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
      <div className="folio-sheet">
        <header className="folio-header">
          <div className="folio-breadcrumbs">
            <span>Không gian quản lý</span>
            <span className="sep">/</span>
            <span style={{ color: '#E11D48', fontWeight: 700 }}>Hộp thư chấm bài</span>
          </div>
          <div className="folio-title-row">
            <div>
              <h1 className="folio-title">Chấm điểm & Đánh giá bài nộp</h1>
              <p className="muted" style={{ margin: '6px 0 0' }}>Theo dõi các bài tập đã nộp, tiến hành nhận xét và ghi điểm đánh giá</p>
            </div>
          </div>
          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        <section style={{ marginBottom: '32px' }}>
          <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
            <span className="idx-badge">1</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Bài đang chờ chấm ({pending.length})</h3>
              <div className="small muted">Ưu tiên xử lý các bài tập nộp trước</div>
            </div>
          </div>
          {pending.length === 0 ? (
            <Empty>Tất cả bài tập đã được chấm điểm hoàn tất.</Empty>
          ) : (
            <ul className="alist">{pending.map((s) => <Row key={s.id} s={s} />)}</ul>
          )}
        </section>

        <hr className="folio-divider" />

        <section>
          <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
            <span className="idx-badge">2</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Lịch sử đánh giá gần đây</h3>
              <div className="small muted">30 bài tập gần nhất đã được xử lý</div>
            </div>
          </div>
          {history.length === 0 ? (
            <Empty>Chưa có lịch sử chấm bài.</Empty>
          ) : (
            <ul className="alist">{history.map((s) => <Row key={s.id} s={s} />)}</ul>
          )}
        </section>
      </div>
    </div>
  );
}

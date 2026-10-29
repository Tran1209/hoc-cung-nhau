import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { data } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { Gallery } from '../components/Gallery';
import { Crumbs, DueBadge, Empty, ErrorBox, Hearts, KindBadge, Loading, StatusBadge } from '../components/ui';
import UploadSubmit from '../components/UploadSubmit';
import QuizRunner from '../components/QuizRunner';
import { fmtDate, maxScoreOf, scoreText, sortByPos } from '../lib/format';

export default function AssignmentPage() {
  const { id } = useParams();
  const { isTeacher } = useAuth();
  const [again, setAgain] = useState(false);

  const { data: d, loading, error } = useLive(async () => {
    const a = await data.get('assignments', id);
    if (!a) return { a: null };
    const [chapter, lesson, questions, submissions] = await Promise.all([
      data.get('chapters', a.chapter_id),
      a.lesson_id ? data.get('lessons', a.lesson_id) : null,
      data.list('questions', { where: { assignment_id: id } }),
      data.list('submissions', { where: { assignment_id: id }, order: 'created_at', asc: false }),
    ]);
    return { a, chapter, lesson, questions: sortByPos(questions), submissions };
  }, [id]);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;
  if (!d.a) return <Empty>Không tìm thấy bài tập (hoặc bài chưa được mở).</Empty>;

  const { a, chapter, lesson, questions, submissions } = d;
  const max = maxScoreOf(a, questions);
  const latest = submissions[0];
  const inProgress = submissions.find((s) => s.status === 'in_progress');
  const finished = submissions.filter((s) => s.status !== 'in_progress');

  let studentAction = null;
  if (!isTeacher) {
    const canStart = !latest || latest.status === 'redo' || latest.status === 'in_progress';
    if (a.kind === 'exam') {
      studentAction = canStart ? (
        <QuizRunner assignment={a} questions={questions} inProgress={inProgress} />
      ) : (
        <div className="ok">Em đã hoàn thành bài thi này. Xem kết quả chi tiết bên dưới.</div>
      );
    } else if (canStart || again) {
      studentAction =
        a.kind === 'upload' ? (
          <UploadSubmit assignment={a} />
        ) : (
          <QuizRunner assignment={a} questions={questions} inProgress={inProgress} />
        );
    } else {
      studentAction = (
        <div className="row">
          <span className="muted">Em đã nộp bài tập này.</span>
          <button className="ios-btn sm ios-btn-secondary" onClick={() => setAgain(true)}>
            Nộp lại bài làm
          </button>
        </div>
      );
    }
  }

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <Crumbs
            items={[
              chapter && { label: chapter.title, to: `/chuong/${chapter.id}` },
              lesson && { label: lesson.title, to: `/bai/${lesson.id}` },
              { label: a.title },
            ]}
          />
          <div className="folio-title-row" style={{ marginTop: '12px' }}>
            <div>
              <div className="subject-pill-tag">BÀI TẬP ĐÁNH GIÁ</div>
              <h1 className="folio-title">{a.title}</h1>
            </div>
            {isTeacher && (
              <Link className="ios-btn sm ios-btn-primary" to={`/bt/${id}/sua`}>
                Soạn / Sửa bài tập
              </Link>
            )}
          </div>

          <div className="folio-meta-bar">
            <KindBadge kind={a.kind} />
            {isTeacher && !a.is_published && <span className="badge draft">Bản nháp (chưa công bố)</span>}
            {isTeacher && a.is_published && a.publish_at && new Date(a.publish_at) > new Date() && (
              <span className="badge due">Mở tự động lúc {fmtDate(a.publish_at)}</span>
            )}
            <DueBadge due={a.due_at} />
            {a.due_at && <span className="small muted">Hạn nộp: {fmtDate(a.due_at)}</span>}
            <span className="small muted">· Thang điểm: {max} điểm</span>
            {a.kind === 'exam' && <span className="small muted">· Thời gian: {a.time_limit_minutes} phút</span>}
            {a.kind !== 'upload' && <span className="small muted">· {questions.length} câu hỏi</span>}
          </div>

          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {/* Đề bài */}
        {(a.instructions || a.attachments?.length > 0) && (
          <section style={{ marginBottom: '32px' }}>
            <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
              <span className="idx-badge">1</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Nội dung đề bài & Yêu cầu</h3>
              </div>
            </div>
            {a.instructions && <p className="pre text-justify" style={{ lineHeight: 1.8 }}>{a.instructions}</p>}
            {a.attachments?.length > 0 && <Gallery items={a.attachments.map((p) => ({ path: p }))} />}
          </section>
        )}

        {/* Danh sách câu hỏi cho Quản lý */}
        {isTeacher && a.kind !== 'upload' && (
          <section style={{ marginBottom: '32px' }}>
            <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
              <span className="idx-badge">2</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Danh sách câu hỏi kiểm tra</h3>
              </div>
            </div>
            {questions.length === 0 ? (
              <Empty>Chưa có câu hỏi trong đề. Nhấn "Soạn / Sửa bài tập" để tạo câu hỏi.</Empty>
            ) : (
              <ol className="qpreview" style={{ paddingLeft: '20px' }}>
                {questions.map((q) => (
                  <li key={q.id} style={{ marginBottom: '10px' }}>
                    <span className="pre">{q.prompt || <i className="muted">(chưa có nội dung)</i>}</span>{' '}
                    <small className="muted">· {q.type === 'mcq' ? `trắc nghiệm ${q.options.length} đáp án` : 'tự luận'} · {q.points}đ</small>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {/* Học sinh làm bài */}
        {!isTeacher && (
          <section style={{ marginBottom: '32px' }}>
            {studentAction}
          </section>
        )}

        <hr className="folio-divider" />

        {/* Lịch sử nộp bài */}
        <section>
          <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
            <span className="idx-badge">{isTeacher ? (a.kind !== 'upload' ? '3' : '2') : '2'}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>
                {isTeacher ? 'Các lượt bài nộp của học viên' : 'Lịch sử nộp bài của em'}
              </h3>
              <div className="small muted">Theo dõi kết quả đánh giá qua các lần nộp</div>
            </div>
          </div>

          {finished.length === 0 ? (
            <Empty>Chưa có lượt nộp bài nào được ghi nhận.</Empty>
          ) : (
            <table className="folio-editorial table" style={{ width: '100%' }}>
              <thead>
                <tr><th>Thời điểm nộp</th><th>Trạng thái</th><th>Điểm số</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {finished.map((s) => (
                  <tr key={s.id}>
                    <td>{fmtDate(s.submitted_at || s.created_at)}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>{s.status === 'graded' ? <b>{scoreText(s.score, max)}</b> : '—'} <Hearts n={s.hearts} /></td>
                    <td><Link className="ios-btn sm ios-btn-secondary" to={`/nop/${s.id}`}>{isTeacher && s.status === 'submitted' ? 'Chấm bài' : 'Xem chi tiết'}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {isTeacher && inProgress && (
            <p className="small muted" style={{ marginTop: '12px' }}>Học viên đang tiến hành làm bài (bắt đầu từ {fmtDate(inProgress.started_at)}).</p>
          )}
        </section>
      </div>
    </div>
  );
}

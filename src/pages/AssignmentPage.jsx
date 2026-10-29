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
        <div className="ok">Em đã nộp bài thi này rồi. Xem kết quả bên dưới nhé.</div>
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
          <span className="muted">Em đã nộp bài này.</span>
          <button className="btn" onClick={() => setAgain(true)}>Nộp lại / làm thêm lần nữa</button>
        </div>
      );
    }
  }

  return (
    <div className="page">
      <Crumbs
        items={[
          chapter && { label: chapter.title, to: `/chuong/${chapter.id}` },
          lesson && { label: lesson.title, to: `/bai/${lesson.id}` },
          { label: a.title },
        ]}
      />
      <div className="row between">
        <h1>{a.title}</h1>
        {isTeacher && <Link className="btn primary" to={`/bt/${id}/sua`}>✏️ Soạn / sửa</Link>}
      </div>
      <div className="badges">
        <KindBadge kind={a.kind} />
        {isTeacher && !a.is_published && <span className="badge draft">Nháp — em chưa thấy</span>}
        {isTeacher && a.is_published && a.publish_at && new Date(a.publish_at) > new Date() && (
          <span className="badge due">🗓️ Tự mở lúc {fmtDate(a.publish_at)}</span>
        )}
        <DueBadge due={a.due_at} />
        {a.due_at && <span className="small muted">Hạn: {fmtDate(a.due_at)}</span>}
        <span className="small muted">· Điểm tối đa: {max}</span>
        {a.kind === 'exam' && <span className="small muted">· ⏱️ {a.time_limit_minutes} phút</span>}
        {a.kind !== 'upload' && <span className="small muted">· {questions.length} câu</span>}
      </div>

      {(a.instructions || a.attachments?.length > 0) && (
        <section className="card">
          <h2>📄 Đề bài</h2>
          {a.instructions && <p className="pre">{a.instructions}</p>}
          {a.attachments?.length > 0 && <Gallery items={a.attachments.map((p) => ({ path: p }))} />}
        </section>
      )}

      {isTeacher && a.kind !== 'upload' && (
        <section className="card">
          <h2>❓ Câu hỏi</h2>
          {questions.length === 0 ? (
            <Empty>Chưa có câu hỏi — bấm "Soạn / sửa" để thêm.</Empty>
          ) : (
            <ol className="qpreview">
              {questions.map((q) => (
                <li key={q.id}>
                  <span className="pre">{q.prompt || <i className="muted">(chưa có nội dung)</i>}</span>{' '}
                  <small className="muted">· {q.type === 'mcq' ? `trắc nghiệm ${q.options.length} đáp án` : 'tự luận'} · {q.points}đ</small>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {!isTeacher && <section className="card do">{studentAction}</section>}

      <section className="card">
        <h2>{isTeacher ? '📥 Bài em đã nộp' : '🗂️ Các lần nộp của em'}</h2>
        {finished.length === 0 ? (
          <Empty>Chưa có lần nộp nào.</Empty>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Nộp lúc</th><th>Trạng thái</th><th>Điểm</th><th></th></tr>
            </thead>
            <tbody>
              {finished.map((s) => (
                <tr key={s.id}>
                  <td>{fmtDate(s.submitted_at || s.created_at)}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.status === 'graded' ? <b>{scoreText(s.score, max)}</b> : '—'} <Hearts n={s.hearts} /></td>
                  <td><Link className="btn sm" to={`/nop/${s.id}`}>{isTeacher && s.status === 'submitted' ? 'Chấm' : 'Xem'}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {isTeacher && inProgress && (
          <p className="small muted">⏳ Em đang làm bài (bắt đầu {fmtDate(inProgress.started_at)}).</p>
        )}
      </section>
    </div>
  );
}

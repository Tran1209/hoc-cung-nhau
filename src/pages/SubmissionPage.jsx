import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { Gallery, FileThumb } from '../components/Gallery';
import { Crumbs, Empty, ErrorBox, Hearts, Loading, StatusBadge } from '../components/ui';
import { fmtDate, maxScoreOf, scoreText, sortByPos } from '../lib/format';

const LETTERS = 'ABCDEFGH';

export default function SubmissionPage() {
  const { id } = useParams();
  const { isTeacher, nameOf } = useAuth();

  const { data: d, loading, error } = useLive(async () => {
    const s = await data.get('submissions', id);
    if (!s) return { s: null };
    const a = await data.get('assignments', s.assignment_id);
    const questions = a ? sortByPos(await data.list('questions', { where: { assignment_id: a.id } })) : [];
    let keys = [];
    if (a && a.kind !== 'upload') {
      keys = isTeacher
        ? await data.list('answer_keys', { where: { question_id: questions.map((q) => q.id) } })
        : await data.quizReview(a.id);
    }
    return { s, a, questions, keys: Object.fromEntries(keys.map((k) => [k.question_id, k])) };
  }, [id, isTeacher]);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;
  if (!d.s) return <Empty>Không tìm thấy bài nộp.</Empty>;

  const { s, a, questions, keys } = d;
  const max = maxScoreOf(a, questions);

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <Crumbs items={[a && { label: a.title, to: `/bt/${a.id}` }, { label: 'Bài nộp' }]} />
          <div className="folio-title-row" style={{ marginTop: '12px' }}>
            <div>
              <div className="subject-pill-tag">KẾT QUẢ ĐÁNH GIÁ</div>
              <h1 className="folio-title">{a?.title || 'Bài nộp'}</h1>
              <p className="muted" style={{ margin: '6px 0 0' }}>
                Học viên {nameOf(s.student_id)} nộp lúc {fmtDate(s.submitted_at || s.created_at)}
                {s.started_at && a?.kind === 'exam' && (
                  <> · Thời gian hoàn thành: {Math.max(1, Math.round((new Date(s.submitted_at) - new Date(s.started_at)) / 60000))} phút</>
                )}
              </p>
            </div>
            <div>
              <StatusBadge status={s.status} />
            </div>
          </div>
          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {s.status === 'graded' && (
          <section className="card result" style={{ marginBottom: '28px' }}>
            <div className="result-score">{scoreText(s.score, max)}</div>
            <Hearts n={s.hearts} />
            {s.feedback && <p className="pre feedback" style={{ marginTop: '12px' }}>Nhận xét: {s.feedback}</p>}
            {s.graded_at && <small className="muted" style={{ display: 'block', marginTop: '8px' }}>Thời điểm đánh giá: {fmtDate(s.graded_at)}</small>}
          </section>
        )}
        {s.status === 'redo' && (
          <section className="card result redo" style={{ marginBottom: '28px' }}>
            <h3 style={{ color: '#E11D48', margin: 0 }}>Yêu cầu làm lại bài tập này</h3>
            {s.feedback && <p className="pre feedback" style={{ marginTop: '10px' }}>Ghi chú yêu cầu: {s.feedback}</p>}
            {!isTeacher && a && (
              <div style={{ marginTop: '14px' }}>
                <Link className="ios-btn ios-btn-primary sm" to={`/bt/${a.id}`}>Làm lại bài ngay</Link>
              </div>
            )}
          </section>
        )}

        {s.note && (
          <div className="card note" style={{ marginBottom: '24px' }}>
            <span className="small muted">Lời nhắn của người làm: </span>
            <i className="pre">{s.note}</i>
          </div>
        )}

        {questions.length > 0 && a?.kind !== 'upload' && (
          <section style={{ marginBottom: '32px' }}>
            <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
              <span className="idx-badge">1</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Chi tiết câu trả lời</h3>
              </div>
            </div>
            {questions.map((q, i) => (
              <AnswerView key={q.id} i={i} q={q} answer={s.answers?.[q.id]} k={keys[q.id]} qScore={s.question_scores?.[q.id]} showKey={isTeacher || s.status === 'graded'} />
            ))}
            {s.auto_score !== null && s.auto_score !== undefined && (
              <p className="small muted" style={{ marginTop: '12px' }}>Điểm trắc nghiệm tự động: <b>{s.auto_score}</b></p>
            )}
          </section>
        )}

        {s.files?.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <div className="row" style={{ marginBottom: '16px', gap: '10px' }}>
              <span className="idx-badge">2</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Ảnh bài làm đính kèm ({s.files.length})</h3>
              </div>
            </div>
            <Gallery items={s.files.map((p, i) => ({ path: p, caption: `Trang ${i + 1}` }))} />
          </section>
        )}

        {isTeacher && s.status !== 'in_progress' && (
          <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1.5px solid rgba(253, 164, 175, 0.35)' }}>
            <GradePanel s={s} a={a} questions={questions} max={max} />
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerView({ i, q, answer, k, qScore, showKey }) {
  const [lb, setLb] = useState(null);
  const answered = answer !== undefined && answer !== '' && answer !== null;
  const hasKey = showKey && k && k.correct !== null && k.correct !== undefined;
  const right = q.type === 'mcq' && hasKey && Number(answer) === Number(k.correct);
  return (
    <div className={`qcard ${q.type === 'mcq' && hasKey ? (right ? 'right' : 'wrong') : ''}`} style={{ marginBottom: '14px' }}>
      <div className="qtitle">
        <b>Câu {i + 1}</b> <small className="muted">({q.points} điểm)</small>
        {q.type === 'mcq' && hasKey && (
          <span className="mark" style={{ color: right ? '#059669' : '#E11D48' }}>
            {right ? 'Đúng' : answered ? 'Sai' : 'Chưa chọn'}
          </span>
        )}
        {q.type === 'essay' && qScore !== undefined && <span className="mark">{qScore}/{q.points} điểm</span>}
      </div>
      <div className="pre">{q.prompt}</div>
      {q.image_path && <div className="qimg"><FileThumb path={q.image_path} onOpen={setLb} className="wide" /></div>}
      {q.type === 'mcq' ? (
        <div className="choices readonly">
          {q.options.map((o, idx) =>
            o?.trim() ? (
              <div key={idx} className={`choice ${Number(answer) === idx && answered ? 'on' : ''} ${hasKey && k.correct === idx ? 'correct' : ''}`}>
                <b>{LETTERS[idx]}.</b> <span>{o}</span>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <div className="essay-answer pre">{answered ? answer : <i className="muted">(không trả lời trên web)</i>}</div>
      )}
      {showKey && k?.explanation && (
        <div className="explain" style={{ background: '#FFF8F9', borderLeft: '3px solid #FDA4AF', padding: '8px 12px', marginTop: '10px' }}>
          Giải thích: {k.explanation}
        </div>
      )}
    </div>
  );
}

function GradePanel({ s, a, questions, max }) {
  const nav = useNavigate();
  const [score, setScore] = useState(s.score ?? (s.auto_score || 0));
  const [hearts, setHearts] = useState(s.hearts || 1);
  const [feedback, setFeedback] = useState(s.feedback || '');
  const [action, setAction] = useState('grade');
  const [busy, setBusy] = useState(false);
  const [qScores, setQScores] = useState(s.question_scores || {});

  const essayQs = questions.filter((q) => q.type === 'essay');

  const onQScore = (qid, val) => {
    const next = { ...qScores, [qid]: Number(val) || 0 };
    setQScores(next);
    const sumEssay = essayQs.reduce((sum, q) => sum + (next[q.id] || 0), 0);
    setScore(Math.round(((s.auto_score || 0) + sumEssay) * 10) / 10);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const isRedo = action === 'redo';
      await data.update('submissions', s.id, {
        status: isRedo ? 'redo' : 'graded',
        score: isRedo ? null : Number(score),
        hearts: isRedo ? 0 : Number(hearts),
        feedback: feedback.trim(),
        question_scores: qScores,
        graded_at: new Date().toISOString(),
      });
      logActivity(
        'grade',
        `${isRedo ? 'Yêu cầu làm lại' : 'Đã chấm bài'}: ${a?.title || 'Bài tập'}${isRedo ? '' : ` (${score}đ)`}`,
        `/nop/${s.id}`,
      );
      nav('/cham');
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#380718' }}>Bảng chấm điểm bài nộp</h3>
      <div className="seg">
        <button type="button" className={action === 'grade' ? 'on' : ''} onClick={() => setAction('grade')}>
          <b>Đạt / Ghi điểm</b>
          <small>Ghi điểm và trao điểm thưởng</small>
        </button>
        <button type="button" className={action === 'redo' ? 'on' : ''} onClick={() => setAction('redo')}>
          <b>Yêu cầu làm lại</b>
          <small>Học sinh cần làm lại bài</small>
        </button>
      </div>

      {action === 'grade' && (
        <>
          {essayQs.length > 0 && (
            <div className="stack" style={{ background: '#FFFDFE', border: '1.5px solid rgba(253, 164, 175, 0.4)', borderRadius: '16px', padding: '16px' }}>
              <b>Chấm từng câu tự luận:</b>
              {essayQs.map((q, idx) => (
                <div key={q.id} className="row between">
                  <span className="small">Câu {questions.indexOf(q) + 1} (tối đa {q.points}đ):</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max={q.points}
                    style={{ width: '90px' }}
                    value={qScores[q.id] ?? ''}
                    onChange={(e) => onQScore(q.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="row">
            <label className="field" style={{ flex: 1 }}>
              <span>Tổng điểm (trên {max})</span>
              <input type="number" step="0.25" min="0" max={max} value={score} onChange={(e) => setScore(e.target.value)} required />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Điểm thưởng trao tặng</span>
              <input type="number" min="0" max="10" value={hearts} onChange={(e) => setHearts(e.target.value)} />
            </label>
          </div>
        </>
      )}

      <label className="field">
        <span>Nhận xét bài làm</span>
        <textarea rows={3} placeholder="Ghi nhận xét và góp ý cho học sinh..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      </label>

      <button className="ios-btn ios-btn-primary big" disabled={busy}>
        {busy ? 'Đang lưu kết quả...' : action === 'grade' ? 'Lưu điểm và hoàn tất chấm bài' : 'Gửi yêu cầu làm lại'}
      </button>
    </form>
  );
}

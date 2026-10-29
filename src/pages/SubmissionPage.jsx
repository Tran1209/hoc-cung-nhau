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
      <Crumbs items={[a && { label: a.title, to: `/bt/${a.id}` }, { label: 'Bài nộp' }]} />
      <div className="row between">
        <h1>{a?.title || 'Bài nộp'}</h1>
        <StatusBadge status={s.status} />
      </div>
      <p className="small muted">
        {nameOf(s.student_id)} nộp lúc {fmtDate(s.submitted_at || s.created_at)}
        {s.started_at && a?.kind === 'exam' && (
          <> · làm trong {Math.max(1, Math.round((new Date(s.submitted_at) - new Date(s.started_at)) / 60000))} phút / {a.time_limit_minutes} phút</>
        )}
      </p>

      {s.status === 'graded' && (
        <section className="card result">
          <div className="result-score">{scoreText(s.score, max)}</div>
          <Hearts n={s.hearts} />
          {s.feedback && <p className="pre feedback">💬 {s.feedback}</p>}
          {s.graded_at && <small className="muted">Chấm lúc {fmtDate(s.graded_at)}</small>}
        </section>
      )}
      {s.status === 'redo' && (
        <section className="card result redo">
          <b>🔁 Anh yêu cầu làm lại bài này</b>
          {s.feedback && <p className="pre feedback">💬 {s.feedback}</p>}
          {!isTeacher && a && <Link className="btn primary" to={`/bt/${a.id}`}>Làm lại ngay</Link>}
        </section>
      )}

      {s.note && <div className="card note">✉️ <i className="pre">{s.note}</i></div>}

      {questions.length > 0 && a?.kind !== 'upload' && (
        <section className="card">
          <h2>Bài làm</h2>
          {questions.map((q, i) => (
            <AnswerView key={q.id} i={i} q={q} answer={s.answers?.[q.id]} k={keys[q.id]} qScore={s.question_scores?.[q.id]} showKey={isTeacher || s.status === 'graded'} />
          ))}
          {s.auto_score !== null && s.auto_score !== undefined && (
            <p className="small">Điểm trắc nghiệm tự chấm: <b>{s.auto_score}</b></p>
          )}
        </section>
      )}

      {s.files?.length > 0 && (
        <section className="card">
          <h2>📸 Ảnh bài làm ({s.files.length})</h2>
          <Gallery items={s.files.map((p, i) => ({ path: p, caption: `Trang ${i + 1}` }))} />
        </section>
      )}

      {isTeacher && s.status !== 'in_progress' && <GradePanel s={s} a={a} questions={questions} max={max} />}
    </div>
  );
}

function AnswerView({ i, q, answer, k, qScore, showKey }) {
  const [lb, setLb] = useState(null);
  const answered = answer !== undefined && answer !== '' && answer !== null;
  const hasKey = showKey && k && k.correct !== null && k.correct !== undefined;
  const right = q.type === 'mcq' && hasKey && Number(answer) === Number(k.correct);
  return (
    <div className={`qcard ${q.type === 'mcq' && hasKey ? (right ? 'right' : 'wrong') : ''}`}>
      <div className="qtitle">
        <b>Câu {i + 1}</b> <small className="muted">({q.points}đ)</small>
        {q.type === 'mcq' && hasKey && <span className="mark">{right ? '✅ Đúng' : answered ? '❌ Sai' : '⚪ Bỏ trống'}</span>}
        {q.type === 'essay' && qScore !== undefined && <span className="mark">🖊️ {qScore}/{q.points}đ</span>}
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
        <div className="essay-answer pre">{answered ? answer : <i className="muted">(không trả lời — có thể đã làm trên giấy)</i>}</div>
      )}
      {showKey && k?.explanation && <div className="explain">💡 {k.explanation}</div>}
      {lb && <div className="lightbox" onClick={() => setLb(null)}><img src={lb} alt="" /></div>}
    </div>
  );
}

function GradePanel({ s, a, questions, max }) {
  const nav = useNavigate();
  const essays = questions.filter((q) => q.type === 'essay');
  const [qScores, setQScores] = useState(s.question_scores || {});
  const [score, setScore] = useState(s.score ?? (a?.kind === 'upload' ? '' : Number(s.auto_score || 0)));
  const [feedback, setFeedback] = useState(s.feedback || '');
  const [hearts, setHearts] = useState(s.hearts || 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (a?.kind === 'upload' || !essays.length) return;
    const sum = essays.reduce((t, q) => t + Number(qScores[q.id] || 0), 0);
    setScore(Math.round((Number(s.auto_score || 0) + sum) * 100) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qScores]);

  const grade = async (status) => {
    setErr('');
    if (status === 'graded' && (score === '' || isNaN(Number(score)))) return setErr('Nhập điểm trước đã.');
    setBusy(true);
    try {
      const patch = {
        status,
        feedback,
        hearts: status === 'graded' ? Number(hearts) : 0,
        question_scores: qScores,
        score: status === 'graded' ? Number(score) : null,
        graded_at: new Date().toISOString(),
      };
      await data.update('submissions', s.id, patch);
      if (status === 'graded') {
        await logActivity('graded', `Chấm bài ${a?.title}: ${scoreText(score, max)}${hearts ? ` (+${hearts} ❤️)` : ''}`, `/nop/${s.id}`);
      } else {
        await logActivity('redo', `Yêu cầu làm lại: ${a?.title}`, `/nop/${s.id}`);
      }
      nav('/cham');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm('Xoá bài nộp này?')) return;
    await data.remove('submissions', s.id);
    for (const f of s.files || []) await data.removeFile(f);
    nav(a ? `/bt/${a.id}` : '/');
  };

  return (
    <section className="card grade">
      <h2>🖊️ Chấm bài</h2>
      {essays.length > 0 && (
        <div className="stack">
          {essays.map((q) => (
            <label key={q.id} className="inline-field">
              Câu {questions.indexOf(q) + 1} (tự luận, tối đa {q.points}đ):
              <input type="number" step="0.25" min="0" max={q.points} value={qScores[q.id] ?? ''}
                onChange={(e) => setQScores({ ...qScores, [q.id]: e.target.value === '' ? undefined : Number(e.target.value) })} />
            </label>
          ))}
        </div>
      )}
      <label className="field">
        <span>Tổng điểm (tối đa {max})</span>
        <input type="number" step="0.25" min="0" value={score} onChange={(e) => setScore(e.target.value)} />
      </label>
      <label className="field">
        <span>Lời phê</span>
        <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Giỏi lắm! Câu 2 cần trình bày kỹ hơn nha…" />
      </label>
      <div className="field">
        <span>Thưởng tim (cộng vào quỹ tình yêu 💕)</span>
        <div className="heart-pick">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className={hearts === n ? 'on' : ''} onClick={() => setHearts(n)}>
              {n === 0 ? '0' : '❤️'.repeat(n)}
            </button>
          ))}
        </div>
      </div>
      {err && <div className="error">{err}</div>}
      <div className="row between">
        <button className="btn danger ghost" onClick={del}>Xoá bài nộp</button>
        <div className="row">
          <button className="btn" disabled={busy} onClick={() => grade('redo')}>🔁 Yêu cầu làm lại</button>
          <button className="btn primary" disabled={busy} onClick={() => grade('graded')}>✅ Chấm xong</button>
        </div>
      </div>
    </section>
  );
}

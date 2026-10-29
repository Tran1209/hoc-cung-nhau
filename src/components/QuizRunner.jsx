import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useAuth } from '../context/AuthContext';
import { Gallery, FileThumb } from './Gallery';
import Uploader from './Uploader';

const LETTERS = 'ABCDEFGH';

/**
 * Làm bài trắc nghiệm / tự luận / thi online.
 * - Câu trả lời được lưu nháp liên tục (tải lại trang không mất).
 * - Bài thi: đồng hồ tính từ lúc bấm "Bắt đầu" (lưu trên server), hết giờ tự nộp.
 */
export default function QuizRunner({ assignment, questions, inProgress }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const isExam = assignment.kind === 'exam';
  const key = `hcn-draft-${assignment.id}`;
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  const [answers, setAnswers] = useState(saved.answers || {});
  const [files, setFiles] = useState(saved.files || []);
  const [note, setNote] = useState(saved.note || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [starting, setStarting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const submittedRef = useRef(false);
  const lightbox = useState(null);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ answers, files, note }));
  }, [key, answers, files, note]);

  const deadline =
    isExam && inProgress?.started_at
      ? new Date(inProgress.started_at).getTime() + Number(assignment.time_limit_minutes || 0) * 60000
      : null;
  const remaining = deadline ? Math.max(0, deadline - now) : null;

  const isQuestionDone = (q) => {
    const a = answers[q.id];
    if (a === undefined || a === null || a === '') return false;
    if (q.type === 'tf') {
      const opts = q.options || [];
      return opts.length > 0 && opts.every((_, idx) => a[idx] === true || a[idx] === false);
    }
    return true;
  };

  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      if (!auto) {
        const unanswered = questions.filter((q) => !isQuestionDone(q)).length;
        if (unanswered && !confirm(`Còn ${unanswered} câu chưa hoàn thành đủ các ý. Vẫn nộp bài?`)) return;
      }
      submittedRef.current = true;
      setBusy(true);
      setErr('');
      try {
        const s = await data.submitQuiz(assignment.id, answers, files, note);
        localStorage.removeItem(key);
        await logActivity(
          'submission',
          `${auto ? 'Hết giờ, tự nộp' : 'Nộp bài'}: ${assignment.title}${s.status === 'graded' ? ` — được ${s.score}đ` : ''}`,
          `/nop/${s.id}`,
        );
        nav(`/nop/${s.id}`);
      } catch (e) {
        submittedRef.current = false;
        setErr(e.message);
      } finally {
        setBusy(false);
      }
    },
    [answers, files, note, assignment, questions, key, nav],
  );

  // đồng hồ
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  useEffect(() => {
    if (deadline && remaining === 0) submit(true);
  }, [deadline, remaining, submit]);

  // Bài thi chưa bắt đầu
  if (isExam && !inProgress) {
    const start = async () => {
      if (!confirm(`Bắt đầu làm bài thi? Em có ${assignment.time_limit_minutes} phút và chỉ được làm 1 lần.`)) return;
      setStarting(true);
      try {
        localStorage.removeItem(key);
        setAnswers({});
        setFiles([]);
        await data.insert('submissions', {
          assignment_id: assignment.id,
          student_id: user.id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });
        logActivity('exam_start', `Bắt đầu làm bài thi: ${assignment.title}`, `/bt/${assignment.id}`);
      } catch (e) {
        setErr(e.message);
      } finally {
        setStarting(false);
      }
    };
    return (
      <div className="exam-intro">
        <h2>Bài thi định kỳ</h2>
        <p>
          Thời gian: <b>{assignment.time_limit_minutes} phút</b> · {questions.length} câu.
          <br />Đồng hồ tính giờ bắt đầu ngay khi nhấn làm bài. Hết thời gian hệ thống sẽ tự động nộp bài.
        </p>
        {err && <div className="error">{err}</div>}
        <button className="ios-btn ios-btn-primary big" disabled={starting} onClick={start}>
          {starting ? 'Đang chuẩn bị…' : 'Bắt đầu làm bài'}
        </button>
      </div>
    );
  }

  const setA = (qid, v) => setAnswers((a) => ({ ...a, [qid]: v }));
  const done = questions.filter(isQuestionDone).length;
  const hasEssay = questions.some((q) => q.type === 'essay');

  return (
    <div className="quiz">
      <div className="quiz-head">
        <h2>{isExam ? 'Đang thực hiện bài thi' : 'Làm bài tập'}</h2>
        <div className="row">
          <span className="small muted">Đã làm {done}/{questions.length}</span>
          {remaining !== null && (
            <span className={`timer ${remaining < 60000 ? 'urgent' : ''}`}>
              {String(Math.floor(remaining / 60000)).padStart(2, '0')}:
              {String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className="qcard">
          <div className="qtitle">
            <div className="row" style={{ gap: '8px' }}>
              <b>Câu {i + 1}</b>
              {q.type === 'tf' ? (
                <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C', border: '1px solid #FECDD6' }}>
                  Trắc nghiệm Đúng / Sai THPTQG 2026
                </span>
              ) : q.type === 'mcq' ? (
                <span className="badge">Trắc nghiệm 4 lựa chọn</span>
              ) : (
                <span className="badge">Tự luận vận dụng</span>
              )}
            </div>
            <small className="muted">({q.points}đ)</small>
          </div>
          <div className="pre" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: '10px 0' }}>{q.prompt}</div>
          {q.image_path && (
            <div className="qimg">
              <FileThumb path={q.image_path} onOpen={(u) => lightbox[1](u)} className="wide" />
            </div>
          )}

          {q.type === 'mcq' ? (
            <div className="choices">
              {q.options.map((o, k) =>
                o?.trim() ? (
                  <label key={k} className={`choice ${answers[q.id] === k ? 'on' : ''}`}>
                    <input type="radio" name={q.id} checked={answers[q.id] === k} onChange={() => setA(q.id, k)} />
                    <b>{LETTERS[k]}.</b> <span>{o}</span>
                  </label>
                ) : null,
              )}
            </div>
          ) : q.type === 'tf' ? (
            <div className="tf-question-box">
              <div className="tf-guideline-badge">
                Phần II: Chọn Đúng hoặc Sai cho từng mệnh đề a), b), c), d)
              </div>
              <div className="tf-table">
                {q.options.map((stmt, k) => {
                  const letter = ['a', 'b', 'c', 'd'][k] || String.fromCharCode(97 + k);
                  const currentVal = answers[q.id]?.[k];
                  return (
                    <div key={k} className="tf-row">
                      <div className="tf-stmt-text">
                        <span className="tf-letter-badge">{letter})</span>
                        <span>{stmt}</span>
                      </div>
                      <div className="tf-actions-group">
                        <button
                          type="button"
                          className={`tf-choice-btn btn-true ${currentVal === true ? 'selected' : ''}`}
                          onClick={() => {
                            const prev = answers[q.id] || {};
                            setA(q.id, { ...prev, [k]: true });
                          }}
                        >
                          Đúng
                        </button>
                        <button
                          type="button"
                          className={`tf-choice-btn btn-false ${currentVal === false ? 'selected' : ''}`}
                          onClick={() => {
                            const prev = answers[q.id] || {};
                            setA(q.id, { ...prev, [k]: false });
                          }}
                        >
                          Sai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <textarea rows={5} placeholder="Em trả lời ở đây…" value={answers[q.id] || ''} onChange={(e) => setA(q.id, e.target.value)} />
          )}
        </div>
      ))}

      {hasEssay && (
        <div className="qcard">
          <b style={{ color: '#380718' }}>Ảnh bài làm tự luận kèm theo (tuỳ chọn)</b>
          <Gallery items={files.map((p) => ({ path: p }))} onDelete={(it) => setFiles(files.filter((p) => p !== it.path))} empty="Không bắt buộc." />
          <div className="mt-sm">
            <Uploader folder={`submissions/${assignment.id}`} small onUploaded={(p) => setFiles((f) => [...f, ...p])} />
          </div>
        </div>
      )}

      <label className="field">
        <span>Ghi chú bài nộp (tuỳ chọn)</span>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {err && <div className="error">{err}</div>}
      <button className="ios-btn ios-btn-primary" style={{ padding: '12px 24px' }} disabled={busy} onClick={() => submit(false)}>
        {busy ? 'Đang nộp…' : 'Xác nhận nộp bài'}
      </button>

      {lightbox[0] && (
        <div className="lightbox" onClick={() => lightbox[1](null)}>
          <img src={lightbox[0]} alt="" />
        </div>
      )}
    </div>
  );
}

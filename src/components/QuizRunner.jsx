import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useAuth } from '../context/AuthContext';
import { Gallery, FileThumb } from './Gallery';
import Uploader from './Uploader';
import { extractEvidence } from '../lib/knowledgeExtractor';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Xoá tiền tố thừa "Câu 1.", "Câu 1:", "Bài 1." nếu có trong prompt để tránh lặp từ
 */
function cleanQuestionPrompt(prompt, index) {
  if (!prompt) return '';
  const reg = new RegExp(`^(?:Câu\\s*${index + 1}|Bài\\s*${index + 1})[.:\\s-]*`, 'i');
  return prompt.replace(reg, '').trim();
}

/**
 * Giao diện làm bài thi & bài tập trắc nghiệm THPT Quốc Gia 2026
 * Chuẩn Rose Milk Editorial Folio (Apple HIG)
 */
export default function QuizRunner({
  assignment,
  questions = [],
  inProgress,
  lesson = null,
  explanations = {},
  isPreview = false,
}) {
  const { user } = useAuth();
  const nav = useNavigate();
  const isExam = assignment.kind === 'exam';
  const key = `hcn-draft-${assignment?.id || 'default'}`;
  const [savedDraft] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  });

  const [answers, setAnswers] = useState(savedDraft.answers || {});
  const [files, setFiles] = useState(savedDraft.files || []);
  const [note, setNote] = useState(savedDraft.note || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [starting, setStarting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [showMap, setShowMap] = useState(false);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [activeTfItem, setActiveTfItem] = useState({}); // { [questionId]: statementIndex }
  const [openEvidence, setOpenEvidence] = useState({}); // { [questionId]: boolean }
  const [autoShowEvidence, setAutoShowEvidence] = useState(false); // Mặc định để "Em" tự bấm trích xuất

  const submittedRef = useRef(false);
  const lightbox = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify({ answers, files, note }));
    } catch (e) {
      console.warn('Cannot persist quiz draft:', e);
    }
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

  const doneCount = questions.filter(isQuestionDone).length;
  const totalCount = questions.length;
  const percentDone = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Cuộn mượt đến câu hỏi bất kỳ
  const scrollToQuestion = (idx) => {
    setActiveQIndex(idx);
    setShowMap(false);
    const el = document.getElementById(`question-node-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Nhảy tới câu chưa làm tiếp theo
  const jumpToNextUnanswered = () => {
    const nextIdx = questions.findIndex((q) => !isQuestionDone(q));
    if (nextIdx !== -1) {
      scrollToQuestion(nextIdx);
    } else {
      scrollToQuestion(0);
    }
  };

  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      if (!auto) {
        const unanswered = questions.filter((q) => !isQuestionDone(q)).length;
        if (
          unanswered > 0 &&
          !confirm(
            `Em còn ${unanswered} câu chưa hoàn thành đủ các ý trả lời.\nEm có chắc chắn muốn nộp bài ngay bây giờ không?`,
          )
        ) {
          return;
        }
      }
      if (isPreview) {
        alert('Anh đã hoàn thành lượt làm thử nghiệm! Em sẽ nhìn thấy giao diện và trích xuất dạ quang y hệt khi làm bài.');
        return;
      }
      submittedRef.current = true;
      setBusy(true);
      setErr('');
      try {
        const s = await data.submitQuiz(assignment.id, answers, files, note);
        try { localStorage.removeItem(key); } catch {}
        await logActivity(
          'submission',
          `${auto ? 'Hết giờ, tự nộp' : 'Nộp bài'}: ${assignment.title}${
            s.status === 'graded' ? ` — được ${s.score}đ` : ''
          }`,
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

  // Đồng hồ tính giờ
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  useEffect(() => {
    if (deadline && remaining === 0) submit(true);
  }, [deadline, remaining, submit]);

  // Màn hình bắt đầu làm bài thi
  if (isExam && !inProgress) {
    const start = async () => {
      if (!confirm(`Bắt đầu làm bài thi? Em có ${assignment.time_limit_minutes} phút và chỉ được làm 1 lần.`))
        return;
      setStarting(true);
      try {
        try { localStorage.removeItem(key); } catch {}
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
          <br />
          Đồng hồ tính giờ bắt đầu ngay khi nhấn làm bài. Hết thời gian hệ thống sẽ tự động nộp bài.
        </p>
        {err && <div className="error">{err}</div>}
        <button className="ios-btn ios-btn-primary big" disabled={starting} onClick={start}>
          {starting ? 'Đang chuẩn bị…' : 'Bắt đầu làm bài'}
        </button>
      </div>
    );
  }

  const setA = (qid, v) => setAnswers((a) => ({ ...a, [qid]: v }));
  const hasEssay = questions.some((q) => q.type === 'essay');

  return (
    <div className="quiz-container">
      {/* 1. THANH ĐIỀU HƯỚNG BÀI THI CỐ ĐỊNH (STICKY EXAM HEADER) */}
      <div className="quiz-sticky-header">
        <div className="quiz-header-info">
          <h3 className="quiz-header-title">{assignment.title}</h3>
          <div className="quiz-progress-wrap">
            <div className="quiz-progress-track">
              <div className="quiz-progress-bar" style={{ width: `${percentDone}%` }} />
            </div>
            <span className="quiz-progress-text">
              Đã làm {doneCount}/{totalCount} câu ({percentDone}%)
            </span>
          </div>
        </div>

        <div className="quiz-header-actions">
          {remaining !== null && (
            <span className={`timer ${remaining < 300000 ? 'urgent' : ''}`}>
              ⏱️ {String(Math.floor(remaining / 60000)).padStart(2, '0')}:
              {String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}
            </span>
          )}

          <button
            type="button"
            className="btn-map-toggle"
            style={{ fontSize: '0.78rem', padding: '4px 9px' }}
            onClick={() => setAutoShowEvidence((v) => !v)}
            title="Nhấp để chuyển đổi giữa Em tự bấm trích xuất hoặc Tự động mở"
          >
            {autoShowEvidence ? '⚡ Trích xuất: Tự động' : '🖐️ Trích xuất: Em tự bấm'}
          </button>

          <button
            type="button"
            className="btn-map-toggle"
            onClick={() => setShowMap((v) => !v)}
            title="Mở bảng mục lục câu hỏi"
          >
            <span>Bản đồ câu hỏi</span>
            <span className="tab-badge" style={{ marginLeft: '4px' }}>
              {doneCount}/{totalCount}
            </span>
            <span>{showMap ? '▲' : '▼'}</span>
          </button>

          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            disabled={busy}
            onClick={() => submit(false)}
          >
            {busy ? 'Đang nộp…' : 'Nộp bài'}
          </button>
        </div>
      </div>

      {/* 2. BẢN ĐỒ CÂU HỎI NHANH (DRAWER OVERLAY) */}
      {showMap && (
        <div className="quiz-map-drawer">
          <div className="quiz-map-title">
            <span>Danh sách 28 câu hỏi (Chạm số để nhảy nhanh tới câu tương ứng)</span>
            <button
              type="button"
              className="ios-btn sm ios-btn-secondary"
              style={{ padding: '2px 8px', fontSize: '0.74rem' }}
              onClick={() => setShowMap(false)}
            >
              Đóng ✕
            </button>
          </div>

          <div className="quiz-map-grid">
            {questions.map((q, idx) => {
              const done = isQuestionDone(q);
              const isCurrent = activeQIndex === idx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => scrollToQuestion(idx)}
                  className={`quiz-map-pill ${done ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                  title={`Câu ${idx + 1} (${q.type === 'tf' ? 'Đúng/Sai' : 'Trắc nghiệm'}): ${
                    done ? 'Đã hoàn thành' : 'Chưa làm'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DANH SÁCH TOÀN BỘ CÂU HỎI TRONG ĐỀ THI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {questions.map((q, i) => {
          const isDone = isQuestionDone(q);
          const promptClean = cleanQuestionPrompt(q.prompt, i);

          return (
            <div
              key={q.id}
              id={`question-node-${i}`}
              className={`quiz-card ${isDone ? 'is-answered' : ''}`}
            >
              {/* Question Header Pill Bar */}
              <div className="quiz-card-top">
                <div className="row" style={{ gap: '10px' }}>
                  <span className="quiz-qnum-pill">CÂU {i + 1}</span>

                  {q.type === 'tf' ? (
                    <span className="quiz-section-tag" style={{ color: '#BE123C', background: '#FFF0F3' }}>
                      Phần II · Trắc nghiệm Đúng / Sai theo tư liệu
                    </span>
                  ) : q.type === 'mcq' ? (
                    <span className="quiz-section-tag">Phần I · Trắc nghiệm 4 lựa chọn</span>
                  ) : (
                    <span className="quiz-section-tag">Tự luận & Vận dụng</span>
                  )}
                </div>

                <div className="row" style={{ gap: '8px' }}>
                  <span className="quiz-points-tag">
                    {q.type === 'tf' ? `${q.points || 1.0} điểm (4 ý)` : `${q.points || 0.25} điểm`}
                  </span>
                  {isDone ? (
                    <span className="badge" style={{ background: '#DCFCE7', color: '#15803D' }}>
                      ✓ Đã trả lời
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                      Chưa trả lời
                    </span>
                  )}
                </div>
              </div>

              {/* Question Body Text */}
              <div className="quiz-prompt-text">{promptClean}</div>

              {/* Optional Question Image */}
              {q.image_path && (
                <div className="qimg" style={{ marginBottom: '18px' }}>
                  <FileThumb path={q.image_path} onOpen={(u) => lightbox[1](u)} className="wide" />
                </div>
              )}

              {/* PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN (MCQ) */}
              {q.type === 'mcq' && (
                <>
                  <div className="quiz-mcq-grid">
                    {q.options.map((optText, k) => {
                      const isSelected = answers[q.id] === k;
                      const letter = LETTERS[k] || String.fromCharCode(65 + k);
                      if (!optText || !optText.trim()) return null;

                      return (
                        <div
                          key={k}
                          className={`quiz-choice-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => setA(q.id, k)}
                        >
                          <input
                            type="radio"
                            name={`q_radio_${q.id}`}
                            checked={isSelected}
                            onChange={() => setA(q.id, k)}
                          />
                          <span className="quiz-choice-letter">{letter}</span>
                          <span className="quiz-choice-label">{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* THANH THAO TÁC: EM TỰ BẤM TRÍCH XUẤT KIẾN THỨC */}
                  {answers[q.id] !== undefined && (
                    <div className="quiz-evidence-action-row" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`ios-btn sm ${openEvidence[q.id] ? 'ios-btn-secondary' : 'ios-btn-primary'}`}
                        style={{ borderRadius: '999px', fontSize: '0.8rem', padding: '4px 12px' }}
                        onClick={() => setOpenEvidence((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      >
                        {openEvidence[q.id] ? '📖 Thu gọn trích xuất ▲' : '🔍 Em tự trích xuất dẫn chứng SGK ▼'}
                      </button>
                      {!openEvidence[q.id] && (
                        <span className="small muted">
                          (Em bấm vào để xem đoạn SGK và lời dặn từ Anh đối chiếu cho phương án đã chọn)
                        </span>
                      )}
                    </div>
                  )}

                  {/* TRÍCH XUẤT KIẾN THỨC VỚI BÚT DẠ QUANG HỒNG KHI ĐÃ CHỌN ĐÁP ÁN */}
                  {answers[q.id] !== undefined && (autoShowEvidence || openEvidence[q.id]) && (() => {
                    const evidence = extractEvidence({
                      question: q,
                      selectedAnswer: answers[q.id],
                      lessonContent: lesson?.content || '',
                      studyHint: explanations[q.id],
                    });
                    if (!evidence) return null;

                    return (
                      <div className="quiz-evidence-card">
                        <div className="quiz-evidence-header">
                          <span className="quiz-evidence-icon">📖</span>
                          <div className="quiz-evidence-title-wrap">
                            <span className="quiz-evidence-title">Trích xuất từ Kiến thức (Bút dạ quang hồng)</span>
                            <span className="quiz-evidence-src">{evidence.sourceTitle}</span>
                          </div>
                          <span className="quiz-evidence-badge">
                            {evidence.isDirectSgk ? '✨ Căn cứ SGK' : '💡 Trọng tâm bài'}
                          </span>
                        </div>

                        <div className="quiz-evidence-body">
                          <div
                            className="quiz-evidence-snippet"
                            dangerouslySetInnerHTML={{ __html: evidence.excerptHtml }}
                          />
                          {evidence.noteHtml && (
                            <div className="quiz-evidence-note">
                              <span className="quiz-note-tag">💌 Lời dặn từ Anh:</span>
                              <span
                                className="quiz-note-content"
                                dangerouslySetInnerHTML={{ __html: evidence.noteHtml }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI 4 Ý (TF) */}
              {q.type === 'tf' && (
                <>
                  <div className="tf-question-box">
                    <div className="tf-guideline-badge">
                      {Number(q.points) === 2
                        ? 'Thang điểm: Đúng 1 ý = 0.2đ · 2 ý = 0.5đ · 3 ý = 1.0đ · 4 ý = 2.0đ'
                        : 'Thang điểm Bộ GD&ĐT 2026: Đúng 1 ý = 0.1đ · 2 ý = 0.25đ · 3 ý = 0.5đ · 4 ý = 1.0đ'}
                    </div>

                    <div className="tf-table">
                      {q.options.map((stmt, k) => {
                        const letter = ['a', 'b', 'c', 'd'][k] || String.fromCharCode(97 + k);
                        const currentVal = answers[q.id]?.[k];
                        const isFocused = activeTfItem[q.id] === k;

                        return (
                          <div
                            key={k}
                            className={`tf-row ${isFocused ? 'is-focused' : ''}`}
                            onClick={() => setActiveTfItem((prev) => ({ ...prev, [q.id]: k }))}
                          >
                            <div className="tf-stmt-text">
                              <span className="tf-letter-badge">{letter})</span>
                              <span>{stmt}</span>
                            </div>

                            <div className="tf-actions-group">
                              <button
                                type="button"
                                className={`tf-choice-btn btn-true ${currentVal === true ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTfItem((prev) => ({ ...prev, [q.id]: k }));
                                  const prev = answers[q.id] || {};
                                  setA(q.id, { ...prev, [k]: true });
                                }}
                              >
                                {currentVal === true ? '✓ Đúng' : 'Đúng'}
                              </button>
                              <button
                                type="button"
                                className={`tf-choice-btn btn-false ${currentVal === false ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTfItem((prev) => ({ ...prev, [q.id]: k }));
                                  const prev = answers[q.id] || {};
                                  setA(q.id, { ...prev, [k]: false });
                                }}
                              >
                                {currentVal === false ? '✕ Sai' : 'Sai'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* THANH THAO TÁC: EM TỰ BẤM TRÍCH XUẤT DẪN CHỨNG CHO Ý ĐANG CHỌN */}
                  {answers[q.id] && Object.keys(answers[q.id]).length > 0 && (
                    <div className="quiz-evidence-action-row" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`ios-btn sm ${openEvidence[q.id] ? 'ios-btn-secondary' : 'ios-btn-primary'}`}
                        style={{ borderRadius: '999px', fontSize: '0.8rem', padding: '4px 12px' }}
                        onClick={() => setOpenEvidence((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      >
                        {openEvidence[q.id] ? '📖 Thu gọn dẫn chứng tư liệu ▲' : '🔍 Em tự trích xuất dẫn chứng tư liệu cho ý này ▼'}
                      </button>
                    </div>
                  )}

                  {/* TRÍCH XUẤT KIẾN THỨC VỚI BÚT DẠ QUANG HỒNG CHO Ý ĐANG CHỌN */}
                  {answers[q.id] && Object.keys(answers[q.id]).length > 0 && (autoShowEvidence || openEvidence[q.id]) && (() => {
                    const ansObj = answers[q.id];
                    const keys = Object.keys(ansObj);
                    const focusedIdx = activeTfItem[q.id] !== undefined
                      ? activeTfItem[q.id]
                      : Number(keys[keys.length - 1]);

                    const tfEvidence = extractEvidence({
                      question: q,
                      selectedAnswer: ansObj,
                      selectedTfIndex: focusedIdx,
                      lessonContent: lesson?.content || '',
                      studyHint: explanations[q.id],
                    });
                    if (!tfEvidence) return null;

                    return (
                      <div className="quiz-evidence-card tf-evidence">
                        <div className="quiz-evidence-header">
                          <span className="quiz-evidence-icon">📖</span>
                          <div className="quiz-evidence-title-wrap">
                            <span className="quiz-evidence-title">
                              Trích xuất dẫn chứng cho ý {tfEvidence.letter}) (Bút dạ quang hồng)
                            </span>
                            <span className="quiz-evidence-src">{tfEvidence.sourceTitle}</span>
                          </div>
                          <span className="quiz-evidence-badge">
                            Ý {tfEvidence.letter.toUpperCase()}: {tfEvidence.userChoice ? 'Đã chọn: Đúng' : 'Đã chọn: Sai'}
                          </span>
                        </div>

                        <div className="quiz-evidence-body">
                          <div
                            className="quiz-evidence-snippet"
                            dangerouslySetInnerHTML={{ __html: tfEvidence.excerptHtml }}
                          />
                          {tfEvidence.noteHtml && (
                            <div className="quiz-evidence-note">
                              <span className="quiz-note-tag">💌 Lời dặn từ Anh:</span>
                              <span
                                className="quiz-note-content"
                                dangerouslySetInnerHTML={{ __html: tfEvidence.noteHtml }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* PHẦN TỰ LUẬN (ESSAY) */}
              {q.type === 'essay' && (
                <textarea
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(253, 164, 175, 0.45)',
                    background: '#FFFDFE',
                    fontSize: '0.94rem',
                    lineHeight: 1.6,
                    color: '#380718',
                  }}
                  placeholder="Nhập nội dung câu trả lời tự luận của em vào đây..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setA(q.id, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Ảnh bài làm tự luận kèm theo nếu có */}
      {hasEssay && (
        <div className="quiz-card" style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#380718' }}>Ảnh bài làm tự luận đính kèm (tuỳ chọn)</h4>
          <Gallery
            items={files.map((p) => ({ path: p }))}
            onDelete={(it) => setFiles(files.filter((p) => p !== it.path))}
            empty="Không bắt buộc."
          />
          <div className="mt-sm">
            <Uploader
              folder={`submissions/${assignment.id}`}
              small
              onUploaded={(p) => setFiles((f) => [...f, ...p])}
            />
          </div>
        </div>
      )}

      {/* Ghi chú khi nộp bài */}
      <div className="quiz-card" style={{ marginTop: '20px' }}>
        <label className="field" style={{ margin: 0 }}>
          <span style={{ fontWeight: 700, color: '#380718' }}>Ghi chú dặn dò khi nộp bài (tuỳ chọn)</span>
          <textarea
            rows={2}
            placeholder="Lời nhắn gửi Nam khi chấm bài..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      {err && <div className="error">{err}</div>}

      {/* 4. THANH NỘP BÀI NỔI CỐ ĐỊNH Ở ĐÁY MÀN HÌNH (FLOATING DOCK) */}
      <div className="quiz-floating-dock">
        <div className="quiz-dock-inner">
          <div className="row" style={{ gap: '10px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#380718' }}>
              Đã làm: <b>{doneCount}</b>/{totalCount} câu
            </span>
            {doneCount < totalCount && (
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={jumpToNextUnanswered}
                title="Chuyển ngay đến câu chưa làm"
              >
                Tới câu chưa làm →
              </button>
            )}
          </div>

          <div className="row" style={{ gap: '8px' }}>
            <button
              type="button"
              className="ios-btn sm ios-btn-secondary"
              onClick={() => setShowMap((v) => !v)}
            >
              {showMap ? 'Ẩn bản đồ' : 'Bản đồ câu hỏi'}
            </button>

            <button
              type="button"
              className="ios-btn sm ios-btn-primary"
              style={{ padding: '8px 24px', fontWeight: 800 }}
              disabled={busy}
              onClick={() => submit(false)}
            >
              {busy ? 'Đang nộp bài…' : 'Xác nhận nộp bài (10.0đ)'}
            </button>
          </div>
        </div>
      </div>

      {lightbox[0] && (
        <div className="lightbox" onClick={() => lightbox[1](null)}>
          <img src={lightbox[0]} alt="" />
        </div>
      )}
    </div>
  );
}

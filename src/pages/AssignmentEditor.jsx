import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useAuth } from '../context/AuthContext';
import { Gallery } from '../components/Gallery';
import Uploader from '../components/Uploader';
import { Modal } from '../components/Modal';
import { Empty, ErrorBox, Loading, Crumbs } from '../components/ui';
import { fromLocalInput, toLocalInput, uid, sortByPos, nextSaturday } from '../lib/format';
import { generateThptqg2026Template, parseThptqgExam, parseDocxFile } from '../lib/examParser';

const LETTERS = 'ABCDEFGH';

export default function AssignmentEditor() {
  const { id } = useParams();
  const { isTeacher } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [orig, setOrig] = useState(null);
  const [qs, setQs] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [loadErr, setLoadErr] = useState('');

  // Nạp từ file Word (.docx) & Bộ công cụ THPTQG 2026
  const docxInputRef = useRef(null);
  const [parsingDocx, setParsingDocx] = useState(false);
  const [importNotice, setImportNotice] = useState('');

  const showImportNotice = (msg) => {
    setImportNotice(msg);
    setTimeout(() => setImportNotice(''), 3500);
  };

  const handleDocxUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingDocx(true);
    try {
      const parsed = await parseDocxFile(file);
      if (!parsed.length) {
        alert('Không nhận diện được câu hỏi nào từ file Word này. Hãy kiểm tra định dạng file.');
        return;
      }
      const mcqCount = parsed.filter((q) => q.type === 'mcq').length;
      const tfCount = parsed.filter((q) => q.type === 'tf').length;
      if (
        confirm(
          `Đã nhận diện thành công ${parsed.length} câu hỏi từ file Word (.docx):\n- ${mcqCount} câu trắc nghiệm (Phần I)\n- ${tfCount} câu Đúng / Sai (Phần II)\n\nBạn có muốn nạp toàn bộ vào đề thi này không?`,
        )
      ) {
        setQs(parsed.map((q) => ({ ...q, _new: true, assignment_id: id })));
        showImportNotice(`Đã nạp thành công ${parsed.length} câu từ file Word!`);
      }
    } catch (err) {
      alert('Lỗi nạp file Word: ' + err.message);
    } finally {
      setParsingDocx(false);
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  const handleLoadThptqgTemplate = () => {
    if (
      qs.length > 0 &&
      !confirm(
        'Thao tác này sẽ tạo khung mẫu gồm 24 câu trắc nghiệm + 4 câu Đúng/Sai chuẩn THPTQG 2026 (10 điểm). Bạn có muốn tạo lại không?',
      )
    ) {
      return;
    }
    const template = generateThptqg2026Template(form?.title || 'Lịch Sử 12');
    setQs(template.map((q) => ({ ...q, _new: true, assignment_id: id })));
    showImportNotice('Đã tạo khung mẫu chuẩn 24 câu trắc nghiệm + 4 câu Đúng/Sai THPTQG 2026!');
  };

  const applyBulk = (parsed) => {
    setQs((prev) => [...prev, ...parsed.map((q) => ({ ...q, _new: true, assignment_id: id }))]);
    setBulk(false);
    showImportNotice(`Đã nạp thành công ${parsed.length} câu hỏi vào đề thi!`);
  };

  useEffect(() => {
    (async () => {
      try {
        const a = await data.get('assignments', id);
        if (!a) return setLoadErr('Không tìm thấy bài tập.');
        const questions = sortByPos(await data.list('questions', { where: { assignment_id: id } }));
        const keys = await data.list('answer_keys', { where: { question_id: questions.map((q) => q.id) } });
        const kmap = Object.fromEntries(keys.map((k) => [k.question_id, k]));
        setOrig(a);
        setForm({
          ...a,
          due_local: toLocalInput(a.due_at),
          publish_local: toLocalInput(a.publish_at),
        });
        setQs(
          questions.map((q) => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : [],
            correct: kmap[q.id]?.correct ?? null,
            explanation: kmap[q.id]?.explanation ?? '',
          })),
        );
      } catch (e) {
        setLoadErr(e.message);
      }
    })();
  }, [id]);

  if (!isTeacher) return <Empty>Chỉ người quản lý (Nam) mới sửa được bài tập.</Empty>;
  if (loadErr) return <ErrorBox error={loadErr} />;
  if (!form) return <Loading />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setQ = (i, patch) => setQs((list) => list.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  const addQ = (type) =>
    setQs((list) => [
      ...list,
      {
        id: uid(),
        _new: true,
        assignment_id: id,
        type,
        prompt: '',
        image_path: null,
        options: type === 'mcq' ? ['', '', '', ''] : type === 'tf' ? ['', '', '', ''] : [],
        points: type === 'tf' ? 1.0 : 0.25,
        correct: type === 'tf' ? { 0: true, 1: false, 2: false, 3: true } : 0,
        explanation: '',
      },
    ]);

  const removeQ = (i) => {
    const q = qs[i];
    if (!q._new) setDeleted((d) => [...d, q.id]);
    setQs((list) => list.filter((_, j) => j !== i));
  };

  const moveQ = (i, dir) =>
    setQs((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const needsQuestions = form.kind !== 'upload';
  const total = Number(qs.reduce((s, q) => s + Number(q.points || 0), 0).toFixed(2));

  const save = async (publishNow) => {
    setErr('');
    if (!form.title.trim()) return setErr('Cần nhập tên bài tập.');
    if (needsQuestions && qs.length === 0) return setErr('Bài làm online cần ít nhất 1 câu hỏi.');

    for (const [i, q] of qs.entries()) {
      if (q.type === 'mcq') {
        const opts = (q.options || []).filter((o) => o?.trim());
        if (opts.length < 2) return setErr(`Câu ${i + 1}: cần ít nhất 2 đáp án.`);
        if (q.correct === null || q.correct === undefined || !q.options[q.correct]?.trim())
          return setErr(`Câu ${i + 1}: chưa chọn đáp án đúng.`);
      } else if (q.type === 'tf') {
        const opts = (q.options || []).filter((o) => o?.trim());
        if (opts.length < 4) return setErr(`Câu ${i + 1} (Đúng/Sai THPTQG 2026): cần nhập đủ 4 mệnh đề a, b, c, d.`);
      }
    }
    if (form.kind === 'exam' && !(Number(form.time_limit_minutes) > 0)) return setErr('Bài thi cần thời gian làm bài (phút).');

    setBusy(true);
    try {
      const is_published = publishNow === undefined ? form.is_published : publishNow;
      await data.update('assignments', id, {
        title: form.title.trim(),
        instructions: form.instructions || '',
        kind: form.kind,
        max_score: Number(form.max_score || 10),
        time_limit_minutes: form.kind === 'exam' ? Number(form.time_limit_minutes) : null,
        due_at: fromLocalInput(form.due_local),
        publish_at: fromLocalInput(form.publish_local),
        is_published,
        attachments: form.attachments || [],
        position: Number(form.position || 0),
      });

      for (const qid of deleted) await data.remove('questions', qid);

      if (needsQuestions) {
        for (const [i, q] of qs.entries()) {
          await data.upsert('questions', {
            id: q.id,
            assignment_id: id,
            type: q.type,
            prompt: q.prompt,
            image_path: q.image_path || null,
            options: q.type === 'mcq' || q.type === 'tf' ? q.options : [],
            points: Number(q.points || 0),
            position: i,
          });
          await data.upsert(
            'answer_keys',
            {
              question_id: q.id,
              correct: q.type === 'mcq' || q.type === 'tf' ? q.correct : null,
              explanation: q.explanation || '',
            },
            'question_id',
          );
        }
      }

      if (is_published && !orig.is_published) {
        const when = form.publish_local && new Date(form.publish_local) > new Date() ? ` (mở lúc ${form.publish_local.replace('T', ' ')})` : '';
        logActivity('assignment', `Giao bài mới: ${form.title.trim()}${when}`, `/bt/${id}`);
      }
      nav(`/bt/${id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm(`Xoá bài tập "${orig.title}"? Không thể hoàn tác.`)) return;
    await data.remove('assignments', id);
    nav(orig.lesson_id ? `/bai/${orig.lesson_id}` : `/chuong/${orig.chapter_id}`);
  };

  return (
    <div className="page">
      <div className="folio-sheet">
        <header className="folio-header">
          <Crumbs
            items={[
              { label: 'Bài tập', to: orig.lesson_id ? `/bai/${orig.lesson_id}?tab=exercises` : `/chuong/${orig.chapter_id}` },
              { label: orig.title, to: `/bt/${id}` },
              { label: 'Soạn đề & Quản lý câu hỏi' },
            ]}
          />
          <h1 className="folio-title">Soạn đề bài tập: {orig.title}</h1>
          <div className="folio-meta-bar">
            <span className="badge">Dành cho Nam</span>
            <span className="badge">Chuẩn Đề THPT Quốc Gia 2026</span>
            <span className="badge">24 câu trắc nghiệm + 4 câu Đúng / Sai</span>
          </div>
        </header>

        {/* Thông tin cơ bản của bài tập */}
        <section className="form-grid" style={{ marginBottom: '24px' }}>
          <label className="field">
            <span>Tên bài tập / Đề thi *</span>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="VD: BT1: Đề thi thử THPT Quốc Gia 2026" />
          </label>

          <label className="field">
            <span>Hình thức bài tập</span>
            <select value={form.kind} onChange={(e) => set({ kind: e.target.value })}>
              <option value="quiz">Trắc nghiệm & Đúng/Sai online (tự động chấm điểm)</option>
              <option value="exam">Bài thi có bấm giờ định kỳ</option>
              <option value="upload">Nộp file / ảnh chụp bài làm tự luận</option>
            </select>
          </label>

          {form.kind === 'exam' && (
            <label className="field">
              <span>Thời gian làm bài (phút) *</span>
              <input type="number" min="5" value={form.time_limit_minutes || 50} onChange={(e) => set({ time_limit_minutes: e.target.value })} />
            </label>
          )}

          <label className="field">
            <span>Điểm tối đa</span>
            <input type="number" min="1" value={form.max_score} onChange={(e) => set({ max_score: e.target.value })} />
          </label>

          <label className="field full">
            <span>Hướng dẫn làm bài / Yêu cầu</span>
            <textarea rows={2} value={form.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder="Gợi ý hoặc lưu ý cho học sinh khi làm bài..." />
          </label>

          <div className="row full" style={{ gap: '16px' }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Hạn nộp</span>
              <input type="datetime-local" value={form.due_local} onChange={(e) => set({ due_local: e.target.value })} />
              <button type="button" className="link small" onClick={() => set({ due_local: toLocalInput(nextSaturday(20).toISOString()) })}>
                → 20:00 Thứ 7 tuần này
              </button>
            </label>

            <label className="field" style={{ flex: 1 }}>
              <span>Hẹn giờ mở đề</span>
              <input type="datetime-local" value={form.publish_local} onChange={(e) => set({ publish_local: e.target.value })} />
            </label>
          </div>
        </section>

        {needsQuestions && (
          <section style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1.5px solid rgba(253, 164, 175, 0.35)' }}>
            {/* HỘP CÔNG CỤ NẠP ĐỀ DÀNH CHO NAM (NẠP WORD, DÁN VĂN BẢN, TẠO MẪU 24+4) */}
            <div className="thptqg-tool-box" style={{ background: '#FFFDFE', border: '1.5px solid rgba(253, 164, 175, 0.45)', borderRadius: '16px', padding: '16px 20px', marginBottom: '22px' }}>
              <div className="row between" style={{ flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <div className="row" style={{ gap: '8px' }}>
                    <span className="badge" style={{ background: '#380718', color: '#FFFFFF' }}>Bên Nam</span>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', color: '#380718' }}>Bộ công cụ nạp đề chuẩn THPT Quốc Gia 2026</h3>
                  </div>
                  <div className="small muted" style={{ marginTop: '2px' }}>
                    Đề gồm <b>24 câu trắc nghiệm</b> (Phần I - 6.0đ) + <b>4 câu Đúng / Sai</b> (Phần II - 4.0đ)
                  </div>
                </div>

                <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
                  {/* 1. Nạp từ file Word .docx */}
                  <input
                    type="file"
                    ref={docxInputRef}
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    onChange={handleDocxUpload}
                  />
                  <button
                    type="button"
                    className="ios-btn sm ios-btn-primary"
                    disabled={parsingDocx}
                    onClick={() => docxInputRef.current?.click()}
                  >
                    {parsingDocx ? 'Đang đọc file Word...' : '📄 Nạp từ file Word (.docx)'}
                  </button>

                  {/* 2. Dán văn bản đề thi */}
                  <button
                    type="button"
                    className="ios-btn sm ios-btn-secondary"
                    onClick={() => setBulk(true)}
                  >
                    📋 Dán văn bản đề thi
                  </button>

                  {/* 3. Tạo khung mẫu 24 MCQ + 4 Đúng/Sai */}
                  <button
                    type="button"
                    className="ios-btn sm ios-btn-secondary"
                    onClick={handleLoadThptqgTemplate}
                  >
                    ⚡ Tạo khung mẫu 24+4
                  </button>
                </div>
              </div>

              <div className="row between" style={{ fontSize: '0.82rem', color: '#9F1239', flexWrap: 'wrap', gap: '10px' }}>
                <div className="row" style={{ gap: '14px' }}>
                  <span>Số câu: <b>{qs.length}</b> ({qs.filter((q) => q.type === 'mcq').length} trắc nghiệm, {qs.filter((q) => q.type === 'tf').length} Đúng/Sai)</span>
                  <span>Tổng điểm: <b>{total}</b> / 10 điểm</span>
                </div>
                {importNotice && <span style={{ color: '#059669', fontWeight: 700 }}>✓ {importNotice}</span>}
              </div>
            </div>

            {/* Danh sách câu hỏi */}
            <div className="row between" style={{ marginBottom: '16px' }}>
              <div className="row">
                <span className="idx-badge">{qs.length}</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>Danh sách chi tiết các câu hỏi</h3>
              </div>
              <div className="row" style={{ gap: '8px' }}>
                {qs.length > 0 && (
                  <button
                    type="button"
                    className="btn ghost sm danger"
                    onClick={() => {
                      if (confirm('Xoá toàn bộ câu hỏi trong đề để nạp lại từ đầu?')) setQs([]);
                    }}
                  >
                    Xoá tất cả
                  </button>
                )}
              </div>
            </div>

            {qs.length === 0 && (
              <div className="empty-lesson-banner" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p className="muted" style={{ marginBottom: '12px' }}>
                  Đề thi chưa có câu hỏi nào. Bạn có thể nạp ngay từ <b>File Word (.docx)</b>, dán văn bản, hoặc tạo khung chuẩn 24 câu trắc nghiệm + 4 câu Đúng/Sai.
                </p>
                <div className="row center" style={{ gap: '8px', justifyContent: 'center' }}>
                  <button type="button" className="ios-btn sm ios-btn-primary" onClick={() => docxInputRef.current?.click()}>
                    📄 Nạp từ file Word (.docx)
                  </button>
                  <button type="button" className="ios-btn sm ios-btn-secondary" onClick={handleLoadThptqgTemplate}>
                    ⚡ Tạo khung mẫu 24+4 THPTQG
                  </button>
                </div>
              </div>
            )}

            {qs.map((q, i) => (
              <div key={q.id} className="qedit">
                <div className="row between">
                  <b>Câu {i + 1} · {q.type === 'mcq' ? 'Trắc nghiệm 4 lựa chọn (Phần I)' : q.type === 'tf' ? 'Trắc nghiệm Đúng / Sai (Phần II - THPTQG 2026)' : 'Tự luận'}</b>
                  <div className="row">
                    <label className="inline-field">
                      Điểm <input type="number" step="0.25" min="0" value={q.points} onChange={(e) => setQ(i, { points: e.target.value })} />
                    </label>
                    <button className="btn ghost sm" onClick={() => moveQ(i, -1)} title="Lên">↑</button>
                    <button className="btn ghost sm" onClick={() => moveQ(i, 1)} title="Xuống">↓</button>
                    <button className="btn ghost sm danger" onClick={() => removeQ(i)} title="Xoá">Xoá</button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder={q.type === 'tf' ? 'Nhập đoạn tư liệu lịch sử và lời dẫn câu hỏi Đúng/Sai...' : 'Nội dung câu hỏi trắc nghiệm...'}
                  value={q.prompt}
                  onChange={(e) => setQ(i, { prompt: e.target.value })}
                />

                <div className="row">
                  {q.image_path ? (
                    <Gallery items={[{ path: q.image_path }]} onDelete={() => setQ(i, { image_path: null })} />
                  ) : (
                    <Uploader folder={`questions/${id}`} multiple={false} accept="image/*" small label="+ Thêm ảnh câu hỏi"
                      onUploaded={([p]) => setQ(i, { image_path: p })} />
                  )}
                </div>

                {/* 1. Phần I: Trắc nghiệm 4 lựa chọn */}
                {q.type === 'mcq' && (
                  <div className="opts">
                    {q.options.map((o, k) => (
                      <div key={k} className={`opt-edit ${q.correct === k ? 'correct' : ''}`}>
                        <label title="Đáp án đúng">
                          <input type="radio" name={`c-${q.id}`} checked={q.correct === k} onChange={() => setQ(i, { correct: k })} />
                          <b>{LETTERS[k]}</b>
                        </label>
                        <input
                          value={o}
                          placeholder={`Đáp án ${LETTERS[k]}`}
                          onChange={(e) => setQ(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })}
                        />
                        {q.options.length > 2 && (
                          <button className="btn ghost sm" onClick={() =>
                            setQ(i, {
                              options: q.options.filter((_, m) => m !== k),
                              correct: q.correct === k ? null : q.correct > k ? q.correct - 1 : q.correct,
                            })}>✕</button>
                        )}
                      </div>
                    ))}
                    {q.options.length < LETTERS.length && (
                      <button className="link small" onClick={() => setQ(i, { options: [...q.options, ''] })}>+ Thêm đáp án</button>
                    )}
                  </div>
                )}

                {/* 2. Phần II: Trắc nghiệm Đúng / Sai 4 ý a, b, c, d */}
                {q.type === 'tf' && (
                  <div className="tf-edit-box" style={{ marginTop: '12px', background: '#FFFDFE', padding: '12px', borderRadius: '12px', border: '1px solid rgba(253, 164, 175, 0.4)' }}>
                    <div className="small muted" style={{ marginBottom: '8px', fontWeight: 700, color: '#BE123C' }}>
                      Phần II Đúng / Sai: Nhập 4 mệnh đề a, b, c, d và chọn phương án Đúng hoặc Sai:
                    </div>
                    {['a', 'b', 'c', 'd'].map((letter, k) => {
                      const isTrue = q.correct?.[k] === true;
                      const isFalse = q.correct?.[k] === false;
                      return (
                        <div key={k} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          <b style={{ minWidth: '24px', color: '#BE123C' }}>{letter})</b>
                          <input
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(253, 164, 175, 0.45)', background: '#FFFFFF' }}
                            placeholder={`Mệnh đề ${letter})…`}
                            value={q.options?.[k] || ''}
                            onChange={(e) => {
                              const newOpts = [...(q.options || ['', '', '', ''])];
                              newOpts[k] = e.target.value;
                              setQ(i, { options: newOpts });
                            }}
                          />
                          <div className="row" style={{ gap: '4px' }}>
                            <button
                              type="button"
                              className={`ios-btn sm ${isTrue ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                              style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                              onClick={() => {
                                const nextKey = { ...(q.correct || {}), [k]: true };
                                setQ(i, { correct: nextKey });
                              }}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              className={`ios-btn sm ${isFalse ? 'ios-btn-primary' : 'ios-btn-secondary'}`}
                              style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                              onClick={() => {
                                const nextKey = { ...(q.correct || {}), [k]: false };
                                setQ(i, { correct: nextKey });
                              }}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <input
                  className="mt-sm"
                  placeholder={q.type === 'mcq' || q.type === 'tf' ? 'Giải thích đáp án (học viên xem sau khi chấm) — tuỳ chọn' : 'Gợi ý đáp án / ghi chú chấm bài'}
                  value={q.explanation}
                  onChange={(e) => setQ(i, { explanation: e.target.value })}
                />
              </div>
            ))}

            <div className="row mt" style={{ gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="ios-btn sm ios-btn-secondary" onClick={() => addQ('mcq')}>
                + Thêm trắc nghiệm 4 lựa chọn
              </button>
              <button type="button" className="ios-btn sm ios-btn-primary" onClick={() => addQ('tf')}>
                + Thêm câu hỏi Đúng / Sai (THPTQG 2026)
              </button>
              <button type="button" className="ios-btn sm ios-btn-secondary" onClick={() => addQ('essay')}>
                + Thêm tự luận
              </button>
            </div>
          </section>
        )}

        {err && <div className="error">{err}</div>}
        <div className="row between sticky-actions" style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1.5px solid rgba(253, 164, 175, 0.35)' }}>
          <button className="btn danger ghost" onClick={del}>Xoá bài tập</button>
          <div className="row">
            <button className="ios-btn sm ios-btn-secondary" onClick={() => nav(`/bt/${id}`)}>Huỷ bỏ</button>
            {form.is_published ? (
              <>
                <button className="ios-btn sm ios-btn-secondary" disabled={busy} onClick={() => save(false)}>Thu hồi về nháp</button>
                <button className="ios-btn sm ios-btn-primary" disabled={busy} onClick={() => save(true)}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
              </>
            ) : (
              <>
                <button className="ios-btn sm ios-btn-secondary" disabled={busy} onClick={() => save(false)}>{busy ? 'Đang lưu…' : 'Lưu bản nháp'}</button>
                <button className="ios-btn sm ios-btn-primary" disabled={busy} onClick={() => save(true)}>Giao bài cho học viên</button>
              </>
            )}
          </div>
        </div>
      </div>

      {bulk && <BulkImport onClose={() => setBulk(false)} onApply={applyBulk} />}
    </div>
  );
}

/** Nhập nhanh nhiều câu hỏi bằng cách dán văn bản (hỗ trợ bóc tách cả MCQ và Đúng/Sai THPTQG 2026) */
function BulkImport({ onClose, onApply }) {
  const [text, setText] = useState('');
  const parsed = text.trim() ? parseThptqgExam(text) : [];
  const mcqs = parsed.filter((p) => p.type === 'mcq');
  const tfs = parsed.filter((p) => p.type === 'tf');
  const essays = parsed.filter((p) => p.type === 'essay');

  return (
    <Modal title="Nạp nhanh đề thi từ văn bản (Copy/Paste)" onClose={onClose} wide>
      <div style={{ marginBottom: '12px' }}>
        <p className="small muted" style={{ margin: 0, lineHeight: 1.6 }}>
          Hỗ trợ nhận diện tự động cấu trúc Đề thi THPT Quốc Gia 2026:
          <br />
          • <b>Phần I:</b> Câu trắc nghiệm 4 lựa chọn (VD: <code>Câu 1: ... A. ... *B. ... C. ... D. ...</code>)
          <br />
          • <b>Phần II:</b> Câu Đúng/Sai (VD: <code>Câu 1: Đọc đoạn tư liệu... a) ... (Đúng) b) ... (Sai)</code>)
        </p>
      </div>

      <textarea
        rows={13}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn\nCâu 1. Hiến chương Liên hợp quốc có hiệu lực khi nào?\n*A. 24 - 10 - 1945\nB. 02 - 09 - 1945\nC. 08 - 08 - 1967\nD. 20 - 09 - 1977\n\nPHẦN II. Câu trắc nghiệm đúng sai\nCâu 1. Đọc đoạn tư liệu sau đây về sự hình thành Liên hợp quốc...\na) Hội nghị Xan Phran-xi-xcô có 50 nước tham gia. (Đúng)\nb) Ngày 24-10 là Ngày Liên hợp quốc. (Đúng)\nc) Liên hợp quốc can thiệp nội bộ các nước. (Sai)\nd) Bình đẳng chủ quyền là nguyên tắc cốt lõi. (Đúng)`}
        style={{ fontFamily: 'monospace', fontSize: '0.86rem' }}
      />

      <div className="row between" style={{ marginTop: '10px' }}>
        <div className="small">
          Đã nhận diện: <b>{mcqs.length}</b> trắc nghiệm (Phần I), <b>{tfs.length}</b> Đúng/Sai (Phần II - {tfs.length * 4} ý a,b,c,d)
          {essays.length > 0 && <span>, <b>{essays.length}</b> tự luận</span>}
        </div>
      </div>

      <div className="row end" style={{ marginTop: '16px', gap: '8px' }}>
        <button className="ios-btn sm ios-btn-secondary" onClick={onClose}>Huỷ</button>
        <button
          className="ios-btn sm ios-btn-primary"
          disabled={!parsed.length}
          onClick={() => onApply(parsed)}
        >
          Nạp {parsed.length} câu vào đề
        </button>
      </div>
    </Modal>
  );
}

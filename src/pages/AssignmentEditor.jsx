import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useAuth } from '../context/AuthContext';
import { Gallery } from '../components/Gallery';
import Uploader from '../components/Uploader';
import { Modal } from '../components/Modal';
import { Empty, ErrorBox, Loading, Crumbs } from '../components/ui';
import { fromLocalInput, toLocalInput, uid, sortByPos, nextSaturday } from '../lib/format';

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

  if (!isTeacher) return <Empty>Chỉ người quản lý mới sửa được bài tập.</Empty>;
  if (loadErr) return <ErrorBox error={loadErr} />;
  if (!form) return <Loading />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setQ = (i, patch) => setQs((list) => list.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const addQ = (type) =>
    setQs((list) => [
      ...list,
      {
        id: uid(), _new: true, assignment_id: id, type, prompt: '', image_path: null,
        options: type === 'mcq' ? ['', '', '', ''] : [], points: 1, correct: null, explanation: '',
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
  const total = qs.reduce((s, q) => s + Number(q.points || 0), 0);

  const save = async (publishNow) => {
    setErr('');
    if (!form.title.trim()) return setErr('Cần nhập tên bài tập.');
    if (needsQuestions && qs.length === 0) return setErr('Bài làm online cần ít nhất 1 câu hỏi.');
    for (const [i, q] of qs.entries()) {
      if (q.type === 'mcq') {
        const opts = q.options.filter((o) => o.trim());
        if (opts.length < 2) return setErr(`Câu ${i + 1}: cần ít nhất 2 đáp án.`);
        if (q.correct === null || q.correct === undefined || !q.options[q.correct]?.trim())
          return setErr(`Câu ${i + 1}: chưa chọn đáp án đúng.`);
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
            options: q.type === 'mcq' ? q.options : [],
            points: Number(q.points || 0),
            position: i,
          });
          await data.upsert(
            'answer_keys',
            { question_id: q.id, correct: q.type === 'mcq' ? q.correct : null, explanation: q.explanation || '' },
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
    if (!confirm('Xoá bài tập này cùng toàn bộ bài nộp? Không thể hoàn tác!')) return;
    await data.remove('assignments', id);
    nav(orig.lesson_id ? `/bai/${orig.lesson_id}` : `/chuong/${orig.chapter_id}`);
  };

  const applyBulk = (parsed) => {
    setQs((list) => [...list, ...parsed.map((p) => ({ ...p, id: uid(), _new: true, assignment_id: id, image_path: null }))]);
    setBulk(false);
  };

  return (
    <div className="page">
      <Crumbs items={[{ label: orig.title, to: `/bt/${id}` }, { label: 'Sửa' }]} />
      <h1>✏️ Soạn bài tập</h1>

      <section className="card form">
        <label className="field">
          <span>Tên bài tập</span>
          <input value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </label>

        <div className="field">
          <span>Loại bài</span>
          <div className="seg">
            {[
              ['upload', '📸 Nộp ảnh', 'Em làm ra giấy, chụp ảnh nộp'],
              ['quiz', '📝 Làm online', 'Trắc nghiệm + tự luận, không giới hạn giờ'],
              ['exam', '⏱️ Bài thi', 'Có đồng hồ đếm ngược, chỉ làm 1 lần'],
            ].map(([k, label, hint]) => (
              <button key={k} type="button" className={form.kind === k ? 'on' : ''} onClick={() => set({ kind: k })}>
                <b>{label}</b>
                <small>{hint}</small>
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Đề bài / hướng dẫn</span>
          <textarea rows={5} value={form.instructions} onChange={(e) => set({ instructions: e.target.value })}
            placeholder="VD: Làm bài 1, 2, 3 trang 15 SGK. Trình bày rõ ràng nha!" />
        </label>

        <div className="field">
          <span>Ảnh đề bài (tuỳ chọn)</span>
          <Gallery
            items={(form.attachments || []).map((p) => ({ path: p }))}
            onDelete={(it) => set({ attachments: form.attachments.filter((p) => p !== it.path) })}
            empty="Chưa có ảnh đề."
          />
          <div className="mt-sm">
            <Uploader folder={`assignments/${id}`} label="📎 Thêm ảnh đề" small
              onUploaded={(paths) => set({ attachments: [...(form.attachments || []), ...paths] })} />
          </div>
        </div>

        <div className="grid3">
          {form.kind === 'upload' ? (
            <label className="field">
              <span>Thang điểm</span>
              <input type="number" min="1" value={form.max_score} onChange={(e) => set({ max_score: e.target.value })} />
            </label>
          ) : (
            <div className="field">
              <span>Tổng điểm</span>
              <div className="big-num">{total}</div>
            </div>
          )}
          {form.kind === 'exam' && (
            <label className="field">
              <span>Thời gian làm (phút)</span>
              <input type="number" min="1" value={form.time_limit_minutes || ''}
                onChange={(e) => set({ time_limit_minutes: e.target.value })} />
            </label>
          )}
          <label className="field">
            <span>Thứ tự</span>
            <input type="number" value={form.position} onChange={(e) => set({ position: e.target.value })} />
          </label>
        </div>

        <div className="grid2">
          <label className="field">
            <span>Hạn nộp</span>
            <input type="datetime-local" value={form.due_local} onChange={(e) => set({ due_local: e.target.value })} />
            <button type="button" className="link small" onClick={() => set({ due_local: toLocalInput(nextSaturday(20).toISOString()) })}>
              → 20:00 thứ 7 tới
            </button>
          </label>
          <label className="field">
            <span>Tự động mở cho em lúc (để trống = mở ngay khi giao)</span>
            <input type="datetime-local" value={form.publish_local} onChange={(e) => set({ publish_local: e.target.value })} />
            <button type="button" className="link small" onClick={() => set({ publish_local: toLocalInput(nextSaturday(8).toISOString()) })}>
              → 8:00 sáng thứ 7 tới
            </button>
          </label>
        </div>
      </section>

      {needsQuestions && (
        <section className="card">
          <div className="row between">
            <h2>❓ Câu hỏi ({qs.length})</h2>
            <button className="btn ghost sm" onClick={() => setBulk(true)}>⚡ Nhập nhanh từ văn bản</button>
          </div>
          {qs.length === 0 && <Empty>Chưa có câu hỏi nào.</Empty>}
          {qs.map((q, i) => (
            <div key={q.id} className="qedit">
              <div className="row between">
                <b>Câu {i + 1} · {q.type === 'mcq' ? 'Trắc nghiệm' : 'Tự luận'}</b>
                <div className="row">
                  <label className="inline-field">
                    Điểm <input type="number" step="0.25" min="0" value={q.points} onChange={(e) => setQ(i, { points: e.target.value })} />
                  </label>
                  <button className="btn ghost sm" onClick={() => moveQ(i, -1)} title="Lên">↑</button>
                  <button className="btn ghost sm" onClick={() => moveQ(i, 1)} title="Xuống">↓</button>
                  <button className="btn ghost sm danger" onClick={() => removeQ(i)} title="Xoá">🗑</button>
                </div>
              </div>
              <textarea rows={2} placeholder="Nội dung câu hỏi…" value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} />
              <div className="row">
                {q.image_path ? (
                  <Gallery items={[{ path: q.image_path }]} onDelete={() => setQ(i, { image_path: null })} />
                ) : (
                  <Uploader folder={`questions/${id}`} multiple={false} accept="image/*" small label="🖼️ Ảnh câu hỏi"
                    onUploaded={([p]) => setQ(i, { image_path: p })} />
                )}
              </div>
              {q.type === 'mcq' && (
                <div className="opts">
                  {q.options.map((o, k) => (
                    <div key={k} className={`opt-edit ${q.correct === k ? 'correct' : ''}`}>
                      <label title="Đáp án đúng">
                        <input type="radio" name={`c-${q.id}`} checked={q.correct === k} onChange={() => setQ(i, { correct: k })} />
                        <b>{LETTERS[k]}</b>
                      </label>
                      <input value={o} placeholder={`Đáp án ${LETTERS[k]}`}
                        onChange={(e) => setQ(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} />
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
                    <button className="link small" onClick={() => setQ(i, { options: [...q.options, ''] })}>+ thêm đáp án</button>
                  )}
                </div>
              )}
              <input className="mt-sm" placeholder={q.type === 'mcq' ? 'Giải thích (em xem sau khi chấm) — tuỳ chọn' : 'Đáp án gợi ý / ghi chú chấm (chỉ anh thấy trước khi chấm)'}
                value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} />
            </div>
          ))}
          <div className="row mt">
            <button className="btn" onClick={() => addQ('mcq')}>+ Trắc nghiệm</button>
            <button className="btn" onClick={() => addQ('essay')}>+ Tự luận</button>
          </div>
        </section>
      )}

      {err && <div className="error">{err}</div>}
      <div className="row between sticky-actions">
        <button className="btn danger ghost" onClick={del}>Xoá bài tập</button>
        <div className="row">
          <button className="btn ghost" onClick={() => nav(`/bt/${id}`)}>Huỷ</button>
          {form.is_published ? (
            <>
              <button className="btn" disabled={busy} onClick={() => save(false)}>Thu hồi về nháp</button>
              <button className="btn primary" disabled={busy} onClick={() => save(true)}>{busy ? 'Đang lưu…' : '💾 Lưu'}</button>
            </>
          ) : (
            <>
              <button className="btn" disabled={busy} onClick={() => save(false)}>{busy ? 'Đang lưu…' : '💾 Lưu nháp'}</button>
              <button className="btn primary" disabled={busy} onClick={() => save(true)}>🚀 Giao cho em</button>
            </>
          )}
        </div>
      </div>

      {bulk && <BulkImport onClose={() => setBulk(false)} onApply={applyBulk} />}
    </div>
  );
}

/** Nhập nhanh nhiều câu hỏi bằng cách dán văn bản */
function parseBulk(text) {
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b) => {
    const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
    const prompt = [];
    const options = [];
    let correct = null;
    let points = 1;
    for (const l of lines) {
      const m = /^(\*?)\s*([A-Ha-h])[.)]\s*(.*)$/.exec(l);
      const p = /^\(?\s*(\d+(?:[.,]\d+)?)\s*đ(iểm)?\s*\)?$/i.exec(l);
      if (m && (options.length > 0 || prompt.length > 0)) {
        if (m[1] === '*') correct = options.length;
        options.push(m[3]);
      } else if (p) {
        points = Number(p[1].replace(',', '.'));
      } else if (options.length === 0) {
        prompt.push(l.replace(/^(câu|cau)\s*\d+\s*[:.)]\s*/i, ''));
      } else {
        options[options.length - 1] += ' ' + l;
      }
    }
    const type = options.length >= 2 ? 'mcq' : 'essay';
    return { type, prompt: prompt.join('\n'), options: type === 'mcq' ? options : [], correct: type === 'mcq' ? correct : null, points, explanation: '' };
  });
}

function BulkImport({ onClose, onApply }) {
  const [text, setText] = useState('');
  const parsed = text.trim() ? parseBulk(text) : [];
  return (
    <Modal title="⚡ Nhập nhanh câu hỏi" onClose={onClose} wide>
      <p className="small muted">
        Mỗi câu cách nhau 1 dòng trống. Đáp án bắt đầu bằng <code>A.</code> <code>B.</code>… Thêm dấu <code>*</code> trước đáp án đúng.
        Câu không có đáp án = tự luận. Có thể ghi điểm bằng dòng <code>(2đ)</code>.
      </p>
      <textarea rows={12} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={'Câu 1: 2 + 2 = ?\nA. 3\n*B. 4\nC. 5\nD. 6\n\nCâu 2: Chứng minh rằng tổng 3 góc tam giác bằng 180°.\n(2đ)'} />
      <p className="small">
        Nhận diện được: <b>{parsed.filter((p) => p.type === 'mcq').length}</b> trắc nghiệm,{' '}
        <b>{parsed.filter((p) => p.type === 'essay').length}</b> tự luận
        {parsed.some((p) => p.type === 'mcq' && p.correct === null) && <span className="error inline"> · có câu chưa đánh dấu * đáp án đúng</span>}
      </p>
      <div className="row end">
        <button className="btn ghost" onClick={onClose}>Huỷ</button>
        <button className="btn primary" disabled={!parsed.length} onClick={() => onApply(parsed)}>Thêm {parsed.length} câu</button>
      </div>
    </Modal>
  );
}

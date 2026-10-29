// Các hàm tiện ích về ngày giờ & hiển thị

export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function fmtDate(iso, withTime = true) {
  if (!iso) return '';
  const d = new Date(iso);
  const opts = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('vi-VN', opts);
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`;
  return fmtDate(iso, false);
}

/** "còn 2 ngày" / "quá hạn 3 giờ" */
export function dueText(iso) {
  if (!iso) return '';
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  let s;
  if (abs < 3600) s = `${Math.max(1, Math.round(abs / 60))} phút`;
  else if (abs < 86400) s = `${Math.round(abs / 3600)} giờ`;
  else s = `${Math.round(abs / 86400)} ngày`;
  return diff >= 0 ? `còn ${s}` : `quá hạn ${s}`;
}

/** ISO -> giá trị cho <input type="datetime-local"> */
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(v) {
  return v ? new Date(v).toISOString() : null;
}

/** Thứ 7 sắp tới, lúc `hour` giờ (nếu hôm nay là thứ 7 và chưa tới giờ -> hôm nay) */
export function nextSaturday(hour = 20) {
  const d = new Date();
  const add = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + add);
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 7);
  return d;
}

export function scoreText(score, max) {
  if (score === null || score === undefined) return '—';
  const s = Math.round(Number(score) * 100) / 100;
  return max ? `${s}/${max}` : `${s}`;
}

export const KIND_LABEL = {
  upload: 'Nộp ảnh bài làm',
  quiz: 'Trắc nghiệm online',
  exam: 'Bài thi định kỳ',
};

export const STATUS_LABEL = {
  in_progress: 'Đang làm',
  submitted: 'Chờ chấm',
  graded: 'Đã chấm',
  redo: 'Làm lại',
};

export function sortByPos(arr) {
  return [...(arr || [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0) || String(a.created_at).localeCompare(String(b.created_at)),
  );
}

export function isPdf(path) {
  return /\.pdf$/i.test(path || '');
}

/** Tổng điểm tối đa của bài: quiz/exam = tổng điểm câu hỏi, upload = max_score */
export function maxScoreOf(assignment, questions) {
  if (assignment?.kind === 'upload' || !questions?.length) return Number(assignment?.max_score ?? 10);
  return questions.reduce((s, q) => s + Number(q.points || 0), 0);
}

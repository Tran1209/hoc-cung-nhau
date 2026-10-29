// Tính trạng thái bài tập dựa trên các bài nộp

/** Bài nộp mới nhất của mỗi bài tập: { [assignment_id]: submission } */
export function latestByAssignment(submissions) {
  const map = {};
  for (const s of submissions || []) {
    const cur = map[s.assignment_id];
    if (!cur || String(s.created_at) > String(cur.created_at)) map[s.assignment_id] = s;
  }
  return map;
}

/** Bài tập em còn phải làm */
export function isTodo(assignment, latest) {
  return !latest || latest.status === 'redo' || latest.status === 'in_progress';
}

export function avgScore(submissions, assignmentsById, maxOf) {
  const graded = (submissions || []).filter((s) => s.status === 'graded' && s.score !== null);
  if (!graded.length) return null;
  // quy về thang 10
  let sum = 0;
  let n = 0;
  for (const s of graded) {
    const a = assignmentsById[s.assignment_id];
    const max = maxOf ? maxOf(a) : Number(a?.max_score || 10);
    if (!max) continue;
    sum += (Number(s.score) / max) * 10;
    n++;
  }
  return n ? Math.round((sum / n) * 10) / 10 : null;
}

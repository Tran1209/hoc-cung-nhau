// ============================================================
//  Backend DEMO — lưu trong IndexedDB của trình duyệt.
//  Dùng để xem thử khi chưa cấu hình Supabase.
//  ⚠ Dữ liệu chỉ nằm trên MỘT trình duyệt, KHÔNG đồng bộ 2 máy.
// ============================================================
import { emitDataChange } from './events';
import { compressImage, fileExt } from '../lib/image';
import { uid } from '../lib/format';
import { HISTORY_CURRICULUM } from './historyCurriculum';

const DB_NAME = 'hoc-cung-nhau-demo';
const ME_KEY = 'hcn-demo-me';

const DEMO_PROFILES = [
  { id: 'demo-teacher', email: 'anh@demo', display_name: 'Anh', role: 'teacher', created_at: '2026-01-01T00:00:00Z' },
  { id: 'demo-student', email: 'em@demo', display_name: 'Em', role: 'student', created_at: '2026-01-01T00:00:01Z' },
];

// ---------- IndexedDB mini wrapper ----------
let dbPromise = null;
function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        const rows = d.createObjectStore('rows', { keyPath: 'key' });
        rows.createIndex('table', 'table');
        d.createObjectStore('files');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx(store, mode, fn) {
  return db().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(store, mode);
        const s = t.objectStore(store);
        let result;
        Promise.resolve(fn(s)).then((r) => (result = r));
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
      }),
  );
}

const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

let seedPromise = null;

async function cleanDuplicates() {
  const allSubs = await tx('rows', 'readonly', (s) => reqP(s.index('table').getAll('subjects'))).then((rs) => rs.map((r) => r.data));
  const seenTitles = new Set();
  const keepSubs = new Set();
  for (const sub of allSubs) {
    if (seenTitles.has(sub.title)) {
      await delRow('subjects', sub.id);
    } else {
      seenTitles.add(sub.title);
      keepSubs.add(sub.id);
    }
  }

  const allChs = await tx('rows', 'readonly', (s) => reqP(s.index('table').getAll('chapters'))).then((rs) => rs.map((r) => r.data));
  const seenChs = new Set();
  const keepChs = new Set();
  for (const ch of allChs) {
    const key = `${ch.subject_id}:${ch.title}`;
    if (!keepSubs.has(ch.subject_id) || seenChs.has(key)) {
      await delRow('chapters', ch.id);
    } else {
      seenChs.add(key);
      keepChs.add(ch.id);
    }
  }

  const allLs = await tx('rows', 'readonly', (s) => reqP(s.index('table').getAll('lessons'))).then((rs) => rs.map((r) => r.data));
  const seenLs = new Set();
  for (const l of allLs) {
    const key = `${l.chapter_id}:${l.title}`;
    if (!keepChs.has(l.chapter_id) || seenLs.has(key)) {
      await delRow('lessons', l.id);
    } else {
      seenLs.add(key);
      for (const sub of HISTORY_CURRICULUM) {
        for (const ch of sub.chapters) {
          for (const item of ch.lessons) {
            if (typeof item === 'object' && item.title === l.title && item.content) {
              const needsUpdate = !l.content ||
                l.content.includes('$data.ratingData') ||
                l.content.includes('formData.append') ||
                (item.title.includes('Bài 1') && !l.content.includes('MỤC TIÊU BÀI HỌC'));
              if (needsUpdate) {
                await putRow('lessons', { ...l, content: item.content });
              }
            }
          }
        }
      }
    }
  }
}

async function seedDefaultIfEmpty() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    await cleanDuplicates();
    const existing = await tx('rows', 'readonly', (s) => reqP(s.index('table').getAll('subjects'))).then((rs) => rs.map((r) => r.data));
    if (existing.length === 0) {
      for (let sIdx = 0; sIdx < HISTORY_CURRICULUM.length; sIdx++) {
        const s = HISTORY_CURRICULUM[sIdx];
        const subId = uid();
        await putRow('subjects', {
          id: subId,
          title: s.title,
          icon: s.icon,
          color: s.color,
          description: s.description,
          position: sIdx + 1,
          created_at: new Date().toISOString(),
        });
        for (let cIdx = 0; cIdx < s.chapters.length; cIdx++) {
          const c = s.chapters[cIdx];
          const chId = uid();
          await putRow('chapters', {
            id: chId,
            subject_id: subId,
            title: c.title,
            description: c.description,
            position: cIdx + 1,
            created_at: new Date().toISOString(),
          });
          for (let lIdx = 0; lIdx < c.lessons.length; lIdx++) {
            const l = c.lessons[lIdx];
            const title = typeof l === 'string' ? l : l.title;
            const content = typeof l === 'string' ? '' : l.content || '';
            await putRow('lessons', {
              id: uid(),
              chapter_id: chId,
              title,
              content,
              position: lIdx + 1,
              created_at: new Date().toISOString(),
            });
          }
        }
      }
    }
  })();
  return seedPromise;
}

async function allRows(table) {
  if (table === 'subjects' || table === 'chapters' || table === 'lessons') {
    await seedDefaultIfEmpty();
  }
  return tx('rows', 'readonly', (s) => reqP(s.index('table').getAll(table))).then((rs) => rs.map((r) => r.data));
}
async function putRow(table, data, key = 'id') {
  await tx('rows', 'readwrite', (s) => s.put({ key: `${table}:${data[key]}`, table, data }));
  return data;
}
async function getRow(table, id) {
  const r = await tx('rows', 'readonly', (s) => reqP(s.get(`${table}:${id}`)));
  return r?.data || null;
}
async function delRow(table, id) {
  await tx('rows', 'readwrite', (s) => s.delete(`${table}:${id}`));
}

// ---------- đồng bộ giữa các tab cùng trình duyệt ----------
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hcn-demo') : null;
if (bc) bc.onmessage = () => emitDataChange();
function changed() {
  emitDataChange();
  bc?.postMessage('changed');
}

// ---------- "quyền" giống bản Cloud ----------
function me() {
  const id = localStorage.getItem(ME_KEY);
  return DEMO_PROFILES.find((p) => p.id === id) || null;
}
const isTeacher = () => me()?.role === 'teacher';
const isOpen = (a) => a && a.is_published && (!a.publish_at || new Date(a.publish_at) <= new Date());

async function visible(table, rows) {
  if (isTeacher()) return rows;
  if (table === 'assignments') return rows.filter(isOpen);
  if (table === 'questions') {
    const as = await allRows('assignments');
    const open = new Set(as.filter(isOpen).map((a) => a.id));
    return rows.filter((q) => open.has(q.assignment_id));
  }
  if (table === 'answer_keys') return [];
  if (table === 'submissions') return rows.filter((s) => s.student_id === me()?.id);
  return rows;
}

function requireTeacher(table) {
  const teacherOnly = ['subjects', 'chapters', 'lessons', 'assignments', 'questions', 'answer_keys'];
  if (teacherOnly.includes(table) && !isTeacher()) throw new Error('Bạn không có quyền làm việc này.');
}

const DEFAULTS = {
  lesson_images: () => ({ caption: '', uploaded_by: me()?.id }),
  submissions: () => ({
    student_id: me()?.id, status: 'submitted', note: '', answers: {}, files: [], auto_score: null,
    question_scores: {}, score: null, feedback: '', hearts: 0, started_at: null, submitted_at: null, graded_at: null,
  }),
  activity: () => ({ actor_id: me()?.id, link: null }),
  assignments: () => ({
    instructions: '', kind: 'upload', attachments: [], max_score: 10, time_limit_minutes: null,
    is_published: false, publish_at: null, due_at: null, position: 0, lesson_id: null,
  }),
  questions: () => ({ type: 'mcq', prompt: '', image_path: null, options: [], points: 1, position: 0 }),
  subjects: () => ({ description: '', icon: '📘', color: '#ff7aa2', position: 0 }),
  chapters: () => ({ description: '', position: 0 }),
  lessons: () => ({ content: '', position: 0 }),
};

// xoá dây chuyền giống "on delete cascade"
const CHILDREN = {
  subjects: [['chapters', 'subject_id']],
  chapters: [['lessons', 'chapter_id'], ['assignments', 'chapter_id']],
  lessons: [['lesson_images', 'lesson_id'], ['assignments', 'lesson_id']],
  assignments: [['questions', 'assignment_id'], ['submissions', 'assignment_id']],
  questions: [['answer_keys', 'question_id']],
};
async function cascadeDelete(table, id) {
  for (const [child, fk] of CHILDREN[table] || []) {
    const rows = (await allRows(child)).filter((r) => r[fk] === id);
    for (const r of rows) await cascadeDelete(child, child === 'answer_keys' ? r.question_id : r.id);
  }
  await delRow(table, id);
}

const urlCache = new Map();

export const local = {
  mode: 'local',

  auth: {
    async current() {
      return me();
    },
    async signInDemo(role) {
      localStorage.setItem(ME_KEY, role === 'teacher' ? 'demo-teacher' : 'demo-student');
      authListeners.forEach((cb) => cb());
    },
    async signOut() {
      localStorage.removeItem(ME_KEY);
      authListeners.forEach((cb) => cb());
    },
    onChange(cb) {
      authListeners.add(cb);
      return () => authListeners.delete(cb);
    },
  },

  me,

  async list(table, { where = {}, order = null, asc = true, limit } = {}) {
    let rows = table === 'profiles' ? await profiles() : await allRows(table);
    rows = await visible(table, rows);
    rows = rows.filter((r) =>
      Object.entries(where).every(([k, v]) => {
        if (v === null) return r[k] === null || r[k] === undefined;
        if (Array.isArray(v)) return v.includes(r[k]);
        return r[k] === v;
      }),
    );
    if (order) {
      rows.sort((a, b) => {
        const x = a[order] ?? '';
        const y = b[order] ?? '';
        const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        return asc ? c : -c;
      });
    }
    return limit ? rows.slice(0, limit) : rows;
  },

  async get(table, id) {
    if (table === 'profiles') return (await profiles()).find((p) => p.id === id) || null;
    const row = await getRow(table, id);
    if (!row) return null;
    return (await visible(table, [row]))[0] || null;
  },

  async insert(table, row) {
    requireTeacher(table);
    const data = { ...(DEFAULTS[table]?.() || {}), id: uid(), created_at: new Date().toISOString(), ...row };
    await putRow(table, data);
    changed();
    return data;
  },

  async update(table, id, patch) {
    if (table !== 'submissions' && table !== 'lesson_images') requireTeacher(table);
    if (table === 'submissions' && !isTeacher()) throw new Error('Bạn không có quyền làm việc này.');
    const cur = await getRow(table, id);
    if (!cur) return null;
    const data = { ...cur, ...patch };
    await putRow(table, data);
    changed();
    return data;
  },

  async upsert(table, row, key = 'id') {
    requireTeacher(table);
    const cur = await getRow(table, row[key]);
    const data = { ...(DEFAULTS[table]?.() || {}), created_at: new Date().toISOString(), ...(cur || {}), ...row };
    await putRow(table, data, key);
    changed();
    return data;
  },

  async remove(table, id) {
    if (table === 'submissions' || table === 'activity') {
      if (!isTeacher()) throw new Error('Bạn không có quyền làm việc này.');
    } else if (table !== 'lesson_images') requireTeacher(table);
    await cascadeDelete(table, id);
    changed();
  },

  // ---------- files ----------
  async upload(file, folder = 'misc') {
    const f = await compressImage(file);
    const path = `${folder}/${Date.now()}-${uid().slice(0, 8)}.${fileExt(f)}`;
    await tx('files', 'readwrite', (s) => s.put(f, path));
    return path;
  },

  async fileUrl(path) {
    if (!path) return '';
    if (urlCache.has(path)) return urlCache.get(path);
    const blob = await tx('files', 'readonly', (s) => reqP(s.get(path)));
    if (!blob) return '';
    const url = URL.createObjectURL(blob);
    urlCache.set(path, url);
    return url;
  },

  async removeFile(path) {
    await tx('files', 'readwrite', (s) => s.delete(path));
    urlCache.delete(path);
  },

  // ---------- quiz (mô phỏng hàm submit_quiz trên server) ----------
  async submitQuiz(assignmentId, answers, files = [], note = '') {
    const a = await getRow('assignments', assignmentId);
    if (!isOpen(a)) throw new Error('Bài này chưa mở.');
    const subs = (await allRows('submissions')).filter(
      (s) => s.assignment_id === assignmentId && s.student_id === me()?.id,
    );
    if (a.kind === 'exam' && subs.some((s) => ['submitted', 'graded'].includes(s.status))) {
      throw new Error('Bài thi chỉ được làm 1 lần.');
    }
    const qs = (await allRows('questions')).filter((q) => q.assignment_id === assignmentId);
    let auto = 0;
    let manual = files.length > 0;
    for (const q of qs) {
      if (q.type === 'mcq') {
        const key = await getRow('answer_keys', q.id);
        if (key && key.correct !== null && key.correct !== undefined && String(answers[q.id]) === String(key.correct)) {
          auto += Number(q.points || 1);
        }
      } else manual = true;
    }
    const now = new Date().toISOString();
    const patch = {
      answers, files, note, auto_score: auto,
      status: manual ? 'submitted' : 'graded',
      score: manual ? null : auto,
      submitted_at: now,
      graded_at: manual ? null : now,
    };
    const prog = subs.filter((s) => s.status === 'in_progress').sort((x, y) => y.created_at.localeCompare(x.created_at))[0];
    const data = prog
      ? { ...prog, ...patch }
      : { ...DEFAULTS.submissions(), id: uid(), assignment_id: assignmentId, created_at: now, ...patch };
    await putRow('submissions', data);
    changed();
    return data;
  },

  async quizReview(assignmentId) {
    const qs = (await allRows('questions')).filter((q) => q.assignment_id === assignmentId);
    if (!isTeacher()) {
      const graded = (await allRows('submissions')).some(
        (s) => s.assignment_id === assignmentId && s.student_id === me()?.id && s.status === 'graded',
      );
      if (!graded) return [];
    }
    const out = [];
    for (const q of qs) {
      const k = await getRow('answer_keys', q.id);
      if (k) out.push(k);
    }
    return out;
  },

  async updateProfile(patch) {
    const all = await profiles();
    const cur = all.find((p) => p.id === me()?.id);
    const data = { ...cur, display_name: patch.display_name ?? cur.display_name };
    await putRow('profiles', data);
    changed();
    return data;
  },

  async schemaVersion() {
    return Infinity; // bản demo luôn khớp
  },

  async exportAll() {
    const rows = await tx('rows', 'readonly', (s) => reqP(s.getAll()));
    const keys = await tx('files', 'readonly', (s) => reqP(s.getAllKeys()));
    const files = {};
    for (const k of keys) {
      const blob = await tx('files', 'readonly', (s) => reqP(s.get(k)));
      files[k] = await blobToDataUrl(blob);
    }
    return { app: 'hoc-cung-nhau', mode: 'local', exported_at: new Date().toISOString(), rows, files };
  },

  async importAll(json) {
    if (json?.app !== 'hoc-cung-nhau' || json.mode !== 'local') throw new Error('File sao lưu không hợp lệ.');
    await tx('rows', 'readwrite', (s) => {
      s.clear();
      json.rows.forEach((r) => s.put(r));
    });
    await tx('files', 'readwrite', (s) => s.clear());
    for (const [k, dataUrl] of Object.entries(json.files || {})) {
      const blob = await (await fetch(dataUrl)).blob();
      await tx('files', 'readwrite', (s) => s.put(blob, k));
    }
    urlCache.clear();
    changed();
  },
};

const authListeners = new Set();

async function profiles() {
  const saved = await allRows('profiles');
  return DEMO_PROFILES.map((p) => saved.find((s) => s.id === p.id) || p);
}

function blobToDataUrl(blob) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(blob);
  });
}

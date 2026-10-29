// ============================================================
//  Backend CLOUD — Supabase (đồng bộ thời gian thực giữa 2 máy)
// ============================================================
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET } from '../config';
import { emitDataChange } from './events';
import { compressImage, fileExt } from '../lib/image';
import { uid } from '../lib/format';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

const EXPORT_TABLES = [
  'profiles', 'subjects', 'chapters', 'lessons', 'lesson_images',
  'assignments', 'questions', 'answer_keys', 'submissions', 'activity',
];

function check({ data, error }) {
  if (error) throw new Error(translateError(error.message));
  return data;
}

function translateError(msg = '') {
  if (/Invalid login/i.test(msg)) return 'Sai email hoặc mật khẩu.';
  if (/Database error saving new user|chi danh cho 2/i.test(msg)) return 'Web này chỉ dành cho 2 người — đã đủ tài khoản rồi.';
  if (/Email not confirmed/i.test(msg)) return 'Email chưa được xác nhận. Hãy mở email để xác nhận (hoặc tắt "Confirm email" trong Supabase).';
  if (/row-level security|permission denied/i.test(msg)) return 'Bạn không có quyền làm việc này.';
  if (/chua mo/i.test(msg)) return 'Bài này chưa mở.';
  if (/chi duoc lam 1 lan/i.test(msg)) return 'Bài thi chỉ được làm 1 lần.';
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Mất kết nối mạng. Kiểm tra wifi/4G rồi thử lại.';
  return msg;
}

let me = null;

async function loadProfile(userId) {
  const data = check(await sb.from('profiles').select('*').eq('id', userId).maybeSingle());
  me = data;
  return data;
}

// ---------- realtime ----------
let channel = null;
function startRealtime() {
  if (channel) return;
  channel = sb
    .channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => emitDataChange())
    .subscribe();
}
function stopRealtime() {
  if (channel) sb.removeChannel(channel);
  channel = null;
}

// ---------- signed url cache ----------
const urlCache = new Map(); // path -> { url, exp }

export const cloud = {
  mode: 'cloud',

  auth: {
    async current() {
      const { data } = await sb.auth.getSession();
      const user = data.session?.user;
      if (!user) return null;
      startRealtime();
      const profile = await loadProfile(user.id);
      return profile || { id: user.id, email: user.email, missingProfile: true };
    },
    async signIn(email, password) {
      check(await sb.auth.signInWithPassword({ email, password }));
    },
    async signUp(email, password, displayName) {
      const data = check(
        await sb.auth.signUp({ email, password, options: { data: { display_name: displayName } } }),
      );
      return { needConfirm: !data.session };
    },
    async signOut() {
      stopRealtime();
      me = null;
      await sb.auth.signOut();
    },
    onChange(cb) {
      const { data } = sb.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') cb();
      });
      return () => data.subscription.unsubscribe();
    },
  },

  me: () => me,

  async list(table, { where = {}, order = null, asc = true, limit } = {}) {
    let q = sb.from(table).select('*');
    for (const [k, v] of Object.entries(where)) {
      if (v === null) q = q.is(k, null);
      else if (Array.isArray(v)) q = q.in(k, v.length ? v : ['00000000-0000-0000-0000-000000000000']);
      else q = q.eq(k, v);
    }
    if (order) q = q.order(order, { ascending: asc });
    if (order === 'position') q = q.order('created_at', { ascending: true });
    if (limit) q = q.limit(limit);
    return check(await q);
  },

  async get(table, id) {
    return check(await sb.from(table).select('*').eq('id', id).maybeSingle());
  },

  async insert(table, row) {
    const data = check(await sb.from(table).insert({ id: uid(), ...row }).select().single());
    emitDataChange();
    return data;
  },

  async update(table, id, patch) {
    const data = check(await sb.from(table).update(patch).eq('id', id).select().maybeSingle());
    emitDataChange();
    return data;
  },

  async upsert(table, row, key = 'id') {
    const data = check(await sb.from(table).upsert(row, { onConflict: key }).select().single());
    emitDataChange();
    return data;
  },

  async remove(table, id, key = 'id') {
    check(await sb.from(table).delete().eq(key, id));
    emitDataChange();
  },

  // ---------- files ----------
  async upload(file, folder = 'misc') {
    const f = await compressImage(file);
    const path = `${folder}/${Date.now()}-${uid().slice(0, 8)}.${fileExt(f)}`;
    check(await sb.storage.from(BUCKET).upload(path, f, { contentType: f.type || undefined, upsert: false }));
    return path;
  },

  async fileUrl(path) {
    if (!path) return '';
    const hit = urlCache.get(path);
    if (hit && hit.exp > Date.now()) return hit.url;
    const data = check(await sb.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 6));
    urlCache.set(path, { url: data.signedUrl, exp: Date.now() + 1000 * 60 * 60 * 5 });
    return data.signedUrl;
  },

  async removeFile(path) {
    if (!path) return;
    await sb.storage.from(BUCKET).remove([path]);
    urlCache.delete(path);
  },

  // ---------- quiz ----------
  async submitQuiz(assignmentId, answers, files = [], note = '') {
    const data = check(
      await sb.rpc('submit_quiz', {
        p_assignment_id: assignmentId,
        p_answers: answers,
        p_files: files,
        p_note: note,
      }),
    );
    emitDataChange();
    return data;
  },

  async quizReview(assignmentId) {
    return check(await sb.rpc('quiz_review', { p_assignment_id: assignmentId })) || [];
  },

  async updateProfile(patch) {
    const data = check(await sb.from('profiles').update(patch).eq('id', me.id).select().single());
    me = data;
    emitDataChange();
    return data;
  },

  async schemaVersion() {
    const { data, error } = await sb.from('app_meta').select('value').eq('key', 'schema_version').maybeSingle();
    if (error) return 0;
    return Number(data?.value || 0);
  },

  async exportAll() {
    const out = { app: 'hoc-cung-nhau', mode: 'cloud', exported_at: new Date().toISOString(), tables: {} };
    for (const t of EXPORT_TABLES) {
      const { data, error } = await sb.from(t).select('*');
      out.tables[t] = error ? [] : data;
    }
    return out;
  },

  async importAll() {
    throw new Error('Chế độ Cloud không nhập file sao lưu trực tiếp (để tránh ghi đè nhầm). Xem README mục "Khôi phục".');
  },
};

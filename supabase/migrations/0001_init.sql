-- =====================================================================
--  HỌC CÙNG NHAU — Migration 0001: khởi tạo database
--  Chạy 1 LẦN DUY NHẤT trong Supabase Dashboard > SQL Editor.
--
--  QUY TẮC VÀNG KHI CẬP NHẬT MỖI THỨ 7:
--   * KHÔNG BAO GIỜ sửa file này sau khi đã chạy.
--   * Muốn thay đổi database -> tạo file mới 0002_xxx.sql, 0003_xxx.sql...
--   * Chỉ THÊM bảng/cột, hạn chế xoá/đổi tên cột (để dữ liệu cũ luôn an toàn).
--   * Mỗi migration cuối file đều cập nhật app_meta.schema_version.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 0. Thông tin phiên bản database (web sẽ tự kiểm tra để báo nếu lệch)
-- ---------------------------------------------------------------------
create table public.app_meta (
  key   text primary key,
  value text not null
);

-- ---------------------------------------------------------------------
-- 1. Hồ sơ 2 người. Người đăng ký ĐẦU TIÊN = "teacher" (anh - quản lý),
--    người thứ HAI = "student" (em). Không cho đăng ký người thứ 3.
--    (Web tình yêu sau này dùng chung 2 tài khoản này.)
-- ---------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text not null default '',
  role         text not null default 'student' check (role in ('teacher', 'student')),
  avatar_path  text,
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  select count(*) into n from public.profiles;
  if n >= 2 then
    raise exception 'Web nay chi danh cho 2 nguoi.';
  end if;
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)),
    case when n = 0 then 'teacher' else 'student' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_member()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid()); $$;

create or replace function public.is_teacher()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher'); $$;

-- ---------------------------------------------------------------------
-- 2. Cấu trúc học: Môn -> Chương -> Bài
-- ---------------------------------------------------------------------
create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  icon        text not null default '📘',
  color       text not null default '#ff7aa2',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.chapters (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  title       text not null,
  description text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references public.chapters(id) on delete cascade,
  title       text not null,
  content     text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

-- Ảnh trong bài: sơ đồ tư duy / bài em đã làm / tài liệu
create table public.lesson_images (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  kind        text not null check (kind in ('mindmap', 'work', 'doc')),
  path        text not null,
  caption     text not null default '',
  uploaded_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Bài tập / Ôn tập chương / Bài thi
--    lesson_id = null  => bài ôn tập của cả chương
--    kind: upload (nộp ảnh) | quiz (làm online) | exam (thi có giờ)
-- ---------------------------------------------------------------------
create table public.assignments (
  id                 uuid primary key default gen_random_uuid(),
  chapter_id         uuid not null references public.chapters(id) on delete cascade,
  lesson_id          uuid references public.lessons(id) on delete cascade,
  title              text not null,
  instructions       text not null default '',
  kind               text not null default 'upload' check (kind in ('upload', 'quiz', 'exam')),
  attachments        jsonb not null default '[]'::jsonb,
  max_score          numeric not null default 10,
  time_limit_minutes int,
  is_published       boolean not null default false,
  publish_at         timestamptz,
  due_at             timestamptz,
  position           int not null default 0,
  created_at         timestamptz not null default now()
);

create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  type          text not null default 'mcq' check (type in ('mcq', 'essay')),
  prompt        text not null default '',
  image_path    text,
  options       jsonb not null default '[]'::jsonb,
  points        numeric not null default 1,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

-- Đáp án tách riêng: chỉ anh xem được -> em không "soi" đáp án được
create table public.answer_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct     int,
  explanation text not null default ''
);

create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references public.assignments(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  status          text not null default 'submitted'
                  check (status in ('in_progress', 'submitted', 'graded', 'redo')),
  note            text not null default '',
  answers         jsonb not null default '{}'::jsonb,
  files           jsonb not null default '[]'::jsonb,
  auto_score      numeric,
  question_scores jsonb not null default '{}'::jsonb,
  score           numeric,
  feedback        text not null default '',
  hearts          int not null default 0,
  started_at      timestamptz,
  submitted_at    timestamptz,
  graded_at       timestamptz,
  created_at      timestamptz not null default now()
);

-- Nhật ký hoạt động (cũng là "cầu nối" cho web tình yêu sau này)
create table public.activity (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles(id) on delete set null default auth.uid(),
  type       text not null,
  message    text not null,
  link       text,
  created_at timestamptz not null default now()
);

create index on public.chapters (subject_id);
create index on public.lessons (chapter_id);
create index on public.lesson_images (lesson_id);
create index on public.assignments (chapter_id);
create index on public.assignments (lesson_id);
create index on public.questions (assignment_id);
create index on public.submissions (assignment_id);
create index on public.submissions (student_id);
create index on public.activity (created_at desc);

-- ---------------------------------------------------------------------
-- 4. Bảo mật (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.app_meta      enable row level security;
alter table public.profiles      enable row level security;
alter table public.subjects      enable row level security;
alter table public.chapters      enable row level security;
alter table public.lessons       enable row level security;
alter table public.lesson_images enable row level security;
alter table public.assignments   enable row level security;
alter table public.questions     enable row level security;
alter table public.answer_keys   enable row level security;
alter table public.submissions   enable row level security;
alter table public.activity      enable row level security;

create policy "meta read" on public.app_meta for select to authenticated using (true);

create policy "profiles read" on public.profiles for select to authenticated using (public.is_member());
create policy "profiles update self" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Chỉ cho sửa tên + avatar, KHÔNG cho tự đổi role
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_path) on public.profiles to authenticated;

-- Môn / Chương / Bài: cả 2 cùng xem, chỉ anh được thêm/sửa/xoá
create policy "subjects read"  on public.subjects for select to authenticated using (public.is_member());
create policy "subjects write" on public.subjects for all    to authenticated using (public.is_teacher()) with check (public.is_teacher());
create policy "chapters read"  on public.chapters for select to authenticated using (public.is_member());
create policy "chapters write" on public.chapters for all    to authenticated using (public.is_teacher()) with check (public.is_teacher());
create policy "lessons read"   on public.lessons  for select to authenticated using (public.is_member());
create policy "lessons write"  on public.lessons  for all    to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Ảnh trong bài: cả 2 cùng thêm, xoá ảnh của mình (anh xoá được tất cả)
create policy "limg read"   on public.lesson_images for select to authenticated using (public.is_member());
create policy "limg insert" on public.lesson_images for insert to authenticated
  with check (public.is_member() and uploaded_by = auth.uid());
create policy "limg update" on public.lesson_images for update to authenticated
  using (public.is_teacher() or uploaded_by = auth.uid());
create policy "limg delete" on public.lesson_images for delete to authenticated
  using (public.is_teacher() or uploaded_by = auth.uid());

-- Bài tập: em chỉ thấy bài đã "giao" và đã tới giờ mở
create policy "assign read" on public.assignments for select to authenticated using (
  public.is_teacher()
  or (public.is_member() and is_published and (publish_at is null or publish_at <= now()))
);
create policy "assign write" on public.assignments for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

create policy "questions read" on public.questions for select to authenticated using (
  public.is_teacher()
  or (public.is_member() and exists (
        select 1 from public.assignments a
        where a.id = assignment_id and a.is_published and (a.publish_at is null or a.publish_at <= now())))
);
create policy "questions write" on public.questions for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

create policy "keys teacher" on public.answer_keys for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- Bài nộp: em thấy bài của em, anh thấy hết. Em không tự chấm điểm được.
create policy "subs read" on public.submissions for select to authenticated
  using (public.is_teacher() or student_id = auth.uid());
create policy "subs insert" on public.submissions for insert to authenticated with check (
  public.is_member() and student_id = auth.uid()
  and status in ('in_progress', 'submitted')
  and score is null and auto_score is null and hearts = 0
);
create policy "subs teacher update" on public.submissions for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());
create policy "subs teacher delete" on public.submissions for delete to authenticated
  using (public.is_teacher());

create policy "activity read"   on public.activity for select to authenticated using (public.is_member());
create policy "activity insert" on public.activity for insert to authenticated
  with check (public.is_member() and actor_id = auth.uid());
create policy "activity delete" on public.activity for delete to authenticated using (public.is_teacher());

-- ---------------------------------------------------------------------
-- 5. Nộp bài trắc nghiệm / thi: chấm tự động TRÊN SERVER
-- ---------------------------------------------------------------------
create or replace function public.submit_quiz(
  p_assignment_id uuid,
  p_answers jsonb,
  p_files jsonb default '[]'::jsonb,
  p_note text default ''
)
returns public.submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind     text;
  v_auto     numeric := 0;
  v_manual   boolean := false;
  v_existing uuid;
  v_sub      public.submissions;
  q          record;
begin
  if not public.is_member() then
    raise exception 'Khong co quyen';
  end if;

  select kind into v_kind from public.assignments
   where id = p_assignment_id and is_published and (publish_at is null or publish_at <= now());
  if v_kind is null then
    raise exception 'Bai nay chua mo';
  end if;

  if v_kind = 'exam' and exists (
    select 1 from public.submissions
     where assignment_id = p_assignment_id and student_id = auth.uid() and status in ('submitted', 'graded')
  ) then
    raise exception 'Bai thi chi duoc lam 1 lan';
  end if;

  for q in
    select qu.id, qu.type, qu.points, k.correct
      from public.questions qu
      left join public.answer_keys k on k.question_id = qu.id
     where qu.assignment_id = p_assignment_id
  loop
    if q.type = 'mcq' then
      if q.correct is not null and (p_answers ->> q.id::text) = q.correct::text then
        v_auto := v_auto + coalesce(q.points, 1);
      end if;
    else
      v_manual := true;
    end if;
  end loop;

  if jsonb_array_length(coalesce(p_files, '[]'::jsonb)) > 0 then
    v_manual := true;
  end if;

  select id into v_existing from public.submissions
   where assignment_id = p_assignment_id and student_id = auth.uid() and status = 'in_progress'
   order by created_at desc limit 1;

  if v_existing is not null then
    update public.submissions set
      answers      = coalesce(p_answers, '{}'::jsonb),
      files        = coalesce(p_files, '[]'::jsonb),
      note         = coalesce(p_note, ''),
      auto_score   = v_auto,
      status       = case when v_manual then 'submitted' else 'graded' end,
      score        = case when v_manual then null else v_auto end,
      submitted_at = now(),
      graded_at    = case when v_manual then null else now() end
    where id = v_existing
    returning * into v_sub;
  else
    insert into public.submissions
      (assignment_id, student_id, status, answers, files, note, auto_score, score, submitted_at, graded_at)
    values
      (p_assignment_id, auth.uid(),
       case when v_manual then 'submitted' else 'graded' end,
       coalesce(p_answers, '{}'::jsonb), coalesce(p_files, '[]'::jsonb), coalesce(p_note, ''),
       v_auto, case when v_manual then null else v_auto end,
       now(), case when v_manual then null else now() end)
    returning * into v_sub;
  end if;

  return v_sub;
end;
$$;

-- Xem đáp án: anh luôn xem được; em chỉ xem khi bài đã được chấm
create or replace function public.quiz_review(p_assignment_id uuid)
returns table (question_id uuid, correct int, explanation text)
language sql
stable
security definer
set search_path = public
as $$
  select k.question_id, k.correct, k.explanation
    from public.answer_keys k
    join public.questions q on q.id = k.question_id
   where q.assignment_id = p_assignment_id
     and (
       public.is_teacher()
       or exists (select 1 from public.submissions s
                   where s.assignment_id = p_assignment_id
                     and s.student_id = auth.uid()
                     and s.status = 'graded')
     );
$$;

-- ---------------------------------------------------------------------
-- 6. Thống kê cho WEB TÌNH YÊU sau này (đọc view này là đủ)
-- ---------------------------------------------------------------------
create or replace view public.love_stats
with (security_invoker = true)
as
select
  coalesce(sum(hearts), 0)::int                          as total_hearts,
  count(*) filter (where status = 'graded')::int         as graded_count,
  round(avg(score) filter (where status = 'graded'), 2)  as avg_score
from public.submissions;

-- ---------------------------------------------------------------------
-- 7. Kho ảnh (Storage) — riêng tư, chỉ 2 người xem được
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('study', 'study', false)
on conflict (id) do nothing;

create policy "study read" on storage.objects for select to authenticated
  using (bucket_id = 'study' and public.is_member());
create policy "study insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'study' and public.is_member());
create policy "study delete" on storage.objects for delete to authenticated
  using (bucket_id = 'study' and (owner_id = auth.uid()::text or public.is_teacher()));

-- ---------------------------------------------------------------------
-- 8. Đồng bộ thời gian thực (máy anh sửa -> máy em thấy ngay)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table
  public.subjects, public.chapters, public.lessons, public.lesson_images,
  public.assignments, public.questions, public.submissions, public.activity, public.profiles;

-- ---------------------------------------------------------------------
-- Phiên bản database
-- ---------------------------------------------------------------------
insert into public.app_meta (key, value) values ('schema_version', '1')
on conflict (key) do update set value = excluded.value;

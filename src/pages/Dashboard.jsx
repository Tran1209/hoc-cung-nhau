import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { DueBadge, ErrorBox, KindBadge, Loading, Empty } from '../components/ui';
import { maxScoreOf, nextSaturday, sortByPos, timeAgo, fmtDate } from '../lib/format';
import { avgScore, isTodo, latestByAssignment } from '../lib/progress';
import { seedHistoryCurriculum } from '../data/historyCurriculum';

const SUBJECT_FIELDS = [
  { name: 'title', label: 'Tên môn', required: true, autoFocus: true, placeholder: 'VD: Lịch Sử 12' },
  { name: 'description', label: 'Mô tả', type: 'textarea', rows: 2 },
  { name: 'color', label: 'Màu nhận diện', type: 'color', default: '#e11d48' },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

const QUICK_JOURNAL_CHIPS = [
  'Đã đọc xong lý thuyết Bài 1',
  'Đang làm bài tập trắc nghiệm',
  'Đã hoàn thành câu hỏi vận dụng',
  'Gặp khó khăn ở phần nguyên tắc LHQ',
  'Mục tiêu hôm nay: Đạt điểm 10',
];

export default function Dashboard() {
  const { user, isTeacher, partner, nameOf } = useAuth();
  const nav = useNavigate();
  const [dialog, setDialog] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // State cho Nhật ký hôm nay
  const [journalText, setJournalText] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [journalNotice, setJournalNotice] = useState(false);

  const handleSeedHistory = async () => {
    setSeeding(true);
    try {
      await seedHistoryCurriculum(data);
      logActivity('curriculum', 'Nạp chương trình Lịch Sử 10, 11, 12');
    } catch (e) {
      alert('Lỗi nạp môn: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const { data: d, loading, error, reload } = useLive(async () => {
    const [subjects, chapters, lessons, assignments, questions, submissions, activity] = await Promise.all([
      data.list('subjects'),
      data.list('chapters'),
      data.list('lessons'),
      data.list('assignments'),
      data.list('questions'),
      data.list('submissions'),
      data.list('activity', { order: 'created_at', asc: false, limit: 30 }),
    ]);
    return { subjects, chapters, lessons, assignments, questions, submissions, activity };
  }, []);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;

  const { subjects, chapters, lessons = [], assignments, questions, submissions, activity } = d;
  const aById = Object.fromEntries(assignments.map((a) => [a.id, a]));
  const qByA = {};
  questions.forEach((q) => (qByA[q.assignment_id] ||= []).push(q));
  const latest = latestByAssignment(submissions);
  const avg = avgScore(submissions, aById, (a) => maxScoreOf(a, qByA[a?.id]));
  const hearts = submissions.reduce((s, x) => s + Number(x.hearts || 0), 0);
  const chapterTitle = Object.fromEntries(chapters.map((c) => [c.id, c.title]));

  const openAssignments = assignments.filter(
    (a) => a.is_published && (!a.publish_at || new Date(a.publish_at) <= new Date()),
  );
  const todo = openAssignments
    .filter((a) => isTodo(a, latest[a.id]))
    .sort((x, y) => String(x.due_at || '9999').localeCompare(String(y.due_at || '9999')));
  const toGrade = submissions
    .filter((s) => s.status === 'submitted')
    .sort((x, y) => String(x.submitted_at).localeCompare(String(y.submitted_at)));

  // Tính toán thời gian thực: Ngày hôm nay, Đếm ngược Thứ 7, Lịch tuần 7 ngày
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const sat = nextSaturday(20);
  const daysToSat = Math.ceil((sat - now) / 86400000);

  const todayFullDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  // Tạo dải 7 ngày trong tuần từ Thứ 2 đến Chủ Nhật
  const currentDay = now.getDay();
  const mondayOffset = (currentDay + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const shortNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    const isToday = dt.toDateString() === now.toDateString();
    const isSaturday = dt.getDay() === 6;
    return {
      date: dt,
      dayNum: dt.getDate(),
      monthNum: dt.getMonth() + 1,
      dayName: dayNames[dt.getDay()],
      shortName: shortNames[dt.getDay()],
      isToday,
      isSaturday,
    };
  });

  // Tìm bài học & bài tập trọng tâm Lịch Sử 12
  const historyLesson = lessons.find((l) => l.title.toLowerCase().includes('liên hợp quốc'));
  const historyAssignments = assignments.filter((a) => {
    if (historyLesson && a.lesson_id === historyLesson.id) return true;
    if (a.title.toLowerCase().includes('liên hợp quốc') || a.title.toLowerCase().includes('lịch sử')) return true;
    return false;
  });
  const mainHistoryAssignment = historyAssignments[0];
  const historySub = mainHistoryAssignment ? latest[mainHistoryAssignment.id] : null;

  // Lọc nhật ký của ngày hôm nay
  const todayJournals = activity.filter(
    (x) => x.type === 'daily_journal' && (x.created_at || '').startsWith(todayStr),
  );

  const handleSaveJournal = async (e) => {
    e?.preventDefault();
    if (!journalText.trim() || savingJournal) return;
    setSavingJournal(true);
    try {
      await data.insert('activity', {
        type: 'daily_journal',
        message: journalText.trim(),
        link: historyLesson ? `/bai/${historyLesson.id}` : null,
      });
      setJournalText('');
      setJournalNotice(true);
      setTimeout(() => setJournalNotice(false), 2500);
      reload();
    } catch (err) {
      alert('Lỗi lưu nhật ký: ' + err.message);
    } finally {
      setSavingJournal(false);
    }
  };

  const saveSubject = async (vals, existing) => {
    if (existing) await data.update('subjects', existing.id, vals);
    else {
      const s = await data.insert('subjects', { ...vals, position: vals.position || subjects.length });
      logActivity('subject', `Thêm môn mới: ${s.title}`, `/mon/${s.id}`);
    }
  };

  return (
    <div className="page">
      {/* SINGLE UNIFIED FOLIO SHEET (Rose Milk Editorial Folio) */}
      <div className="folio-sheet">
        {/* Folio Header */}
        <header className="folio-header">
          <div className="folio-breadcrumbs">
            <span>Không gian học tập</span>
            <span className="sep">/</span>
            <span style={{ color: '#E11D48', fontWeight: 700 }}>Lịch trình & Kế hoạch tuần</span>
          </div>

          <div className="folio-title-row">
            <div>
              <h1 className="folio-title">
                {isTeacher ? 'Kế hoạch giảng dạy & Theo dõi' : 'Tổng quan & Lịch trình học tập'}
              </h1>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '1rem' }}>
                {isTeacher
                  ? `Đang đồng hành cùng ${partner?.display_name || 'học viên'} · Kiểm tra tiến độ bài học & nộp bài tuần này`
                  : `Chào ${user.display_name} · Kế hoạch học tập tuần, nhật ký hôm nay và bài tập trọng tâm`}
              </p>
            </div>
          </div>
        </header>

        {/* 1. KHỐI NGÀY HỌC NGAY ĐẦU: NGÀY HÔM NAY, ĐẾM NGƯỢC, VÀ DẢI LỊCH TUẦN 7 NGÀY */}
        <section className="folio-schedule-hub">
          <div className="schedule-hero-row">
            <div>
              <div className="today-badge-pill">
                <span className="today-badge-dot" />
                <span>Tiến trình ngày học</span>
              </div>
              <h2 className="today-headline">{todayFullDate}</h2>
              <div className="small muted">
                Tuần học tập trọng tâm · Buổi kiểm tra định kỳ lúc 20:00 Thứ 7 hàng tuần
              </div>
            </div>

            <div className="countdown-box">
              <div className="countdown-num">
                {daysToSat === 0 ? 'Hôm nay!' : `${daysToSat} ngày nữa`}
              </div>
              <div className="small" style={{ color: '#BE123C', fontWeight: 700, marginTop: '2px' }}>
                Buổi học Thứ 7 ({fmtDate(sat.toISOString(), false)} - 20:00)
              </div>
              <div className="small muted" style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                {daysToSat === 0
                  ? 'Hôm nay là ngày học tổng kết tuần'
                  : daysToSat === 1
                  ? 'Ngày mai kiểm tra, hãy hoàn thành bài tập'
                  : 'Tiếp tục hoàn thiện các nhiệm vụ tuần này'}
              </div>
            </div>
          </div>

          {/* Dải lịch 7 ngày trong tuần */}
          <div className="week-strip-container">
            <div className="week-strip-label">
              <span>Lịch trình 7 ngày trong tuần</span>
              <span className="small muted">Thứ 2 → Chủ Nhật</span>
            </div>
            <div className="week-strip-grid">
              {weekDays.map((dItem, idx) => (
                <div
                  key={idx}
                  className={`week-day-pill ${dItem.isToday ? 'is-today' : ''} ${
                    dItem.isSaturday ? 'is-study-day' : ''
                  }`}
                >
                  <span className="day-name">{dItem.dayName}</span>
                  <span className="day-date">{`${dItem.dayNum}/${dItem.monthNum}`}</span>
                  {dItem.isToday && <span className="day-tag" style={{ color: '#FDA4AF' }}>Hôm nay</span>}
                  {dItem.isSaturday && !dItem.isToday && <span className="day-tag">Buổi học 20h</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. DẢI CHỈ SỐ LIỀN KHỐI (FOLIO METRIC STRIP) */}
        <div className="folio-metric-strip">
          {isTeacher ? (
            <>
              <Link to="/cham" className="folio-metric-cell">
                <div className="folio-metric-val">{toGrade.length}</div>
                <div className="folio-metric-lbl">Bài chờ chấm</div>
              </Link>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{todo.length}</div>
                <div className="folio-metric-lbl">Bài em chưa làm</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{historyAssignments.length}</div>
                <div className="folio-metric-lbl">Bài tập Lịch Sử 12</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{hearts}</div>
                <div className="folio-metric-lbl">Điểm thưởng đã trao</div>
              </div>
            </>
          ) : (
            <>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{todo.length}</div>
                <div className="folio-metric-lbl">Nhiệm vụ tuần này</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{historyAssignments.length}</div>
                <div className="folio-metric-lbl">Bài tập Lịch Sử 12</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{avg ?? '—'}</div>
                <div className="folio-metric-lbl">Điểm trung bình</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{hearts}</div>
                <div className="folio-metric-lbl">Điểm thưởng tích luỹ</div>
              </div>
            </>
          )}
        </div>

        {/* 3. KHỐI TRỌNG TÂM LỊCH SỬ 12 (TRỎ TRỰC TIẾP VÀO CÁC BÀI TẬP VÀ BÀI HỌC) */}
        <section style={{ marginTop: '32px' }}>
          <div className="row between" style={{ marginBottom: '16px' }}>
            <div className="row" style={{ gap: '10px' }}>
              <span className="idx-badge">1</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', color: '#380718' }}>
                  Trọng tâm Lịch Sử 12 · Bài 1: Liên Hợp Quốc
                </h3>
                <div className="small muted">
                  Trỏ trực tiếp vào các bài tập trắc nghiệm, tự luận vận dụng và bài đọc SGK số
                </div>
              </div>
            </div>

            {historyLesson && (
              <Link to={`/bai/${historyLesson.id}`} className="ios-btn sm ios-btn-secondary">
                Mở bài học SGK số →
              </Link>
            )}
          </div>

          <div className="grid3">
            {/* Thẻ 1: Bài tập trắc nghiệm & tự luận */}
            <div className="history-hub-card">
              <div>
                <div className="row between" style={{ marginBottom: '8px' }}>
                  <span className="subject-pill-tag">BÀI TẬP ĐÁNH GIÁ</span>
                  {historySub ? (
                    <span
                      className={`badge ${historySub.status === 'graded' ? 'graded' : 'submitted'}`}
                    >
                      {historySub.status === 'graded' ? `Đã chấm: ${historySub.score}/10` : 'Đã nộp · Chờ chấm'}
                    </span>
                  ) : (
                    <span className="badge in_progress">Chưa làm</span>
                  )}
                </div>
                <h4 style={{ margin: '4px 0 6px', fontSize: '1.05rem', color: '#380718' }}>
                  {mainHistoryAssignment?.title || 'Bài tập trọng tâm: Bài 1 - Liên hợp quốc'}
                </h4>
                <p className="small muted" style={{ margin: 0 }}>
                  Kiểm tra trắc nghiệm khách quan và câu hỏi tự luận ngắn đánh giá mức độ thấu hiểu bài học.
                </p>
                <div className="small muted" style={{ marginTop: '10px' }}>
                  Hạn nộp: 20:00 Thứ 7 · Thang điểm 10
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {mainHistoryAssignment ? (
                  historySub ? (
                    <Link
                      to={`/nop/${historySub.id}`}
                      className="ios-btn sm ios-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Xem bài nộp & Kết quả
                    </Link>
                  ) : (
                    <Link
                      to={`/bt/${mainHistoryAssignment.id}`}
                      className="ios-btn sm ios-btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Làm bài tập ngay →
                    </Link>
                  )
                ) : historyLesson ? (
                  <Link
                    to={`/bai/${historyLesson.id}`}
                    className="ios-btn sm ios-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Xem bài tập trong bài học →
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Thẻ 2: Câu hỏi vận dụng thực tế */}
            <div className="history-hub-card">
              <div>
                <div className="row between" style={{ marginBottom: '8px' }}>
                  <span className="subject-pill-tag">VẬN DỤNG THỰC TẾ</span>
                  <span className="badge">150 – 200 từ</span>
                </div>
                <h4 style={{ margin: '4px 0 6px', fontSize: '1.05rem', color: '#380718' }}>
                  Hoạt động gìn giữ hoà bình của Việt Nam
                </h4>
                <p className="small muted" style={{ margin: 0 }}>
                  Viết đoạn văn vận dụng ngắn về phái bộ Nam Xu-đăng, Abyei và bệnh viện dã chiến cấp 2.
                </p>
                <div className="small muted" style={{ marginTop: '10px' }}>
                  Tích hợp bộ đếm độ dài từ thời gian thực trong trang bài
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {historyLesson ? (
                  <Link
                    to={`/bai/${historyLesson.id}`}
                    className="ios-btn sm ios-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Viết bài thu hoạch vận dụng →
                  </Link>
                ) : (
                  <button className="ios-btn sm ios-btn-secondary" disabled style={{ width: '100%' }}>
                    Chưa kích hoạt bài học
                  </button>
                )}
              </div>
            </div>

            {/* Thẻ 3: SGK số và Thẻ nhớ Flashcards */}
            <div className="history-hub-card">
              <div>
                <div className="row between" style={{ marginBottom: '8px' }}>
                  <span className="subject-pill-tag">SGK & THẺ NHỚ</span>
                  <span className="badge">6 thẻ nhớ</span>
                </div>
                <h4 style={{ margin: '4px 0 6px', fontSize: '1.05rem', color: '#380718' }}>
                  Sách giáo khoa số & Thẻ nhớ Active Recall
                </h4>
                <p className="small muted" style={{ margin: 0 }}>
                  Đọc nội dung chuẩn NXB Kết Nối Tri Thức và luyện 6 thẻ nhớ trọng tâm lật 3D liền khối.
                </p>
                <div className="small muted" style={{ marginTop: '10px' }}>
                  Thời lượng ôn tập: ~15 phút · Trực quan chuẩn Apple
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {historyLesson ? (
                  <Link
                    to={`/bai/${historyLesson.id}`}
                    className="ios-btn sm ios-btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Đọc SGK & Luyện thẻ nhớ →
                  </Link>
                ) : (
                  <button className="ios-btn sm ios-btn-secondary" disabled style={{ width: '100%' }}>
                    Chưa kích hoạt bài học
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. HAI PHÂN MỤC LIỀN KHỐI: NHIỆM VỤ TUẦN NÀY & NHẬT KÝ HỌC TẬP HÔM NAY */}
        <div className="grid2" style={{ marginTop: '36px' }}>
          {/* Cột trái: Nhiệm vụ tuần này */}
          <div>
            <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
              <span className="idx-badge">2</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>
                  {isTeacher ? 'Bài tập cần chấm điểm' : 'Nhiệm vụ học tập tuần này'}
                </h3>
                <div className="small muted">Nhiệm vụ theo hạn nộp Thứ 7 và mức độ ưu tiên</div>
              </div>
            </div>

            {isTeacher ? (
              toGrade.length === 0 ? (
                <Empty>Hiện tại không có bài tập nào đang chờ chấm.</Empty>
              ) : (
                <ul className="list">
                  {toGrade.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <Link to={`/nop/${s.id}`} className="aitem">
                        <div>
                          <b>{aById[s.assignment_id]?.title || 'Bài tập'}</b>
                          <div className="small muted">Nộp lúc: {timeAgo(s.submitted_at)}</div>
                        </div>
                        <span className="badge submitted">Chờ chấm</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : todo.length === 0 ? (
              <Empty>Đã hoàn thành toàn bộ bài tập được giao trong tuần.</Empty>
            ) : (
              <ul className="list">
                {todo.map((a) => (
                  <li key={a.id}>
                    <Link to={`/bt/${a.id}`} className="aitem">
                      <div>
                        <b>{a.title}</b>
                        <div className="small muted">{chapterTitle[a.chapter_id]}</div>
                      </div>
                      <div className="aright">
                        <KindBadge kind={a.kind} />
                        <DueBadge due={a.due_at} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cột phải: Nhật ký học tập hôm nay */}
          <div>
            <div className="row" style={{ marginBottom: '14px', gap: '10px' }}>
              <span className="idx-badge">3</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>
                  Nhật ký học tập hôm nay
                </h3>
                <div className="small muted">Ghi nhận tiến độ và trao đổi trong ngày {todayStr}</div>
              </div>
            </div>

            {/* Ô ghi chú nhanh cho ngày hôm nay */}
            <div className="journal-compose">
              <div className="journal-chips">
                {QUICK_JOURNAL_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="journal-chip-btn"
                    onClick={() =>
                      setJournalText((prev) => (prev ? `${prev} · ${chip}` : chip))
                    }
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveJournal}>
                <textarea
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(253, 164, 175, 0.45)',
                    background: '#FFFDFE',
                    fontSize: '0.92rem',
                    color: '#380718',
                    resize: 'none',
                  }}
                  placeholder={
                    isTeacher
                      ? 'Ghi chú dặn dò học tập hôm nay cho em...'
                      : 'Hôm nay em đã đọc xong bài gì, làm bài nào...'
                  }
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                />

                <div className="row between" style={{ marginTop: '8px' }}>
                  <span className="small muted">
                    {journalNotice ? 'Đã lưu nhật ký hôm nay!' : `Ngày: ${todayStr}`}
                  </span>
                  <button
                    type="submit"
                    className="ios-btn sm ios-btn-primary"
                    disabled={!journalText.trim() || savingJournal}
                  >
                    {savingJournal ? 'Đang lưu...' : 'Lưu nhật ký ngày'}
                  </button>
                </div>
              </form>
            </div>

            {/* Dòng nhật ký hôm nay */}
            <div className="journal-timeline">
              {todayJournals.length === 0 ? (
                <div className="small muted" style={{ padding: '8px 4px' }}>
                  Chưa có ghi chép nhật ký nào cho ngày hôm nay. Hãy ghi nhanh một dòng tiến độ học tập nhé.
                </div>
              ) : (
                todayJournals.map((item) => (
                  <div key={item.id} className="journal-item">
                    <div className="journal-item-top">
                      <span className="who" style={{ color: '#BE123C', fontWeight: 700, fontSize: '0.88rem' }}>
                        {nameOf(item.actor_id)}
                      </span>
                      <span className="small muted">{timeAgo(item.created_at)}</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', color: '#380718', marginTop: '2px' }}>
                      {item.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <hr className="folio-divider" />

        {/* 4. ĐIỀU HƯỚNG TỚI TAB MÔN HỌC */}
        <section style={{ marginTop: '36px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFDFE 0%, #FFF5F7 100%)',
              border: '1.5px solid rgba(253, 164, 175, 0.45)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div className="row" style={{ gap: '12px' }}>
              <span className="idx-badge">4</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#380718' }}>
                  Chương trình & Danh mục môn học
                </h3>
                <div className="small muted">
                  Đang có {subjects.length} môn học trong hệ thống (Lịch Sử 10, Lịch Sử 11, Lịch Sử 12)
                </div>
              </div>
            </div>

            <div className="row" style={{ gap: '10px' }}>
              {sortByPos(subjects).map((s) => (
                <Link
                  key={s.id}
                  to={`/mon/${s.id}`}
                  className="ios-btn sm ios-btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  {s.title}
                </Link>
              ))}
              <Link to="/mon-hoc" className="ios-btn sm ios-btn-primary">
                Xem tất cả trong tab Môn học →
              </Link>
            </div>
          </div>
        </section>

        {dialog && (
          <FormDialog
            title={dialog.existing ? 'Sửa môn học' : 'Thêm môn học'}
            fields={SUBJECT_FIELDS}
            initial={dialog.existing || { color: '#E11D48', position: subjects.length }}
            onSubmit={(v) => saveSubject(v, dialog.existing)}
            onClose={() => setDialog(null)}
          />
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { DueBadge, ErrorBox, KindBadge, Loading, Empty } from '../components/ui';
import { maxScoreOf, nextSaturday, sortByPos, timeAgo, fmtDate } from '../lib/format';
import { avgScore, isTodo, latestByAssignment } from '../lib/progress';
import { seedHistoryCurriculum } from '../data/historyCurriculum';

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
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'todo' | 'journal'

  // State cho Nhật ký hôm nay
  const [journalText, setJournalText] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [journalNotice, setJournalNotice] = useState(false);

  const { data: d, loading, error, reload } = useLive(async () => {
    let [subjects, chapters, lessons, assignments, questions, submissions, activity] = await Promise.all([
      data.list('subjects'),
      data.list('chapters'),
      data.list('lessons'),
      data.list('assignments'),
      data.list('questions'),
      data.list('submissions'),
      data.list('activity', { order: 'created_at', asc: false, limit: 30 }),
    ]);

    // Tự động nạp giáo trình Lịch Sử nếu hệ thống chưa có môn học
    if (subjects.length === 0) {
      await seedHistoryCurriculum(data);
      [subjects, chapters, lessons, assignments, questions, submissions, activity] = await Promise.all([
        data.list('subjects'),
        data.list('chapters'),
        data.list('lessons'),
        data.list('assignments'),
        data.list('questions'),
        data.list('submissions'),
        data.list('activity', { order: 'created_at', asc: false, limit: 30 }),
      ]);
    }

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

  // Thời gian thực
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const sat = nextSaturday(20);

  // Tính số ngày lịch tới Thứ 7
  const satMidnight = new Date(sat);
  satMidnight.setHours(0, 0, 0, 0);
  const nowMidnight = new Date(now);
  nowMidnight.setHours(0, 0, 0, 0);
  const daysDiff = Math.max(0, Math.round((satMidnight - nowMidnight) / 86400000));

  const todayFullDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  // Dải 7 ngày trong tuần
  const currentDay = now.getDay();
  const mondayOffset = (currentDay + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

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

  return (
    <div className="page">
      {/* SINGLE UNIFIED FOLIO SHEET (Cố định 1 màn hình chuẩn điện thoại) */}
      <div className="folio-sheet">
        {/* 1. LỊCH TRÌNH NGÀY HỌC LIỀN KHỐI (APPLE MINIMALIST HEADER) */}
        <header className="folio-schedule-clean">
          <div className="schedule-header-row">
            <div>
              <div className="today-meta-lead">
                <span className="today-chip">
                  <span className="today-chip-dot" />
                  <span>Hôm nay</span>
                </span>
                <span className="small muted">Không gian học tập</span>
              </div>
              <h1 className="schedule-title">{todayFullDate}</h1>
              <p className="schedule-subtitle">
                {isTeacher
                  ? `Đồng hành cùng ${partner?.display_name || 'học viên'} · Kiểm tra tiến độ bài học`
                  : `Chào ${user.display_name} · Kế hoạch học tập và bài tập trọng tâm tuần này`}
              </p>
            </div>

            {/* Apple Countdown Pill */}
            <div className="apple-countdown-pill">
              <span className="countdown-main">
                {daysDiff === 0 ? 'Hôm nay' : daysDiff === 1 ? 'Ngày mai' : `${daysDiff} ngày nữa`}
              </span>
              <div className="countdown-text">
                <div style={{ color: '#BE123C', fontWeight: 700 }}>Buổi học Thứ 7 · 20:00</div>
                <div className="small muted" style={{ fontSize: '0.74rem' }}>{fmtDate(sat.toISOString(), false)}</div>
              </div>
            </div>
          </div>

          {/* Dải lịch 7 ngày trong tuần 1 hàng duy nhất */}
          <div className="apple-week-strip">
            {weekDays.map((dItem, idx) => (
              <div
                key={idx}
                className={`apple-day-col ${dItem.isToday ? 'active-today' : ''} ${
                  dItem.isSaturday ? 'study-day' : ''
                }`}
              >
                <span className="day-txt">{dItem.shortName}</span>
                <span className="date-txt">{dItem.dayNum}</span>
                {dItem.isToday && <span className="today-indicator">Hôm nay</span>}
                {dItem.isSaturday && !dItem.isToday && <span className="study-badge">Học 20h</span>}
              </div>
            ))}
          </div>
        </header>

        {/* 2. DẢI CHỈ SỐ LIỀN KHỐI (FOLIO METRIC STRIP) */}
        <div className="folio-metric-strip">
          {isTeacher ? (
            <>
              <Link to="/cham" className="folio-metric-cell">
                <div className="folio-metric-val">{toGrade.length}</div>
                <div className="folio-metric-lbl">Chờ chấm</div>
              </Link>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{todo.length}</div>
                <div className="folio-metric-lbl">Chưa làm</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{historyAssignments.length}</div>
                <div className="folio-metric-lbl">Bài Sử 12</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{hearts}</div>
                <div className="folio-metric-lbl">Điểm thưởng</div>
              </div>
            </>
          ) : (
            <>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{todo.length}</div>
                <div className="folio-metric-lbl">Cần làm</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{historyAssignments.length}</div>
                <div className="folio-metric-lbl">Bài Sử 12</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{avg ?? '—'}</div>
                <div className="folio-metric-lbl">Điểm TB</div>
              </div>
              <div className="folio-metric-cell">
                <div className="folio-metric-val">{hearts}</div>
                <div className="folio-metric-lbl">Điểm thưởng</div>
              </div>
            </>
          )}
        </div>

        {/* 3. BỘ CHUYỂN TAB CỐ ĐỊNH CHUẨN ĐIỆN THOẠI (1 MÀN HÌNH KHÔNG CUỘN) */}
        <div className="folio-segmented-tabs">
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Trọng tâm Sử 12
          </button>
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            Nhiệm vụ tuần {todo.length > 0 && <span className="tab-badge">{todo.length}</span>}
          </button>
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            Nhật ký {todayJournals.length > 0 && <span className="tab-badge">{todayJournals.length}</span>}
          </button>
        </div>

        {/* 4. NỘI DUNG THEO TAB (VỪA VẶN MÀN HÌNH, KHÔNG BỊ TRÀN CUỘN) */}
        <div className="tab-mobile-body">
          {/* TAB 1: TRỌNG TÂM LỊCH SỬ 12 */}
          {activeTab === 'history' && (
            <div className="compact-action-list">
              {/* Thẻ trắc nghiệm & tự luận */}
              <div className="compact-action-row">
                <div className="compact-action-main">
                  <div className="row" style={{ gap: '6px', marginBottom: '2px' }}>
                    <span className="subject-pill-tag">BÀI TẬP</span>
                    {historySub ? (
                      <span className={`badge ${historySub.status === 'graded' ? 'graded' : 'submitted'}`}>
                        {historySub.status === 'graded' ? `${historySub.score}/10đ` : 'Chờ chấm'}
                      </span>
                    ) : (
                      <span className="badge in_progress">Hạn Thứ 7</span>
                    )}
                  </div>
                  <h4 className="compact-action-title">
                    {mainHistoryAssignment?.title || 'Bài tập trọng tâm: Bài 1 - Liên hợp quốc'}
                  </h4>
                  <div className="compact-action-meta">
                    <span>5 câu TN + 1 tự luận</span>
                    <span>·</span>
                    <span>Thang điểm 10</span>
                  </div>
                </div>

                <div>
                  {mainHistoryAssignment ? (
                    historySub ? (
                      <Link to={`/nop/${historySub.id}`} className="ios-btn sm ios-btn-secondary">
                        Xem kết quả
                      </Link>
                    ) : (
                      <Link to={`/bt/${mainHistoryAssignment.id}`} className="ios-btn sm ios-btn-primary">
                        Làm bài ngay →
                      </Link>
                    )
                  ) : historyLesson ? (
                    <Link to={`/bai/${historyLesson.id}`} className="ios-btn sm ios-btn-primary">
                      Vào bài →
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Thẻ bài luận vận dụng */}
              <div className="compact-action-row">
                <div className="compact-action-main">
                  <div className="row" style={{ gap: '6px', marginBottom: '2px' }}>
                    <span className="subject-pill-tag">VẬN DỤNG</span>
                    <span className="badge">150 – 200 từ</span>
                  </div>
                  <h4 className="compact-action-title">
                    Hoạt động gìn giữ hoà bình của Việt Nam
                  </h4>
                  <div className="compact-action-meta">
                    <span>Phái bộ Nam Xu-đăng & BV dã chiến 2</span>
                  </div>
                </div>

                <div>
                  {historyLesson ? (
                    <Link to={`/bai/${historyLesson.id}`} className="ios-btn sm ios-btn-primary">
                      Viết bài →
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Thẻ đọc SGK & Flashcards */}
              <div className="compact-action-row">
                <div className="compact-action-main">
                  <div className="row" style={{ gap: '6px', marginBottom: '2px' }}>
                    <span className="subject-pill-tag">SGK & THẺ NHỚ</span>
                    <span className="badge">6 thẻ nhớ 3D</span>
                  </div>
                  <h4 className="compact-action-title">
                    Toàn văn SGK KNTT & Thẻ ghi nhớ
                  </h4>
                  <div className="compact-action-meta">
                    <span>Hội nghị I-an-ta · 5 nước HĐBA</span>
                  </div>
                </div>

                <div>
                  {historyLesson ? (
                    <Link to={`/bai/${historyLesson.id}`} className="ios-btn sm ios-btn-secondary">
                      Mở học →
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NHIỆM VỤ TUẦN */}
          {activeTab === 'todo' && (
            <div style={{ marginTop: '8px' }}>
              {isTeacher ? (
                toGrade.length === 0 ? (
                  <Empty>Hiện tại không có bài tập nào đang chờ chấm.</Empty>
                ) : (
                  <ul className="list">
                    {toGrade.map((s) => (
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
                <Empty>Đã hoàn thành toàn bộ bài tập tuần này.</Empty>
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
          )}

          {/* TAB 3: NHẬT KÝ HÔM NAY */}
          {activeTab === 'journal' && (
            <div style={{ marginTop: '8px' }}>
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
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid rgba(253, 164, 175, 0.45)',
                      background: '#FFFDFE',
                      fontSize: '0.88rem',
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

                  <div className="row between" style={{ marginTop: '6px' }}>
                    <span className="small muted">
                      {journalNotice ? 'Đã lưu nhật ký!' : todayStr}
                    </span>
                    <button
                      type="submit"
                      className="ios-btn sm ios-btn-primary"
                      disabled={!journalText.trim() || savingJournal}
                    >
                      {savingJournal ? 'Đang lưu...' : 'Lưu nhật ký'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Dòng nhật ký hôm nay */}
              <div className="journal-timeline">
                {todayJournals.length === 0 ? (
                  <div className="small muted" style={{ padding: '6px 4px' }}>
                    Chưa có ghi chép nhật ký nào cho ngày hôm nay. Hãy ghi nhanh một dòng tiến độ học tập nhé.
                  </div>
                ) : (
                  todayJournals.map((item) => (
                    <div key={item.id} className="journal-item">
                      <div className="journal-item-top">
                        <span className="who" style={{ color: '#BE123C', fontWeight: 700, fontSize: '0.85rem' }}>
                          {nameOf(item.actor_id)}
                        </span>
                        <span className="small muted">{timeAgo(item.created_at)}</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#380718', marginTop: '1px' }}>
                        {item.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Liên kết sang tab Môn học dạng 1 dòng gọn gàng */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', textAlign: 'center', flexShrink: 0 }}>
          <Link to="/mon-hoc" className="small" style={{ color: '#BE123C', fontWeight: 700 }}>
            Mở tab Môn học để chọn giáo trình các lớp →
          </Link>
        </div>
      </div>
    </div>
  );
}

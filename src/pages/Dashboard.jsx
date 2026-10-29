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

  // Thời gian thực hiện tại
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const sat = nextSaturday(20);

  // State ngày được chọn để xem (mặc định là ngày hôm nay theo thời gian thực)
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // State cho Nhật ký
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

  // Tính số ngày lịch tới Thứ 7 (luôn cố định theo thời gian thực)
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

  // Tạo dải 7 ngày trong tuần từ Thứ 2 đến Chủ Nhật của tuần thực tế hiện tại
  const currentDay = now.getDay();
  const mondayOffset = (currentDay + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const shortNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const fullDayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    const dateStr = dt.toISOString().slice(0, 10);
    const isRealToday = dt.toDateString() === now.toDateString();
    const isSaturday = dt.getDay() === 6;
    return {
      date: dt,
      dateStr,
      dayNum: dt.getDate(),
      monthNum: dt.getMonth() + 1,
      shortName: shortNames[dt.getDay()],
      dayName: fullDayNames[dt.getDay()],
      isRealToday,
      isSaturday,
    };
  });

  // Tìm thông tin ngày đang được bấm xem
  const selectedDayObj =
    weekDays.find((d) => d.dateStr === selectedDateStr) ||
    weekDays.find((d) => d.isRealToday) ||
    weekDays[0];
  const isViewingRealToday = selectedDayObj.isRealToday;

  // Lọc hoạt động, bài nộp, nhật ký của ngày đang chọn
  const selectedDayActivities = activity.filter((x) => (x.created_at || '').startsWith(selectedDateStr));
  const selectedDaySubmissions = submissions.filter((s) =>
    (s.submitted_at || s.created_at || '').startsWith(selectedDateStr),
  );
  const selectedDayJournals = selectedDayActivities.filter((x) => x.type === 'daily_journal');
  const otherDayActivities = selectedDayActivities.filter((x) => x.type !== 'daily_journal');

  // Tìm bài học & bài tập trọng tâm Lịch Sử 12
  const historyLesson = lessons.find((l) => l.title.toLowerCase().includes('liên hợp quốc'));
  const historyAssignments = assignments.filter((a) => {
    if (historyLesson && a.lesson_id === historyLesson.id) return true;
    if (a.title.toLowerCase().includes('liên hợp quốc') || a.title.toLowerCase().includes('lịch sử')) return true;
    return false;
  });
  const mainHistoryAssignment = historyAssignments[0];
  const historySub = mainHistoryAssignment ? latest[mainHistoryAssignment.id] : null;

  // Xử lý khi bấm vào 1 ngày trong dải 7 ngày
  const handleSelectDay = (dItem) => {
    setSelectedDateStr(dItem.dateStr);
    // Tự động chuyển sang tab Nhật ký để người dùng xem ngay những việc đã làm trong ngày đó
    setActiveTab('journal');
  };

  const handleSaveJournal = async (e) => {
    e?.preventDefault();
    if (!journalText.trim() || savingJournal) return;
    setSavingJournal(true);
    try {
      // Gắn mốc thời gian theo ngày đang chọn
      const createdIso = isViewingRealToday
        ? new Date().toISOString()
        : `${selectedDateStr}T12:00:00.000Z`;

      await data.insert('activity', {
        type: 'daily_journal',
        message: journalText.trim(),
        link: historyLesson ? `/bai/${historyLesson.id}` : null,
        created_at: createdIso,
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
        {/* 1. LỊCH TRÌNH NGÀY HỌC LIỀN KHỐI (LUÔN CỐ ĐỊNH THEO THỜI GIAN THỰC) */}
        <header className="folio-schedule-clean">
          <div className="schedule-header-row">
            <div>
              <div className="today-meta-lead">
                <span className="today-chip">
                  <span className="today-chip-dot" />
                  <span>Hôm nay thực tế</span>
                </span>
                <span className="small muted">Tuần học tập trọng tâm</span>
              </div>
              <h1 className="schedule-title">{todayFullDate}</h1>
              <p className="schedule-subtitle">
                {isTeacher
                  ? `Đồng hành cùng ${partner?.display_name || 'học viên'} · Kiểm tra tiến độ bài học`
                  : `Chào ${user.display_name} · Kế hoạch học tập và bài tập trọng tâm tuần này`}
              </p>
            </div>

            {/* Apple Countdown Pill (luôn đếm tới Thứ 7 thực tế) */}
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

          {/* Dải lịch 7 ngày trong tuần: BẤM ĐƯỢC TỪNG NGÀY, LUÔN CỐ ĐỊNH THỜI GIAN THỰC */}
          <div className="apple-week-strip">
            {weekDays.map((dItem, idx) => {
              const isSelected = dItem.dateStr === selectedDateStr;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(dItem)}
                  className={`apple-day-col ${isSelected ? 'is-selected' : ''} ${
                    dItem.isRealToday ? 'is-real-today' : ''
                  } ${dItem.isSaturday ? 'study-day' : ''}`}
                  title={`${dItem.dayName}, ngày ${dItem.dayNum}/${dItem.monthNum}${
                    dItem.isRealToday ? ' (Hôm nay thực tế)' : ''
                  }`}
                >
                  <span className="day-txt">{dItem.shortName}</span>
                  <span className="date-txt">{dItem.dayNum}</span>
                  {dItem.isRealToday && (
                    <span className="today-indicator">
                      {isSelected ? 'Hôm nay' : '●'}
                    </span>
                  )}
                  {dItem.isSaturday && !dItem.isRealToday && !isSelected && (
                    <span className="study-badge">Học 20h</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Thanh chỉ báo khi đang bấm xem một ngày khác ngày hôm nay */}
          {!isViewingRealToday && (
            <div className="day-inspect-bar">
              <div className="row" style={{ gap: '6px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#380718' }}>
                  Đang xem {selectedDayObj.dayName} ({selectedDayObj.dayNum}/{selectedDayObj.monthNum})
                </span>
                <span className="badge" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                  {selectedDayActivities.length + selectedDaySubmissions.length} việc đã làm
                </span>
              </div>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                onClick={() => setSelectedDateStr(todayStr)}
              >
                Quay lại Hôm nay ↺
              </button>
            </div>
          )}
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
            {isViewingRealToday ? 'Nhật ký hôm nay' : `Việc ${selectedDayObj.shortName}`}
            {(selectedDayActivities.length + selectedDaySubmissions.length > 0) && (
              <span className="tab-badge">
                {selectedDayActivities.length + selectedDaySubmissions.length}
              </span>
            )}
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

          {/* TAB 3: NHẬT KÝ & TIẾN TRÌNH CỦA NGÀY ĐƯỢC CHỌN */}
          {activeTab === 'journal' && (
            <div style={{ marginTop: '8px' }}>
              {/* Nếu đang xem Hôm nay: Có ô nhập nhanh nhật ký */}
              {isViewingRealToday ? (
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
                        {journalNotice ? 'Đã lưu nhật ký hôm nay!' : todayStr}
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
              ) : (
                /* Nếu đang xem một ngày khác trong quá khứ/tuần này */
                <div style={{ marginBottom: '10px' }}>
                  <div className="row between" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#380718' }}>
                      Các việc đã thực hiện ngày {selectedDayObj.dayName} ({selectedDayObj.dayNum}/{selectedDayObj.monthNum}):
                    </span>
                  </div>
                </div>
              )}

              {/* Danh sách bài tập đã nộp trong ngày đang chọn */}
              {selectedDaySubmissions.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div className="small muted" style={{ fontWeight: 700, color: '#BE123C', marginBottom: '6px' }}>
                    Bài tập đã nộp ({selectedDaySubmissions.length})
                  </div>
                  {selectedDaySubmissions.map((s) => (
                    <Link
                      key={s.id}
                      to={`/nop/${s.id}`}
                      className="compact-action-row"
                      style={{ textDecoration: 'none', padding: '8px 12px', marginBottom: '6px' }}
                    >
                      <div>
                        <b>{aById[s.assignment_id]?.title || 'Bài tập'}</b>
                        <div className="small muted">
                          Nộp lúc:{' '}
                          {new Date(s.submitted_at || s.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <span className={`badge ${s.status === 'graded' ? 'graded' : 'submitted'}`}>
                        {s.status === 'graded' ? `${s.score}/10đ` : 'Chờ chấm'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Danh sách nhật ký học tập trong ngày đang chọn */}
              {selectedDayJournals.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div className="small muted" style={{ fontWeight: 700, color: '#BE123C', marginBottom: '6px' }}>
                    Ghi chú nhật ký ({selectedDayJournals.length})
                  </div>
                  {selectedDayJournals.map((item) => (
                    <div key={item.id} className="journal-item" style={{ marginBottom: '6px' }}>
                      <div className="journal-item-top">
                        <span className="who" style={{ color: '#BE123C', fontWeight: 700, fontSize: '0.85rem' }}>
                          {nameOf(item.actor_id)}
                        </span>
                        <span className="small muted">
                          {new Date(item.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#380718', marginTop: '1px' }}>
                        {item.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Danh sách hoạt động khác trong ngày đang chọn */}
              {otherDayActivities.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div className="small muted" style={{ fontWeight: 700, color: '#BE123C', marginBottom: '6px' }}>
                    Nhật ký hoạt động khác
                  </div>
                  {otherDayActivities.map((item) => (
                    <div key={item.id} className="journal-item" style={{ marginBottom: '6px' }}>
                      <div className="journal-item-top">
                        <span className="who" style={{ color: '#BE123C', fontWeight: 700, fontSize: '0.85rem' }}>
                          {nameOf(item.actor_id)}
                        </span>
                        <span className="small muted">
                          {new Date(item.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#380718', marginTop: '1px' }}>
                        {item.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trường hợp ngày đó chưa làm gì */}
              {selectedDayActivities.length === 0 && selectedDaySubmissions.length === 0 && (
                <div
                  style={{
                    padding: '24px 14px',
                    textAlign: 'center',
                    background: '#FFFDFE',
                    border: '1.5px dashed rgba(253, 164, 175, 0.45)',
                    borderRadius: '14px',
                    margin: '8px 0',
                  }}
                >
                  <p className="small muted" style={{ margin: 0 }}>
                    Chưa có bài tập nộp hay ghi chép nhật ký nào trong ngày {selectedDayObj.dayName} ({selectedDayObj.dayNum}/{selectedDayObj.monthNum}).
                  </p>
                </div>
              )}

              {/* Cho phép ghi thêm nhận xét/nhật ký bổ sung cho ngày đang xem */}
              {!isViewingRealToday && (
                <form onSubmit={handleSaveJournal} style={{ marginTop: '10px' }}>
                  <div className="row" style={{ gap: '6px' }}>
                    <input
                      type="text"
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(253, 164, 175, 0.45)',
                        background: '#FFFDFE',
                        fontSize: '0.86rem',
                        color: '#380718',
                      }}
                      placeholder={`Ghi thêm nhật ký cho ${selectedDayObj.dayName}...`}
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="ios-btn sm ios-btn-primary"
                      disabled={!journalText.trim() || savingJournal}
                    >
                      {savingJournal ? 'Lưu...' : 'Ghi nhận'}
                    </button>
                  </div>
                </form>
              )}
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

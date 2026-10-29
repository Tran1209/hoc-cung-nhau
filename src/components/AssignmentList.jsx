import { Link, useNavigate } from 'react-router-dom';
import { data } from '../data';
import { useAuth } from '../context/AuthContext';
import { DueBadge, KindBadge, StatusBadge, Empty } from './ui';
import { nextSaturday, sortByPos, scoreText, fmtDate } from '../lib/format';

/**
 * Danh sách bài tập BT1, BT2, BT3,...
 * Chuẩn định dạng Đề thi THPT Quốc Gia 2026 (Bộ GD&ĐT)
 * Hỗ trợ Nam thêm và quản lý bài tập dễ dàng.
 */
export default function AssignmentList({
  assignments = [],
  latest = {},
  chapterId,
  lessonId = null,
  emptyText,
  defaultTitle,
}) {
  const { user, isTeacher } = useAuth();
  const nav = useNavigate();

  const sorted = sortByPos(assignments);

  const add = async () => {
    const nextNum = sorted.length + 1;
    const a = await data.insert('assignments', {
      chapter_id: chapterId,
      lesson_id: lessonId,
      title: defaultTitle || `BT${nextNum}: Đề bài tập mới (Chuẩn THPTQG 2026)`,
      kind: 'quiz',
      instructions: 'Đề bài tập luyện thi THPT Quốc Gia 2026 gồm các câu hỏi trắc nghiệm nhiều lựa chọn và trắc nghiệm Đúng/Sai theo tư liệu.',
      max_score: 10,
      due_at: nextSaturday(20).toISOString(),
      position: nextNum,
      is_published: true,
    });
    nav(`/bt/${a.id}/sua`);
  };

  return (
    <div>
      {sorted.length === 0 ? (
        <Empty>{emptyText || 'Chưa có bài tập nào được giao cho bài này.'}</Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sorted.map((a, idx) => {
            const s = latest?.[a.id];
            const isGraded = s?.status === 'graded';
            const scheduled = a.is_published && a.publish_at && new Date(a.publish_at) > new Date();

            // Nhận diện mã BT (ví dụ BT1, BT2, BT3)
            const matchBt = (a.title || '').match(/^(BT\d+)/i);
            const btCode = matchBt ? matchBt[1].toUpperCase() : `BT${idx + 1}`;

            return (
              <div key={a.id} className="bt-card">
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: '8px', marginBottom: '6px' }}>
                    <span className="bt-badge">{btCode}</span>
                    <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C', border: '1px solid #FECDD6' }}>
                      Chuẩn Đề THPTQG 2026
                    </span>
                    {a.kind === 'quiz' && <span className="badge">Trắc nghiệm online</span>}
                    {!a.is_published && <span className="badge draft">Bản nháp</span>}
                    {scheduled && <span className="badge due">Mở ngày {fmtDate(a.publish_at)}</span>}
                  </div>

                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '1.02rem', color: '#380718' }}>
                    {a.title}
                  </h4>

                  <div className="row" style={{ gap: '12px', fontSize: '0.82rem', color: '#9F1239' }}>
                    <span>Điểm tối đa: <b>{a.max_score || 10}đ</b></span>
                    {a.due_at && <DueBadge due={a.due_at} />}
                    {isGraded ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        Đã nộp · Đạt {scoreText(s.score)}
                      </span>
                    ) : s?.status === 'submitted' ? (
                      <span style={{ color: '#E11D48', fontWeight: 700 }}>Đã nộp · Chờ giáo viên chấm</span>
                    ) : (
                      <span className="muted">Chưa làm bài</span>
                    )}
                  </div>
                </div>

                <div className="row" style={{ gap: '8px', flexShrink: 0 }}>
                  {/* Nút sửa đề dành cho Nam / Người quản trị */}
                  <Link
                    to={`/bt/${a.id}/sua`}
                    className="ios-btn sm ios-btn-secondary"
                    title="Chỉnh sửa câu hỏi, đáp án Đúng/Sai (Nam)"
                  >
                    Sửa đề ✎
                  </Link>

                  {/* Nút làm bài hoặc xem kết quả */}
                  <Link
                    to={`/bt/${a.id}`}
                    className={`ios-btn sm ${isGraded ? 'ios-btn-secondary' : 'ios-btn-primary'}`}
                  >
                    {isGraded ? 'Xem bài nộp' : 'Làm bài ' + btCode + ' →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nút thêm BT1, BT2, BT3,... do Nam thêm vào */}
      <div
        className="row between"
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1.5px solid rgba(253, 164, 175, 0.35)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="small muted">
          Nam có thể thêm các bài tập mới (BT1, BT2, BT3,...) với câu hỏi trắc nghiệm và Đúng/Sai chuẩn THPTQG 2026:
        </div>
        <button type="button" className="ios-btn sm ios-btn-primary" onClick={add}>
          + Nam thêm bài tập mới (BT{sorted.length + 1})
        </button>
      </div>
    </div>
  );
}

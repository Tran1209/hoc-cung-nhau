import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { data, logActivity } from '../data';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { DueBadge, KindBadge, StatusBadge, Empty } from './ui';
import { nextSaturday, sortByPos, scoreText, fmtDate } from '../lib/format';
import { generateThptqg2026Template, parseDocxFile } from '../lib/examParser';

/**
 * Danh sách bài tập BT1, BT2, BT3,...
 * Chuẩn định dạng Đề thi THPT Quốc Gia 2026 (Bộ GD&ĐT)
 * Hỗ trợ Nam thêm và quản lý bài tập dễ dàng với các phương án lựa chọn và nạp file Word.
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
  const docxInputRef = useRef(null);

  const [showPresetModal, setShowPresetModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const sorted = sortByPos(assignments);
  const nextNum = sorted.length + 1;
  const nextBtCode = `BT${nextNum}`;

  // 1. Tạo đề theo Preset chuẩn THPTQG 2026 (24 MCQ + 4 TF)
  const handleCreateThptqgPreset = async () => {
    setCreating(true);
    setStatusMsg('Đang khởi tạo khung đề chuẩn THPTQG 2026 (28 câu)...');
    try {
      const a = await data.insert('assignments', {
        chapter_id: chapterId,
        lesson_id: lessonId,
        title: `${nextBtCode}: Đề luyện thi THPT Quốc Gia 2026`,
        kind: 'quiz',
        instructions:
          'Đề thi thử tốt nghiệp THPT Quốc Gia 2026 môn Lịch Sử gồm 2 phần: Phần I gồm 24 câu trắc nghiệm 4 lựa chọn (6.0đ) và Phần II gồm 4 câu trắc nghiệm Đúng / Sai theo đoạn tư liệu (4.0đ). Thời gian làm bài 50 phút.',
        max_score: 10,
        due_at: nextSaturday(20).toISOString(),
        position: nextNum,
        is_published: true,
      });

      // Tạo sẵn 24 MCQ + 4 TF
      const template = generateThptqg2026Template(defaultTitle || 'Lịch Sử 12');
      for (let i = 0; i < template.length; i++) {
        const qData = template[i];
        const q = await data.insert('questions', {
          assignment_id: a.id,
          position: i + 1,
          type: qData.type,
          prompt: qData.prompt,
          options: qData.options,
          points: qData.points,
        });

        if (qData.correct !== undefined && qData.correct !== null) {
          await data.insert('answer_keys', {
            question_id: q.id,
            correct: qData.correct,
            explanation: qData.explanation || '',
          });
        }
      }

      await logActivity('assignment', `Nam đã tạo ${a.title}`, `/bt/${a.id}`);
      setShowPresetModal(false);
      nav(`/bt/${a.id}/sua`);
    } catch (err) {
      alert('Lỗi tạo bài tập: ' + err.message);
    } finally {
      setCreating(false);
      setStatusMsg('');
    }
  };

  // 2. Tạo đề nhanh 10 câu trắc nghiệm (Kiểm tra 15 phút)
  const handleCreate10McqPreset = async () => {
    setCreating(true);
    setStatusMsg('Đang tạo đề kiểm tra 15 phút (10 câu)...');
    try {
      const a = await data.insert('assignments', {
        chapter_id: chapterId,
        lesson_id: lessonId,
        title: `${nextBtCode}: Đề kiểm tra nhanh 15 phút (10 câu)`,
        kind: 'quiz',
        instructions: 'Đề kiểm tra 15 phút gồm 10 câu hỏi trắc nghiệm nhanh củng cố kiến thức trọng tâm.',
        max_score: 10,
        time_limit_minutes: 15,
        due_at: nextSaturday(20).toISOString(),
        position: nextNum,
        is_published: true,
      });

      for (let i = 1; i <= 10; i++) {
        const q = await data.insert('questions', {
          assignment_id: a.id,
          position: i,
          type: 'mcq',
          prompt: `Câu ${i}: Nhập nội dung câu hỏi trắc nghiệm số ${i}...`,
          options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
          points: 1.0,
        });
        await data.insert('answer_keys', {
          question_id: q.id,
          correct: 0,
          explanation: '',
        });
      }

      setShowPresetModal(false);
      nav(`/bt/${a.id}/sua`);
    } catch (err) {
      alert('Lỗi tạo bài tập: ' + err.message);
    } finally {
      setCreating(false);
      setStatusMsg('');
    }
  };

  // 3. Tạo bài bằng cách nạp trực tiếp file Word (.docx)
  const handleImportDocx = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCreating(true);
    setStatusMsg(`Đang đọc và bóc tách câu hỏi từ file "${file.name}"...`);
    try {
      const parsed = await parseDocxFile(file);
      if (!parsed || parsed.length === 0) {
        alert('Không nhận diện được câu hỏi từ file Word này. Vui lòng kiểm tra định dạng.');
        setCreating(false);
        setStatusMsg('');
        return;
      }

      const mcqCount = parsed.filter((q) => q.type === 'mcq').length;
      const tfCount = parsed.filter((q) => q.type === 'tf').length;

      const a = await data.insert('assignments', {
        chapter_id: chapterId,
        lesson_id: lessonId,
        title: `${nextBtCode}: Đề thi nạp từ file Word (${parsed.length} câu)`,
        kind: 'quiz',
        instructions: `Đề thi được nạp tự động từ file Word "${file.name}" gồm ${mcqCount} câu trắc nghiệm và ${tfCount} câu Đúng/Sai.`,
        max_score: 10,
        due_at: nextSaturday(20).toISOString(),
        position: nextNum,
        is_published: true,
      });

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const q = await data.insert('questions', {
          assignment_id: a.id,
          position: i + 1,
          type: item.type,
          prompt: item.prompt,
          options: item.options,
          points: item.points,
        });

        if (item.correct !== undefined && item.correct !== null) {
          await data.insert('answer_keys', {
            question_id: q.id,
            correct: item.correct,
            explanation: item.explanation || '',
          });
        }
      }

      await logActivity('assignment', `Nam đã nạp ${a.title} từ file Word`, `/bt/${a.id}`);
      setShowPresetModal(false);
      nav(`/bt/${a.id}/sua`);
    } catch (err) {
      alert('Lỗi nạp file Word: ' + err.message);
    } finally {
      setCreating(false);
      setStatusMsg('');
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  // 4. Tạo khung bài tập rỗng
  const handleCreateBlank = async () => {
    setCreating(true);
    setStatusMsg('Đang tạo khung bài tập mới...');
    try {
      const a = await data.insert('assignments', {
        chapter_id: chapterId,
        lesson_id: lessonId,
        title: defaultTitle || `${nextBtCode}: Bài tập rèn luyện mới`,
        kind: 'quiz',
        instructions: 'Nhập hướng dẫn làm bài tập...',
        max_score: 10,
        due_at: nextSaturday(20).toISOString(),
        position: nextNum,
        is_published: true,
      });
      setShowPresetModal(false);
      nav(`/bt/${a.id}/sua`);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setCreating(false);
      setStatusMsg('');
    }
  };

  return (
    <div>
      {sorted.length === 0 ? (
        <Empty>{emptyText || 'Chưa có bài tập nào được giao cho bài này.'}</Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sorted.map((a, idx) => {
            const s = latest?.[a.id];
            const isGraded = s?.status === 'graded';
            const scheduled = a.is_published && a.publish_at && new Date(a.publish_at) > new Date();

            const matchBt = (a.title || '').match(/^(BT\d+)/i);
            const btCode = matchBt ? matchBt[1].toUpperCase() : `BT${idx + 1}`;

            return (
              <div key={a.id} className="bt-card">
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: '8px', marginBottom: '6px' }}>
                    <span className="bt-badge">{btCode}</span>
                    <span
                      className="badge"
                      style={{ background: '#FFF0F3', color: '#BE123C', border: '1px solid #FECDD6' }}
                    >
                      Chuẩn Đề THPTQG 2026
                    </span>
                    {a.kind === 'quiz' && <span className="badge">Trắc nghiệm online</span>}
                    {!a.is_published && <span className="badge draft">Bản nháp</span>}
                    {scheduled && <span className="badge due">Mở ngày {fmtDate(a.publish_at)}</span>}
                  </div>

                  <h4 style={{ margin: '4px 0 6px 0', fontSize: '1.05rem', color: '#380718' }}>
                    {a.title}
                  </h4>

                  <div className="row" style={{ gap: '12px', fontSize: '0.82rem', color: '#9F1239' }}>
                    <span>
                      Điểm tối đa: <b>{a.max_score || 10}đ</b>
                    </span>
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
                  {isTeacher && (
                    <Link
                      to={`/bt/${a.id}/sua`}
                      className="ios-btn sm ios-btn-secondary"
                      title="Chỉnh sửa câu hỏi, đáp án Đúng/Sai (Nam)"
                    >
                      Sửa đề ✎
                    </Link>
                  )}

                  <Link
                    to={`/bt/${a.id}`}
                    className={`ios-btn sm ${isGraded ? 'ios-btn-secondary' : 'ios-btn-primary'}`}
                  >
                    {isGraded ? 'Xem kết quả' : 'Làm bài ' + btCode + ' →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nút mở bảng lựa chọn phương án tạo bài tập mới */}
      {isTeacher && (
        <div
          className="row between"
          style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1.5px solid rgba(253, 164, 175, 0.35)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div className="small muted">
            Nam có thể thêm nhanh <b>BT{nextNum}</b> với các phương án lựa chọn mẫu hoặc nạp trực tiếp từ file Word:
          </div>

          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={() => setShowPresetModal(true)}
          >
            + Nam thêm bài tập mới ({nextBtCode})
          </button>
        </div>
      )}

      {/* MODAL PHƯƠNG ÁN LỰA CHỌN TẠO BÀI TẬP */}
      {showPresetModal && (
        <Modal title={`Chọn phương án tạo ${nextBtCode}`} onClose={() => !creating && setShowPresetModal(false)}>
          <div style={{ padding: '6px 0' }}>
            <p className="small muted" style={{ marginBottom: '16px' }}>
              Chọn một phương án tạo bài tập phù hợp. Sau khi chọn, hệ thống sẽ tự động tạo khung và đưa bạn vào màn hình chỉnh sửa:
            </p>

            {statusMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#FFF0F3',
                  border: '1px solid #FDA4AF',
                  borderRadius: '10px',
                  color: '#BE123C',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                ⏳ {statusMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Chuẩn THPT Quốc Gia 2026 */}
              <div
                className="compact-action-row"
                style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
                onClick={() => !creating && handleCreateThptqgPreset()}
              >
                <div>
                  <div className="row" style={{ gap: '6px', marginBottom: '2px' }}>
                    <span className="bt-badge">24+4</span>
                    <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                      Chuẩn Bộ GD&ĐT 2026
                    </span>
                  </div>
                  <h4 style={{ margin: '2px 0', fontSize: '0.98rem', color: '#380718' }}>
                    Đề thi THPT Quốc Gia 2026 tiêu chuẩn
                  </h4>
                  <div className="small muted">
                    24 câu trắc nghiệm 4 lựa chọn (6.0đ) + 4 câu Đúng/Sai theo tư liệu (4.0đ) = 10.0đ
                  </div>
                </div>
                <button type="button" className="ios-btn sm ios-btn-primary" disabled={creating}>
                  Chọn mẫu này →
                </button>
              </div>

              {/* Option 2: Nạp trực tiếp từ file Word (.docx) */}
              <div
                className="compact-action-row"
                style={{ cursor: creating ? 'not-allowed' : 'pointer', background: '#FFFDFE', borderColor: '#FDA4AF' }}
                onClick={() => !creating && docxInputRef.current?.click()}
              >
                <div>
                  <div className="row" style={{ gap: '6px', marginBottom: '2px' }}>
                    <span className="badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                      Tự động bóc tách Word (.docx)
                    </span>
                    <span className="badge">Tiết kiệm thời gian</span>
                  </div>
                  <h4 style={{ margin: '2px 0', fontSize: '0.98rem', color: '#380718' }}>
                    Nạp đề tự động từ file Word (.docx)
                  </h4>
                  <div className="small muted">
                    Chọn file Word có sẵn đề thi, hệ thống sẽ tự đọc 24 câu trắc nghiệm và 4 câu Đúng/Sai
                  </div>
                </div>

                <div>
                  <input
                    ref={docxInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    onChange={handleImportDocx}
                  />
                  <button
                    type="button"
                    className="ios-btn sm ios-btn-secondary"
                    style={{ color: '#0284C7', borderColor: '#BAE6FD' }}
                    disabled={creating}
                  >
                    Chọn file Word 📁
                  </button>
                </div>
              </div>

              {/* Option 3: Đề kiểm tra 15 phút */}
              <div
                className="compact-action-row"
                style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
                onClick={() => !creating && handleCreate10McqPreset()}
              >
                <div>
                  <div className="row" style={{ gap: '6px', marginBottom: '2px' }}>
                    <span className="badge">15 phút</span>
                    <span className="badge">10 câu</span>
                  </div>
                  <h4 style={{ margin: '2px 0', fontSize: '0.98rem', color: '#380718' }}>
                    Đề kiểm tra nhanh 15 phút
                  </h4>
                  <div className="small muted">10 câu trắc nghiệm 4 lựa chọn (1.0đ/câu) = 10.0 điểm</div>
                </div>
                <button type="button" className="ios-btn sm ios-btn-secondary" disabled={creating}>
                  Chọn mẫu →
                </button>
              </div>

              {/* Option 4: Khung bài tập rỗng */}
              <div
                className="compact-action-row"
                style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
                onClick={() => !creating && handleCreateBlank()}
              >
                <div>
                  <h4 style={{ margin: '2px 0', fontSize: '0.98rem', color: '#380718' }}>
                    Khung bài tập rỗng (Tự thiết kế thủ công)
                  </h4>
                  <div className="small muted">Tạo khung trống để tự soạn câu hỏi, bài luận hoặc dạng nộp file</div>
                </div>
                <button type="button" className="ios-btn sm ios-btn-secondary" disabled={creating}>
                  Tạo rỗng →
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

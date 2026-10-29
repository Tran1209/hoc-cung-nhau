import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { data, logActivity } from '../data';
import { fmtDate } from '../lib/format';

/**
 * Rose Milk Editorial Folio — Integrated Notes & Discussion
 * Ghi chú tương tác 2 người trong cùng một mặt phẳng.
 */
export default function LessonNotes({ lessonId, notes = [], onNotesChanged }) {
  const { user, isTeacher, nameOf } = useAuth();
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow'); // yellow | pink | green
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const addNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      await data.insert('lesson_images', {
        lesson_id: lessonId,
        kind: 'doc',
        caption: JSON.stringify({ type: 'note', color, text: content.trim(), replies: [] }),
        path: 'note://text',
        uploaded_by: user.id,
      });
      setContent('');
      setAdding(false);
      logActivity('note', `Gắn ghi chú vào bài học: "${content.slice(0, 30)}..."`, `/bai/${lessonId}`);
      onNotesChanged?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addReply = async (noteItem) => {
    if (!replyText.trim()) return;
    try {
      const parsed = JSON.parse(noteItem.caption || '{}');
      const replies = parsed.replies || [];
      replies.push({
        author: user.display_name,
        author_id: user.id,
        text: replyText.trim(),
        created_at: new Date().toISOString(),
      });
      parsed.replies = replies;
      await data.update('lesson_images', noteItem.id, { caption: JSON.stringify(parsed) });
      setReplyText('');
      setReplyingId(null);
      logActivity('reply', `Trả lời ghi chú: "${replyText.slice(0, 30)}..."`, `/bai/${lessonId}`);
      onNotesChanged?.();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Xoá ghi chú này?')) return;
    await data.remove('lesson_images', noteId);
    onNotesChanged?.();
  };

  const stickyNotes = (notes || []).filter((n) => n.kind === 'doc' && n.path === 'note://text').map((n) => {
    try {
      return { ...n, data: JSON.parse(n.caption) };
    } catch {
      return { ...n, data: { text: n.caption, color: 'yellow', replies: [] } };
    }
  });

  return (
    <div className="folio-notes-section">
      <div className="row between sn-head">
        <div className="row">
          <span className="idx-badge">N</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#380718' }}>Ghi chú học tập & Góc trao đổi</h4>
            <div className="small muted">Có {stickyNotes.length} trao đổi trong bài học này</div>
          </div>
        </div>
        {!adding && (
          <button className="ios-btn sm ios-btn-primary" onClick={() => setAdding(true)}>
            + Thêm ghi chú mới
          </button>
        )}
      </div>

      {adding && (
        <form className="sn-form" onSubmit={addNote} style={{ marginTop: '16px' }}>
          <div className="row between" style={{ marginBottom: '10px' }}>
            <span className="small muted">Tông màu ghi chú:</span>
            <div className="row">
              {['yellow', 'pink', 'green'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-btn ${c} ${color === c ? 'on' : ''}`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <textarea
            rows={3}
            placeholder={
              isTeacher
                ? 'Nhắn nhủ hoặc phân tích trọng tâm cần nhớ cho bài này...'
                : 'Em cần hỏi hoặc lưu ý điểm nào trong bài này...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            autoFocus
          />
          <div className="row end" style={{ marginTop: '12px' }}>
            <button type="button" className="ios-btn sm ios-btn-secondary" onClick={() => setAdding(false)}>
              Huỷ bỏ
            </button>
            <button className="ios-btn sm ios-btn-primary" disabled={busy}>
              {busy ? 'Đang lưu...' : 'Lưu ghi chú'}
            </button>
          </div>
        </form>
      )}

      {stickyNotes.length === 0 && !adding ? (
        <div className="empty sm" style={{ marginTop: '16px' }}>
          Chưa có ghi chú nào. Hãy tạo ghi chú để đánh dấu kiến thức hoặc gửi câu hỏi trao đổi nhé.
        </div>
      ) : (
        <div className="notes-grid">
          {stickyNotes.map((note) => (
            <div key={note.id} className={`folio-note-item ${note.data.color || 'yellow'}`}>
              <div className="note-top">
                <span className="note-author">{nameOf(note.uploaded_by)}</span>
                <div className="row">
                  <span className="small muted">{fmtDate(note.created_at, false)}</span>
                  {(isTeacher || note.uploaded_by === user.id) && (
                    <button className="sn-del" onClick={() => deleteNote(note.id)} title="Xoá note">
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="note-text pre">{note.data.text}</p>

              {note.data.replies && note.data.replies.length > 0 && (
                <div className="note-replies">
                  {note.data.replies.map((rep, idx) => (
                    <div key={idx} className="note-reply-bubble">
                      <b style={{ color: '#BE123C' }}>{rep.author}:</b> <span>{rep.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {replyingId === note.id ? (
                <div className="sn-reply-box" style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nhập phản hồi..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addReply(note)}
                    autoFocus
                  />
                  <div className="row end" style={{ marginTop: '6px' }}>
                    <button className="btn sm ghost" onClick={() => setReplyingId(null)}>
                      Huỷ
                    </button>
                    <button className="ios-btn sm ios-btn-primary" onClick={() => addReply(note)}>
                      Gửi
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="link small"
                  style={{ marginTop: '10px', color: '#9F1239', fontWeight: 700 }}
                  onClick={() => setReplyingId(note.id)}
                >
                  + Trả lời ghi chú
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

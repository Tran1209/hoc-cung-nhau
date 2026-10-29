import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { data, logActivity } from '../data';
import { fmtDate } from '../lib/format';

/**
 * Giấy nhớ tương tác 2 người (Sticky Notes) cho từng bài học.
 * Ny gắn note thắc mắc -> Anh rep lại giải đáp.
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
        kind: 'doc', // Dùng bảng lesson_images với kind='doc' để lưu note tiện lợi
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
    if (!confirm('Xoá giấy nhớ này?')) return;
    await data.remove('lesson_images', noteId);
    onNotesChanged?.();
  };

  // Lọc các item ghi chú (kind === 'doc' và path === 'note://text')
  const stickyNotes = (notes || []).filter((n) => n.kind === 'doc' && n.path === 'note://text').map((n) => {
    try {
      return { ...n, data: JSON.parse(n.caption) };
    } catch {
      return { ...n, data: { text: n.caption, color: 'yellow', replies: [] } };
    }
  });

  return (
    <div className="sticky-notes-widget">
      <div className="row between sn-head">
        <div className="row">
          <span>📌</span>
          <b>Giấy nhớ & Góc trao đổi của 2 đứa</b>
          <span className="small muted">({stickyNotes.length})</span>
        </div>
        {!adding && (
          <button className="btn sm primary" onClick={() => setAdding(true)}>
            + Dán giấy nhớ mới
          </button>
        )}
      </div>

      {adding && (
        <form className="sn-form card" onSubmit={addNote}>
          <div className="row between">
            <span className="small"><b>Chọn màu giấy note:</b></span>
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
                ? 'Anh nhắn nhủ hoặc lưu ý chỗ quan trọng cho em...'
                : 'Em chưa hiểu chỗ nào, thắc mắc gì thì dán giấy nhớ ở đây nhé...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            autoFocus
          />
          <div className="row end">
            <button type="button" className="btn ghost sm" onClick={() => setAdding(false)}>
              Huỷ
            </button>
            <button className="btn primary sm" disabled={busy}>
              {busy ? 'Đang dán...' : 'Dán lên bài học 📌'}
            </button>
          </div>
        </form>
      )}

      {stickyNotes.length === 0 && !adding ? (
        <div className="empty sm">
          Chưa có giấy nhớ nào. Hãy dán giấy note để lưu ý mốc sự kiện quan trọng hoặc gửi câu hỏi cho nhau nhé!
        </div>
      ) : (
        <div className="sn-grid">
          {stickyNotes.map((note) => (
            <div key={note.id} className={`sticky-note ${note.data.color || 'yellow'}`}>
              <div className="sn-top">
                <span className="sn-author">{nameOf(note.uploaded_by)}</span>
                <div className="row">
                  <span className="sn-time">{fmtDate(note.created_at, false)}</span>
                  {(isTeacher || note.uploaded_by === user.id) && (
                    <button className="sn-del" onClick={() => deleteNote(note.id)} title="Xoá note">
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="sn-content pre">{note.data.text}</p>

              {note.data.replies && note.data.replies.length > 0 && (
                <div className="sn-replies">
                  {note.data.replies.map((rep, idx) => (
                    <div key={idx} className="sn-reply">
                      <b>{rep.author}:</b> <span>{rep.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {replyingId === note.id ? (
                <div className="sn-reply-box">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Gõ trả lời..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && addReply(note)}
                  />
                  <div className="row end mt-sm">
                    <button className="btn sm ghost" onClick={() => setReplyingId(null)}>
                      Huỷ
                    </button>
                    <button className="btn sm primary" onClick={() => addReply(note)}>
                      Gửi
                    </button>
                  </div>
                </div>
              ) : (
                <button className="link small sn-reply-btn" onClick={() => setReplyingId(note.id)}>
                  💬 Trả lời note này
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

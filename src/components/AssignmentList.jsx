import { Link, useNavigate } from 'react-router-dom';
import { data } from '../data';
import { useAuth } from '../context/AuthContext';
import { DueBadge, KindBadge, StatusBadge, Empty } from './ui';
import { nextSaturday, sortByPos, scoreText, fmtDate } from '../lib/format';

/** Danh sách bài tập + nút "Thêm bài tập" cho anh */
export default function AssignmentList({ assignments, latest, chapterId, lessonId = null, emptyText, defaultTitle }) {
  const { isTeacher } = useAuth();
  const nav = useNavigate();

  const add = async () => {
    const a = await data.insert('assignments', {
      chapter_id: chapterId,
      lesson_id: lessonId,
      title: defaultTitle || 'Bài tập mới',
      kind: 'upload',
      due_at: nextSaturday(20).toISOString(),
      position: assignments.length,
      is_published: false,
    });
    nav(`/bt/${a.id}/sua`);
  };

  return (
    <div>
      {assignments.length === 0 ? (
        <Empty>{emptyText || 'Chưa có bài tập.'}</Empty>
      ) : (
        <ul className="alist">
          {sortByPos(assignments).map((a) => {
            const s = latest?.[a.id];
            const scheduled = a.is_published && a.publish_at && new Date(a.publish_at) > new Date();
            return (
              <li key={a.id}>
                <Link to={`/bt/${a.id}`} className="aitem">
                  <div>
                    <b>{a.title}</b>
                    <div className="badges">
                      <KindBadge kind={a.kind} />
                      {isTeacher && !a.is_published && <span className="badge draft">Nháp</span>}
                      {isTeacher && scheduled && <span className="badge due">🗓️ mở {fmtDate(a.publish_at)}</span>}
                      {s?.status !== 'graded' && <DueBadge due={a.due_at} />}
                    </div>
                  </div>
                  <div className="aright">
                    <StatusBadge status={s?.status} />
                    {s?.status === 'graded' && <div className="score">{scoreText(s.score)}</div>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {isTeacher && (
        <button className="btn mt" onClick={add}>+ Thêm bài tập</button>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { data, logActivity } from '../data';
import { useLive } from '../data/useLive';
import { useAuth } from '../context/AuthContext';
import { FormDialog } from '../components/Modal';
import { Gallery } from '../components/Gallery';
import Uploader from '../components/Uploader';
import AssignmentList from '../components/AssignmentList';
import LessonFlashcards from '../components/LessonFlashcards';
import LessonNotes from '../components/LessonNotes';
import { Crumbs, Empty, ErrorBox, Loading } from '../components/ui';
import { fmtDate } from '../lib/format';
import { latestByAssignment } from '../lib/progress';

const FLASHCARDS_MAP = {
  'Liên hợp quốc': [
    {
      q: 'Liên hợp quốc chính thức được thành lập vào ngày tháng năm nào?',
      a: 'Ngày 24 - 10 - 1945 (sau khi bản Hiến chương được các nước phê chuẩn). Ngày 24-10 hàng năm là "Ngày Liên hợp quốc".',
      hint: 'Mùa thu năm 1945, ngay sau CTTG II',
    },
    {
      q: 'Trụ sở chính của Liên hợp quốc hiện nay đặt ở đâu?',
      a: 'Thành phố Niu Oóc (New York, Mỹ).',
      hint: 'Thành phố lớn nhất nước Mỹ',
    },
    {
      q: '5 quốc gia uỷ viên thường trực của Hội đồng Bảo an gồm những nước nào?',
      a: 'Liên Xô (nay là Nga), Mỹ, Anh, Pháp, Trung Quốc. (5 nước này có quyền phủ quyết).',
      hint: '5 cường quốc thắng trận trong CTTG II',
    },
    {
      q: 'Nguyên tắc quan trọng nhất trong biểu quyết tại Hội đồng Bảo an là gì?',
      a: 'Nguyên tắc nhất trí giữa 5 nước uỷ viên thường trực (chỉ cần 1 nước bỏ phiếu chống là nghị quyết không được thông qua).',
      hint: 'Quyền phủ quyết (veto)',
    },
    {
      q: 'Việt Nam chính thức gia nhập Liên hợp quốc vào ngày nào và là thành viên thứ mấy?',
      a: 'Ngày 20 - 9 - 1977, trở thành thành viên thứ 149 của Liên hợp quốc.',
      hint: 'Sau ngày đất nước thống nhất 2 năm',
    },
    {
      q: 'Cơ quan nào của Liên hợp quốc giữ vai trò trọng yếu nhất trong duy trì hoà bình và an ninh quốc tế?',
      a: 'Hội đồng Bảo an Liên hợp quốc (gồm 5 uỷ viên thường trực và 10 uỷ viên không thường trực).',
      hint: 'Cơ quan ra quyết định an ninh thế giới',
    },
  ],
  'Trật tự thế giới trong Chiến tranh lạnh': [
    {
      q: 'Hội nghị I-an-ta diễn ra vào thời gian nào và gồm nguyên thủ những nước nào?',
      a: 'Từ ngày 4 đến 12-2-1945 tại I-an-ta (Liên Xô), gồm ba cường quốc: U. Sớc-sin (Anh), Ph. Ru-dơ-ven (Mỹ), I. Xta-lin (Liên Xô).',
      hint: 'Tháng 2 năm 1945',
    },
    {
      q: 'Hội nghị I-an-ta phân chia phạm vi ảnh hưởng ở châu Âu như thế nào?',
      a: 'Đông Đức, Đông Béc-lin và Đông Âu thuộc phạm vi ảnh hưởng của Liên Xô; Tây Đức, Tây Béc-lin và Tây Âu thuộc Mỹ, Anh, Pháp.',
      hint: 'Đông thuộc Liên Xô, Tây thuộc Mỹ và đồng minh',
    },
    {
      q: 'Trật tự thế giới hai cực I-an-ta tồn tại trong khoảng thời gian nào?',
      a: 'Tồn tại từ năm 1945 đến năm 1991 (kéo dài hơn 45 năm).',
      hint: 'Từ sau CTTG II đến khi Liên Xô tan rã',
    },
    {
      q: 'Hai khối quân sự đối đầu tiêu biểu thời kì Chiến tranh lạnh là gì?',
      a: 'Khối NATO (1949 do Mỹ đứng đầu) và Tổ chức Hiệp ước Vác-sa-va (1955 do Liên Xô đứng đầu).',
      hint: 'NATO và Vác-sa-va',
    },
    {
      q: 'Sự kiện nào đánh dấu sự kết thúc của Trật tự hai cực I-an-ta?',
      a: 'Sự sụp đổ của CNXH ở Đông Âu (cuối những năm 80) và sự tan rã của Liên bang Xô viết vào tháng 12 - 1991.',
      hint: 'Tháng 12 năm 1991',
    },
  ],
  'sau Chiến tranh lạnh': [
    {
      q: 'Sau Chiến tranh lạnh, hầu hết các quốc gia điều chỉnh chiến lược lấy lĩnh vực nào làm trọng tâm?',
      a: 'Lấy phát triển KINH TẾ làm trọng tâm, nhằm tăng cường thực lực và nâng cao vị thế quốc gia.',
      hint: 'Kinh tế là chìa khoá',
    },
    {
      q: 'Khái niệm "đa cực" trong quan hệ quốc tế nghĩa là gì?',
      a: 'Là trật tự thế giới có sự tham gia của nhiều quốc gia, trung tâm lớn; không một quốc gia nào có quyền lực áp đảo chi phối toàn bộ thế giới.',
      hint: 'Nhiều cực, nhiều trung tâm',
    },
    {
      q: 'Sự kiện nào vào tháng 11 - 1989 được xem là biểu tượng chấm dứt Chiến tranh lạnh?',
      a: 'Sự kiện Bức tường Béc-lin (Đức) sụp đổ vào tháng 11 - 1989.',
      hint: 'Bức tường chia cắt nước Đức',
    },
  ],
  'ASEAN': [
    {
      q: 'Tổ chức ASEAN được thành lập vào ngày tháng năm nào và tại đâu?',
      a: 'Ngày 8 - 8 - 1967 tại thủ đô Băng Cốc (Thái Lan) qua bản Tuyên bố Băng Cốc (Tuyên bố ASEAN).',
      hint: 'Ngày 8 tháng 8 năm 1967',
    },
    {
      q: 'Năm quốc gia sáng lập viên của ASEAN (ASEAN 5) gồm những nước nào?',
      a: 'In-đô-nê-xi-a, Ma-lai-xi-a, Phi-líp-pin, Xin-ga-po và Thái Lan.',
      hint: '5 nước Đông Nam Á hải đảo & Thái Lan',
    },
    {
      q: 'Việt Nam chính thức gia nhập ASEAN vào thời gian nào và là thành viên thứ mấy?',
      a: 'Ngày 28 - 7 - 1995, trở thành thành viên thứ 7 của ASEAN (ASEAN 7).',
      hint: 'Mùa hè năm 1995',
    },
    {
      q: 'Cộng đồng ASEAN chính thức được thành lập vào thời gian nào với 3 trụ cột gì?',
      a: 'Ngày 31 - 12 - 2015, với 3 trụ cột: Chính trị – An ninh (APSC), Kinh tế (AEC) và Văn hoá – Xã hội (ASCC).',
      hint: 'Cuối năm 2015',
    },
  ],
  'Cách mạng tháng Tám': [
    {
      q: 'Bốn tỉnh giành chính quyền sớm nhất trong cả nước trong Cách mạng tháng Tám là?',
      a: 'Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam (giành chính quyền ngày 18 - 8 - 1945).',
      hint: 'Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam',
    },
    {
      q: 'Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh nước VNDCCH vào ngày nào?',
      a: 'Ngày 2 - 9 - 1945 tại Quảng trường Ba Đình (Hà Nội).',
      hint: 'Ngày Quốc khánh 2-9',
    },
  ],
  'Đổi mới': [
    {
      q: 'Đường lối Đổi mới đất nước được đề ra tại Đại hội lần thứ mấy của Đảng?',
      a: 'Đại hội đại biểu toàn quốc lần thứ VI của Đảng (tháng 12 - 1986).',
      hint: 'Đại hội VI (12-1986)',
    },
    {
      q: 'Đặc trưng trọng tâm cốt lõi của công cuộc Đổi mới năm 1986 là gì?',
      a: 'Đổi mới về kinh tế là trọng tâm, xây dựng nền kinh tế thị trường định hướng xã hội chủ nghĩa.',
      hint: 'Kinh tế là trọng tâm',
    },
  ],
};

const LESSON_FIELDS = [
  { name: 'title', label: 'Tên bài', required: true },
  { name: 'content', label: 'Nội dung bài học (hỗ trợ Markdown)', type: 'textarea', rows: 14 },
  { name: 'position', label: 'Thứ tự', type: 'number' },
];

const SECTIONS = [
  { kind: 'mindmap', title: '🧠 Sơ đồ tư duy', empty: 'Chưa có sơ đồ tư duy.' },
  { kind: 'work', title: '📸 Bài em đã làm', empty: 'Chưa có ảnh bài làm nào.' },
  { kind: 'doc', title: '📎 Tài liệu đính kèm', empty: 'Chưa có tài liệu.' },
];

export default function LessonPage() {
  const { id } = useParams();
  const { user, isTeacher, nameOf } = useAuth();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);

  const { data: d, loading, error, reload } = useLive(async () => {
    const lesson = await data.get('lessons', id);
    if (!lesson) return { lesson: null };
    const chapter = await data.get('chapters', lesson.chapter_id);
    const [subject, images, assignments, submissions] = await Promise.all([
      chapter ? data.get('subjects', chapter.subject_id) : null,
      data.list('lesson_images', { where: { lesson_id: id }, order: 'created_at' }),
      data.list('assignments', { where: { lesson_id: id } }),
      data.list('submissions'),
    ]);
    return { lesson, chapter, subject, images, assignments, submissions };
  }, [id]);

  const renderedContent = useMemo(() => {
    if (!d?.lesson?.content) return '';
    try {
      return marked.parse(d.lesson.content);
    } catch {
      return d.lesson.content;
    }
  }, [d?.lesson?.content]);

  const cards = useMemo(() => {
    const title = d?.lesson?.title || '';
    for (const [key, list] of Object.entries(FLASHCARDS_MAP)) {
      if (title.toLowerCase().includes(key.toLowerCase())) return list;
    }
    return [];
  }, [d?.lesson?.title]);

  if (loading && !d) return <Loading />;
  if (error && !d) return <ErrorBox error={error} />;
  if (!d.lesson) return <Empty>Không tìm thấy bài học.</Empty>;

  const { lesson, chapter, subject, images, assignments, submissions } = d;
  const latest = latestByAssignment(submissions);

  const addImages = async (kind, paths) => {
    for (const path of paths) {
      await data.insert('lesson_images', { lesson_id: id, kind, path, uploaded_by: user.id });
    }
    const label = SECTIONS.find((s) => s.kind === kind).title.replace(/^\S+\s/, '');
    logActivity('lesson_images', `Thêm ${paths.length} ảnh "${label}" vào ${lesson.title}`, `/bai/${id}`);
    reload();
  };

  const delImage = async (img) => {
    if (!confirm('Xoá ảnh này?')) return;
    await data.remove('lesson_images', img.id);
    await data.removeFile(img.path);
    reload();
  };

  const editCaption = async (img) => {
    const c = prompt('Ghi chú cho ảnh:', img.caption || '');
    if (c !== null) {
      await data.update('lesson_images', img.id, { caption: c });
      reload();
    }
  };

  const delLesson = async () => {
    if (!confirm(`Xoá "${lesson.title}" cùng toàn bộ ảnh, bài tập, bài nộp? Không thể hoàn tác!`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('lessons', id);
    nav(`/chuong/${lesson.chapter_id}`);
  };

  return (
    <div className="page">
      <Crumbs
        items={[
          subject && { label: subject.title, to: `/mon/${subject.id}` },
          chapter && { label: chapter.title, to: `/chuong/${chapter.id}` },
          { label: lesson.title },
        ]}
      />
      <div className="row between">
        <h1>{lesson.title}</h1>
        {isTeacher && (
          <div className="row">
            <button className="btn ghost" onClick={() => setEditing(true)}>✏️ Sửa bài</button>
            <button className="btn danger ghost" onClick={delLesson}>Xoá bài</button>
          </div>
        )}
      </div>

      {/* 🃏 Thẻ ghi nhớ nhanh (Active Recall) */}
      {cards.length > 0 && <LessonFlashcards cards={cards} />}

      {/* 📖 Nội dung Sách giáo khoa số */}
      {lesson.content ? (
        <section className="card textbook-reader">
          <div className="row between reader-header">
            <span className="badge kind-quiz">📖 Sách giáo khoa số chi tiết</span>
            {isTeacher && (
              <button className="btn ghost sm" onClick={() => setEditing(true)}>✏️ Sửa nội dung</button>
            )}
          </div>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedContent }} />
        </section>
      ) : (
        <div className="card empty-lesson-banner">
          <p className="muted">Bài học này chưa có nội dung văn bản chi tiết.</p>
          {isTeacher && (
            <button className="btn primary sm mt-sm" onClick={() => setEditing(true)}>
              + Nhập hoặc dán nội dung bài học
            </button>
          )}
        </div>
      )}

      {/* 📌 Giấy nhớ tương tác 2 người (Sticky Notes) */}
      <LessonNotes lessonId={id} notes={images} onNotesChanged={reload} />

      {/* 📸 Sơ đồ tư duy & Ảnh tư liệu */}
      {SECTIONS.filter((s) => s.kind !== 'doc').map((sec) => {
        const items = images
          .filter((i) => i.kind === sec.kind && i.path !== 'note://text')
          .map((i) => ({
            ...i,
            meta: `${nameOf(i.uploaded_by)} · ${fmtDate(i.created_at, false)}`,
            canDelete: isTeacher || i.uploaded_by === user.id,
          }));
        return (
          <section key={sec.kind} className="card">
            <div className="row between">
              <h2>{sec.title} <small className="muted">({items.length})</small></h2>
              <Uploader folder={`lessons/${id}/${sec.kind}`} onUploaded={(p) => addImages(sec.kind, p)} />
            </div>
            <Gallery items={items} onDelete={delImage} empty={sec.empty} />
            {items.some((i) => i.canDelete) && (
              <details className="small muted">
                <summary>Sửa ghi chú ảnh</summary>
                <div className="chips">
                  {items.filter((i) => i.canDelete).map((i, idx) => (
                    <button key={i.id} className="chip" onClick={() => editCaption(i)}>
                      Ảnh {idx + 1}{i.caption ? `: ${i.caption}` : ''}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </section>
        );
      })}

      {/* 📝 Bài tập của bài này */}
      <section className="card">
        <h2>📝 Bài tập của bài này</h2>
        <AssignmentList
          assignments={assignments}
          latest={latest}
          chapterId={lesson.chapter_id}
          lessonId={id}
          defaultTitle={`Bài tập ${lesson.title}`}
          emptyText="Chưa có bài tập nào."
        />
      </section>

      {editing && (
        <FormDialog
          title="Sửa bài học"
          fields={LESSON_FIELDS}
          initial={lesson}
          onSubmit={async (v) => {
            await data.update('lessons', id, v);
            reload();
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

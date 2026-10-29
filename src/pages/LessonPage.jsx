import { useMemo, useState, useEffect, useRef } from 'react';
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
import LessonReviewHub from '../components/LessonReviewHub';
import LessonNotesHub from '../components/LessonNotesHub';
import LessonNotes from '../components/LessonNotes';
import { Crumbs, Empty, ErrorBox, Loading } from '../components/ui';
import { fmtDate } from '../lib/format';
import { latestByAssignment } from '../lib/progress';
import { seedBtAssignmentsForLesson } from '../data/historyCurriculum';

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

// Các mốc lịch sử và thuật ngữ cốt lõi để tự động tô bút dạ quang hồng chuẩn Apple
const CORE_HISTORY_TERMS = [
  '24 - 10 - 1945',
  '24-10-1945',
  '20 - 9 - 1977',
  '20-9-1977',
  '25-4 đến 26-6-1945',
  'tháng 2 - 1945',
  'tháng 12 - 1991',
  'tháng 11 - 1989',
  '8 - 8 - 1967',
  '28 - 7 - 1995',
  '31 - 12 - 2015',
  '18 - 8 - 1945',
  '2 - 9 - 1945',
  'tháng 12 - 1986',
  'Hiến chương Liên hợp quốc',
  'Hội đồng Bảo an',
  'thành viên thứ 149',
  'quyền phủ quyết',
  'sự nhất trí giữa 5 nước lớn',
  'sự nhất trí giữa năm nước uỷ viên thường trực',
  'ngăn chặn thảm hoạ chiến tranh',
  'Bình đẳng về chủ quyền',
  'Tôn trọng toàn vẹn lãnh thổ và độc lập chính trị',
  'Giải quyết các tranh chấp quốc tế bằng biện pháp hoà bình',
  'Không can thiệp vào công việc nội bộ',
];

// Trích xuất tự động thông tin lịch sử từ đoạn văn bản vừa bôi đen
function extractHistoricalInfo(snippet) {
  if (!snippet) return { time: '', entity: '', verb: '', content: '' };
  let time = '';
  const dateMatch =
    snippet.match(/(?:ngày\s*)?(\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{2,4})/i) ||
    snippet.match(/(?:tháng\s*)?(\d{1,2}\s*[-/.]\s*\d{4})/i) ||
    snippet.match(/(?:năm\s*)?(\b(18|19|20)\d{2}\b)/i) ||
    snippet.match(/(?:thế\s*kỷ\s*)([IVXLCDM]+|\d+)/i);
  if (dateMatch) {
    time = dateMatch[0].trim();
  }

  const commonVerbs = [
    'thành lập', 'ký kết', 'kí kết', 'soạn thảo', 'khẳng định', 'lãnh đạo',
    'phát động', 'tiêu diệt', 'đề ra', 'xây dựng', 'thông qua', 'chủ trì',
    'gia nhập', 'khởi xướng', 'tuyên bố', 'bình thường hoá', 'chuyển hướng',
    'đánh dấu', 'quyết định', 'triển khai', 'mở rộng', 'đàm phán'
  ];
  let verb = '';
  const lowerSnippet = snippet.toLowerCase();
  for (const v of commonVerbs) {
    if (lowerSnippet.includes(v)) {
      verb = v.charAt(0).toUpperCase() + v.slice(1);
      break;
    }
  }
  if (!verb) verb = 'Thực hiện';

  let content = snippet;
  if (time) {
    content = content.replace(time, '').replace(/^[:\s,.-]+|[:\s,.-]+$/g, '').trim();
  }
  if (!content) content = snippet;

  return { time, entity: content, verb, content };
}

function applyEditorialHighlights(html, userHighlights = [], autoHighlight = true, highlightTags = {}) {
  if (!html) return '';

  const terms = [];
  if (autoHighlight) {
    terms.push(...CORE_HISTORY_TERMS);
  }
  userHighlights.forEach((uh) => {
    const trimmed = (uh || '').trim();
    if (trimmed && !terms.includes(trimmed)) {
      terms.push(trimmed);
    }
  });

  if (!terms.length) return html;

  // Sắp xếp giảm dần theo độ dài để tránh regex trùng nhau
  const sorted = [...terms].sort((a, b) => b.length - a.length);

  // Tách HTML: chỉ thay thế an toàn trong phần text ngoài tags
  const parts = html.split(/(<[^>]+>)/g);
  return parts
    .map((part) => {
      if (part.startsWith('<')) return part;
      let text = part;
      for (const term of sorted) {
        const isUser = userHighlights.includes(term);
        const tag = highlightTags[term];
        const tagClass = tag ? `tag-${tag.replace('#', '').toLowerCase()}` : '';
        const tagHtml = tag ? `<span class="highlight-pill-tag ${tagClass}">${tag}</span>` : '';

        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(`(${escaped})`, 'gi');
        text = text.replace(
          reg,
          `<mark class="highlight-tape ${isUser ? 'user-highlight' : ''}" ${
            isUser ? `data-user-term="${term.replace(/"/g, '&quot;')}" title="Nhấn vào đây để xem tuỳ chọn hoặc bỏ tô"` : ''
          }>$1${tagHtml}</mark>`,
        );
      }
      return text;
    })
    .join('');
}

export default function LessonPage() {
  const { id } = useParams();
  const { user, isTeacher, nameOf } = useAuth();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);

  // Quản lý tab: 'theory' (Kiến thức) | 'exercises' (Bài tập) | 'review' (Ôn tập) | 'notes' (Lưu ý)
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (['theory', 'exercises', 'review', 'notes'].includes(t)) return t;
    return 'theory';
  });

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabName);
    window.history.replaceState({}, '', url.toString());
  };

  // State Bút dạ quang (Chỉ cho phép dùng trên trang Kiến thức)
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [userHighlights, setUserHighlights] = useState(() => {
    try {
      const saved = localStorage.getItem(`lesson_user_highlights_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Nhãn gán cho từng đoạn văn bản đã tô (#Mốc-Thực-Thể, #Hoạt-Động-Chủ-Trương...)
  const [highlightTags, setHighlightTags] = useState(() => {
    try {
      const saved = localStorage.getItem(`lesson_highlight_tags_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Tổng số lượng mục ôn tập hiển thị trên badge của Tab Ôn tập (Đồng bộ với trục dùng chung)
  const getOverallReviewCount = () => {
    try {
      const unifiedRaw = localStorage.getItem('unified_history_milestones_timeline');
      const unifiedList = unifiedRaw ? JSON.parse(unifiedRaw) : [];
      const userMilestones = Array.isArray(unifiedList)
        ? unifiedList.filter((m) => m && !m.id?.match(/^ms-[0-6][b]?$/))
        : [];

      const saved = localStorage.getItem(`lesson_study_data_${id}`);
      const d = saved ? JSON.parse(saved) : {};
      const axCount = d.axes?.length ?? 6;
      const ceCount = d.causeEffects?.length ?? 1;
      const cmpCount = d.comparisons?.length ?? 1;
      return userMilestones.length + axCount + ceCount + cmpCount;
    } catch {
      return 8;
    }
  };

  const [reviewCount, setReviewCount] = useState(getOverallReviewCount);

  useEffect(() => {
    setReviewCount(getOverallReviewCount());
  }, [id]);

  useEffect(() => {
    const handleSync = () => setReviewCount(getOverallReviewCount());
    window.addEventListener('unified_milestones_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('unified_milestones_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [id]);

  // Hộp thoại thêm nhanh vào Tab Ôn tập (Lõi 1, Lõi 2&4, Lõi 3)
  const [quickAddModal, setQuickAddModal] = useState(null); // 'milestone' | 'axis' | 'causeEffect' | null
  const [extractedData, setExtractedData] = useState({ time: '', entity: '', verb: '', content: '' });

  const saveHighlightTag = (snippet, tag) => {
    setHighlightTags((prev) => {
      const next = { ...prev, [snippet]: tag };
      localStorage.setItem(`lesson_highlight_tags_${id}`, JSON.stringify(next));
      return next;
    });
    if (!userHighlights.includes(snippet)) {
      updateHighlightsWithHistory([...userHighlights, snippet], `Đã tô dạ quang và gắn nhãn ${tag}!`);
    } else {
      showToast(`Đã gắn nhãn ${tag} cho đoạn văn!`);
    }
  };

  const handleOpenExtract = (targetType) => {
    const ext = extractHistoricalInfo(selectedSnippet);
    setExtractedData(ext);
    setQuickAddModal(targetType);
    setFloatingPos(null);
  };

  // Lịch sử hoàn tác (Undo Stack) và Thông báo tương tác
  const [undoStack, setUndoStack] = useState([]);
  const [undoToast, setUndoToast] = useState('');

  const showToast = (msg) => {
    setUndoToast(msg);
    setTimeout(() => setUndoToast(''), 2500);
  };

  // Cập nhật highlights kèm lưu vết lịch sử để hoàn tác
  const updateHighlightsWithHistory = (nextList, actionMsg) => {
    setUndoStack((prev) => [...prev, userHighlights]);
    setUserHighlights(nextList);
    localStorage.setItem(`lesson_user_highlights_${id}`, JSON.stringify(nextList));
    if (actionMsg) showToast(actionMsg);
  };

  // Hoàn tác bước vừa thực hiện (Nút Hoàn tác hoặc Ctrl+Z)
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setUserHighlights(previous);
    localStorage.setItem(`lesson_user_highlights_${id}`, JSON.stringify(previous));
    showToast('Đã hoàn tác thao tác tô bút dạ quang ↺');
  };

  // Hỗ trợ phím tắt Ctrl+Z (Cmd+Z trên Mac) để hoàn tác nhanh khi đang đọc
  useEffect(() => {
    if (activeTab !== 'theory') return;
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, undoStack, userHighlights]);

  // Xoá 1 đoạn cụ thể đã tô
  const handleRemoveHighlight = (term) => {
    const next = userHighlights.filter((h) => h !== term);
    updateHighlightsWithHistory(next, `Đã bỏ tô đoạn: "${term.slice(0, 20)}..." (Bấm Hoàn tác ↺ nếu muốn lấy lại)`);
    window.getSelection()?.removeAllRanges();
    setFloatingPos(null);
    setSelectedSnippet('');
  };

  // Nhấn trực tiếp vào bất kỳ đoạn văn bản đã tô để bỏ tô
  const handleArticleClick = (e) => {
    const markEl = e.target.closest('mark.user-highlight');
    if (markEl) {
      const term = markEl.getAttribute('data-user-term') || markEl.textContent.trim();
      if (term && userHighlights.includes(term)) {
        handleRemoveHighlight(term);
      }
    }
  };

  // Floating Highlighter Action Pill
  const articleRef = useRef(null);
  const [floatingPos, setFloatingPos] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState('');

  const handleSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setFloatingPos(null);
      setSelectedSnippet('');
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 2 || text.length > 120) {
      setFloatingPos(null);
      setSelectedSnippet('');
      return;
    }

    const range = sel.getRangeAt(0);
    if (!articleRef.current || !articleRef.current.contains(range.commonAncestorContainer)) {
      setFloatingPos(null);
      setSelectedSnippet('');
      return;
    }

    const rect = range.getBoundingClientRect();
    setSelectedSnippet(text);
    setFloatingPos({
      top: rect.top + window.scrollY - 10,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  const handleAddHighlight = () => {
    if (!selectedSnippet) return;
    if (!userHighlights.includes(selectedSnippet)) {
      const next = [...userHighlights, selectedSnippet];
      updateHighlightsWithHistory(next, 'Đã tô dạ quang đoạn văn bản! (Bấm Hoàn tác ↺ để huỷ)');
    }
    window.getSelection()?.removeAllRanges();
    setFloatingPos(null);
    setSelectedSnippet('');
  };

  const handleClearHighlights = () => {
    if (!userHighlights.length) return;
    if (confirm('Xoá tất cả các đoạn bạn đã đánh dấu bút dạ quang trong bài này? (Bạn vẫn có thể bấm nút Hoàn tác để lấy lại)')) {
      updateHighlightsWithHistory([], 'Đã xoá toàn bộ đoạn tô màu! (Bấm Hoàn tác ↺ để phục hồi)');
    }
  };

  // Integrated Editor state (trong tab Bài tập)
  const [essayText, setEssayText] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`folio_essay_${id}`);
    if (saved) setEssayText(saved);
  }, [id]);

  const wordCount = useMemo(() => {
    const trimmed = essayText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [essayText]);

  const targetWords = 150;
  const progressPct = Math.min(100, Math.round((wordCount / targetWords) * 100));

  const saveEssay = () => {
    localStorage.setItem(`folio_essay_${id}`, essayText);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const { data: d, loading, error, reload } = useLive(async () => {
    const lesson = await data.get('lessons', id);
    if (!lesson) return { lesson: null };
    const chapter = await data.get('chapters', lesson.chapter_id);
    let [subject, images, assignments, submissions] = await Promise.all([
      chapter ? data.get('subjects', chapter.subject_id) : null,
      data.list('lesson_images', { where: { lesson_id: id }, order: 'created_at' }),
      data.list('assignments', { where: { lesson_id: id } }),
      data.list('submissions'),
    ]);

    // Tự động gieo sẵn các bài tập BT1, BT2, BT3 chuẩn Đề thi THPTQG 2026 nếu chưa có
    if (lesson.title.toLowerCase().includes('liên hợp quốc') && !assignments.some((a) => (a.title || '').includes('BT2'))) {
      await seedBtAssignmentsForLesson(data, lesson.id, lesson.chapter_id);
      assignments = await data.list('assignments', { where: { lesson_id: id } });
    }

    return { lesson, chapter, subject, images, assignments, submissions };
  }, [id]);

  // Làm sạch hoàn toàn emoji trẻ con và áp dụng bút dạ quang
  const renderedContent = useMemo(() => {
    if (!d?.lesson?.content) return '';
    try {
      let clean = d.lesson.content
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\*\*\s*MỤC TIÊU BÀI HỌC:/g, '**MỤC TIÊU BÀI HỌC:**')
        .replace(/##\s*Luyện tập/g, '## Luyện tập');

      const html = marked.parse(clean);
      return applyEditorialHighlights(html, userHighlights, autoHighlight, highlightTags);
    } catch {
      return d.lesson.content;
    }
  }, [d?.lesson?.content, userHighlights, autoHighlight, highlightTags]);

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
    logActivity('lesson_images', `Thêm tư liệu vào ${lesson.title}`, `/bai/${id}`);
    reload();
  };

  const delImage = async (img) => {
    if (!confirm('Xoá ảnh tư liệu này?')) return;
    await data.remove('lesson_images', img.id);
    await data.removeFile(img.path);
    reload();
  };

  const delLesson = async () => {
    if (!confirm(`Xoá bài "${lesson.title}"? Không thể hoàn tác.`)) return;
    if (prompt('Gõ XOA để xác nhận') !== 'XOA') return;
    await data.remove('lessons', id);
    nav(`/chuong/${lesson.chapter_id}`);
  };

  return (
    <div className="page">
      {/* SINGLE UNIFIED FOLIO SHEET (Rose Milk Editorial Folio) */}
      <div className="folio-sheet">
        {/* Folio Header */}
        <header className="folio-header">
          <div className="folio-breadcrumbs">
            {subject && (
              <>
                <a href={`#/mon/${subject.id}`}>{subject.title}</a>
                <span className="sep">/</span>
              </>
            )}
            {chapter && (
              <>
                <a href={`#/chuong/${chapter.id}`}>{chapter.title}</a>
                <span className="sep">/</span>
              </>
            )}
            <span style={{ color: '#E11D48', fontWeight: 700 }}>{lesson.title}</span>
          </div>

          <div className="folio-title-row">
            <h1 className="folio-title">{lesson.title}</h1>
            {isTeacher && (
              <div className="row">
                <button className="ios-btn sm ios-btn-secondary" onClick={() => setEditing(true)}>
                  Sửa nội dung
                </button>
                <button
                  className="ios-btn sm"
                  style={{ color: '#E11D48', borderColor: '#FDA4AF' }}
                  onClick={delLesson}
                >
                  Xoá bài
                </button>
              </div>
            )}
          </div>

          <div className="folio-meta-bar">
            <span className="badge">Chương trình Lịch Sử 12</span>
            <span className="badge in_progress">Thời lượng đọc: ~15 phút</span>
            <span className="badge">Bộ Kết Nối Tri Thức</span>
          </div>

          <div className="folio-progress-bar">
            <div className="folio-progress-fill" style={{ width: '100%' }} />
          </div>
        </header>

        {/* BỘ CHUYỂN TAB CHUẨN APPLE: PHÂN TÁCH RÕ RÀNG KIẾN THỨC, BÀI TẬP, ÔN TẬP, LƯU Ý */}
        <div className="folio-segmented-tabs" style={{ marginBottom: '22px' }}>
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => switchTab('theory')}
          >
            Kiến thức
          </button>
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
            onClick={() => switchTab('exercises')}
          >
            Bài tập {assignments.length > 0 && <span className="tab-badge">{assignments.length}</span>}
          </button>
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => switchTab('review')}
          >
            Ôn tập {reviewCount > 0 && <span className="tab-badge">{reviewCount}</span>}
          </button>
          <button
            type="button"
            className={`segmented-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => switchTab('notes')}
          >
            Lưu ý {images.length > 0 && <span className="tab-badge">{images.length}</span>}
          </button>
        </div>

        {/* =========================================================================
            TAB 1: KIẾN THỨC (CHỈ GHI KIẾN THỨC BÀI ĐỌC, ĐƯỢC PHÉP DÙNG HIGHLIGHT & HOÀN TÁC)
            ========================================================================= */}
        {activeTab === 'theory' && (
          <div className="tab-pane-content">
            {/* Reading Toolbar (Bút dạ quang hồng, Hoàn tác & Chỉ báo đọc) */}
            <div className="editorial-reading-toolbar">
              <div className="reading-tool-group">
                <span className="small muted" style={{ fontWeight: 700, color: '#380718' }}>
                  Sách giáo khoa số · Bản chuẩn
                </span>
                <button
                  type="button"
                  onClick={() => setAutoHighlight((v) => !v)}
                  className={`reading-tool-pill ${autoHighlight ? 'active' : ''}`}
                  title="Tự động tô mốc sự kiện, ngày tháng, nguyên tắc quan trọng"
                >
                  {autoHighlight ? 'Trọng tâm dạ quang: Đang bật' : 'Trọng tâm dạ quang: Tắt'}
                </button>
              </div>

              <div className="reading-tool-group">
                {/* Nút Hoàn tác (Undo) trực tiếp */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`reading-tool-pill ${undoStack.length > 0 ? 'active' : ''}`}
                  title="Hoàn tác đoạn vừa tô hoặc vừa xoá (phím tắt Ctrl+Z)"
                  style={{
                    opacity: undoStack.length === 0 ? 0.45 : 1,
                    cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Hoàn tác ↺ {undoStack.length > 0 && `(${undoStack.length})`}
                </button>

                {userHighlights.length > 0 && (
                  <>
                    <span className="small muted" style={{ fontSize: '0.78rem' }}>
                      Đã tô <b>{userHighlights.length}</b> đoạn
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHighlights}
                      className="ios-btn sm"
                      style={{ padding: '3px 8px', fontSize: '0.74rem', color: '#BE123C' }}
                      title="Xoá tất cả (bạn vẫn có thể bấm Hoàn tác)"
                    >
                      Xoá tất cả
                    </button>
                  </>
                )}

                <span className="small muted" style={{ fontSize: '0.76rem', color: '#BE123C' }}>
                  Chạm đoạn tô để bỏ · Ctrl+Z để hoàn tác
                </span>
              </div>
            </div>

            {/* Thân bài Sách giáo khoa số liền khối (Thuần tuý kiến thức) */}
            {lesson.content ? (
              <article
                ref={articleRef}
                className="folio-editorial markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
                onMouseUp={handleSelection}
                onTouchEnd={handleSelection}
                onClick={handleArticleClick}
              />
            ) : (
              <div className="empty-lesson-banner">
                <p className="muted">Bài học này chưa có nội dung văn bản chi tiết.</p>
                {isTeacher && (
                  <button className="ios-btn sm ios-btn-primary mt-sm" onClick={() => setEditing(true)}>
                    + Nhập nội dung bài học
                  </button>
                )}
              </div>
            )}

            {/* Menu Popover nổi khi bôi đen / chạm vào đoạn văn bản */}
            {floatingPos && (
              <div
                className="editorial-popover-menu"
                style={{ top: floatingPos.top, left: floatingPos.left }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Hành động chính: Tô dạ quang / Bỏ tô */}
                <div className="popover-main-action">
                  {userHighlights.includes(selectedSnippet) ? (
                    <button
                      type="button"
                      className="popover-action-btn"
                      style={{ background: '#FFF1F2', color: '#BE123C', borderColor: '#FECDD6' }}
                      onClick={() => handleRemoveHighlight(selectedSnippet)}
                    >
                      Bỏ tô đoạn này ✕
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="popover-action-btn"
                      style={{ background: '#FFE4E8', color: '#BE123C', borderColor: '#FDA4AF' }}
                      onClick={handleAddHighlight}
                    >
                      Tô dạ quang hồng
                    </button>
                  )}

                  <button
                    type="button"
                    style={{ background: 'transparent', border: 'none', color: '#9F1239', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => {
                      setFloatingPos(null);
                      setSelectedSnippet('');
                    }}
                  >
                    ✕ Đóng
                  </button>
                </div>

                {/* 2. Gắn nhanh 1 trong 5 Nhãn nhỏ */}
                <div className="popover-tag-group">
                  <span className="popover-tag-label">Gắn nhãn định vị:</span>
                  <div className="popover-tag-chips">
                    {[
                      { tag: '#Mốc-Thực-Thể', color: '#0284C7', bg: '#E0F2FE' },
                      { tag: '#Hoạt-Động-Chủ-Trương', color: '#7E22CE', bg: '#F3E8FF' },
                      { tag: '#Nguyên-Nhân', color: '#B45309', bg: '#FEF3C7' },
                      { tag: '#Ý-Nghĩa', color: '#15803D', bg: '#DCFCE7' },
                      { tag: '#Bản-Chất', color: '#BE123C', bg: '#FFE4E8' },
                    ].map((t) => {
                      const isActive = highlightTags[selectedSnippet] === t.tag;
                      return (
                        <button
                          key={t.tag}
                          type="button"
                          className={`popover-tag-chip ${isActive ? 'active' : ''}`}
                          style={{
                            borderColor: t.color,
                            color: isActive ? '#FFFFFF' : t.color,
                            background: isActive ? t.color : t.bg,
                          }}
                          onClick={() => saveHighlightTag(selectedSnippet, t.tag)}
                        >
                          {t.tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Đẩy chữ sang Sơ đồ (3 nút thao tác nhanh) */}
                <div className="popover-extract-group">
                  <span className="popover-tag-label" style={{ color: '#881337' }}>Đẩy chữ sang Sơ đồ (Tab Ôn tập):</span>
                  <button
                    type="button"
                    className="popover-extract-btn"
                    onClick={() => handleOpenExtract('milestone')}
                  >
                    <span>+ Đưa vào Sơ đồ Mốc</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Lõi 1 ➔</span>
                  </button>

                  <button
                    type="button"
                    className="popover-extract-btn"
                    onClick={() => handleOpenExtract('axis')}
                  >
                    <span>+ Đưa vào Bảng Chia Trục</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Lõi 2 & 4 ➔</span>
                  </button>

                  <button
                    type="button"
                    className="popover-extract-btn"
                    onClick={() => handleOpenExtract('causeEffect')}
                  >
                    <span>+ Đưa vào Sơ đồ Nhân - Quả</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Lõi 3 ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* HỘP THOẠI THÊM NHANH VÀO TAB ÔN TẬP (TỰ TRÍCH XUẤT) */}
            {quickAddModal && (
              <FormDialog
                title={
                  quickAddModal === 'milestone'
                    ? '⚡ Đưa vào Sơ đồ Mốc & Nhãn (Lõi 1)'
                    : quickAddModal === 'axis'
                    ? '⚡ Đưa vào Bảng Chia Trục (Lõi 2 & 4)'
                    : '⚡ Đưa vào Sơ đồ Nhân - Quả (Lõi 3)'
                }
                onClose={() => setQuickAddModal(null)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
                  <p className="small muted" style={{ margin: 0 }}>
                    Hệ thống đã tự động bóc tách từ đoạn văn bản bạn vừa tô sáng. Kiểm tra lại và bấm xác nhận để đưa vào Tab Ôn tập:
                  </p>

                  {/* Form Sơ đồ Mốc (Lõi 1) */}
                  {quickAddModal === 'milestone' && (
                    <>
                      <label className="field">
                        <span>Mốc thời gian (Đã tự động nhận diện)</span>
                        <input
                          type="text"
                          value={extractedData.time}
                          placeholder="VD: 24-10-1945, năm 1967..."
                          onChange={(e) => setExtractedData((d) => ({ ...d, time: e.target.value }))}
                        />
                      </label>

                      <label className="field">
                        <span>Tên thực thể / Danh từ đích</span>
                        <input
                          type="text"
                          value={extractedData.entity}
                          placeholder="VD: Liên hợp quốc, Hiến chương, ASEAN..."
                          onChange={(e) => setExtractedData((d) => ({ ...d, entity: e.target.value }))}
                        />
                      </label>

                      <div className="row" style={{ gap: '8px' }}>
                        <span className="badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>#Văn_kiện</span>
                        <span className="badge" style={{ background: '#FEF3C7', color: '#B45309' }}>#Châu_Mỹ</span>
                        <span className="badge" style={{ background: '#F3E8FF', color: '#7E22CE' }}>#1919-1945</span>
                      </div>
                    </>
                  )}

                  {/* Form Bảng Chia Trục (Lõi 2 & 4) */}
                  {quickAddModal === 'axis' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label className="field">
                          <span>Chủ thể</span>
                          <input
                            type="text"
                            value={extractedData.entity || 'Liên hợp quốc'}
                            onChange={(e) => setExtractedData((d) => ({ ...d, entity: e.target.value }))}
                          />
                        </label>
                        <label className="field">
                          <span>Giai đoạn / Mốc</span>
                          <input
                            type="text"
                            value={extractedData.time || '1945 - 1975'}
                            onChange={(e) => setExtractedData((d) => ({ ...d, time: e.target.value }))}
                          />
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px' }}>
                        <label className="field">
                          <span>Tiến độ</span>
                          <select defaultValue="Hoàn thành">
                            <option value="Bước đầu">Bước đầu</option>
                            <option value="Bắt đầu">Bắt đầu</option>
                            <option value="Tiếp tục đẩy mạnh">Tiếp tục đẩy mạnh</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                          </select>
                        </label>
                        <label className="field">
                          <span>Động từ chính</span>
                          <input
                            type="text"
                            value={extractedData.verb}
                            placeholder="VD: Soạn thảo, Ký kết..."
                            onChange={(e) => setExtractedData((d) => ({ ...d, verb: e.target.value }))}
                          />
                        </label>
                      </div>

                      <label className="field">
                        <span>Mục tiêu / Nội dung</span>
                        <textarea
                          rows={2}
                          value={extractedData.content}
                          onChange={(e) => setExtractedData((d) => ({ ...d, content: e.target.value }))}
                        />
                      </label>
                    </>
                  )}

                  {/* Form Sơ đồ Nhân - Quả (Lõi 3) */}
                  {quickAddModal === 'causeEffect' && (
                    <>
                      <label className="field">
                        <span>Sự kiện trung tâm</span>
                        <input
                          type="text"
                          value={lesson.title}
                          disabled
                        />
                      </label>

                      <label className="field">
                        <span>Phân loại nhân quả</span>
                        <select defaultValue="yNghiaVietNam">
                          <option value="khachQuan">Bối cảnh / Khách quan (bên ngoài)</option>
                          <option value="chuQuan">Nguyên nhân Chủ quan (nội lực)</option>
                          <option value="yNghiaVietNam">Ý nghĩa đối với Việt Nam</option>
                          <option value="yNghiaQuocTe">Ý nghĩa Quốc tế</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Nội dung trích xuất</span>
                        <textarea
                          rows={3}
                          value={extractedData.content}
                          onChange={(e) => setExtractedData((d) => ({ ...d, content: e.target.value }))}
                        />
                      </label>
                    </>
                  )}

                  <div className="row between" style={{ marginTop: '14px' }}>
                    <button
                      type="button"
                      className="ios-btn sm ios-btn-secondary"
                      onClick={() => setQuickAddModal(null)}
                    >
                      Huỷ bỏ
                    </button>

                    <button
                      type="button"
                      className="ios-btn sm ios-btn-primary"
                      onClick={() => {
                        try {
                          if (quickAddModal === 'milestone') {
                            // Lưu vào Trục thời gian Lịch Sử dùng chung & đồng bộ xuyên suốt Lớp 10, 11, 12
                            const unifiedKey = 'unified_history_milestones_timeline';
                            const globalRaw = localStorage.getItem(unifiedKey);
                            const globalMilestones = globalRaw ? JSON.parse(globalRaw) : [];
                            const newMs = {
                              id: 'ms-user-' + Date.now(),
                              time: extractedData.time || '1945',
                              entityName: extractedData.entity || selectedSnippet,
                              note: extractedData.content || `Trích từ bài học: ${lesson.title}`,
                              typeTag: highlightTags[selectedSnippet] || '#Văn_kiện',
                              spaceTag: '#Việt_Nam',
                              eraTag: '#1919-1945',
                            };
                            const nextGlobal = [newMs, ...globalMilestones];
                            localStorage.setItem(unifiedKey, JSON.stringify(nextGlobal));
                            window.dispatchEvent(new Event('unified_milestones_updated'));
                          } else {
                            const studyKey = `lesson_study_data_${id}`;
                            const existing = JSON.parse(localStorage.getItem(studyKey) || '{"milestones":[],"axes":[],"causeEffects":[]}');
                            if (quickAddModal === 'axis') {
                              existing.axes = existing.axes || [];
                              existing.axes.push({
                                id: 'ax-' + Date.now(),
                                subject: extractedData.entity || 'Chủ thể',
                                period: extractedData.time || 'Giai đoạn',
                                progressBadge: 'Hoàn thành',
                                verb: extractedData.verb || 'Thực hiện',
                                content: extractedData.content || selectedSnippet,
                              });
                            } else if (quickAddModal === 'causeEffect') {
                              existing.causeEffects = existing.causeEffects || [];
                              existing.causeEffects.push({
                                id: 'ce-' + Date.now(),
                                content: extractedData.content || selectedSnippet,
                              });
                            }
                            localStorage.setItem(studyKey, JSON.stringify(existing));
                          }
                        } catch (e) {
                          console.error(e);
                        }
                        setQuickAddModal(null);
                        setSelectedSnippet('');
                        showToast('✓ Đã trích xuất và lưu vào Tab Ôn tập!');
                        switchTab('review');
                      }}
                    >
                      Lưu & Chuyển sang Tab Ôn tập ➔
                    </button>
                  </div>
                </div>
              </FormDialog>
            )}

            {/* Thanh chuyển tiếp tự nhiên ở chân bài đọc */}
            <div
              style={{
                marginTop: '36px',
                paddingTop: '20px',
                borderTop: '1.5px solid rgba(253, 164, 175, 0.35)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div className="small muted">Hoàn thành bài đọc lý thuyết? Tiếp tục củng cố kiến thức:</div>
              <div className="row" style={{ gap: '8px' }}>
                <button
                  type="button"
                  className="ios-btn sm ios-btn-primary"
                  onClick={() => switchTab('exercises')}
                >
                  Làm bài tập của bài này →
                </button>
                <button
                  type="button"
                  className="ios-btn sm ios-btn-secondary"
                  onClick={() => switchTab('review')}
                >
                  Ôn tập thẻ phản xạ →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: BÀI TẬP (HỆ THỐNG BÀI TẬP BT1, BT2, BT3 CHUẨN THPTQG 2026 & VẬN DỤNG)
            ========================================================================= */}
        {activeTab === 'exercises' && (
          <div className="tab-pane-content">
            {/* 1. Hệ thống bài tập trọng tâm BT1, BT2, BT3,... */}
            <div style={{ marginBottom: '32px' }}>
              <div className="row" style={{ marginBottom: '16px' }}>
                <span className="idx-badge">BT</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', color: '#380718' }}>
                    Hệ thống bài tập trọng tâm (BT1, BT2, BT3, ...)
                  </h3>
                  <div className="small muted">
                    Cấu trúc bám sát định dạng Đề thi Tốt nghiệp THPT Quốc Gia 2026 của Bộ GD&ĐT (Trắc nghiệm 4 lựa chọn & Đúng / Sai theo tư liệu)
                  </div>
                </div>
              </div>

              <AssignmentList
                assignments={assignments}
                latest={latest}
                chapterId={lesson.chapter_id}
                lessonId={id}
                defaultTitle={`BT${assignments.length + 1}: Bài tập ${lesson.title}`}
                emptyText="Chưa có bài tập nào cho bài học này."
              />
            </div>

            {/* 2. Vùng soạn thảo / Tương tác câu hỏi vận dụng (Integrated Editor) */}
            <section className="integrated-editor">
              <div className="editor-head">
                <div className="row" style={{ gap: '10px' }}>
                  <span className="idx-badge">Vận dụng</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.12rem', color: '#380718' }}>
                      Câu hỏi vận dụng: Hoạt động gìn giữ hoà bình của Việt Nam
                    </h3>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="hint-chip">Mục tiêu: Đoạn văn 150 – 200 từ</span>
                      <span className="hint-chip">Phái bộ Nam Xu-đăng & Abyei</span>
                      <span className="hint-chip">Bệnh viện dã chiến cấp 2</span>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <span className="word-badge">
                    Đã viết: <b>{wordCount}</b> / {targetWords} từ
                  </span>
                </div>
              </div>

              <div className="editor-progress">
                <div className="editor-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>

              <textarea
                rows={5}
                placeholder="Nhập câu trả lời vận dụng hoặc thu hoạch sau bài học của em vào đây..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
              />

              <div className="row between" style={{ marginTop: '14px' }}>
                <span className="small muted">
                  {savedNotice ? 'Đã lưu bài làm vào sổ học tập!' : 'Tiến độ: ' + progressPct + '%'}
                </span>
                <div className="row">
                  <button
                    type="button"
                    className="ios-btn sm ios-btn-secondary"
                    onClick={() => setEssayText('')}
                  >
                    Làm mới
                  </button>
                  <button type="button" className="ios-btn sm ios-btn-primary" onClick={saveEssay}>
                    Lưu bài làm
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ÔN TẬP (4 CHẾ ĐỘ SƠ ĐỒ LÕI + THẺ LẬT 3D)
            ========================================================================= */}
        {activeTab === 'review' && (
          <div className="tab-pane-content">
            <LessonReviewHub
              key={id}
              lessonId={id}
              lessonTitle={lesson.title}
              flashcards={cards}
              onCountChange={setReviewCount}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 4: LƯU Ý (TRẠM RADAR CẢNH BÁO BẪY & CẨM NANG CHỐNG SAI NGU)
            ========================================================================= */}
        {activeTab === 'notes' && (
          <div className="tab-pane-content">
            <LessonNotesHub
              lessonId={id}
              userHighlights={userHighlights}
              highlightTags={highlightTags}
              notes={images}
              onNotesChanged={reload}
              onSwitchTab={switchTab}
              onRemoveHighlight={handleRemoveHighlight}
            />

            {/* Bộ tài liệu tư liệu & Sơ đồ tư duy đính kèm */}
            <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1.5px solid rgba(253, 164, 175, 0.35)' }}>
              <div className="row between" style={{ marginBottom: '16px' }}>
                <div className="row">
                  <span className="idx-badge">Sơ đồ</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.12rem', color: '#380718' }}>
                      Sơ đồ tư duy & Ảnh tư liệu bài làm
                    </h3>
                    <div className="small muted">Lưu giữ hình ảnh sơ đồ vẽ tay hoặc bài làm thực tế</div>
                  </div>
                </div>
                <Uploader folder={`lessons/${id}/work`} onUploaded={(p) => addImages('work', p)} />
              </div>

              <Gallery
                items={images
                  .filter((i) => i.kind !== 'doc' && i.path !== 'note://text')
                  .map((i) => ({
                    ...i,
                    meta: `${nameOf(i.uploaded_by)} · ${fmtDate(i.created_at, false)}`,
                    canDelete: isTeacher || i.uploaded_by === user.id,
                  }))}
                onDelete={delImage}
                empty="Chưa có hình ảnh tư liệu nào được tải lên."
              />
            </div>
          </div>
        )}

        {/* Floating Toast thông báo hoàn tác dạ quang */}
        {undoToast && <div className="highlight-undo-toast">{undoToast}</div>}

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
    </div>
  );
}

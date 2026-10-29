import { useState, useMemo } from 'react';
import AssignmentList from './AssignmentList';
import { DEFAULT_BAI1_REVIEW_DATA } from './LessonReviewHub';

// Barem 6 Chiêu Bẫy Kinh Điển trong câu hỏi Đúng/Sai đề thi THPTQG
export const EXAM_TRAP_TYPES = {
  TRAP_1: { id: 1, name: 'Chiêu 1: Sửa dữ kiện tư liệu', icon: '🔍', desc: 'Thay đổi số liệu, mốc năm hoặc danh từ riêng so với văn bản gốc.' },
  TRAP_2: { id: 2, name: 'Chiêu 2: Nuốt từ / Phóng đại phạm vi', icon: '🐘', desc: 'Dùng từ tuyệt đối (tất cả, toàn thể, duy nhất) để phóng đại mức độ chưa đạt tới.' },
  TRAP_3: { id: 3, name: 'Chiêu 3: Gán kết quả sau cho trước', icon: '⏳', desc: 'Lấy thành tựu của giai đoạn sau gán vào giai đoạn trước khi mới thành lập.' },
  TRAP_4: { id: 4, name: 'Chiêu 4: Lệch pha thời kỳ', icon: '⏱', desc: 'Đánh tráo bối cảnh giữa thời chiến và thời bình, hoặc giữa CTTG II và Chiến tranh lạnh.' },
  TRAP_5: { id: 5, name: 'Chiêu 5: Đánh tráo yếu tố quyết định', icon: '⚖️', desc: 'Đổi yếu tố chủ quan (nội lực) thành yếu tố khách quan (ngoại lực) giữ vai trò quyết định.' },
  TRAP_6: { id: 6, name: 'Chiêu 6: Đầu voi đuôi chuột', icon: '🐭', desc: 'Vế trước câu đúng hoàn toàn tạo cảm giác đúng, nhưng cài cắm 1 từ sai ở vế cuối.' }
};

// Từ khoá nhạy cảm để Radar tự động khoanh tròn màu cam
const SENSITIVE_KEYWORDS_REGEX = /\b(hoàn toàn|tất cả|ngay lập tức|triệt để|duy nhất|trong suốt|khơi nguồn|khởi đầu|mới|trực tiếp|bắt buộc|tuyệt đối|đầu tiên|toàn bộ|1945|1967|1975|1977|1995|2015)\b/gi;

// Dữ liệu mẫu Phần I (Trắc nghiệm 4 lựa chọn theo 5 Lõi)
export const DEFAULT_PART1_MCQ = [
  {
    id: 'mcq-1',
    core: 'Lõi 1: Định danh',
    prompt: 'Bản Hiến chương Liên hợp quốc chính thức có hiệu lực vào ngày tháng năm nào?',
    options: [
      '24 - 10 - 1945',
      '25 - 04 - 1945',
      '02 - 09 - 1945',
      '20 - 09 - 1977'
    ],
    answer: 0,
    explanation: 'Ngày 24-10-1945, Hiến chương Liên hợp quốc chính thức có hiệu lực sau khi được các nước phê chuẩn, đánh dấu sự ra đời của tổ chức Liên hợp quốc (Ngày Liên hợp quốc hàng năm).'
  },
  {
    id: 'mcq-2',
    core: 'Lõi 2: Hành động / Chủ trương',
    prompt: 'Nội dung nào sau đây là hành động chủ chốt của ASEAN trong giai đoạn 1975 – 1991?',
    options: [
      'Ký kết Hiệp ước Thân thiện và Hợp tác Đông Nam Á (Hiệp ước Ba-li).',
      'Ký Tuyên bố Băng Cốc thành lập Hiệp hội với 5 nước sáng lập.',
      'Chính thức thành lập Cộng đồng ASEAN với 3 trụ cột vững chắc.',
      'Gia nhập Liên hợp quốc và trở thành uỷ viên thường trực HĐBA.'
    ],
    answer: 0,
    explanation: 'Năm 1976 (tại Hội nghị cấp cao Ba-li lần thứ nhất), các nước ASEAN đã ký Hiệp ước Ba-li xác lập các nguyên tắc quan hệ cơ bản trong khu vực.'
  },
  {
    id: 'mcq-3',
    core: 'Lõi 3: Nhân - Quả',
    prompt: 'Yếu tố khách quan thuận lợi nào sau đây đã thúc đẩy sự ra đời của tổ chức Liên hợp quốc năm 1945?',
    options: [
      'Thắng lợi của phe Đồng minh trong cuộc chiến tiêu diệt chủ nghĩa phát xít.',
      'Sự viện trợ kinh tế toàn diện của Kế hoạch Mác-san cho châu Á.',
      'Sự sụp đổ hoàn toàn của hệ thống thuộc địa trên toàn thế giới.',
      'Chiến tranh lạnh giữa hai cực Xô - Mỹ đã hoàn toàn chấm dứt.'
    ],
    answer: 0,
    explanation: 'Thắng lợi của các lực lượng dân chủ và phe Đồng minh chống phát xít trong CTTG II đã tạo cơ sở quốc tế thuận lợi cho việc hình thành Liên hợp quốc.'
  },
  {
    id: 'mcq-4',
    core: 'Lõi 4: Bản chất / Xu thế',
    prompt: 'Đặc trưng bản chất xuyên suốt không thay đổi trong nguyên tắc hoạt động của ASEAN từ năm 1967 đến nay là gì?',
    options: [
      'Nguyên tắc đồng thuận và không can thiệp vào công việc nội bộ.',
      'Nguyên tắc biểu quyết theo đa số quá bán của các nước thành viên.',
      'Nguyên tắc thành lập khối liên minh phòng thủ quân sự chung.',
      'Nguyên tắc xây dựng đồng tiền chung và liên minh thuế quan toàn diện.'
    ],
    answer: 0,
    explanation: 'Nguyên tắc đồng thuận (consensus) và không can thiệp nội bộ là cốt lõi của "Phương cách ASEAN", được duy trì nhất quán từ Tuyên bố Băng Cốc đến Hiến chương ASEAN.'
  },
  {
    id: 'mcq-5',
    core: 'Lõi 5: Đối chiếu / Bài học',
    prompt: 'Từ thực tiễn tham gia Liên hợp quốc và ASEAN, bài học kinh nghiệm quan trọng hàng đầu cho đường lối đối ngoại của Việt Nam hiện nay là gì?',
    options: [
      'Kiên định độc lập, tự chủ kết hợp chủ động hội nhập đa phương hoá, đa dạng hoá.',
      'Liên minh quân sự chặt chẽ với một cường quốc để bảo vệ chủ quyền biên giới.',
      'Tập trung phát triển kinh tế bao cấp và hạn chế dòng vốn đầu tư trực tiếp.',
      'Chỉ mở rộng quan hệ song phương, từ chối tham gia các tổ chức đa phương.'
    ],
    answer: 0,
    explanation: 'Bài học sống còn là giữ vững độc lập, tự chủ, thực lực quốc gia vững mạnh kết hợp linh hoạt hội nhập đa phương hoá, đa dạng hoá quan hệ quốc tế.'
  }
];

// Dữ liệu mẫu Phần II (Đoạn tư liệu + Đúng/Sai + Cắt vế bằng dấu /)
export const DEFAULT_PART2_TF = {
  id: 'tf-bai-1',
  docTitle: 'Đoạn trích tư liệu về sự thành lập và nguyên tắc của Hiệp hội các quốc gia Đông Nam Á (ASEAN)',
  docContent: `“Ngày 8 – 8 – 1967, đại diện 5 nước Đông Nam Á gồm In-đô-nê-xi-a, Ma-lai-xi-a, Phi-líp-pin, Xin-ga-po và Thái Lan đã ký bản Tuyên bố Băng Cốc, chính thức thành lập Hiệp hội các quốc gia Đông Nam Á (ASEAN). Mục tiêu của ASEAN là thúc đẩy sự tăng trưởng kinh tế, tiến bộ xã hội và phát triển văn hoá thông qua các nỗ lực hợp tác chung; duy trì hoà bình và ổn định khu vực bằng việc tôn trọng công lý và các nguyên tắc của Hiến chương Liên hợp quốc... Đến tháng 2 – 1976, Hiệp ước Ba-li được ký kết, xác định nguyên tắc đồng thuận và không can thiệp vào công việc nội bộ của nhau.”`,
  source: '(Sách giáo khoa Lịch sử 12 – Bộ Kết Nối Tri Thức Với Cuộc Sống, tr. 18–20)',
  items: [
    {
      id: 'a',
      indexLabel: 'a)',
      statement: 'ASEAN được thành lập trong bối cảnh cuộc Chiến tranh thế giới thứ hai vừa kết thúc / nhằm mục tiêu tập trung liên minh phòng thủ quân sự chống lại các nước phương Tây.',
      suggestedSlashes: ['ASEAN được thành lập trong bối cảnh cuộc Chiến tranh thế giới thứ hai vừa kết thúc', 'nhằm mục tiêu tập trung liên minh phòng thủ quân sự chống lại các nước phương Tây.'],
      connectors: ['/'],
      correct: false,
      trapType: 'TRAP_4', // Lệch pha thời kỳ & sai bản chất quân sự
      trapExplanation: 'Chiêu 4 (Lệch pha thời kỳ): Năm 1967 là thời kỳ Chiến tranh lạnh đang diễn ra gay gắt, không phải vừa kết thúc CTTG II (1945). Chiêu 6 (Đầu voi đuôi chuột): ASEAN không phải liên minh quân sự.'
    },
    {
      id: 'b',
      indexLabel: 'b)',
      statement: 'Năm nước ký Tuyên bố Băng Cốc năm 1967 / là các quốc gia thành viên sáng lập / đặt nền tảng cho sự hợp tác khu vực Đông Nam Á.',
      suggestedSlashes: ['Năm nước ký Tuyên bố Băng Cốc năm 1967', 'là các quốc gia thành viên sáng lập', 'đặt nền tảng cho sự hợp tác khu vực Đông Nam Á.'],
      connectors: ['/', '/'],
      correct: true,
      trapType: null,
      trapExplanation: 'Mệnh đề ĐÚNG hoàn toàn: Đúng tư liệu về 5 nước sáng lập và ý nghĩa đặt nền tảng hợp tác khu vực.'
    },
    {
      id: 'c',
      indexLabel: 'c)',
      statement: 'Ngay khi thành lập năm 1967 / ASEAN đã giải quyết triệt để mọi bất đồng song phương / và mở rộng kết nạp toàn bộ 10 quốc gia trong khu vực.',
      suggestedSlashes: ['Ngay khi thành lập năm 1967', 'ASEAN đã giải quyết triệt để mọi bất đồng song phương', 'và mở rộng kết nạp toàn bộ 10 quốc gia trong khu vực.'],
      connectors: ['/', '/'],
      correct: false,
      trapType: 'TRAP_2', // Nuốt từ / Phóng đại phạm vi
      trapExplanation: 'Chiêu 2 (Nuốt từ / Phóng đại phạm vi): Cài các từ nhạy cảm "ngay khi", "triệt để", "toàn bộ 10 quốc gia". Thực tế năm 1967 chỉ có 5 nước, đến 1999 mới đủ 10 nước và mâu thuẫn vẫn cần thời gian giải quyết.'
    },
    {
      id: 'd',
      indexLabel: 'd)',
      statement: 'Nguyên tắc đồng thuận được xác lập trong Hiệp ước Ba-li năm 1976 / tiếp tục là nguyên tắc cốt lõi xuyên suốt / trong quá trình xây dựng Cộng đồng ASEAN hiện nay.',
      suggestedSlashes: ['Nguyên tắc đồng thuận được xác lập trong Hiệp ước Ba-li năm 1976', 'tiếp tục là nguyên tắc cốt lõi xuyên suốt', 'trong quá trình xây dựng Cộng đồng ASEAN hiện nay.'],
      connectors: ['/', '/'],
      correct: true,
      trapType: null,
      trapExplanation: 'Mệnh đề ĐÚNG: Nguyên tắc đồng thuận từ Hiệp ước Ba-li (1976) được kế thừa nguyên vẹn vào Hiến chương ASEAN (2007) và Cộng đồng ASEAN (2015).'
    }
  ]
};

export default function LessonPracticeHub({ lessonId, assignments = [], latest, id, onSwitchTab }) {
  // Chế độ bài tập: 'part1-mcq' (Phần I - 5 Lõi) | 'part2-tf' (Phần II - Đúng/Sai tư liệu) | 'official-list' (Danh sách bài thi)
  const [exerciseMode, setExerciseMode] = useState('part1-mcq');

  // Lọc theo Lõi ở Phần I
  const [selectedCoreFilter, setSelectedCoreFilter] = useState('ALL');

  // Danh sách câu hỏi Phần I (có thể tự sinh thêm từ dữ liệu ôn tập)
  const [mcqList, setMcqList] = useState(DEFAULT_PART1_MCQ);
  const [userAnswers, setUserAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({}); // id -> boolean đã bấm xem đáp án
  const [autoGenNotice, setAutoGenNotice] = useState('');

  // Trạng thái Phần II
  const [tfData, setTfData] = useState(DEFAULT_PART2_TF);
  const [tfUserAnswers, setTfUserAnswers] = useState({}); // 'a' -> boolean (true/false)
  const [tfChecked, setTfChecked] = useState(false);
  
  // Công cụ: Bật/Tắt Radar Từ khóa nhạy cảm
  const [radarActive, setRadarActive] = useState(true);

  // Công cụ: Đánh dấu phân tách vế bằng dấu / (Slash Segmenter state)
  // itemId -> array of boolean vế con [true, false]
  const [slashSubChecks, setSlashSubChecks] = useState({});

  // --------------------------------------------------------------------------
  // TÍNH NĂNG: TỰ SINH CÂU HỎI TRẮC NGHIỆM TỪ SƠ ĐỒ ÔN TẬP
  // --------------------------------------------------------------------------
  const handleAutoGenerateQuestions = () => {
    try {
      const saved = localStorage.getItem(`lesson_study_data_${lessonId}`);
      const data = saved ? JSON.parse(saved) : DEFAULT_BAI1_REVIEW_DATA;
      const unifiedRaw = localStorage.getItem('unified_history_milestones_timeline');
      const unifiedMilestones = unifiedRaw ? JSON.parse(unifiedRaw) : [];
      const milestones = unifiedMilestones.length > 0 ? unifiedMilestones : (data.milestones || []);
      const axes = data.axes || DEFAULT_BAI1_REVIEW_DATA.axes;

      const generated = [];

      // 1. Tự sinh câu hỏi Lõi 1 từ Milestone:
      if (milestones.length >= 4) {
        const target = milestones[Math.floor(Math.random() * milestones.length)];
        const distractors = milestones.filter((m) => m.id !== target.id).slice(0, 3);
        const options = [target.time, ...distractors.map((d) => d.time)].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(target.time);

        generated.push({
          id: 'gen-ms-' + Date.now(),
          core: 'Lõi 1: Định danh',
          prompt: `[Tự sinh từ sơ đồ] Sự kiện / thực thể "${target.entityName}" được ghi nhận vào mốc thời gian nào?`,
          options: options,
          answer: correctIndex,
          explanation: `Theo sơ đồ ôn tập mốc tri thức: ${target.entityName} gắn liền với mốc ${target.time}. Ghi chú: ${target.note}`,
        });
      }

      // 2. Tự sinh câu hỏi Lõi 2 từ Axes (Hành động chuẩn):
      if (axes.length >= 3) {
        const targetAx = axes[Math.floor(Math.random() * axes.length)];
        generated.push({
          id: 'gen-ax-' + Date.now(),
          core: 'Lõi 2: Hành động / Chủ trương',
          prompt: `[Tự sinh từ sơ đồ] Trong giai đoạn ${targetAx.period}, tổ chức / chủ thể "${targetAx.subject}" đã thực hiện hành động trọng tâm nào sau đây?`,
          options: [
            `${targetAx.verb} ${targetAx.content}`,
            'Thành lập liên minh phòng thủ quân sự song phương.',
            'Áp dụng cơ chế biểu quyết đa số bắt buộc các nước thành viên.',
            'Chấm dứt hoàn toàn các hoạt động ngoại giao đa phương.'
          ].sort(() => Math.random() - 0.5),
          answer: 0, // Sẽ được tìm lại sau khi sort
          explanation: `Theo bảng chia trục chủ thể: Trong giai đoạn ${targetAx.period}, ${targetAx.subject} đã ${targetAx.verb} ${targetAx.content}.`,
        });
        // Cập nhật lại answer index cho chính xác
        const lastGen = generated[generated.length - 1];
        lastGen.answer = lastGen.options.findIndex((opt) => opt.startsWith(targetAx.verb));
      }

      if (generated.length > 0) {
        setMcqList((prev) => [...generated, ...prev]);
        setAutoGenNotice(`🎉 Đã tự sinh thành công ${generated.length} câu hỏi mới từ dữ liệu Sơ đồ Ôn tập của em!`);
        setTimeout(() => setAutoGenNotice(''), 5000);
      } else {
        alert('Dữ liệu sơ đồ ôn tập chưa đủ để tự sinh câu hỏi. Hãy thêm thêm mốc ở tab Ôn tập!');
      }
    } catch {
      alert('Chưa đọc được dữ liệu sơ đồ ôn tập.');
    }
  };

  // Chọn phương án trắc nghiệm Phần I
  const handleSelectMcq = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCheckMcq = (qId) => {
    setCheckedAnswers((prev) => ({ ...prev, [qId]: true }));
  };

  // Chọn Đúng / Sai ở Phần II
  const handleSelectTf = (itemId, val) => {
    setTfUserAnswers((prev) => ({ ...prev, [itemId]: val }));
  };

  // Tính điểm Phần II theo Barem Bộ GD&ĐT 2026
  const tfScore = useMemo(() => {
    let rightCount = 0;
    tfData.items.forEach((it) => {
      if (tfUserAnswers[it.id] !== undefined && tfUserAnswers[it.id] === it.correct) {
        rightCount++;
      }
    });

    let points = 0;
    if (rightCount === 1) points = 0.1;
    else if (rightCount === 2) points = 0.25;
    else if (rightCount === 3) points = 0.5;
    else if (rightCount === 4) points = 1.0;

    return { rightCount, points };
  }, [tfUserAnswers, tfData]);

  // Cắt vế bằng dấu / : Đánh dấu Đúng/Sai cho từng vế nhỏ
  const handleToggleSubSlash = (itemId, partIndex, isCorrect) => {
    setSlashSubChecks((prev) => {
      const current = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: { ...current, [partIndex]: isCorrect },
      };
    });
  };

  // Highlight Radar từ khóa nhạy cảm trong câu
  const renderTextWithRadar = (text) => {
    if (!radarActive) return text;
    const parts = text.split(SENSITIVE_KEYWORDS_REGEX);
    return parts.map((part, index) => {
      if (part.match(SENSITIVE_KEYWORDS_REGEX)) {
        return (
          <mark key={index} className="radar-sensitive-word" title="⚠️ Từ khóa nhạy cảm đề thi hay gài bẫy!">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Danh sách câu hỏi Phần I sau khi lọc Lõi
  const filteredMcqList = useMemo(() => {
    if (selectedCoreFilter === 'ALL') return mcqList;
    return mcqList.filter((q) => q.core.includes(selectedCoreFilter));
  }, [mcqList, selectedCoreFilter]);

  return (
    <div className="practice-hub-container">
      {/* 1. THANH CHUYỂN ĐỔI CHẾ ĐỘ LUYỆN ĐỀ CHUẨN THPTQG */}
      <div className="practice-mode-nav-bar">
        <div className="practice-mode-pills">
          <button
            type="button"
            className={`practice-pill-btn ${exerciseMode === 'part1-mcq' ? 'active' : ''}`}
            onClick={() => setExerciseMode('part1-mcq')}
          >
            <span className="part-tag">Phần I</span>
            <span>Trắc nghiệm 4 lựa chọn (5 Lõi)</span>
            <span className="count-tag">{mcqList.length}</span>
          </button>

          <button
            type="button"
            className={`practice-pill-btn ${exerciseMode === 'part2-tf' ? 'active' : ''}`}
            onClick={() => setExerciseMode('part2-tf')}
          >
            <span className="part-tag tag-tf">Phần II</span>
            <span>Giải phẫu Đúng / Sai bằng dấu / (Tư liệu)</span>
            <span className="count-tag">4 ý</span>
          </button>

          <button
            type="button"
            className={`practice-pill-btn ${exerciseMode === 'official-list' ? 'active' : ''}`}
            onClick={() => setExerciseMode('official-list')}
          >
            <span>Hệ thống Đề thi đầy đủ</span>
            <span className="count-tag">{assignments.length}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CHẾ ĐỘ 1: PHẦN I · TRẮC NGHIỆM 4 LỰA CHỌN (GẮN NHÃN 5 LÕI + TỰ SINH ĐỀ)
          ========================================================================= */}
      {exerciseMode === 'part1-mcq' && (
        <div className="part1-mcq-workspace">
          {/* Header công cụ: Lọc 5 Lõi & Tự sinh câu hỏi */}
          <div className="part1-toolbar-box">
            <div className="core-filter-chips-row">
              <span className="filter-label">Lọc theo Lõi:</span>
              <div className="filter-scroll">
                <button
                  type="button"
                  className={`core-chip-btn ${selectedCoreFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedCoreFilter('ALL')}
                >
                  Tất cả 5 Lõi ({mcqList.length})
                </button>
                <button
                  type="button"
                  className={`core-chip-btn core-1 ${selectedCoreFilter === 'Lõi 1' ? 'active' : ''}`}
                  onClick={() => setSelectedCoreFilter('Lõi 1')}
                >
                  Lõi 1: Định danh
                </button>
                <button
                  type="button"
                  className={`core-chip-btn core-2 ${selectedCoreFilter === 'Lõi 2' ? 'active' : ''}`}
                  onClick={() => setSelectedCoreFilter('Lõi 2')}
                >
                  Lõi 2: Hành động
                </button>
                <button
                  type="button"
                  className={`core-chip-btn core-3 ${selectedCoreFilter === 'Lõi 3' ? 'active' : ''}`}
                  onClick={() => setSelectedCoreFilter('Lõi 3')}
                >
                  Lõi 3: Nhân - Quả
                </button>
                <button
                  type="button"
                  className={`core-chip-btn core-4 ${selectedCoreFilter === 'Lõi 4' ? 'active' : ''}`}
                  onClick={() => setSelectedCoreFilter('Lõi 4')}
                >
                  Lõi 4: Bản chất
                </button>
                <button
                  type="button"
                  className={`core-chip-btn core-5 ${selectedCoreFilter === 'Lõi 5' ? 'active' : ''}`}
                  onClick={() => setSelectedCoreFilter('Lõi 5')}
                >
                  Lõi 5: Đối chiếu
                </button>
              </div>
            </div>

            <button
              type="button"
              className="ios-btn sm ios-btn-primary auto-gen-btn"
              onClick={handleAutoGenerateQuestions}
            >
              <span>⚡ Tự sinh câu hỏi từ Sơ đồ Ôn tập</span>
            </button>
          </div>

          {autoGenNotice && (
            <div className="auto-gen-toast-banner">
              {autoGenNotice}
            </div>
          )}

          {/* Danh sách câu hỏi Phần I */}
          <div className="mcq-questions-stack">
            {filteredMcqList.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              const isChecked = checkedAnswers[q.id];
              const isCorrect = selectedOpt === q.answer;

              return (
                <div key={q.id} className="mcq-apple-card">
                  <div className="mcq-card-head">
                    <div className="row" style={{ gap: '8px' }}>
                      <span className="q-index-badge">CÂU {qIndex + 1}</span>
                      <span className="q-core-badge">{q.core}</span>
                    </div>
                    <span className="q-points-badge">0.25 điểm</span>
                  </div>

                  <h4 className="mcq-prompt-text">{q.prompt}</h4>

                  {/* 4 Lựa chọn A, B, C, D */}
                  <div className="mcq-options-grid">
                    {q.options.map((optText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = selectedOpt === optIdx;
                      let optionClass = 'mcq-opt-pill';

                      if (isSelected) optionClass += ' is-selected';
                      if (isChecked) {
                        if (optIdx === q.answer) optionClass += ' is-correct-answer';
                        else if (isSelected && !isCorrect) optionClass += ' is-wrong-answer';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={optionClass}
                          onClick={() => !isChecked && handleSelectMcq(q.id, optIdx)}
                        >
                          <span className="opt-letter">{letter}.</span>
                          <span className="opt-label">{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Thanh thao tác & Giải thích */}
                  <div className="mcq-card-footer">
                    {selectedOpt !== undefined && !isChecked && (
                      <button
                        type="button"
                        className="ios-btn sm ios-btn-primary"
                        onClick={() => handleCheckMcq(q.id)}
                      >
                        Kiểm tra đáp án
                      </button>
                    )}

                    {isChecked && (
                      <div className={`mcq-explanation-box ${isCorrect ? 'right' : 'wrong'}`}>
                        <div className="exp-head">
                          <b>{isCorrect ? '✓ CHÍNH XÁC (+0.25đ)' : `✗ CHƯA ĐÚNG (Đáp án đúng là ${String.fromCharCode(65 + q.answer)})`}</b>
                        </div>
                        <p className="exp-text">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ 2: PHẦN II · GIẢI PHẪU ĐÚNG / SAI BẰNG DẤU / (TƯ LIỆU GỐC)
          ========================================================================= */}
      {exerciseMode === 'part2-tf' && (
        <div className="part2-tf-workspace">
          {/* Thanh công cụ Phần II: Bật / Tắt Radar */}
          <div className="tf-toolbar-box">
            <div className="row" style={{ gap: '10px' }}>
              <span className="tf-lead-badge">PHẦN II · ĐỀ BỘ GD&ĐT 2026</span>
              <span className="small muted">Thang điểm: Đúng 1 ý = 0.1đ · 2 ý = 0.25đ · 3 ý = 0.5đ · 4 ý = 1.0đ</span>
            </div>

            <div className="radar-switch-wrap">
              <label className="radar-switch-label">
                <input
                  type="checkbox"
                  checked={radarActive}
                  onChange={(e) => setRadarActive(e.target.checked)}
                />
                <span className="radar-switch-text">
                  🎯 Radar Từ khóa nhạy cảm: <b>{radarActive ? 'Đang BẬT' : 'Đang TẮT'}</b>
                </span>
              </label>
            </div>
          </div>

          {/* KHUNG ĐOẠN TƯ LIỆU GỐC */}
          <div className="tf-document-card">
            <div className="doc-head">
              <span className="doc-icon">📜</span>
              <h4 className="doc-title">{tfData.docTitle}</h4>
            </div>
            <blockquote className="doc-content-quote">
              {tfData.docContent}
            </blockquote>
            <span className="doc-source-caption">{tfData.source}</span>
          </div>

          {/* 4 MỆNH ĐỀ a, b, c, d CÓ CÔNG CỤ CẮT VẾ BẰNG DẤU / */}
          <div className="tf-statements-list">
            {tfData.items.map((item) => {
              const userChoice = tfUserAnswers[item.id];
              const isChecked = tfChecked;
              const isItemRight = userChoice !== undefined && userChoice === item.correct;
              const subChecks = slashSubChecks[item.id] || {};
              const trapInfo = item.trapType ? EXAM_TRAP_TYPES[item.trapType] : null;

              return (
                <div key={item.id} className="tf-statement-card">
                  <div className="st-head-row">
                    <span className="st-index-label">{item.indexLabel}</span>
                    <span className="small muted">Phân tích từng vế bằng dấu / trước khi chọn Đúng / Sai:</span>
                  </div>

                  {/* VÙNG HIỂN THỊ CẮT VẾ BẰNG DẤU / (SLASH SEGMENTER) */}
                  <div className="slash-segmenter-box">
                    {item.suggestedSlashes.map((vếText, vIndex) => {
                      const vStatus = subChecks[vIndex];
                      return (
                        <div key={vIndex} className="slash-sub-clause">
                          <span className="clause-text">{renderTextWithRadar(vếText)}</span>

                          {/* Bộ nút đánh giá mini từng vế con */}
                          <div className="sub-clause-eval-row">
                            <span className="eval-sub-label">Vế {vIndex + 1}:</span>
                            <button
                              type="button"
                              className={`mini-eval-btn ${vStatus === true ? 'is-correct' : ''}`}
                              onClick={() => handleToggleSubSlash(item.id, vIndex, true)}
                            >
                              ✓ Đúng
                            </button>
                            <button
                              type="button"
                              className={`mini-eval-btn ${vStatus === false ? 'is-wrong' : ''}`}
                              onClick={() => handleToggleSubSlash(item.id, vIndex, false)}
                            >
                              ✗ Sai
                            </button>
                          </div>

                          {/* Dấu gạch phân tách / nếu chưa phải vế cuối */}
                          {vIndex < item.suggestedSlashes.length - 1 && (
                            <span className="slash-divider-mark">/</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* HAI NÚT CHỐT ĐÁP ÁN: ĐÚNG vs SAI */}
                  <div className="st-action-row">
                    <div className="st-choice-buttons">
                      <button
                        type="button"
                        className={`tf-choice-btn true-btn ${userChoice === true ? 'selected' : ''}`}
                        onClick={() => handleSelectTf(item.id, true)}
                      >
                        ✓ ĐÚNG
                      </button>
                      <button
                        type="button"
                        className={`tf-choice-btn false-btn ${userChoice === false ? 'selected' : ''}`}
                        onClick={() => handleSelectTf(item.id, false)}
                      >
                        ✗ SAI
                      </button>
                    </div>

                    {userChoice !== undefined && !isChecked && (
                      <span className="small muted">Đã chọn: <b>{userChoice ? 'Đúng' : 'Sai'}</b></span>
                    )}
                  </div>

                  {/* GIẢI PHẪU CHIÊU BẪY KHI ĐÃ CHẤM ĐIỂM */}
                  {isChecked && (
                    <div className={`tf-autopsy-box ${isItemRight ? 'right' : 'wrong'}`}>
                      <div className="autopsy-head">
                        <b>{isItemRight ? '✓ CHÍNH XÁC' : '✗ CHƯA CHÍNH XÁC'}</b>
                        <span>(Đáp án chuẩn: <b>{item.correct ? 'ĐÚNG' : 'SAI'}</b>)</span>
                      </div>

                      {/* Hiển thị chiêu bẫy trong 6 chiêu */}
                      {trapInfo && (
                        <div className="trap-anatomy-chip">
                          <span className="trap-icon">{trapInfo.icon}</span>
                          <span className="trap-name">{trapInfo.name}</span>
                        </div>
                      )}

                      <p className="autopsy-desc">{item.trapExplanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER NỘP BÀI VÀ TÍNH ĐIỂM BỘ GD&ĐT 2026 */}
          <div className="tf-submit-score-bar">
            <div>
              {tfChecked ? (
                <div className="score-summary-pill">
                  <span>Kết quả: <b>Đúng {tfScore.rightCount}/4 ý</b></span>
                  <span className="score-pts">➔ Đạt <b>{tfScore.points}</b> / 1.0 điểm</span>
                </div>
              ) : (
                <span className="small muted">Hãy hoàn thành cả 4 ý a, b, c, d trước khi bấm kiểm tra điểm số.</span>
              )}
            </div>

            <button
              type="button"
              className="ios-btn sm ios-btn-primary"
              onClick={() => setTfChecked(true)}
            >
              {tfChecked ? 'Chấm Lại Điểm' : 'Kiểm Tra Điểm Số 4 Ý'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ 3: DANH SÁCH BÀI TẬP VÀ ĐỀ THI ĐẦY ĐỦ (BT1, BT2,...)
          ========================================================================= */}
      {exerciseMode === 'official-list' && (
        <div className="official-list-workspace">
          <div className="row" style={{ marginBottom: '16px' }}>
            <span className="idx-badge">BT</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.18rem', color: '#380718' }}>
                Hệ thống đề thi trắc nghiệm đầy đủ (28 câu)
              </h3>
              <div className="small muted">
                Làm trọn vẹn 24 câu Phần I + 4 câu Phần II tính điểm tự động và lưu vào sổ học tập
              </div>
            </div>
          </div>

          <AssignmentList
            assignments={assignments}
            latest={latest}
            chapterId={id}
            lessonId={lessonId}
            defaultTitle={`Bài tập kiểm tra`}
            emptyText="Chưa có bài tập nào cho bài học này."
          />
        </div>
      )}
    </div>
  );
}

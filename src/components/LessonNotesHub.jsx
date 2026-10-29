import { useState } from 'react';
import { FormDialog } from './Modal';
import LessonNotes from './LessonNotes';
import { Gallery } from './Gallery';
import Uploader from './Uploader';

// Dữ liệu mẫu Cẩm nang chống sai ngu cho Bài 1
export const DEFAULT_RADAR_DATA = {
  // BẢNG 1: CÁC CẶP KHÁI NIỆM DỄ ĐÁNH TRÁO (A ≠ B)
  conceptPairs: [
    {
      id: 'pair-1',
      title: 'Thời điểm Hiến chương LHQ có hiệu lực vs Thời điểm kết thúc CTTG II',
      sideA: {
        label: 'Hiến chương LHQ có hiệu lực (24-10-1945)',
        desc: 'Là mốc thành lập chính thức của Liên hợp quốc (Ngày Liên hợp quốc hàng năm), diễn ra sau khi được đa số nước phê chuẩn.',
        color: '#BE123C',
      },
      sideB: {
        label: 'Thời điểm CTTG II kết thúc (2-9-1945)',
        desc: 'Ngày phát xít Nhật ký văn bản đầu hàng không điều kiện trên chiến hạm Missouri của Mỹ, chấm dứt hoàn toàn CTTG II.',
        color: '#0369A1',
      },
      trapNote: 'Đề thi hay bẫy: "Liên hợp quốc được thành lập ngay vào ngày Chiến tranh thế giới thứ hai kết thúc (2-9-1945)". Đây là MỆNH ĐỀ SAI!',
    },
    {
      id: 'pair-2',
      title: 'Thành lập ASEAN vs Thành lập Cộng đồng ASEAN',
      sideA: {
        label: 'Thành lập Hiệp hội ASEAN (8-8-1967)',
        desc: '5 nước sáng lập ký Tuyên bố Băng Cốc đặt nền tảng hợp tác khu vực Đông Nam Á trong bối cảnh Chiến tranh lạnh.',
        color: '#BE123C',
      },
      sideB: {
        label: 'Thành lập Cộng đồng ASEAN (31-12-2015)',
        desc: 'Bước chuyển chất với 3 trụ cột liên kết chặt chẽ (APSC, AEC, ASCC) sau khi đã có khung pháp lý Hiến chương ASEAN (2007).',
        color: '#0369A1',
      },
      trapNote: 'Đề thi hay bẫy: "Cộng đồng ASEAN ra đời từ năm 1967 theo Tuyên bố Băng Cốc". Phải phân biệt rõ HIỆP HỘI (1967) vs CỘNG ĐỒNG (2015)!',
    },
    {
      id: 'pair-3',
      title: 'Cơ chế đồng thuận ASEAN vs Biểu quyết đa số',
      sideA: {
        label: 'Cơ chế đồng thuận (Consensus) của ASEAN',
        desc: 'Tất cả các thành viên cùng bàn bạc, tham vấn cho đến khi đạt được sự nhất trí chung; không bên nào bị áp đặt ("Phương cách ASEAN").',
        color: '#BE123C',
      },
      sideB: {
        label: 'Biểu quyết theo đa số quá bán (> 50%)',
        desc: 'Phương thức của các tổ chức quốc tế khác (như Đại hội đồng LHQ). ASEAN tuyệt đối không áp dụng vì dễ gây chia rẽ nội khối.',
        color: '#0369A1',
      },
      trapNote: 'Đề thi hay bẫy: "Các nghị quyết của ASEAN được thông qua khi có đa số quốc gia thành viên bỏ phiếu tán thành". SAI HOÀN TOÀN!',
    },
    {
      id: 'pair-4',
      title: 'Việt Nam tham gia Hiệp ước Ba-li vs Chính thức gia nhập ASEAN',
      sideA: {
        label: 'Tham gia Hiệp ước Ba-li (7-1992)',
        desc: 'Bước chuẩn bị quan trọng, Việt Nam trở thành quan sát viên của ASEAN, tạo tiền đề hoà dịu quan hệ khu vực.',
        color: '#BE123C',
      },
      sideB: {
        label: 'Chính thức gia nhập ASEAN (28-7-1995)',
        desc: 'Kỳ họp thứ 28 tại Bru-nây, Việt Nam chính thức được kết nạp là thành viên thứ 7, mở đầu giai đoạn hội nhập khu vực.',
        color: '#0369A1',
      },
      trapNote: 'Đề thi hay bẫy tráo mốc 1992 (chỉ mới là quan sát viên) thành mốc chính thức gia nhập.',
    },
  ],

  // BẢNG 2: TỪ ĐIỂN TỪ KHÓA TUYỆT ĐỐI HÓA & NHẠY CẢM
  sensitiveWords: [
    {
      id: 'sw-1',
      word: 'hoàn toàn',
      level: 'Báo động đỏ (Tỷ lệ bẫy 95%)',
      trapExplanation: 'Thường dùng để tuyệt đối hoá kết quả mà thực tế sự kiện chưa đạt tới.',
      wrongExample: 'Hiến chương Liên hợp quốc đã giải quyết hoàn toàn các bất đồng giữa các cường quốc.',
      correctRule: 'Mâu thuẫn giữa các nước lớn (đặc biệt là Xô - Mỹ) trong Hội đồng Bảo an vẫn diễn ra gay gắt suốt thời kỳ Chiến tranh lạnh.',
    },
    {
      id: 'sw-2',
      word: 'tất cả',
      level: 'Báo động đỏ (Tỷ lệ bẫy 95%)',
      trapExplanation: 'Đánh tráo phạm vi bộ phận thành phạm vi toàn thể.',
      wrongExample: 'Năm 1967, tất cả các quốc gia ở Đông Nam Á đã cùng ký kết văn kiện thành lập ASEAN.',
      correctRule: 'Năm 1967 chỉ có 5 nước sáng lập (In-đô, Ma-lai, Phi-líp-pin, Xin-ga-po, Thái Lan). Đến năm 1999 mới đủ 10 nước.',
    },
    {
      id: 'sw-3',
      word: 'ngay lập tức',
      level: 'Nhạy cảm cao (Tỷ lệ bẫy 90%)',
      trapExplanation: 'Bỏ qua tính chất tiệm tiến, từng bước của các quá trình lịch sử.',
      wrongExample: 'Ngay sau khi thành lập, ASEAN đã triển khai liên kết kinh tế sâu rộng giữa các thành viên.',
      correctRule: 'Giai đoạn đầu (1967-1976), ASEAN chủ yếu hợp tác chính trị - an ninh sơ khai; hợp tác kinh tế chỉ thực sự đẩy mạnh sau Hiệp ước Ba-li và thế kỷ XXI.',
    },
    {
      id: 'sw-4',
      word: 'triệt để',
      level: 'Báo động đỏ (Tỷ lệ bẫy 95%)',
      trapExplanation: 'Tuyệt đối hoá tính giải quyết vấn đề.',
      wrongExample: 'Liên hợp quốc đã ngăn chặn triệt để mọi cuộc xung đột vũ trang trên hành tinh.',
      correctRule: 'LHQ ngăn ngừa được Chiến tranh thế giới thứ ba, nhưng các cuộc xung đột vũ trang cục bộ, nội chiến và tranh chấp lãnh thổ vẫn xảy ra.',
    },
    {
      id: 'sw-5',
      word: 'duy nhất',
      level: 'Nhạy cảm cao (Tỷ lệ bẫy 90%)',
      trapExplanation: 'Phủ nhận sự tồn tại của các tổ chức hoặc nhân tố song hành khác.',
      wrongExample: 'Hội đồng Bảo an là cơ quan duy nhất có quyền đưa ra quyết định tại Liên hợp quốc.',
      correctRule: 'Hội đồng Bảo an chịu trách nhiệm chính về hoà bình và an ninh, nhưng Đại hội đồng và Toà án Công lý Quốc tế cũng có thẩm quyền quan trọng.',
    },
    {
      id: 'sw-6',
      word: 'khởi đầu / khơi nguồn',
      level: 'Nhạy cảm cao (Tỷ lệ bẫy 85%)',
      trapExplanation: 'Đánh tráo mốc xuất phát điểm của các tiến trình cải cách hoặc sự kiện.',
      wrongExample: 'Tuyên bố Băng Cốc năm 1967 là sự kiện khơi nguồn cho ý tưởng xây dựng Cộng đồng ASEAN.',
      correctRule: 'Ý tưởng xây dựng Cộng đồng ASEAN chính thức được đề xuất tại Tuyên bố Ba-li II (2003), không phải từ năm 1967.',
    },
    {
      id: 'sw-7',
      word: 'trực tiếp',
      level: 'Nhạy cảm cao (Tỷ lệ bẫy 85%)',
      trapExplanation: 'Đánh tráo giữa tác động gián tiếp / nguyên tắc không can thiệp.',
      wrongExample: 'Liên hợp quốc có quyền cử quân đội can thiệp trực tiếp vào pháp luật nội bộ của các quốc gia thành viên.',
      correctRule: 'Nguyên tắc cơ bản của Hiến chương là tôn trọng bình đẳng chủ quyền và KHÔNG can thiệp vào công việc nội bộ của bất kỳ quốc gia nào.',
    },
  ],
};

export default function LessonNotesHub({
  lessonId,
  userHighlights = [],
  highlightTags = {},
  notes = [],
  onNotesChanged,
  onSwitchTab,
  onRemoveHighlight,
}) {
  // Lấy dữ liệu radar từ localStorage hoặc dùng mặc định
  const storageKey = `lesson_radar_data_${lessonId}`;
  const [radarData, setRadarData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      return DEFAULT_RADAR_DATA;
    } catch {
      return DEFAULT_RADAR_DATA;
    }
  });

  const saveRadar = (nextData) => {
    setRadarData(nextData);
    localStorage.setItem(storageKey, JSON.stringify(nextData));
  };

  // State Modal thêm cặp khái niệm
  const [isAddPairModal, setIsAddPairModal] = useState(false);
  const [pairTitle, setPairTitle] = useState('');
  const [sideALabel, setSideALabel] = useState('');
  const [sideADesc, setSideADesc] = useState('');
  const [sideBLabel, setSideBLabel] = useState('');
  const [sideBDesc, setSideBDesc] = useState('');
  const [pairTrapNote, setPairTrapNote] = useState('');

  // State Modal thêm từ khoá nhạy cảm
  const [isAddWordModal, setIsAddWordModal] = useState(false);
  const [swWord, setSwWord] = useState('');
  const [swLevel, setSwLevel] = useState('Báo động đỏ (Tỷ lệ bẫy 95%)');
  const [swExplanation, setSwExplanation] = useState('');
  const [swWrongExample, setSwWrongExample] = useState('');
  const [swCorrectRule, setSwCorrectRule] = useState('');

  // Xử lý thêm cặp khái niệm mới
  const handleAddPair = (e) => {
    e?.preventDefault();
    if (!pairTitle.trim() || !sideALabel.trim() || !sideBLabel.trim()) return;

    const newPair = {
      id: 'pair-' + Date.now(),
      title: pairTitle.trim(),
      sideA: {
        label: sideALabel.trim(),
        desc: sideADesc.trim() || 'Bản chất ngữ cảnh A.',
        color: '#BE123C',
      },
      sideB: {
        label: sideBLabel.trim(),
        desc: sideBDesc.trim() || 'Bản chất ngữ cảnh B.',
        color: '#0369A1',
      },
      trapNote: pairTrapNote.trim() || 'Lưu ý không đánh tráo 2 khái niệm này trong đề thi.',
    };

    saveRadar({
      ...radarData,
      conceptPairs: [newPair, ...(radarData.conceptPairs || [])],
    });

    setIsAddPairModal(false);
    setPairTitle('');
    setSideALabel('');
    setSideADesc('');
    setSideBLabel('');
    setSideBDesc('');
    setPairTrapNote('');
  };

  // Xoá cặp khái niệm
  const handleDeletePair = (id) => {
    if (window.confirm('Em có chắc chắn muốn xoá cặp khái niệm này?')) {
      saveRadar({
        ...radarData,
        conceptPairs: radarData.conceptPairs.filter((p) => p.id !== id),
      });
    }
  };

  // Xử lý thêm từ khoá nhạy cảm mới
  const handleAddWord = (e) => {
    e?.preventDefault();
    if (!swWord.trim()) return;

    const newWord = {
      id: 'sw-' + Date.now(),
      word: swWord.trim().toLowerCase(),
      level: swLevel,
      trapExplanation: swExplanation.trim() || 'Từ khoá nhạy cảm cần cảnh giác trong đề thi.',
      wrongExample: swWrongExample.trim() || 'Câu đề thi có chứa từ khoá này thường là bẫy.',
      correctRule: swCorrectRule.trim() || 'Kiểm tra kỹ giới hạn mức độ thực tế của sự kiện.',
    };

    saveRadar({
      ...radarData,
      sensitiveWords: [newWord, ...(radarData.sensitiveWords || [])],
    });

    setIsAddWordModal(false);
    setSwWord('');
    setSwExplanation('');
    setSwWrongExample('');
    setSwCorrectRule('');
  };

  // Xoá từ khoá nhạy cảm
  const handleDeleteWord = (id) => {
    if (window.confirm('Em có chắc muốn xoá từ khoá cảnh báo này?')) {
      saveRadar({
        ...radarData,
        sensitiveWords: radarData.sensitiveWords.filter((w) => w.id !== id),
      });
    }
  };

  return (
    <div className="radar-hub-container">
      {/* =========================================================================
          BANNER TIÊU ĐỀ: TRẠM RADAR CẢNH BÁO BẪY
          ========================================================================= */}
      <div className="radar-hero-banner">
        <div className="radar-hero-content">
          <div className="radar-icon-badge">🎯</div>
          <div>
            <div className="radar-lead-tag">CẨM NANG CHỐNG SAI NGU TRƯỚC KHI LÀM ĐỀ</div>
            <h2 className="radar-hero-title">Trạm Radar Cảnh Báo Bẫy Đề Thi THPT Quốc Gia</h2>
            <p className="radar-hero-sub">
              Hệ thống tự động rà quét các cặp khái niệm đánh tráo, từ điển từ khóa tuyệt đối hóa và các đoạn trọng tâm dạ quang đã ghi nhớ.
            </p>
          </div>
        </div>

        <div className="radar-stats-pills">
          <span className="r-stat-pill">
            <b>{radarData.conceptPairs?.length || 0}</b> cặp A ≠ B
          </span>
          <span className="r-stat-pill">
            <b>{radarData.sensitiveWords?.length || 0}</b> từ khóa đỏ
          </span>
          <span className="r-stat-pill">
            <b>{userHighlights.length}</b> đoạn dạ quang
          </span>
        </div>
      </div>

      {/* =========================================================================
          BẢNG 1: CÁC CẶP KHÁI NIỆM DỄ ĐÁNH TRÁO TRONG BÀI (A ≠ B)
          ========================================================================= */}
      <section className="radar-card-section">
        <div className="radar-section-header">
          <div className="row" style={{ gap: '10px' }}>
            <span className="radar-badge-pill">BẢNG 1</span>
            <div>
              <h3 className="radar-section-title">Các Cặp Khái Niệm Dễ Đánh Tráo (A ≠ B)</h3>
              <p className="small muted">
                Đề thi thường thay thế khái niệm A bằng khái niệm B để tạo ra mệnh đề sai rất tinh vi.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={() => setIsAddPairModal(true)}
          >
            + Thêm Cặp Khái Niệm
          </button>
        </div>

        <div className="concept-pairs-grid">
          {radarData.conceptPairs?.map((pair) => (
            <div key={pair.id} className="concept-pair-card">
              <div className="pair-card-top">
                <h4 className="pair-card-title">{pair.title}</h4>
                <button
                  type="button"
                  className="pair-del-btn"
                  title="Xoá cặp này"
                  onClick={() => handleDeletePair(pair.id)}
                >
                  ✕
                </button>
              </div>

              {/* Bố cục đối xứng 2 vế: Vế A ≠ Vế B */}
              <div className="pair-symmetric-box">
                {/* Vế A */}
                <div className="pair-side side-a">
                  <span className="side-badge badge-a">VẾ A</span>
                  <h5 className="side-label">{pair.sideA?.label}</h5>
                  <p className="side-desc">{pair.sideA?.desc}</p>
                </div>

                {/* Dấu Không Bằng ≠ */}
                <div className="not-equal-divider">
                  <span className="ne-sign">≠</span>
                  <span className="ne-sub">KHÁC</span>
                </div>

                {/* Vế B */}
                <div className="pair-side side-b">
                  <span className="side-badge badge-b">VẾ B</span>
                  <h5 className="side-label">{pair.sideB?.label}</h5>
                  <p className="side-desc">{pair.sideB?.desc}</p>
                </div>
              </div>

              {/* Hộp giải thích bẫy thi */}
              {pair.trapNote && (
                <div className="pair-trap-box">
                  <span className="trap-icon">🚩</span>
                  <span className="trap-text">
                    <b>Cảnh báo bẫy:</b> {pair.trapNote}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          BẢNG 2: TỪ ĐIỂN TỪ KHÓA TUYỆT ĐỐI HÓA & NHẠY CẢM
          ========================================================================= */}
      <section className="radar-card-section">
        <div className="radar-section-header">
          <div className="row" style={{ gap: '10px' }}>
            <span className="radar-badge-pill pill-alert">BẢNG 2</span>
            <div>
              <h3 className="radar-section-title">
                Từ Điển "Từ Khóa Tuyệt Đối Hóa & Nhạy Cảm" Cần Cảnh Giác
              </h3>
              <p className="small muted">
                Gặp các từ này trong phương án trắc nghiệm: <b>90% là bẫy sai</b> do tuyệt đối hoá mức độ hoặc đánh tráo thời điểm.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={() => setIsAddWordModal(true)}
          >
            + Thêm Từ Khóa
          </button>
        </div>

        <div className="sensitive-words-grid">
          {radarData.sensitiveWords?.map((sw) => (
            <div key={sw.id} className="sensitive-word-card">
              <div className="sw-top-row">
                <div className="row" style={{ gap: '8px' }}>
                  <span className="sw-keyword-badge">"{sw.word}"</span>
                  <span className="sw-level-pill">{sw.level}</span>
                </div>
                <button
                  type="button"
                  className="pair-del-btn"
                  title="Xoá từ này"
                  onClick={() => handleDeleteWord(sw.id)}
                >
                  ✕
                </button>
              </div>

              <p className="sw-explanation">{sw.trapExplanation}</p>

              {/* Ví dụ câu sai và cách sửa */}
              <div className="sw-examples-box">
                <div className="sw-wrong-row">
                  <span className="sw-tag tag-wrong">✕ CÂU SAI ĐIỂN HÌNH:</span>
                  <p className="sw-example-text wrong">"{sw.wrongExample}"</p>
                </div>

                <div className="sw-correct-row">
                  <span className="sw-tag tag-correct">✓ BẢN CHẤT ĐÚNG:</span>
                  <p className="sw-example-text correct">{sw.correctRule}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          BẢNG 3: DANH SÁCH CÁC ĐOẠN TRỌNG TÂM DẠ QUANG TỪ SÁCH GIÁO KHOA SỐ
          ========================================================================= */}
      <section className="radar-card-section">
        <div className="radar-section-header">
          <div className="row" style={{ gap: '10px' }}>
            <span className="radar-badge-pill pill-highlight">BẢNG 3</span>
            <div>
              <h3 className="radar-section-title">
                Các Đoạn Trọng Tâm Dạ Quang Đã Đánh Dấu Từ Sách Giáo Khoa Số
              </h3>
              <p className="small muted">
                Tự động đồng bộ các cụm từ, mốc thời gian và mệnh đề bạn đã dùng bút dạ quang tô sáng trong tab Kiến thức.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ios-btn sm ios-btn-secondary"
            onClick={() => onSwitchTab?.('theory')}
          >
            Sang Tab Kiến Thức để Tô Thêm →
          </button>
        </div>

        {userHighlights.length === 0 ? (
          <div className="empty-highlights-box">
            <span className="empty-hl-icon">🖍️</span>
            <h4>Chưa có đoạn văn nào được tô bút dạ quang</h4>
            <p className="small muted">
              Hãy sang tab <b>Kiến thức</b>, dùng chuột hoặc chạm bôi đen các câu quan trọng trong sách giáo khoa để tự động đưa vào danh sách trọng tâm này.
            </p>
            <button
              type="button"
              className="ios-btn sm ios-btn-primary"
              onClick={() => onSwitchTab?.('theory')}
              style={{ marginTop: '10px' }}
            >
              Mở Sách Giáo Khoa Ngay
            </button>
          </div>
        ) : (
          <div className="highlighted-snippets-grid">
            {userHighlights.map((term, idx) => {
              const tag = highlightTags[term] || '#Mốc-Thực-Thể';
              return (
                <div key={idx} className="highlight-snippet-item">
                  <div className="snippet-top-row">
                    <span className="snippet-index">#{idx + 1}</span>
                    <span className="snippet-tag-badge">{tag}</span>
                    <button
                      type="button"
                      className="pair-del-btn"
                      title="Bỏ tô đoạn này"
                      onClick={() => onRemoveHighlight?.(term)}
                    >
                      ✕
                    </button>
                  </div>

                  <blockquote className="snippet-quote-text">
                    "{term}"
                  </blockquote>

                  <div className="snippet-footer-row">
                    <button
                      type="button"
                      className="snippet-goto-btn"
                      onClick={() => onSwitchTab?.('theory')}
                    >
                      Xem vị trí trong bài đọc ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          KHU VỰC PHỤ TRỢ: GIẤY NHỚ GÓC TRAO ĐỔI & SƠ ĐỒ TƯ DUY ẢNH
          ========================================================================= */}
      <section className="radar-legacy-notes-section">
        <LessonNotes lessonId={lessonId} notes={notes} onNotesChanged={onNotesChanged} />
      </section>

      {/* =========================================================================
          MODAL THÊM CẶP KHÁI NIỆM MỚI (A ≠ B)
          ========================================================================= */}
      {isAddPairModal && (
        <FormDialog
          title="+ Thêm Cặp Khái Niệm Dễ Đánh Tráo (A ≠ B)"
          onClose={() => setIsAddPairModal(false)}
        >
          <form onSubmit={handleAddPair} className="radar-form-dialog">
            <label className="field">
              <span>Tiêu đề phân biệt *</span>
              <input
                type="text"
                required
                value={pairTitle}
                onChange={(e) => setPairTitle(e.target.value)}
                placeholder="VD: Khởi đầu kháng chiến toàn quốc vs Khởi đầu kháng chiến chống Pháp..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field-group">
                <label className="field">
                  <span>Khái niệm A *</span>
                  <input
                    type="text"
                    required
                    value={sideALabel}
                    onChange={(e) => setSideALabel(e.target.value)}
                    placeholder="VD: Kháng chiến toàn quốc (12-1946)"
                  />
                </label>
                <label className="field">
                  <span>Bản chất vế A</span>
                  <textarea
                    rows={2}
                    value={sideADesc}
                    onChange={(e) => setSideADesc(e.target.value)}
                    placeholder="Tóm tắt ý nghĩa vế A..."
                  />
                </label>
              </div>

              <div className="field-group">
                <label className="field">
                  <span>Khái niệm B *</span>
                  <input
                    type="text"
                    required
                    value={sideBLabel}
                    onChange={(e) => setSideBLabel(e.target.value)}
                    placeholder="VD: Kháng chiến chống Pháp (9-1945)"
                  />
                </label>
                <label className="field">
                  <span>Bản chất vế B</span>
                  <textarea
                    rows={2}
                    value={sideBDesc}
                    onChange={(e) => setSideBDesc(e.target.value)}
                    placeholder="Tóm tắt ý nghĩa vế B..."
                  />
                </label>
              </div>
            </div>

            <label className="field">
              <span>Cảnh báo bẫy đánh tráo trong đề thi</span>
              <textarea
                rows={2}
                value={pairTrapNote}
                onChange={(e) => setPairTrapNote(e.target.value)}
                placeholder="Đề thi hay bẫy ở điểm nào..."
              />
            </label>

            <div className="row between" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => setIsAddPairModal(false)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="ios-btn sm ios-btn-primary">
                Lưu Cặp Khái Niệm
              </button>
            </div>
          </form>
        </FormDialog>
      )}

      {/* =========================================================================
          MODAL THÊM TỪ KHÓA NHẠY CẢM MỚI
          ========================================================================= */}
      {isAddWordModal && (
        <FormDialog
          title="+ Thêm Từ Khóa Báo Động Đỏ"
          onClose={() => setIsAddWordModal(false)}
        >
          <form onSubmit={handleAddWord} className="radar-form-dialog">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Từ khóa nhạy cảm *</span>
                <input
                  type="text"
                  required
                  value={swWord}
                  onChange={(e) => setSwWord(e.target.value)}
                  placeholder="VD: hoàn toàn, duy nhất, ngay lập tức..."
                />
              </label>

              <label className="field">
                <span>Mức độ cảnh báo</span>
                <select value={swLevel} onChange={(e) => setSwLevel(e.target.value)}>
                  <option value="Báo động đỏ (Tỷ lệ bẫy 95%)">Báo động đỏ (Tỷ lệ bẫy 95%)</option>
                  <option value="Nhạy cảm cao (Tỷ lệ bẫy 90%)">Nhạy cảm cao (Tỷ lệ bẫy 90%)</option>
                  <option value="Cảnh báo vừa (Tỷ lệ bẫy 80%)">Cảnh báo vừa (Tỷ lệ bẫy 80%)</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Bản chất bẫy thường gặp</span>
              <textarea
                rows={2}
                value={swExplanation}
                onChange={(e) => setSwExplanation(e.target.value)}
                placeholder="VD: Tuyệt đối hoá kết quả chưa đạt được..."
              />
            </label>

            <label className="field">
              <span>Ví dụ câu sai điển hình trong đề thi</span>
              <textarea
                rows={2}
                value={swWrongExample}
                onChange={(e) => setSwWrongExample(e.target.value)}
                placeholder="VD: LHQ đã giải quyết hoàn toàn các xung đột..."
              />
            </label>

            <label className="field">
              <span>Bản chất đúng cần ghi nhớ</span>
              <textarea
                rows={2}
                value={swCorrectRule}
                onChange={(e) => setSwCorrectRule(e.target.value)}
                placeholder="VD: Xung đột cục bộ vẫn diễn ra phức tạp..."
              />
            </label>

            <div className="row between" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => setIsAddWordModal(false)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="ios-btn sm ios-btn-primary">
                Lưu Từ Khóa
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}

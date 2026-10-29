import { useState, useMemo, useEffect } from 'react';
import { FormDialog } from './Modal';
import LessonFlashcards from './LessonFlashcards';

// Dữ liệu mẫu chuẩn hoá của Bài 1: Liên hợp quốc & ASEAN (Bộ GD&ĐT 2026)
export const DEFAULT_BAI1_REVIEW_DATA = {
  milestones: [
    {
      id: 'ms-1',
      time: '25-4 đến 26-6-1945',
      entityName: 'Hội nghị Xan Phran-xi-xcô (Mỹ)',
      note: '50 quốc gia họp bàn và thông qua bản Hiến chương Liên hợp quốc.',
      typeTag: '#Văn_kiện',
      spaceTag: '#Châu_Mỹ',
      eraTag: '#1919-1945',
    },
    {
      id: 'ms-2',
      time: '24-10-1945',
      entityName: 'Hiến chương Liên hợp quốc chính thức có hiệu lực',
      note: 'Đánh dấu sự thành lập chính thức của Liên hợp quốc (Ngày Liên hợp quốc hàng năm).',
      typeTag: '#Văn_kiện',
      spaceTag: '#Châu_Mỹ',
      eraTag: '#1919-1945',
    },
    {
      id: 'ms-3',
      time: '20-9-1977',
      entityName: 'Việt Nam gia nhập Liên hợp quốc (Thành viên 149)',
      note: 'Tại kỳ họp thứ 32 của Đại hội đồng LHQ, mở ra thời kỳ hội nhập đa phương toàn cầu.',
      typeTag: '#Sự_kiện',
      spaceTag: '#Việt_Nam',
      eraTag: '#Đổi_mới',
    },
    {
      id: 'ms-4',
      time: '8-8-1967',
      entityName: 'Thành lập Hiệp hội các quốc gia Đông Nam Á (ASEAN)',
      note: '5 nước sáng lập (In-đô-nê-xi-a, Ma-lai-xi-a, Phi-líp-pin, Xin-ga-po, Thái Lan) ký Tuyên bố Băng Cốc.',
      typeTag: '#Tổ_chức',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Chống_Mỹ',
    },
    {
      id: 'ms-5',
      time: '28-7-1995',
      entityName: 'Việt Nam chính thức gia nhập ASEAN (Thành viên thứ 7)',
      note: 'Đánh dấu bước ngoặt hoà nhập khu vực của Việt Nam trong công cuộc Đổi mới.',
      typeTag: '#Sự_kiện',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Đổi_mới',
    },
    {
      id: 'ms-6',
      time: '31-12-2015',
      entityName: 'Chính thức thành lập Cộng đồng ASEAN',
      note: 'Hiện thực hoá 3 trụ cột liên kết: Chính trị - An ninh (APSC), Kinh tế (AEC), Văn hoá - Xã hội (ASCC).',
      typeTag: '#Tổ_chức',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Đổi_mới',
    },
  ],
  axes: [
    {
      id: 'ax-1',
      subject: 'Liên hợp quốc',
      period: '1945 – 1975',
      progressBadge: 'Hoàn thành',
      verb: 'Thông qua và ký kết',
      content: 'Hiến chương Liên hợp quốc xác lập nguyên tắc nhất trí 5 nước lớn HĐBA.',
    },
    {
      id: 'ax-2',
      subject: 'Liên hợp quốc',
      period: '1975 – 1991',
      progressBadge: 'Tiếp tục đẩy mạnh',
      verb: 'Triển khai lực lượng',
      content: 'Gìn giữ hoà bình tại các điểm nóng xung đột, ngăn chặn thảm hoạ CTTG III.',
    },
    {
      id: 'ax-3',
      subject: 'Liên hợp quốc',
      period: '1991 – nay',
      progressBadge: 'Hoàn thành',
      verb: 'Đề ra và thúc đẩy',
      content: '17 Mục tiêu phát triển bền vững (SDGs) đến năm 2030 và ứng phó biến đổi khí hậu.',
    },
    {
      id: 'ax-4',
      subject: 'ASEAN',
      period: '1945 – 1975',
      progressBadge: 'Bắt đầu',
      verb: 'Ký kết',
      content: 'Tuyên bố Băng Cốc (1967) đặt nền móng hợp tác khu vực Đông Nam Á.',
    },
    {
      id: 'ax-5',
      subject: 'ASEAN',
      period: '1975 – 1991',
      progressBadge: 'Hoàn thành',
      verb: 'Ký kết',
      content: 'Hiệp ước Ba-li (1976) xác lập nguyên tắc đồng thuận và tôn trọng chủ quyền.',
    },
    {
      id: 'ax-6',
      subject: 'ASEAN',
      period: '1991 – nay',
      progressBadge: 'Hoàn thành',
      verb: 'Chính thức thành lập',
      content: 'Cộng đồng ASEAN (2015) với 3 trụ cột vững chắc, hoàn tất ASEAN 10.',
    },
  ],
  causeEffects: [
    {
      id: 'ce-1',
      eventTitle: 'Sự ra đời và hoạt động của Liên hợp quốc (1945 – nay)',
      inputsKhachQuan: [
        'Chiến tranh thế giới thứ hai tàn phá khốc liệt nhân loại, để lại hậu quả thảm hoạ nặng nề.',
        'Nguyện vọng tha thiết của nhân dân toàn thế giới là bảo vệ nền hoà bình và an ninh quốc tế bền vững.',
      ],
      inputsChuQuan: [
        'Sự nhất trí và thoả hiệp chiến lược giữa ba cường quốc lớn (Liên Xô, Mỹ, Anh) tại Hội nghị I-an-ta.',
        'Ý chí và sự phê chuẩn của 50 quốc gia sáng lập viên đối với bản Hiến chương tiến bộ.',
      ],
      outputsVietNam: [
        'Tạo diễn đàn đa phương toàn cầu giúp Việt Nam nâng cao vị thế và tranh thủ nguồn lực phát triển.',
        'Việt Nam 2 lần đảm nhiệm xuất sắc Uỷ viên không thường trực Hội đồng Bảo an (2008-2009, 2020-2021).',
      ],
      outputsQuocTe: [
        'Ngăn ngừa thành công nguy cơ bùng nổ một cuộc chiến tranh thế giới mới mang tính hủy diệt hạt nhân.',
        'Thúc đẩy giải trừ chủ nghĩa thực dân, bảo vệ nhân quyền và cứu trợ nhân đạo toàn cầu.',
      ],
      exaggerationTraps: [
        'Bẫy sai: "Liên hợp quốc là chính phủ toàn cầu có quyền can thiệp vào pháp luật nội bộ của các quốc gia". (Sai: Bình đẳng chủ quyền, không can thiệp nội bộ)',
        'Bẫy phóng đại: "Liên hợp quốc đã ngăn chặn và giải quyết triệt để mọi xung đột vũ trang trên hành tinh". (Sai: Xung đột cục bộ vẫn xảy ra)',
      ],
    },
  ],
  comparisons: [
    {
      id: 'cmp-1',
      title: 'Đối chiếu Liên hợp quốc (1945) vs ASEAN (1967)',
      eventA: {
        name: 'Liên hợp quốc (1945)',
        context: 'Sau CTTG II (1945), nhân loại cần một tổ chức toàn cầu duy trì trật tự thế giới mới.',
        target: 'Duy trì hoà bình, an ninh quốc tế và hợp tác đa phương toàn cầu.',
        mechanism: 'Nguyên tắc nhất trí giữa 5 nước uỷ viên thường trực Hội đồng Bảo an (veto).',
        scope: 'Tổ chức toàn cầu lớn nhất hành tinh (hiện có 193 quốc gia thành viên).',
      },
      eventB: {
        name: 'ASEAN (1967)',
        context: 'Trong Chiến tranh lạnh (1967), các nước ĐNA cần hợp tác để ổn định và phát triển.',
        target: 'Thúc đẩy tăng trưởng kinh tế, tiến bộ xã hội và hoà bình, ổn định khu vực.',
        mechanism: 'Nguyên tắc đồng thuận (consensus) giữa tất cả các nước thành viên.',
        scope: 'Tổ chức hợp tác liên chính phủ cấp khu vực Đông Nam Á (hiện có 10 thành viên).',
      },
      similarities: [
        'Đều là tổ chức liên chính phủ nhằm duy trì hoà bình, an ninh và hợp tác phát triển.',
        'Đều tôn trọng độc lập, chủ quyền, giải quyết tranh chấp bằng biện pháp hoà bình, không can thiệp nội bộ.',
      ],
      differences: [
        'Phạm vi hoạt động: Liên hợp quốc mang tính toàn cầu; ASEAN mang tính khu vực.',
        'Cơ chế biểu quyết: HĐBA LHQ áp dụng quyền phủ quyết của 5 nước lớn; ASEAN áp dụng cơ chế đồng thuận.',
      ],
      lessons: 'Thực hiện đường lối đối ngoại độc lập, tự chủ, đa phương hoá, đa dạng hoá; chủ động hội nhập quốc tế.',
      blacklist: ['liên minh phòng thủ quân sự', 'đối đầu khối quân sự', 'bao cấp kinh tế'],
    },
  ],
};

export default function LessonReviewHub({ lessonId, lessonTitle = 'Bài học', flashcards = [], onCountChange }) {
  // 4 Chế độ sơ đồ (Sub-tabs)
  const [subTab, setSubTab] = useState('milestones'); // 'milestones' | 'axes' | 'causeEffects' | 'comparisons' | 'flashcards'

  // Modal thêm mục mới
  const [addModal, setAddModal] = useState(false);
  const [addType, setAddType] = useState('milestone'); // 'milestone' | 'axis' | 'causeEffect' | 'comparison'

  // Dữ liệu ôn tập của bài học (Được lưu trong localStorage và cập nhật tự động)
  const storageKey = `lesson_study_data_${lessonId}`;
  const [studyData, setStudyData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.milestones?.length || parsed.axes?.length || parsed.causeEffects?.length || parsed.comparisons?.length) {
          return parsed;
        }
      }
      return DEFAULT_BAI1_REVIEW_DATA;
    } catch {
      return DEFAULT_BAI1_REVIEW_DATA;
    }
  });

  // Tự động tính tổng số mục ôn tập và đẩy lên Badge của Tab Ôn tập cha
  const totalCount = useMemo(() => {
    const msCount = studyData.milestones?.length || 0;
    const axCount = studyData.axes?.length || 0;
    const ceCount = studyData.causeEffects?.length || 0;
    const cmpCount = studyData.comparisons?.length || 0;
    return msCount + axCount + ceCount + cmpCount;
  }, [studyData]);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(totalCount);
    }
  }, [totalCount, onCountChange]);

  // Lưu thay đổi vào localStorage
  const saveStudyData = (nextData) => {
    setStudyData(nextData);
    localStorage.setItem(storageKey, JSON.stringify(nextData));
  };

  // State form thêm Mốc mới
  const [mTime, setMTime] = useState('');
  const [mEntity, setMEntity] = useState('');
  const [mTypeTag, setMTypeTag] = useState('#Văn_kiện');
  const [mSpaceTag, setMSpaceTag] = useState('#Việt_Nam');
  const [mEraTag, setMEraTag] = useState('#1919-1945');
  const [mNote, setMNote] = useState('');

  const handleAddMilestone = (e) => {
    e?.preventDefault();
    if (!mTime.trim() || !mEntity.trim()) return;
    const newMs = {
      id: 'ms-user-' + Date.now(),
      time: mTime.trim(),
      entityName: mEntity.trim(),
      note: mNote.trim() || 'Mốc sự kiện được thêm vào sổ ôn tập.',
      typeTag: mTypeTag,
      spaceTag: mSpaceTag,
      eraTag: mEraTag,
    };
    saveStudyData({
      ...studyData,
      milestones: [newMs, ...(studyData.milestones || [])],
    });
    setAddModal(false);
    setMTime('');
    setMEntity('');
    setMNote('');
  };

  return (
    <div className="review-hub-container">
      {/* =========================================================================
          THANH CHUYỂN ĐỔI 4 CHẾ ĐỘ SƠ ĐỒ (SUB-TABS) PHONG CÁCH PILL HỒNG/ĐỎ
          ========================================================================= */}
      <div className="review-subtabs-bar">
        <div className="subtabs-pill-group">
          {/* 1. Sơ đồ Mốc & Nhãn (Lõi 1) */}
          <button
            type="button"
            className={`review-subtab-pill ${subTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setSubTab('milestones')}
          >
            <span className="pill-prefix">Lõi 1</span>
            <span>Sơ đồ Mốc & Nhãn</span>
            <span className="pill-count">{studyData.milestones?.length || 0}</span>
          </button>

          {/* 2. Chia trục Chủ thể & Giai đoạn (Lõi 2 & 4) */}
          <button
            type="button"
            className={`review-subtab-pill ${subTab === 'axes' ? 'active' : ''}`}
            onClick={() => setSubTab('axes')}
          >
            <span className="pill-prefix">Lõi 2 & 4</span>
            <span>Chia trục Chủ thể & Giai đoạn</span>
            <span className="pill-count">{studyData.axes?.length || 0}</span>
          </button>

          {/* 3. Sơ đồ Nhân - Quả (Lõi 3) */}
          <button
            type="button"
            className={`review-subtab-pill ${subTab === 'causeEffects' ? 'active' : ''}`}
            onClick={() => setSubTab('causeEffects')}
          >
            <span className="pill-prefix">Lõi 3</span>
            <span>Sơ đồ Nhân - Quả</span>
            <span className="pill-count">{studyData.causeEffects?.length || 0}</span>
          </button>

          {/* 4. Bàn cân Đối chiếu & Bài học (Lõi 5) */}
          <button
            type="button"
            className={`review-subtab-pill ${subTab === 'comparisons' ? 'active' : ''}`}
            onClick={() => setSubTab('comparisons')}
          >
            <span className="pill-prefix">Lõi 5</span>
            <span>Bàn cân Đối chiếu & Bài học</span>
            <span className="pill-count">{studyData.comparisons?.length || 0}</span>
          </button>

          {/* Phụ trợ: Thẻ lật phản xạ 3D */}
          {flashcards.length > 0 && (
            <button
              type="button"
              className={`review-subtab-pill ${subTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setSubTab('flashcards')}
            >
              <span>Thẻ lật 3D</span>
              <span className="pill-count">{flashcards.length}</span>
            </button>
          )}
        </div>

        <div className="subtabs-action-group">
          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={() => {
              setAddType(
                subTab === 'milestones'
                  ? 'milestone'
                  : subTab === 'axes'
                  ? 'axis'
                  : subTab === 'causeEffects'
                  ? 'causeEffect'
                  : 'comparison'
              );
              setAddModal(true);
            }}
          >
            + Thêm mục ôn tập
          </button>
        </div>
      </div>

      {/* =========================================================================
          NỘI DUNG CHI TIẾT TỪNG CHẾ ĐỘ SƠ ĐỒ
          ========================================================================= */}
      <div className="review-subtab-body">
        {/* ---------------------------------------------------------------------
            SUB-TAB 1: SƠ ĐỒ MỐC & NHÃN (LÕI 1 - ĐỊNH DANH)
            --------------------------------------------------------------------- */}
        {subTab === 'milestones' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 1: Trục Sơ đồ Mốc thời gian & Nhãn định vị</h3>
                <p className="small muted">
                  Hệ thống mốc thời gian kèm 3 nhóm nhãn loại thực thể, không gian và thời kỳ để rèn luyện quy tắc loại trừ đề thi THPTQG.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {studyData.milestones?.length || 0} mốc trọng tâm
              </span>
            </div>

            <div className="milestone-timeline-grid">
              {(studyData.milestones || []).map((m) => (
                <div key={m.id} className="milestone-card">
                  <div className="milestone-card-top">
                    <span className="time-badge">{m.time}</span>
                    <div className="tag-badges-row">
                      <span className="tag-pill tag-type">{m.typeTag}</span>
                      <span className="tag-pill tag-space">{m.spaceTag}</span>
                      <span className="tag-pill tag-era">{m.eraTag}</span>
                    </div>
                  </div>

                  <h4 className="entity-name">{m.entityName}</h4>
                  <p className="entity-note">{m.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB 2: CHIA TRỤC CHỦ THỂ & GIAI ĐOẠN (LÕI 2 - HÀNH ĐỘNG & LÕI 4 - BẢN CHẤT)
            --------------------------------------------------------------------- */}
        {subTab === 'axes' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 2 & 4: Bảng Chia trục Chủ thể & Giai đoạn thời gian</h3>
                <p className="small muted">
                  Rèn luyện phản xạ bắt động từ chuẩn 3 mảnh ghép: <b>[Tiến độ]</b> + <b>[Động từ hành động]</b> + <b>[Mục tiêu / Đối tượng]</b>.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {studyData.axes?.length || 0} hành động cốt lõi
              </span>
            </div>

            <div className="axes-cards-grid">
              {(studyData.axes || []).map((ax) => (
                <div key={ax.id} className="axis-item-card">
                  <div className="axis-card-header">
                    <span className="subject-pill">{ax.subject}</span>
                    <span className="period-pill">{ax.period}</span>
                  </div>

                  <div className="axis-formula-box">
                    <span className="badge-progress">{ax.progressBadge}</span>
                    <b className="verb-text">{ax.verb}</b>
                    <span className="content-text">{ax.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB 3: SƠ ĐỒ NHÂN - QUẢ (LÕI 3 - TRƯỚC & SAU SỰ KIỆN)
            --------------------------------------------------------------------- */}
        {subTab === 'causeEffects' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 3: Sơ đồ Nhân - Quả 3 khối (Trước ➔ Sự kiện ➔ Sau)</h3>
                <p className="small muted">
                  Phân tách rạch ròi Khách quan / Chủ quan và Ý nghĩa Việt Nam / Quốc tế kèm nhận diện Bẫy phóng đại.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {studyData.causeEffects?.length || 0} sơ đồ nhân quả
              </span>
            </div>

            {(studyData.causeEffects || []).map((ce) => (
              <div key={ce.id} className="cause-effect-wrapper">
                {/* 3 Cột luồng */}
                <div className="ce-flow-grid">
                  {/* Cột 1: Đầu vào */}
                  <div className="ce-col ce-input">
                    <span className="ce-step-badge">1. ĐẦU VÀO</span>
                    <h4>Bối cảnh & Nguyên nhân</h4>

                    <div className="ce-sub-compartment">
                      <span className="comp-title">Khách quan (Bên ngoài):</span>
                      <ul>
                        {ce.inputsKhachQuan?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="ce-sub-compartment">
                      <span className="comp-title">Chủ quan (Nội lực quyết định):</span>
                      <ul>
                        {ce.inputsChuQuan?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Mũi tên */}
                  <div className="ce-arrow-divider">➔</div>

                  {/* Cột 2: Sự kiện trung tâm */}
                  <div className="ce-col ce-event">
                    <span className="ce-step-badge">2. SỰ KIỆN TRUNG TÂM</span>
                    <h3 className="ce-event-title">{ce.eventTitle}</h3>
                    <p className="small muted" style={{ marginTop: '6px' }}>
                      Mốc xác lập trật tự và kiến tạo nền tảng hợp tác an ninh, kinh tế thế giới.
                    </p>
                  </div>

                  {/* Mũi tên */}
                  <div className="ce-arrow-divider">➔</div>

                  {/* Cột 3: Đầu ra */}
                  <div className="ce-col ce-output">
                    <span className="ce-step-badge">3. ĐẦU RA</span>
                    <h4>Ý nghĩa lịch sử</h4>

                    <div className="ce-sub-compartment">
                      <span className="comp-title">Ý nghĩa đối với Việt Nam:</span>
                      <ul>
                        {ce.outputsVietNam?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="ce-sub-compartment">
                      <span className="comp-title">Ý nghĩa Quốc tế:</span>
                      <ul>
                        {ce.outputsQuocTe?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Hộp bẫy cờ đỏ */}
                {ce.exaggerationTraps?.length > 0 && (
                  <div className="ce-redflag-box">
                    <b style={{ color: '#DC2626', fontSize: '0.86rem' }}>
                      🚩 Bẫy phóng đại trong đề thi (Tuyệt đối hoá mức độ chưa đạt tới):
                    </b>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: '#991B1B', fontSize: '0.84rem' }}>
                      {ce.exaggerationTraps.map((tr, idx) => (
                        <li key={idx}>{tr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB 4: BÀN CÂN ĐỐI CHIẾU & BÀI HỌC (LÕI 5 - SO SÁNH & VẬN DỤNG)
            --------------------------------------------------------------------- */}
        {subTab === 'comparisons' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 5: Bàn cân Đối chiếu & Bài học vượt thời gian</h3>
                <p className="small muted">
                  Bảng đối chiếu 4 tiêu chí cố định (Bối cảnh, Mục tiêu, Cơ chế, Quy mô) và danh sách Từ khoá thời chiến BỊ LOẠI TRỪ.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {studyData.comparisons?.length || 0} bảng đối chiếu
              </span>
            </div>

            {(studyData.comparisons || []).map((cmp) => (
              <div key={cmp.id} className="comparison-card">
                <h4 className="cmp-title">{cmp.title}</h4>

                {/* Bảng so sánh 4 tiêu chí */}
                <table className="cmp-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Tiêu chí đối chiếu</th>
                      <th style={{ width: '37.5%' }}>{cmp.eventA?.name}</th>
                      <th style={{ width: '37.5%' }}>{cmp.eventB?.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="cmp-criteria">1. Bối cảnh lịch sử</td>
                      <td>{cmp.eventA?.context}</td>
                      <td className="cmp-diff">{cmp.eventB?.context}</td>
                    </tr>
                    <tr>
                      <td className="cmp-criteria">2. Mục tiêu trọng tâm</td>
                      <td>{cmp.eventA?.target}</td>
                      <td>{cmp.eventB?.target}</td>
                    </tr>
                    <tr>
                      <td className="cmp-criteria">3. Cơ chế biểu quyết</td>
                      <td>{cmp.eventA?.mechanism}</td>
                      <td className="cmp-diff">{cmp.eventB?.mechanism}</td>
                    </tr>
                    <tr>
                      <td className="cmp-criteria">4. Quy mô & Phạm vi</td>
                      <td>{cmp.eventA?.scope}</td>
                      <td className="cmp-diff">{cmp.eventB?.scope}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Điểm tương đồng & Khác biệt */}
                <div className="cmp-summary-row">
                  <div className="cmp-summary-col">
                    <span className="summary-title" style={{ color: '#059669' }}>✓ Điểm tương đồng:</span>
                    <ul>
                      {cmp.similarities?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cmp-summary-col">
                    <span className="summary-title" style={{ color: '#BE123C' }}>★ Điểm khác biệt / Điểm mới:</span>
                    <ul>
                      {cmp.differences?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bài học hiện nay & Blacklist */}
                <div className="cmp-lesson-footer">
                  <div className="lesson-box">
                    <b>★ Bài học cho hiện nay:</b> {cmp.lessons}
                  </div>
                  {cmp.blacklist?.length > 0 && (
                    <div className="blacklist-box">
                      <b>⛔ Từ khoá thời chiến bị loại trừ (Không chọn cho hiện nay):</b>
                      <div className="bl-chips">
                        {cmp.blacklist.map((w, wi) => (
                          <span key={wi} className="bl-chip">✕ "{w}"</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB PHỤ TRỢ: THẺ LẬT 3D (ACTIVE RECALL FLASHCARDS)
            --------------------------------------------------------------------- */}
        {subTab === 'flashcards' && flashcards.length > 0 && (
          <div className="review-core-pane">
            <LessonFlashcards cards={flashcards} />
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL THÊM MỤC ÔN TẬP THỦ CÔNG
          ========================================================================= */}
      {addModal && (
        <FormDialog
          title="+ Thêm Mốc Tri Thức vào Tab Ôn tập"
          onClose={() => setAddModal(false)}
        >
          <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
            <label className="field">
              <span>Mốc thời gian (VD: 24-10-1945, năm 1967...) *</span>
              <input
                type="text"
                required
                value={mTime}
                onChange={(e) => setMTime(e.target.value)}
                placeholder="Nhập mốc thời gian..."
              />
            </label>

            <label className="field">
              <span>Tên thực thể / Danh từ đích *</span>
              <input
                type="text"
                required
                value={mEntity}
                onChange={(e) => setMEntity(e.target.value)}
                placeholder="VD: Liên hợp quốc, ASEAN, Hiến chương..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <label className="field">
                <span>Loại thực thể</span>
                <select value={mTypeTag} onChange={(e) => setMTypeTag(e.target.value)}>
                  <option value="#Văn_kiện">#Văn_kiện</option>
                  <option value="#Tổ_chức">#Tổ_chức</option>
                  <option value="#Quốc_gia">#Quốc_gia</option>
                  <option value="#Nhân_vật">#Nhân_vật</option>
                  <option value="#Sự_kiện">#Sự_kiện</option>
                </select>
              </label>

              <label className="field">
                <span>Không gian</span>
                <select value={mSpaceTag} onChange={(e) => setMSpaceTag(e.target.value)}>
                  <option value="#Việt_Nam">#Việt_Nam</option>
                  <option value="#Đông_Nam_Á">#Đông_Nam_Á</option>
                  <option value="#Châu_Mỹ">#Châu_Mỹ</option>
                  <option value="#Châu_Âu">#Châu_Âu</option>
                </select>
              </label>

              <label className="field">
                <span>Thời kỳ</span>
                <select value={mEraTag} onChange={(e) => setMEraTag(e.target.value)}>
                  <option value="#1919-1945">#1919-1945</option>
                  <option value="#Chống_Pháp">#Chống_Pháp</option>
                  <option value="#Chống_Mỹ">#Chống_Mỹ</option>
                  <option value="#Đổi_mới">#Đổi_mới</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Ghi chú bối cảnh</span>
              <textarea
                rows={2}
                value={mNote}
                onChange={(e) => setMNote(e.target.value)}
                placeholder="Tóm tắt ý nghĩa mốc tri thức..."
              />
            </label>

            <div className="row between" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => setAddModal(false)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="ios-btn sm ios-btn-primary">
                Lưu vào Tab Ôn tập
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}

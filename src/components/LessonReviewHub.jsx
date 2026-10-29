import { useState, useMemo, useEffect } from 'react';
import { FormDialog } from './Modal';
import LessonFlashcards from './LessonFlashcards';
import MilestoneDiagram from './MilestoneDiagram';
import AxesDiagram from './AxesDiagram';
import CauseEffectDiagram, { DEFAULT_CAUSE_EFFECT_LIST } from './CauseEffectDiagram';
import ComparisonDiagram, { DEFAULT_COMPARISONS_LIST } from './ComparisonDiagram';

// Dữ liệu mẫu chuẩn hoá của Bài 1: Liên hợp quốc & ASEAN (Bộ GD&ĐT 2026)
export const DEFAULT_BAI1_REVIEW_DATA = {
  milestones: [
    {
      id: 'ms-0',
      time: '4 đến 11-2-1945',
      entityName: 'Hội nghị I-an-ta (Liên Xô)',
      note: '3 cường quốc (Liên Xô, Mỹ, Anh) họp bàn phân chia phạm vi ảnh hưởng và thống nhất thành lập tổ chức Liên hợp quốc.',
      typeTag: '#Sự_kiện',
      spaceTag: '#Châu_Âu',
      eraTag: '#1919-1945',
      customTags: ['#Phân_chia_phạm_vi', '#Nền_tảng_LHQ'],
    },
    {
      id: 'ms-1',
      time: '25-4 đến 26-6-1945',
      entityName: 'Hội nghị Xan Phran-xi-xcô (Mỹ)',
      note: '50 quốc gia họp bàn và thông qua bản Hiến chương Liên hợp quốc.',
      typeTag: '#Văn_kiện',
      spaceTag: '#Châu_Mỹ',
      eraTag: '#1919-1945',
      customTags: ['#50_quốc_gia', '#Hiến_chương'],
    },
    {
      id: 'ms-2',
      time: '24-10-1945',
      entityName: 'Hiến chương Liên hợp quốc chính thức có hiệu lực',
      note: 'Đánh dấu sự thành lập chính thức của Liên hợp quốc (Ngày Liên hợp quốc hàng năm).',
      typeTag: '#Văn_kiện',
      spaceTag: '#Châu_Mỹ',
      eraTag: '#1919-1945',
      customTags: ['#Thành_lập_LHQ', '#Ngày_LHQ'],
    },
    {
      id: 'ms-3',
      time: '8-8-1967',
      entityName: 'Thành lập Hiệp hội các quốc gia Đông Nam Á (ASEAN)',
      note: '5 nước sáng lập (In-đô-nê-xi-a, Ma-lai-xi-a, Phi-líp-pin, Xin-ga-po, Thái Lan) ký Tuyên bố Băng Cốc.',
      typeTag: '#Tổ_chức',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Chống_Mỹ',
      customTags: ['#5_nước_sáng_lập', '#Tuyên_bố_Băng_Cốc'],
    },
    {
      id: 'ms-3b',
      time: '2-1976',
      entityName: 'Ký kết Hiệp ước Thân thiện và Hợp tác Đông Nam Á (Hiệp ước Ba-li)',
      note: 'Xác định các nguyên tắc cơ bản trong quan hệ giữa các nước thành viên: tôn trọng độc lập chủ quyền, giải quyết tranh chấp bằng biện pháp hoà bình.',
      typeTag: '#Văn_kiện',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Chống_Mỹ',
      customTags: ['#Hiệp_ước_Ba_li', '#Nguyên_tắc_hoà_bình'],
    },
    {
      id: 'ms-4',
      time: '20-9-1977',
      entityName: 'Việt Nam gia nhập Liên hợp quốc (Thành viên 149)',
      note: 'Tại kỳ họp thứ 32 của Đại hội đồng LHQ, mở ra thời kỳ hội nhập đa phương toàn cầu.',
      typeTag: '#Sự_kiện',
      spaceTag: '#Việt_Nam',
      eraTag: '#Đổi_mới',
      customTags: ['#Thành_viên_149', '#Đại_hội_đồng_32'],
    },
    {
      id: 'ms-5',
      time: '28-7-1995',
      entityName: 'Việt Nam chính thức gia nhập ASEAN (Thành viên thứ 7)',
      note: 'Đánh dấu bước ngoặt hoà nhập khu vực của Việt Nam trong công cuộc Đổi mới.',
      typeTag: '#Sự_kiện',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Đổi_mới',
      customTags: ['#Thành_viên_thứ_7', '#Bước_ngoặt_Đổi_mới'],
    },
    {
      id: 'ms-5b',
      time: '11-2007',
      entityName: 'Ký kết Hiến chương ASEAN (Có hiệu lực 12-2008)',
      note: 'Tạo cơ sở pháp lý và khuôn khổ thể chế để hiện thực hoá mục tiêu xây dựng Cộng đồng ASEAN vững mạnh.',
      typeTag: '#Văn_kiện',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Đổi_mới',
      customTags: ['#Hiến_chương_ASEAN', '#Khung_pháp_lý'],
    },
    {
      id: 'ms-6',
      time: '31-12-2015',
      entityName: 'Chính thức thành lập Cộng đồng ASEAN',
      note: 'Hiện thực hoá 3 trụ cột liên kết: Chính trị - An ninh (APSC), Kinh tế (AEC), Văn hoá - Xã hội (ASCC).',
      typeTag: '#Tổ_chức',
      spaceTag: '#Đông_Nam_Á',
      eraTag: '#Đổi_mới',
      customTags: ['#3_trụ_cột', '#APSC_AEC_ASCC'],
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
  causeEffects: DEFAULT_CAUSE_EFFECT_LIST,
  comparisons: DEFAULT_COMPARISONS_LIST,
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
                <h3 className="core-lead-title">Lõi 1: Trục Sơ đồ Mốc thời gian & Quản lý Nhãn đa chiều</h3>
                <p className="small muted">
                  Chuyển đổi linh hoạt giữa Trục dọc (nhánh rẽ), Trục ngang dòng chảy và Cụm Nhãn. Rèn luyện phản xạ phát hiện bẫy nhiễu đề thi.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {studyData.milestones?.length || 0} mốc tri thức
              </span>
            </div>

            <MilestoneDiagram
              milestones={studyData.milestones || []}
              onSaveMilestones={(newMilestones) => {
                saveStudyData({
                  ...studyData,
                  milestones: newMilestones,
                });
              }}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB 2: CHIA TRỤC CHỦ THỂ & GIAI ĐOẠN (LÕI 2 - HÀNH ĐỘNG & LÕI 4 - BẢN CHẤT)
            --------------------------------------------------------------------- */}
        {subTab === 'axes' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 2 & 4: Chia Trục Chủ Thể, Giai Đoạn & Bản Chất</h3>
                <p className="small muted">
                  Tự do chia trục theo 3 kiểu mẫu: <b>Chặng Thời Gian</b>, <b>Ma Trận Chủ Thể</b> và <b>Chia Đôi Bản Chất: Bất Biến vs Vận Động</b>.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {studyData.axes?.length || 0} hành động cốt lõi
              </span>
            </div>

            <AxesDiagram
              axes={studyData.axes || []}
              onSaveAxes={(newAxes) => {
                saveStudyData({
                  ...studyData,
                  axes: newAxes,
                });
              }}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB 3: SƠ ĐỒ NHÂN - QUẢ (LÕI 3 - TRƯỚC & SAU SỰ KIỆN)
            --------------------------------------------------------------------- */}
        {subTab === 'causeEffects' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 3: Sơ Đồ Nhân - Quả 3 Khối (Trước ➔ Sự Kiện ➔ Sau)</h3>
                <p className="small muted">
                  Phân tích chuẩn xác Bối cảnh (Khách quan / Chủ quan), Kết quả sự kiện và Đầu ra (Thành tựu, Ý nghĩa VN, Quốc tế) kèm <b>Ghim Bẫy phóng đại cờ đỏ 🚩</b>.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {(studyData.causeEffects?.length || DEFAULT_CAUSE_EFFECT_LIST.length)} sơ đồ nhân quả
              </span>
            </div>

            <CauseEffectDiagram
              causeEffects={studyData.causeEffects?.length > 0 ? studyData.causeEffects : DEFAULT_CAUSE_EFFECT_LIST}
              onSaveCauseEffects={(newCauseEffects) => {
                saveStudyData({
                  ...studyData,
                  causeEffects: newCauseEffects,
                });
              }}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------------
            SUB-TAB 4: BÀN CÂN ĐỐI CHIẾU & BÀI HỌC (LÕI 5 - SO SÁNH & VẬN DỤNG)
            --------------------------------------------------------------------- */}
        {subTab === 'comparisons' && (
          <div className="review-core-pane">
            <div className="core-lead-row">
              <div>
                <h3 className="core-lead-title">Lõi 5: Bàn Cân Đối Chiếu Đa Chiều & Bài Học Kinh Nghiệm</h3>
                <p className="small muted">
                  Bảng so sánh 2–3 cột với tính năng <b>Gộp ô xanh tương đồng</b> và <b>Tách cột tô sáng khác biệt</b>. Cầu nối bài học bảo vệ Tổ quốc hôm nay & <b>Từ khoá thời chiến bị loại trừ ⛔</b>.
                </p>
              </div>
              <span className="badge" style={{ background: '#FFF0F3', color: '#BE123C' }}>
                {(studyData.comparisons?.length || DEFAULT_COMPARISONS_LIST.length)} bảng đối chiếu
              </span>
            </div>

            <ComparisonDiagram
              comparisons={studyData.comparisons?.length > 0 ? studyData.comparisons : DEFAULT_COMPARISONS_LIST}
              onSaveComparisons={(newComparisons) => {
                saveStudyData({
                  ...studyData,
                  comparisons: newComparisons,
                });
              }}
            />
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

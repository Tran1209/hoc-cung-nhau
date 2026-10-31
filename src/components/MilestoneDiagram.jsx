import { useState, useMemo } from 'react';
import { Modal } from './Modal';

// Danh mục nhãn gợi ý chuẩn thi THPTQG
export const STANDARD_TAGS = {
  types: ['#Văn_kiện', '#Tổ_chức', '#Quốc_gia', '#Địa_phương', '#Nhân_vật', '#Chiến_dịch', '#Sự_kiện', '#Triều_đại'],
  spaces: ['#Việt_Nam', '#Đông_Nam_Á', '#Châu_Mỹ', '#Châu_Âu', '#Châu_Á', '#Toàn_cầu'],
  eras: ['#Phong_kiến', '#1919-1945', '#Chống_Pháp', '#Chống_Mỹ', '#Đổi_mới'],
};

export const SUGGESTED_HASHTAGS = [
  '#Hiến_chương',
  '#Hội_nghị',
  '#Hiệp_định',
  '#Hội_nhập',
  '#Kinh_tế',
  '#Đối_ngoại',
  '#Bảo_vệ_chủ_quyền',
  '#Gìn_giữ_hoà_bình',
  '#HĐBA_LHQ',
  '#ASEAN',
  '#Việt_Nam',
  '#Đổi_mới',
  '#Độc_lập_dân_tộc',
  '#Kháng_chiến',
  '#Chiến_dịch',
];

// Phân tách chuỗi mốc thời gian thành [ngày, tháng, năm] hoặc chuỗi tự do
export function parseTimeString(str) {
  if (!str) return { day: '', month: '', year: '', isCustom: false, customStr: '' };
  const s = String(str).trim();
  
  // Trường hợp 1: D-M-YYYY hoặc DD-MM-YYYY (VD: 24-10-1945, 7-6-2019, 24/10/1945)
  const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{1,4})$/);
  if (dmyMatch) {
    return { day: dmyMatch[1], month: dmyMatch[2], year: dmyMatch[3], isCustom: false, customStr: '' };
  }

  // Trường hợp 2: M-YYYY hoặc MM-YYYY (VD: 2-1945, 12-1946, 2/1945)
  const myMatch = s.match(/^(\d{1,2})[-/.](\d{1,4})$/);
  if (myMatch) {
    return { day: '', month: myMatch[1], year: myMatch[2], isCustom: false, customStr: '' };
  }

  // Trường hợp 3: Chỉ có năm YYYY (VD: 1967, 1945, 2015)
  const yMatch = s.match(/^(\d{1,4})$/);
  if (yMatch) {
    return { day: '', month: '', year: yMatch[1], isCustom: false, customStr: '' };
  }

  // Trường hợp 4: Chuỗi kéo dài hoặc đặc biệt (VD: 25-4 đến 26-6-1945, 1945 – 1954)
  return { day: '', month: '', year: '', isCustom: true, customStr: s };
}

// Ghép lại thành chuỗi chuẩn để lưu vào sơ đồ
export function formatTimeString(day, month, year, isCustom, customStr) {
  if (isCustom) return (customStr || '').trim();
  const y = (year || '').trim();
  const m = (month || '').trim();
  const d = (day || '').trim();
  if (!y) return '';
  if (d && m) return `${d}-${m}-${y}`;
  if (m) return `${m}-${y}`;
  return y;
}


// Từ điển bẫy nhiễu mẫu thông minh theo chuẩn Bộ GD&ĐT 2026
const SMART_TRAP_RULES = {
  'Hiến chương Liên hợp quốc': [
    { name: 'Hiến chương ASEAN (2007)', note: 'Khác tổ chức và thời kỳ (ASEAN thế kỷ XXI, không phải LHQ 1945).' },
    { name: 'Tuyên bố Ba-li (1976)', note: 'Văn kiện của ASEAN đặt nền móng hợp tác Đông Nam Á, không phải LHQ.' },
    { name: 'Định ước Hen-xin-ki (1975)', note: 'Văn kiện an ninh châu Âu giữa 33 nước châu Âu cùng Mỹ và Ca-na-đa.' }
  ],
  'Hội nghị Xan Phran-xi-xcô': [
    { name: 'Hội nghị I-an-ta (2-1945)', note: 'Hội nghị 3 cường quốc phân chia khu vực đóng quân, chưa thông qua Hiến chương.' },
    { name: 'Hội nghị Pốt-xđam (7-8/1945)', note: 'Hội nghị sau khi phát xít Đức đầu hàng, bàn giải giáp quân phiệt Nhật Bản.' }
  ],
  'Thành lập Hiệp hội các quốc gia Đông Nam Á (ASEAN)': [
    { name: 'Khối quân sự SEATO (1954)', note: 'Khối liên minh quân sự do Mỹ đứng đầu, không phải tổ chức hợp tác toàn diện khu vực như ASEAN.' },
    { name: 'Tổ chức ASEAN +3 (1997)', note: 'Cơ chế mở rộng giữa ASEAN với Trung Quốc, Nhật Bản, Hàn Quốc sau khủng hoảng tài chính.' }
  ],
  'Việt Nam gia nhập Liên hợp quốc': [
    { name: 'Việt Nam gia nhập ASEAN (1995)', note: 'Gia nhập tổ chức khu vực Đổi mới, còn gia nhập LHQ là năm 1977.' },
    { name: 'Việt Nam gia nhập WTO (2007)', note: 'Gia nhập Tổ chức Thương mại Thế giới, mốc sau 30 năm kể từ ngày vào LHQ.' }
  ],
  'Việt Nam chính thức gia nhập ASEAN': [
    { name: 'Việt Nam tham gia Hiệp ước Ba-li (1992)', note: 'Bước chuẩn bị (quan sát viên), chính thức kết nạp là 28-7-1995.' },
    { name: 'Việt Nam ký Tuyên bố Băng Cốc (1967)', note: 'Sai nghiêm trọng: 1967 chỉ có 5 nước sáng lập, VN chưa tham gia.' }
  ],
  'Chính thức thành lập Cộng đồng ASEAN': [
    { name: 'Ký Hiến chương ASEAN (2007)', note: 'Hiến chương tạo khung pháp lý, đến 31-12-2015 mới chính thức ra đời Cộng đồng ASEAN.' },
    { name: 'Tuyên bố Ba-li II (2003)', note: 'Hội nghị cấp cao đưa ra ý tưởng xây dựng Cộng đồng ASEAN 3 trụ cột.' }
  ]
};

export default function MilestoneDiagram({
  milestones = [],
  allCurriculumMilestones = [],
  onSaveMilestones,
  onResetToStandard,
  lessonTitle = '',
}) {
  // Phạm vi hiển thị: 'lesson' (Mốc bài này) | 'all' (Niên biểu toàn diện 10·11·12)
  const [timelineScope, setTimelineScope] = useState('lesson');

  const sourceMilestones = timelineScope === 'all' && allCurriculumMilestones.length > 0
    ? allCurriculumMilestones
    : milestones;

  // Chế độ hiển thị: 'timeline-vertical' | 'timeline-horizontal' | 'cluster'
  const [viewMode, setViewMode] = useState('timeline-vertical');
  // Hướng gom cụm khi ở Cluster View: 'type' | 'space' | 'era'
  const [clusterDimension, setClusterDimension] = useState('type');

  // Bộ lọc nhãn & tìm kiếm
  const [activeFilterTag, setActiveFilterTag] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal thêm/sửa mốc
  const [editModal, setEditModal] = useState(null); // { mode: 'add' | 'edit', insertIndex?: number, parentId?: string, data?: object }
  
  // Trạng thái mở bẫy nhiễu từng thẻ (id -> boolean)
  const [openTraps, setOpenTraps] = useState({});

  // Form State
  const [formDay, setFormDay] = useState('');
  const [formMonth, setFormMonth] = useState('');
  const [formYear, setFormYear] = useState('');
  const [isCustomTimeMode, setIsCustomTimeMode] = useState(false);
  const [customTimeString, setCustomTimeString] = useState('');

  const previewTimeString = useMemo(() => {
    return formatTimeString(formDay, formMonth, formYear, isCustomTimeMode, customTimeString);
  }, [formDay, formMonth, formYear, isCustomTimeMode, customTimeString]);
  const [formEntity, setFormEntity] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formTypeTag, setFormTypeTag] = useState('#Văn_kiện');
  const [formSpaceTag, setFormSpaceTag] = useState('#Việt_Nam');
  const [formEraTag, setFormEraTag] = useState('#1919-1945');
  const [formTagsList, setFormTagsList] = useState([]);
  const [tagInputValue, setTagInputValue] = useState('');

  const handleAddCustomTag = (tagStr) => {
    let clean = (tagStr || '').trim().replace(/^#+/, '');
    if (!clean) return;
    clean = '#' + clean.replace(/\s+/g, '_');
    if (!formTagsList.includes(clean)) {
      setFormTagsList([...formTagsList, clean]);
    }
    setTagInputValue('');
  };

  const handleRemoveCustomTag = (tag) => {
    setFormTagsList(formTagsList.filter((t) => t !== tag));
  };

  const handleToggleSuggestedTag = (tag) => {
    if (formTagsList.includes(tag)) {
      handleRemoveCustomTag(tag);
    } else {
      setFormTagsList([...formTagsList, tag]);
    }
  };

  // Drag & Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Toggle bẫy nhiễu của thẻ
  const toggleTrap = (id) => {
    setOpenTraps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Lọc danh sách mốc
  
  // Tổng hợp tất cả hashtag có trong dữ liệu (chuẩn + tự do của người dùng)
  const allAvailableTags = useMemo(() => {
    const counts = {};
    sourceMilestones.forEach((m) => {
      [m.typeTag, m.spaceTag, m.eraTag, ...(m.customTags || [])].forEach((tag) => {
        if (tag && typeof tag === 'string' && tag.startsWith('#')) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      });
    });
    return Object.entries(counts).map(([tag, count]) => ({ tag, count }));
  }, [sourceMilestones]);

  const filteredMilestones = useMemo(() => {
    return sourceMilestones.filter((m) => {
      // 1. Lọc theo Tag
      if (activeFilterTag !== 'ALL') {
        const hasTag =
          m.typeTag === activeFilterTag ||
          m.spaceTag === activeFilterTag ||
          m.eraTag === activeFilterTag ||
          m.customTags?.includes(activeFilterTag);
        if (!hasTag) return false;
      }
      // 2. Tìm kiếm theo từ khoá
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTime = m.time?.toLowerCase().includes(q);
        const matchEntity = m.entityName?.toLowerCase().includes(q);
        const matchNote = m.note?.toLowerCase().includes(q);
        const matchTags = (m.typeTag + m.spaceTag + m.eraTag + (m.customTags?.join('') || '')).toLowerCase().includes(q);
        if (!matchTime && !matchEntity && !matchNote && !matchTags) return false;
      }
      return true;
    });
  }, [sourceMilestones, activeFilterTag, searchQuery]);

  // Gom cụm cho Cluster View
  const clusters = useMemo(() => {
    const map = {};
    if (clusterDimension === 'hashtag') {
      filteredMilestones.forEach((m) => {
        const tags = m.customTags && m.customTags.length > 0 ? m.customTags : ['#Chưa_gắn_hashtag'];
        tags.forEach((tag) => {
          if (!map[tag]) map[tag] = [];
          if (!map[tag].some((existing) => existing.id === m.id)) {
            map[tag].push(m);
          }
        });
      });
    } else {
      const keyProp = clusterDimension === 'type' ? 'typeTag' : clusterDimension === 'space' ? 'spaceTag' : 'eraTag';
      filteredMilestones.forEach((m) => {
        const groupKey = m[keyProp] || '#Khác';
        if (!map[groupKey]) map[groupKey] = [];
        map[groupKey].push(m);
      });
    }

    return Object.entries(map).map(([tag, items]) => ({ tag, items }));
  }, [filteredMilestones, clusterDimension]);

  // Mở modal thêm mốc mới (hoặc chèn vào giữa)
  const handleOpenAdd = (insertIndex = null, parentId = null) => {
    setFormDay('');
    setFormMonth('');
    setFormYear('');
    setIsCustomTimeMode(false);
    setCustomTimeString('');
    setFormEntity('');
    setFormNote('');
    setFormTypeTag('#Văn_kiện');
    setFormSpaceTag('#Việt_Nam');
    setFormEraTag('#1919-1945');
    setFormTagsList([]);
    setTagInputValue('');
    setEditModal({ mode: 'add', insertIndex, parentId });
  };

  // Mở modal chỉnh sửa mốc
  const handleOpenEdit = (m, idx) => {
    setFormTime(m.time || '');
    setFormEntity(m.entityName || '');
    setFormNote(m.note || '');
    setFormTypeTag(m.typeTag || '#Văn_kiện');
    setFormSpaceTag(m.spaceTag || '#Việt_Nam');
    setFormEraTag(m.eraTag || '#1919-1945');
    setCustomTagInput(m.customTags ? m.customTags.join(', ') : '');
    setEditModal({ mode: 'edit', index: idx, id: m.id, data: m });
  };

  // Xử lý lưu mốc
  const handleSaveModal = (e) => {
    e?.preventDefault();
    const finalTime = formatTimeString(formDay, formMonth, formYear, isCustomTimeMode, customTimeString);
    if (!finalTime || !formEntity.trim()) {
      alert('Vui lòng nhập ít nhất Năm lịch sử (hoặc chuyển sang chế độ tự do).');
      return;
    }

    const nodeData = {
      id: editModal.mode === 'edit' ? editModal.id : 'ms-' + Date.now(),
      time: finalTime,
      entityName: formEntity.trim(),
      note: formNote.trim() || 'Mốc sự kiện được ghi chú trong sổ học tập.',
      typeTag: formTypeTag,
      spaceTag: formSpaceTag,
      eraTag: formEraTag,
      customTags: formTagsList.length > 0 ? formTagsList : undefined,
      parentId: editModal.parentId || null,
    };

    let nextList = [...milestones];
    if (editModal.mode === 'edit') {
      nextList = nextList.map((item) => (item.id === editModal.id ? { ...item, ...nodeData } : item));
    } else {
      if (typeof editModal.insertIndex === 'number' && editModal.insertIndex >= 0) {
        nextList.splice(editModal.insertIndex, 0, nodeData);
      } else {
        nextList.push(nodeData);
      }
    }

    onSaveMilestones(nextList);
    setEditModal(null);
  };

  // Xoá mốc
  const handleDeleteMilestone = (id) => {
    if (window.confirm('Em có chắc chắn muốn xoá mốc sự kiện này khỏi sơ đồ?')) {
      const nextList = milestones.filter((m) => m.id !== id && m.parentId !== id);
      onSaveMilestones(nextList);
    }
  };

  // Kéo thả đổi vị trí (HTML5 Drag & Drop)
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const listCopy = [...milestones];
    const [moved] = listCopy.splice(draggedIndex, 1);
    listCopy.splice(targetIndex, 0, moved);

    onSaveMilestones(listCopy);
    setDraggedIndex(null);
  };

  // Tự động tìm bẫy nhiễu cho mốc
  const getTrapsForMilestone = (m) => {
    // 1. Kiểm tra từ điển bẫy mẫu
    for (const [key, list] of Object.entries(SMART_TRAP_RULES)) {
      if (m.entityName?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(m.entityName?.toLowerCase())) {
        return list;
      }
    }
    // 2. Tự động suy luận bẫy từ các mốc khác trong dữ liệu cùng loại thực thể nhưng khác không gian hoặc thời kỳ
    const autoTraps = milestones
      .filter((other) => other.id !== m.id && other.typeTag === m.typeTag && (other.spaceTag !== m.spaceTag || other.eraTag !== m.eraTag))
      .slice(0, 3)
      .map((other) => ({
        name: `${other.entityName} (${other.time})`,
        note: `Cùng là ${other.typeTag} nhưng thuộc ${other.spaceTag} · Thời kỳ ${other.eraTag}. Chú ý phân biệt!`
      }));

    if (autoTraps.length > 0) return autoTraps;

    return [
      { name: 'Quy tắc bẫy châu lục', note: 'Đề thi hay dùng thực thể ở Châu Âu hoặc Châu Mỹ để bẫy các câu về Đông Nam Á.' },
      { name: 'Quy tắc mốc thế kỷ', note: 'Lưu ý phân biệt các mốc diễn ra trong CTTG II (1939-1945) với sau CTTG II.' }
    ];
  };

  return (
    <div className="milestone-hub-box">
      {/* 1. THANH ĐIỀU HƯỚNG CÔNG CỤ (TOOLBAR) */}
      <div className="milestone-toolbar">
        {/* Bộ chuyển phạm vi: Mốc bài học này VS Niên biểu toàn diện Lớp 10·11·12 */}
        {allCurriculumMilestones.length > 0 && (
          <div className="view-mode-pill-bar" style={{ background: '#FFF0F3', border: '1px solid #FDA4AF' }}>
            <button
              type="button"
              className={`view-pill-btn ${timelineScope === 'lesson' ? 'active' : ''}`}
              onClick={() => setTimelineScope('lesson')}
              title="Các mốc trọng tâm có sẵn của bài học này"
            >
              <span>📖 Mốc bài này ({milestones.length})</span>
            </button>
            <button
              type="button"
              className={`view-pill-btn ${timelineScope === 'all' ? 'active' : ''}`}
              onClick={() => setTimelineScope('all')}
              title="Trục niên biểu lịch sử toàn diện xuyên suốt Lớp 10 · 11 · 12"
            >
              <span>🌐 Niên biểu 10·11·12 ({allCurriculumMilestones.length})</span>
            </button>
          </div>
        )}

        {/* Nhóm nút chọn kiểu nhìn View Mode */}
        <div className="view-mode-pill-bar">
          <button
            type="button"
            className={`view-pill-btn ${viewMode === 'timeline-vertical' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline-vertical')}
            title="Sơ đồ trục thời gian dọc dạng nhánh rẽ"
          >
            <span>Trục dọc</span>
          </button>

          <button
            type="button"
            className={`view-pill-btn ${viewMode === 'timeline-horizontal' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline-horizontal')}
            title="Sơ đồ trục thời gian ngang dòng chảy"
          >
            <span>Trục ngang</span>
          </button>

          <button
            type="button"
            className={`view-pill-btn ${viewMode === 'cluster' ? 'active' : ''}`}
            onClick={() => setViewMode('cluster')}
            title="Sơ đồ Cụm Nhãn gom nhóm thực thể"
          >
            <span>Cụm Nhãn</span>
          </button>
        </div>

        {/* Ô tìm kiếm nhanh */}
        <div className="milestone-search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="milestone-search-input"
            placeholder="Tìm mốc năm, danh từ, văn kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>

        {/* Nút thao tác mốc */}
        <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
          {onResetToStandard && timelineScope === 'lesson' && (
            <button
              type="button"
              className="ios-btn sm"
              style={{
                color: '#BE123C',
                borderColor: '#FDA4AF',
                background: '#FFF0F3',
                fontSize: '0.84rem',
              }}
              title="Khôi phục lại toàn bộ mốc có sẵn chuẩn SGK của bài này"
              onClick={onResetToStandard}
            >
              ⚡ Đặt lại mốc chuẩn
            </button>
          )}

          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={() => handleOpenAdd()}
          >
            + Thêm Mốc Mới
          </button>
        </div>
      </div>

      {/* 2. THANH BỘ LỌC NHÃN ĐA CHIỀU & HASHTAG (#) */}
      <div className="milestone-tag-filter-bar">
        <span className="tag-filter-label">Bộ lọc nhãn:</span>
        <div className="tag-filter-scroll">
          <button
            type="button"
            className={`tag-chip-filter ${activeFilterTag === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilterTag('ALL')}
          >
            Tất cả ({sourceMilestones.length})
          </button>

          {allAvailableTags.map(({ tag, count }) => {
            const isType = STANDARD_TAGS.types.includes(tag);
            const isSpace = STANDARD_TAGS.spaces.includes(tag);
            const isEra = STANDARD_TAGS.eras.includes(tag);
            const chipClass = isType ? 'type-chip' : isSpace ? 'space-chip' : isEra ? 'era-chip' : 'custom-chip';
            return (
              <button
                key={tag}
                type="button"
                className={`tag-chip-filter ${chipClass} ${activeFilterTag === tag ? 'active' : ''}`}
                onClick={() => setActiveFilterTag(activeFilterTag === tag ? 'ALL' : tag)}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KHÔNG GIAN HIỂN THỊ CHÍNH (CANVAS THEO TỪNG CHẾ ĐỘ VIEW) */}
      {viewMode === 'cluster' ? (
        /* =========================================================================
           CHẾ ĐỘ CỤM NHÃN (CLUSTER VIEW)
           ========================================================================= */
        <div className="cluster-view-container">
          <div className="cluster-subbar">
            <span className="small muted">Gom nhóm thực thể theo:</span>
            <div className="cluster-dimension-pills">
              <button
                type="button"
                className={`dim-pill ${clusterDimension === 'type' ? 'active' : ''}`}
                onClick={() => setClusterDimension('type')}
              >
                Loại thực thể
              </button>
              <button
                type="button"
                className={`dim-pill ${clusterDimension === 'space' ? 'active' : ''}`}
                onClick={() => setClusterDimension('space')}
              >
                Không gian khu vực
              </button>
              <button
                type="button"
                className={`dim-pill ${clusterDimension === 'era' ? 'active' : ''}`}
                onClick={() => setClusterDimension('era')}
              >
                Giai đoạn thời kỳ
              </button>
              <button
                type="button"
                className={`dim-pill ${clusterDimension === 'hashtag' ? 'active' : ''}`}
                onClick={() => setClusterDimension('hashtag')}
              >
                Từ khóa Hashtag (#)
              </button>
            </div>
          </div>

          {milestones.length === 0 ? (
            <div
              className="empty-unified-timeline"
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#FFF0F3',
                borderRadius: '24px',
                border: '2px dashed #FDA4AF',
                margin: '28px auto',
                maxWidth: '620px',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏱️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#380718', margin: '0 0 8px 0' }}>
                Trục thời gian Lịch Sử dùng chung (Lớp 10 · 11 · 12)
              </h3>
              <p style={{ color: '#4A1D2F', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                Trục dọc niên biểu này là <b>duy nhất</b> và <b>đồng bộ liên tục</b> xuyên suốt toàn bộ các bài học trong cả 3 khối lớp. Hiện tại chưa có mốc nào. Hãy bấm nút bên dưới hoặc dùng <b>Bút dạ quang</b> tô sáng câu từ trong bài đọc để thêm mốc của bạn vào đây!
              </p>
              <button
                type="button"
                className="ios-btn md ios-btn-primary"
                onClick={() => handleOpenAdd()}
                style={{ padding: '10px 24px', fontSize: '0.95rem' }}
              >
                + Thêm Cột Mốc Đầu Tiên Vào Trục
              </button>
            </div>
          ) : (
            <div className="clusters-grid">
              {clusters.map(({ tag, items }) => (
                <div key={tag} className="cluster-box">
                  <div className="cluster-header">
                    <div className="row" style={{ gap: '8px' }}>
                      <span className="cluster-tag-badge">{tag}</span>
                      <span className="cluster-count">{items.length} thực thể</span>
                    </div>
                  </div>

                  <div className="cluster-cards-list">
                    {items.map((m, idx) => {
                      const traps = getTrapsForMilestone(m);
                      const isTrapOpen = !!openTraps[m.id];
                      return (
                        <div key={m.id} className="cluster-item-node">
                          <div className="node-top-bar">
                            <span className="node-time-badge">{m.time}</span>
                            <div className="node-action-icons">
                              <button
                                type="button"
                                className="node-mini-btn"
                                title="Sửa mốc"
                                onClick={() => handleOpenEdit(m, idx)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="node-mini-btn delete"
                                title="Xoá mốc"
                                onClick={() => handleDeleteMilestone(m.id)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <h4 className="node-entity-title">{m.entityName}</h4>
                          <p className="node-note-text">{m.note}</p>

                          <div className="node-tags-row">
                            <span className="tag-pill tag-type">{m.typeTag}</span>
                            <span className="tag-pill tag-space">{m.spaceTag}</span>
                            <span className="tag-pill tag-era">{m.eraTag}</span>
                          </div>

                          {/* Nút xem bẫy nhiễu */}
                          <div className="node-trap-trigger-row">
                            <button
                              type="button"
                              className={`trap-toggle-btn ${isTrapOpen ? 'is-active' : ''}`}
                              onClick={() => toggleTrap(m.id)}
                            >
                              <span>⚠️ {isTrapOpen ? 'Ẩn bẫy nhiễu đề thi' : 'Xem bẫy nhiễu đề thi'}</span>
                              <span className="trap-arrow">{isTrapOpen ? '▲' : '▼'}</span>
                            </button>
                          </div>

                          {isTrapOpen && (
                            <div className="node-trap-content">
                              <b className="trap-content-head">🚩 Đề thi dễ bẫy nhầm với các thực thể:</b>
                              <ul className="trap-list">
                                {traps.map((tr, ti) => (
                                  <li key={ti}>
                                    <b>{tr.name}:</b> {tr.note}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
           CHẾ ĐỘ TRỤC THỜI GIAN NỐI TIẾP (DỌC HOẶC NGANG CÓ NHÁNH RẼ)
           ========================================================================= */
        <div className={`timeline-diagram-container ${viewMode === 'timeline-horizontal' ? 'is-horizontal' : 'is-vertical'}`}>
          {sourceMilestones.length === 0 ? (
            /* KHI TOÀN BỘ MỐC BỊ XOÁ HẾT: HIỂN THỊ THẺ TRỐNG TRỰC TIẾP TRÊN TRỤC */
            <div className="timeline-track">
              <div className="timeline-node-segment empty-placeholder-segment">
                <div className="timeline-spine-dot placeholder-spine-dot">
                  <span>+</span>
                </div>
                <div
                  className="milestone-placeholder-card"
                  onClick={() => handleOpenAdd(0)}
                  title="Bấm vào thẻ này để thêm mốc lịch sử đầu tiên"
                >
                  <div className="placeholder-card-badge">MỐC SỰ KIỆN MỚI</div>
                  <h3 className="placeholder-card-title">+ Thêm mốc lịch sử đầu tiên vào trục</h3>
                  <p className="placeholder-card-desc">
                    Trục thời gian đang trống. Bấm trực tiếp vào thẻ trống này để nhập mốc năm, tên sự kiện, văn kiện và gắn thẻ #hashtag phân loại...
                  </p>
                  <div className="placeholder-card-action">
                    <span className="ios-btn sm ios-btn-primary">+ Nhập thông tin mốc</span>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredMilestones.length === 0 ? (
            <div className="empty-milestones-notice">
              <p>Không tìm thấy mốc lịch sử nào phù hợp với bộ lọc hiện tại.</p>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => {
                  setActiveFilterTag('ALL');
                  setSearchQuery('');
                }}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="timeline-track">
              {filteredMilestones.map((m, idx) => {
                const traps = getTrapsForMilestone(m);
                const isTrapOpen = !!openTraps[m.id];
                const isDraggable = activeFilterTag === 'ALL' && !searchQuery.trim();

                return (
                  <div key={m.id} className="timeline-node-segment">
                    {/* KHU VỰC RÊ CHUỘT ĐỂ CHÈN MỐC Ở ĐẦU HOẶC GIỮA */}
                    <div className="insert-hover-zone" title="Chèn mốc vào vị trí này">
                      <div className="insert-line-bar" />
                      <button
                        type="button"
                        className="insert-add-btn"
                        onClick={() => handleOpenAdd(idx)}
                      >
                        + Chèn mốc vào đây
                      </button>
                    </div>

                    {/* ĐIỂM TIMELINE TRÊN TRỤC */}
                    <div className="timeline-spine-dot" />

                    {/* HỘP NỘI DUNG THẺ MỐC */}
                    <div
                      className={`milestone-card-box ${m.parentId ? 'is-branch-child' : ''} ${isDraggable ? 'is-draggable' : ''}`}
                      draggable={isDraggable}
                      onDragStart={(e) => isDraggable && handleDragStart(e, idx)}
                      onDragOver={(e) => isDraggable && handleDragOver(e, idx)}
                      onDrop={(e) => isDraggable && handleDrop(e, idx)}
                    >
                      <div className="milestone-card-content">
                        {/* Thanh Tiêu Đề Mốc: Thời gian + Nút hành động */}
                        <div className="node-top-bar">
                          <span className="node-time-badge">{m.time}</span>

                          <div className="node-actions-wrap">
                            {isDraggable && (
                              <span className="drag-handle-pill" title="Kéo thả để đổi thứ tự mốc">
                                ⋮⋮ Kéo
                              </span>
                            )}

                            <button
                              type="button"
                              className="node-action-btn branch-btn"
                              title="Tạo nhánh sự kiện con trực thuộc mốc này"
                              onClick={() => handleOpenAdd(idx + 1, m.id)}
                            >
                              + Nhánh con
                            </button>

                            <button
                              type="button"
                              className="node-action-btn edit-btn"
                              title="Chỉnh sửa thông tin mốc"
                              onClick={() => handleOpenEdit(m, idx)}
                            >
                              ✎ Sửa
                            </button>

                            <button
                              type="button"
                              className="node-action-btn delete-btn"
                              title="Xoá mốc này khỏi sơ đồ"
                              onClick={() => handleDeleteMilestone(m.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Tên Thực Thể Đích In Đậm */}
                        <h3 className="node-entity-title">{m.entityName}</h3>

                        {/* Ghi chú ngữ cảnh ngắn */}
                        <p className="node-note-text">{m.note}</p>

                        {/* HỆ TỪ KHÓA HASHTAG TƯƠNG TÁC */}
                        <div className="node-tags-row">
                          <button
                            type="button"
                            className={`tag-pill tag-type ${activeFilterTag === m.typeTag ? 'is-active-filter' : ''}`}
                            title={`Lọc theo ${m.typeTag}`}
                            onClick={() => setActiveFilterTag(activeFilterTag === m.typeTag ? 'ALL' : m.typeTag)}
                          >
                            {m.typeTag}
                          </button>
                          <button
                            type="button"
                            className={`tag-pill tag-space ${activeFilterTag === m.spaceTag ? 'is-active-filter' : ''}`}
                            title={`Lọc theo ${m.spaceTag}`}
                            onClick={() => setActiveFilterTag(activeFilterTag === m.spaceTag ? 'ALL' : m.spaceTag)}
                          >
                            {m.spaceTag}
                          </button>
                          <button
                            type="button"
                            className={`tag-pill tag-era ${activeFilterTag === m.eraTag ? 'is-active-filter' : ''}`}
                            title={`Lọc theo ${m.eraTag}`}
                            onClick={() => setActiveFilterTag(activeFilterTag === m.eraTag ? 'ALL' : m.eraTag)}
                          >
                            {m.eraTag}
                          </button>

                          {m.customTags?.map((ct, ci) => (
                            <button
                              key={ci}
                              type="button"
                              className={`tag-pill tag-custom ${activeFilterTag === ct ? 'is-active-filter' : ''}`}
                              title={`Lọc theo ${ct}`}
                              onClick={() => setActiveFilterTag(activeFilterTag === ct ? 'ALL' : ct)}
                            >
                              {ct}
                            </button>
                          ))}
                        </div>

                        {/* Nút Xem Bẫy Nhiễu Đề Thi */}
                        <div className="node-trap-trigger-row">
                          <button
                            type="button"
                            className={`trap-toggle-btn ${isTrapOpen ? 'is-active' : ''}`}
                            onClick={() => toggleTrap(m.id)}
                          >
                            <span>⚠️ {isTrapOpen ? 'Ẩn bẫy nhiễu đề thi' : 'Xem bẫy nhiễu đề thi'}</span>
                            <span className="trap-arrow">{isTrapOpen ? '▲' : '▼'}</span>
                          </button>
                        </div>

                        {/* Ngăn cảnh báo bẫy nhiễu trắc nghiệm */}
                        {isTrapOpen && (
                          <div className="node-trap-content">
                            <b className="trap-content-head">🚩 Đề thi THPTQG thường bẫy nhầm với:</b>
                            <ul className="trap-list">
                              {traps.map((tr, ti) => (
                                <li key={ti}>
                                  <b>{tr.name}:</b> {tr.note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* THẺ TRỐNG TIẾP THEO Ở CUỐI TRỤC (THAY THẾ NÚT BỊ VÔ DUYÊN) */}
              <div className="timeline-node-segment end-add-segment">
                <div className="timeline-spine-dot placeholder-spine-dot">
                  <span>+</span>
                </div>
                <div
                  className="milestone-placeholder-card"
                  onClick={() => handleOpenAdd(sourceMilestones.length)}
                  title="Bấm vào thẻ này để thêm mốc nối tiếp vào trục"
                >
                  <div className="placeholder-card-compact">
                    <span className="placeholder-plus-circle">+</span>
                    <div className="placeholder-text-group">
                      <div className="placeholder-compact-title">Thêm mốc sự kiện tiếp theo vào trục thời gian</div>
                      <div className="placeholder-compact-sub">Bấm vào thẻ trống này để chèn mốc mới kèm nhãn #hashtag phân loại</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL THÊM / CHỈNH SỬA MỐC VÀ QUẢN LÝ NHÃN ĐA CHIỀU (REDESIGNED)
          ========================================================================= */}
      {editModal && (
        <Modal
          title={editModal.mode === 'edit' ? 'Chỉnh sửa Mốc Lịch Sử' : editModal.parentId ? '+ Thêm Nhánh Sự Kiện Con' : '+ Thêm Mốc Lịch Sử Mới'}
          wide
          onClose={() => setEditModal(null)}
        >
          <form onSubmit={handleSaveModal} className="milestone-form-dialog">
            {/* THẺ 1: THỜI GIAN & TÊN SỰ KIỆN */}
            <div className="modal-section-card">
              <div className="modal-section-header">
                <span className="modal-section-title">
                  <span>🕒</span> Mốc thời gian & Sự kiện
                </span>
                <button
                  type="button"
                  className="btn ghost sm"
                  style={{ fontSize: '0.78rem', color: '#BE123C', padding: '2px 10px', borderRadius: '8px', background: '#FFF0F3' }}
                  onClick={() => setIsCustomTimeMode(!isCustomTimeMode)}
                >
                  {isCustomTimeMode ? '📅 Dùng [Ngày][Tháng][Năm]' : '✏️ Nhập khoảng tự do'}
                </button>
              </div>

              {!isCustomTimeMode ? (
                <div>
                  <div className="date-triplet-boxes">
                    {/* Ô NGÀY */}
                    <div className="triplet-box">
                      <span className="triplet-label">Ngày (tuỳ chọn)</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={formDay}
                        onChange={(e) => setFormDay(e.target.value)}
                        placeholder="VD: 24"
                        className="triplet-input"
                      />
                    </div>

                    {/* Ô THÁNG */}
                    <div className="triplet-box">
                      <span className="triplet-label">Tháng (tuỳ chọn)</span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={formMonth}
                        onChange={(e) => setFormMonth(e.target.value)}
                        placeholder="VD: 10"
                        className="triplet-input"
                      />
                    </div>

                    {/* Ô NĂM */}
                    <div className="triplet-box">
                      <span className="triplet-label">Năm (bắt buộc) *</span>
                      <input
                        type="number"
                        required
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        placeholder="VD: 1945"
                        className="triplet-input year-input"
                      />
                    </div>
                  </div>

                  {/* DÒNG XEM TRƯỚC KẾT QUẢ ĐỊNH DẠNG */}
                  <div className="modal-date-preview-strip">
                    <span>Hiển thị trên trục:</span>
                    <span className="modal-date-badge">
                      {previewTimeString || 'Chưa nhập năm'}
                    </span>
                    <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>(Ô nào không cần thì để trống)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    required
                    value={customTimeString}
                    onChange={(e) => setCustomTimeString(e.target.value)}
                    placeholder="VD: 25-4 đến 26-6-1945 hoặc 1945 – 1954..."
                    className="modal-input-hero"
                    style={{ fontSize: '0.94rem' }}
                  />
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#9F1239', opacity: 0.85 }}>
                    Dành cho sự kiện dài hạn hoặc giai đoạn diễn ra nhiều năm.
                  </div>
                </div>
              )}

              <div style={{ marginTop: '6px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#881337', marginBottom: '4px' }}>
                  Tên sự kiện / Thực thể lịch sử <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formEntity}
                  onChange={(e) => setFormEntity(e.target.value)}
                  placeholder="VD: Hội nghị I-an-ta, Liên hợp quốc, Tuyên bố Ba-li..."
                  className="modal-input-hero"
                />
              </div>
            </div>

            {/* THẺ 2: PHÂN LOẠI 3 CHIỀU CHUẨN THI THPTQG */}
            <div className="modal-section-card">
              <div>
                <div className="modal-section-title">
                  <span>🏷️</span> Phân loại 3 chiều chuẩn thi
                </div>
                <div className="modal-section-subtitle">
                  Hỗ trợ ma trận câu hỏi và bấm lọc nhanh theo từng chiều không gian - thời gian
                </div>
              </div>

              <div className="modal-selects-row">
                <div className="modal-select-item">
                  <label>🏷️ Loại thực thể</label>
                  <select
                    className="modal-custom-select"
                    value={formTypeTag}
                    onChange={(e) => setFormTypeTag(e.target.value)}
                  >
                    {STANDARD_TAGS.types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-select-item">
                  <label>🌍 Không gian</label>
                  <select
                    className="modal-custom-select"
                    value={formSpaceTag}
                    onChange={(e) => setFormSpaceTag(e.target.value)}
                  >
                    {STANDARD_TAGS.spaces.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-select-item">
                  <label>⏳ Thời kỳ</label>
                  <select
                    className="modal-custom-select"
                    value={formEraTag}
                    onChange={(e) => setFormEraTag(e.target.value)}
                  >
                    {STANDARD_TAGS.eras.map((er) => (
                      <option key={er} value={er}>
                        {er}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* THẺ 3: HỆ TỪ KHÓA HASHTAG (#) */}
            <div className="modal-section-card">
              <div>
                <div className="modal-section-title">
                  <span>🔖</span> Bộ từ khóa Hashtag (#) gắn kèm
                </div>
                <div className="modal-section-subtitle">
                  Gắn thêm từ khóa trọng tâm để bấm lọc nhanh các mốc liên quan trên sơ đồ
                </div>
              </div>

              {/* Thanh nhập hashtag tự do */}
              <div className="modal-tag-input-row">
                <span className="modal-tag-prefix">#</span>
                <input
                  type="text"
                  className="modal-tag-input"
                  value={tagInputValue}
                  onChange={(e) => setTagInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(tagInputValue);
                    }
                  }}
                  placeholder="Nhập từ khóa tuỳ ý rồi ấn Thêm (VD: HĐBA_LHQ, Đổi_mới...)"
                />
                <button
                  type="button"
                  className="modal-tag-add-btn"
                  onClick={() => handleAddCustomTag(tagInputValue)}
                >
                  + Thêm thẻ
                </button>
              </div>

              {/* Danh sách hashtag đang có */}
              {formTagsList.length > 0 && (
                <div>
                  <div className="modal-sub-label" style={{ marginBottom: '6px' }}>
                    Đang gắn ({formTagsList.length} thẻ):
                  </div>
                  <div className="modal-active-tags-strip">
                    {formTagsList.map((tag) => (
                      <span key={tag} className="modal-active-tag-chip">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTag(tag)}
                          title="Bỏ thẻ này"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gợi ý nhanh 1-chạm */}
              <div>
                <div className="modal-sub-label" style={{ marginBottom: '6px' }}>
                  💡 Gợi ý nhanh (chạm để bật / tắt):
                </div>
                <div className="modal-suggest-scroll-shelf">
                  {SUGGESTED_HASHTAGS.map((sug) => {
                    const isSelected = formTagsList.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        className={`modal-suggest-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleSuggestedTag(sug)}
                      >
                        {isSelected ? `✓ ${sug}` : `+ ${sug}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* THẺ 4: GHI CHÚ BỐI CẢNH / Ý NGHĨA */}
            <div className="modal-section-card">
              <div className="modal-section-title">
                <span>📝</span> Ghi chú bối cảnh & ý nghĩa lịch sử (tuỳ chọn)
              </div>
              <textarea
                rows={2}
                className="modal-textarea-clean"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Tóm tắt ngắn gọn mục tiêu, nguyên nhân hoặc tác động của sự kiện để ôn luyện nhanh..."
              />
            </div>

            {/* FOOTER NÚT BẤM */}
            <div className="modal-actions-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setEditModal(null)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="modal-btn-submit">
                {editModal.mode === 'edit' ? '✓ Cập nhật Mốc' : '+ Lưu vào Sơ đồ'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Modal } from './Modal';

// Danh mục nhãn gợi ý chuẩn thi THPTQG
export const STANDARD_TAGS = {
  types: ['#Văn_kiện', '#Tổ_chức', '#Quốc_gia', '#Địa_phương', '#Nhân_vật', '#Chiến_dịch', '#Sự_kiện', '#Triều_đại'],
  spaces: ['#Việt_Nam', '#Đông_Nam_Á', '#Châu_Mỹ', '#Châu_Âu', '#Châu_Á', '#Toàn_cầu'],
  eras: ['#Phong_kiến', '#1919-1945', '#Chống_Pháp', '#Chống_Mỹ', '#Đổi_mới'],
};

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
  const [formTime, setFormTime] = useState('');
  const [formEntity, setFormEntity] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formTypeTag, setFormTypeTag] = useState('#Văn_kiện');
  const [formSpaceTag, setFormSpaceTag] = useState('#Việt_Nam');
  const [formEraTag, setFormEraTag] = useState('#1919-1945');
  const [customTagInput, setCustomTagInput] = useState('');

  // Drag & Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Toggle bẫy nhiễu của thẻ
  const toggleTrap = (id) => {
    setOpenTraps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Lọc danh sách mốc
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
    const keyProp = clusterDimension === 'type' ? 'typeTag' : clusterDimension === 'space' ? 'spaceTag' : 'eraTag';

    filteredMilestones.forEach((m) => {
      const groupKey = m[keyProp] || '#Khác';
      if (!map[groupKey]) map[groupKey] = [];
      map[groupKey].push(m);
    });

    return Object.entries(map).map(([tag, items]) => ({ tag, items }));
  }, [filteredMilestones, clusterDimension]);

  // Mở modal thêm mốc mới (hoặc chèn vào giữa)
  const handleOpenAdd = (insertIndex = null, parentId = null) => {
    setFormTime('');
    setFormEntity('');
    setFormNote('');
    setFormTypeTag('#Văn_kiện');
    setFormSpaceTag('#Việt_Nam');
    setFormEraTag('#1919-1945');
    setCustomTagInput('');
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
    if (!formTime.trim() || !formEntity.trim()) return;

    const customTags = customTagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && t.startsWith('#'));

    const nodeData = {
      id: editModal.mode === 'edit' ? editModal.id : 'ms-' + Date.now(),
      time: formTime.trim(),
      entityName: formEntity.trim(),
      note: formNote.trim() || 'Mốc sự kiện được ghi chú trong sổ học tập.',
      typeTag: formTypeTag,
      spaceTag: formSpaceTag,
      eraTag: formEraTag,
      customTags: customTags.length > 0 ? customTags : undefined,
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

      {/* 2. THANH BỘ LỌC NHÃN ĐA CHIỀU (TAG FILTER BAR) */}
      <div className="milestone-tag-filter-bar">
        <span className="tag-filter-label">Bộ lọc nhãn:</span>
        <div className="tag-filter-scroll">
          <button
            type="button"
            className={`tag-chip-filter ${activeFilterTag === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilterTag('ALL')}
          >
            Tất cả ({milestones.length})
          </button>

          {/* Nhãn loại thực thể */}
          {STANDARD_TAGS.types.map((t) => {
            const count = milestones.filter((m) => m.typeTag === t).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                type="button"
                className={`tag-chip-filter type-chip ${activeFilterTag === t ? 'active' : ''}`}
                onClick={() => setActiveFilterTag(t)}
              >
                {t} ({count})
              </button>
            );
          })}

          {/* Nhãn không gian */}
          {STANDARD_TAGS.spaces.map((s) => {
            const count = milestones.filter((m) => m.spaceTag === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                type="button"
                className={`tag-chip-filter space-chip ${activeFilterTag === s ? 'active' : ''}`}
                onClick={() => setActiveFilterTag(s)}
              >
                {s} ({count})
              </button>
            );
          })}

          {/* Nhãn thời kỳ */}
          {STANDARD_TAGS.eras.map((er) => {
            const count = milestones.filter((m) => m.eraTag === er).length;
            if (count === 0) return null;
            return (
              <button
                key={er}
                type="button"
                className={`tag-chip-filter era-chip ${activeFilterTag === er ? 'active' : ''}`}
                onClick={() => setActiveFilterTag(er)}
              >
                {er} ({count})
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
                        + Chèn Mốc vào đây
                      </button>
                    </div>

                    {/* THẺ MỐC LỊCH SỬ (MILESTONE NODE) */}
                    <div
                      className={`milestone-interactive-card ${draggedIndex === idx ? 'is-dragging' : ''}`}
                      draggable={isDraggable}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      {/* Cột mốc và điểm neo trên trục */}
                      <div className="node-axis-anchor">
                        <div className="anchor-dot" />
                        <div className="anchor-stem" />
                      </div>

                      <div className="node-card-body">
                        {/* Header Thẻ Mốc: Thời gian + Thao tác */}
                        <div className="node-top-bar">
                          <span className="node-time-badge">{m.time}</span>

                          <div className="node-action-icons">
                            {isDraggable && (
                              <span className="drag-handle-pill" title="Kéo thả để đổi thứ tự mốc">
                                ⠿ Kéo
                              </span>
                            )}
                            <button
                              type="button"
                              className="node-mini-btn"
                              title="Thêm nhánh sự kiện con"
                              onClick={() => handleOpenAdd(idx + 1, m.id)}
                            >
                              + Nhánh con
                            </button>
                            <button
                              type="button"
                              className="node-mini-btn"
                              title="Chỉnh sửa mốc"
                              onClick={() => handleOpenEdit(m, idx)}
                            >
                              ✎ Sửa
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

                        {/* Tên Thực Thể Đích In Đậm */}
                        <h3 className="node-entity-title">{m.entityName}</h3>

                        {/* Ghi chú ngữ cảnh ngắn */}
                        <p className="node-note-text">{m.note}</p>

                        {/* 3 Nhóm Nhãn Màu Sắc Phân Biệt */}
                        <div className="node-tags-row">
                          <button
                            type="button"
                            className="tag-pill tag-type"
                            title="Lọc thực thể cùng loại"
                            onClick={() => setActiveFilterTag(m.typeTag)}
                          >
                            {m.typeTag}
                          </button>
                          <button
                            type="button"
                            className="tag-pill tag-space"
                            title="Lọc thực thể cùng không gian"
                            onClick={() => setActiveFilterTag(m.spaceTag)}
                          >
                            {m.spaceTag}
                          </button>
                          <button
                            type="button"
                            className="tag-pill tag-era"
                            title="Lọc thực thể cùng thời kỳ"
                            onClick={() => setActiveFilterTag(m.eraTag)}
                          >
                            {m.eraTag}
                          </button>

                          {m.customTags?.map((ct, ci) => (
                            <span key={ci} className="tag-pill tag-custom">
                              {ct}
                            </span>
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

              {/* KHU VỰC RÊ CHUỘT Ở CUỐI CÙNG TRỤC SƠ ĐỒ */}
              <div className="insert-hover-zone last-zone" title="Thêm mốc vào cuối sơ đồ">
                <div className="insert-line-bar" />
                <button
                  type="button"
                  className="insert-add-btn"
                  onClick={() => handleOpenAdd(filteredMilestones.length)}
                >
                  + Chèn Mốc vào cuối sơ đồ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL THÊM / CHỈNH SỬA MỐC VÀ QUẢN LÝ NHÃN ĐA CHIỀU
          ========================================================================= */}
      {editModal && (
        <Modal
          title={editModal.mode === 'edit' ? 'Chỉnh sửa Mốc Lịch Sử' : editModal.parentId ? '+ Thêm Nhánh Sự Kiện Con' : '+ Thêm Mốc Lịch Sử Mới'}
          onClose={() => setEditModal(null)}
        >
          <form onSubmit={handleSaveModal} className="milestone-form-dialog">
            <label className="field">
              <span>Mốc thời gian (VD: 2-1945, 24-10-1945, 1967, 2003, 2007) *</span>
              <input
                type="text"
                required
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                placeholder="Nhập mốc thời gian..."
              />
            </label>

            <label className="field">
              <span>Tên thực thể / Danh từ đích * (VD: Hội nghị I-an-ta, Liên hợp quốc, Tuyên bố Ba-li II...)</span>
              <input
                type="text"
                required
                value={formEntity}
                onChange={(e) => setFormEntity(e.target.value)}
                placeholder="Nhập danh từ thực thể..."
              />
            </label>

            {/* 3 Nhóm Nhãn Bắt Buộc */}
            <div className="form-tags-grid">
              <label className="field">
                <span>Nhãn Loại thực thể</span>
                <select value={formTypeTag} onChange={(e) => setFormTypeTag(e.target.value)}>
                  {STANDARD_TAGS.types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Nhãn Không gian</span>
                <select value={formSpaceTag} onChange={(e) => setFormSpaceTag(e.target.value)}>
                  {STANDARD_TAGS.spaces.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Nhãn Thời kỳ</span>
                <select value={formEraTag} onChange={(e) => setFormEraTag(e.target.value)}>
                  {STANDARD_TAGS.eras.map((er) => (
                    <option key={er} value={er}>
                      {er}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Nhãn tuỳ chỉnh bổ sung (Cách nhau bởi dấu phẩy, có dấu #)</span>
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="VD: #Hội_nhập, #Kinh_tế, #Bảo_vệ_chủ_quyền"
              />
            </label>

            <label className="field">
              <span>Ghi chú ngữ cảnh ngắn (Bản chất, mục đích hoặc vai trò lịch sử)</span>
              <textarea
                rows={3}
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Tóm tắt ngắn gọn ý nghĩa mốc lịch sử..."
              />
            </label>

            <div className="row between" style={{ marginTop: '14px' }}>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => setEditModal(null)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="ios-btn sm ios-btn-primary">
                {editModal.mode === 'edit' ? 'Cập nhật Mốc' : 'Lưu vào Sơ đồ'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

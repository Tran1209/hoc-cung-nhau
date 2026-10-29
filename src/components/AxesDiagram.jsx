import { useState, useMemo } from 'react';
import { FormDialog } from './Modal';

// Các tùy chọn Badge Tiến độ / Tính chất chuẩn đề thi THPTQG
export const PROGRESS_BADGES = [
  { label: 'Bước đầu', color: '#0284C7', bg: '#E0F2FE' },
  { label: 'Bắt đầu', color: '#0369A1', bg: '#E0F2FE' },
  { label: 'Tiếp tục đẩy mạnh', color: '#D97706', bg: '#FEF3C7' },
  { label: 'Hoàn thành', color: '#15803D', bg: '#DCFCE7' },
  { label: 'Xuyên suốt', color: '#7E22CE', bg: '#F3E8FF' },
  { label: 'Từng bước', color: '#4338CA', bg: '#EEF2FF' },
  { label: 'Nhanh chóng', color: '#BE123C', bg: '#FFF0F3' },
  { label: 'Quyết định', color: '#991B1B', bg: '#FEE2E2' },
];

// Gợi ý động từ hành động cốt lõi
const COMMON_ACTION_VERBS = [
  'Thông qua',
  'Ký kết',
  'Khởi xướng',
  'Thành lập',
  'Đề ra',
  'Triển khai',
  'Xác lập',
  'Kiên định',
  'Mở rộng',
  'Hoàn thiện',
  'Chuyển đổi',
  'Duy trì',
];

// Dữ liệu mẫu chuẩn hoá của 3 kiểu mẫu cho Bài 1
export const DEFAULT_AXIS_DATA = {
  // Kiểu 1: Các chặng thời gian
  timelineLanes: [
    { id: 'lane-1', title: '1945 – 1975 (Sau CTTG II & Chiến tranh lạnh)' },
    { id: 'lane-2', title: '1975 – 1991 (Thời kỳ hoà dịu & trước Đổi mới)' },
    { id: 'lane-3', title: '1991 – 2015 (Thời kỳ Đổi mới & Hội nhập sâu)' },
    { id: 'lane-4', title: '2015 – nay (Cộng đồng ASEAN & Toàn cầu hoá)' },
  ],
  // Kiểu 2: Các chủ thể
  subjects: ['Liên hợp quốc', 'ASEAN', 'Việt Nam'],
  // Kiểu 3: Trục bản chất (Bất biến vs Vận động)
  essenceTopics: [
    {
      id: 'topic-asean',
      title: 'Quá trình phát triển của ASEAN (1967 – 2015)',
      invariable: [
        {
          id: 'inv-1',
          progressBadge: 'Xuyên suốt',
          verb: 'Kiên trì tôn trọng',
          content: 'Độc lập, chủ quyền, toàn vẹn lãnh thổ và không can thiệp vào công việc nội bộ của nhau.',
        },
        {
          id: 'inv-2',
          progressBadge: 'Xuyên suốt',
          verb: 'Áp dụng tuyệt đối',
          content: 'Nguyên tắc đồng thuận (consensus) và tham vấn chặt chẽ giữa các quốc gia thành viên ("Phương cách ASEAN").',
        },
        {
          id: 'inv-3',
          progressBadge: 'Xuyên suốt',
          verb: 'Duy trì mục tiêu',
          content: 'Xây dựng một khu vực Đông Nam Á hoà bình, tự do, trung lập và hợp tác cùng phát triển.',
        },
      ],
      dynamic: [
        {
          id: 'dyn-1',
          progressBadge: 'Bước đầu',
          verb: 'Tập trung hợp tác',
          content: 'Chính trị - an ninh trong bối cảnh Chiến tranh lạnh, từng bước hoà dịu quan hệ song phương và đa phương.',
        },
        {
          id: 'dyn-2',
          progressBadge: 'Từng bước mở rộng',
          verb: 'Kết nạp thêm',
          content: 'Từ 5 nước sáng lập (1967) từng bước phát triển thành ASEAN 10 (kết nạp VN 1995, Lào & Myanmar 1997, Campuchia 1999).',
        },
        {
          id: 'dyn-3',
          progressBadge: 'Tiếp tục đẩy mạnh',
          verb: 'Xây dựng và hoàn thiện',
          content: 'Cơ sở pháp lý với Hiến chương ASEAN (2007) và chính thức thành lập Cộng đồng ASEAN 3 trụ cột (2015).',
        },
      ],
    },
    {
      id: 'topic-un',
      title: 'Tổ chức Liên hợp quốc (1945 – nay)',
      invariable: [
        {
          id: 'inv-un-1',
          progressBadge: 'Xuyên suốt',
          verb: 'Giữ vững nguyên tắc',
          content: 'Bình đẳng chủ quyền giữa các quốc gia thành viên và giải quyết tranh chấp bằng biện pháp hoà bình.',
        },
        {
          id: 'inv-un-2',
          progressBadge: 'Xuyên suốt',
          verb: 'Thực thi cơ chế',
          content: 'Nguyên tắc nhất trí giữa 5 nước uỷ viên thường trực Hội đồng Bảo an (quyền phủ quyết veto).',
        },
      ],
      dynamic: [
        {
          id: 'dyn-un-1',
          progressBadge: 'Bước đầu',
          verb: 'Tập trung xử lý',
          content: 'Ngăn chặn thảm hoạ Chiến tranh thế giới thứ ba và giải quyết các cuộc xung đột cục bộ lớn sau CTTG II.',
        },
        {
          id: 'dyn-un-2',
          progressBadge: 'Mở rộng mạnh mẽ',
          verb: 'Chuyển hướng thúc đẩy',
          content: 'Phát triển kinh tế bền vững, bảo vệ môi trường, nhân quyền và 17 Mục tiêu Thiên niên kỷ (SDGs 2030).',
        },
      ],
    },
  ],
};

export default function AxesDiagram({ axes = [], onSaveAxes }) {
  // Chọn kiểu mẫu: 'timeline-lanes' (Kiểu 1) | 'subject-matrix' (Kiểu 2) | 'essence-dual' (Kiểu 3)
  const [templateMode, setTemplateMode] = useState('timeline-lanes');

  // Lựa chọn bộ lọc Chủ thể trong Kiểu 2
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Lựa chọn chuyên đề trong Kiểu 3
  const [selectedEssenceTopic, setSelectedEssenceTopic] = useState('topic-asean');

  // State các chặng thời gian (có thể thêm chặng mới)
  const [timelineLanes, setTimelineLanes] = useState(DEFAULT_AXIS_DATA.timelineLanes);

  // Modal thêm/sửa Thẻ Hành Động
  const [editModal, setEditModal] = useState(null); // { mode: 'add' | 'edit', initialLane?: string, initialSubject?: string, id?: string }
  const [isAddingLaneModal, setIsAddingLaneModal] = useState(false);
  const [newLaneTitle, setNewLaneTitle] = useState('');

  // Form State
  const [formSubject, setFormSubject] = useState('Liên hợp quốc');
  const [formPeriod, setFormPeriod] = useState('1945 – 1975 (Sau CTTG II & Chiến tranh lạnh)');
  const [formProgressBadge, setFormProgressBadge] = useState('Hoàn thành');
  const [formVerb, setFormVerb] = useState('');
  const [formContent, setFormContent] = useState('');

  // Danh sách chủ thể độc nhất
  const uniqueSubjects = useMemo(() => {
    const set = new Set(['Liên hợp quốc', 'ASEAN', 'Việt Nam']);
    axes.forEach((ax) => {
      if (ax.subject) set.add(ax.subject.trim());
    });
    return Array.from(set);
  }, [axes]);

  // Mở modal thêm thẻ
  const handleOpenAdd = (laneTitle = null, subject = null) => {
    setFormSubject(subject || uniqueSubjects[0] || 'Liên hợp quốc');
    setFormPeriod(laneTitle || (timelineLanes[0]?.title) || '1945 – 1975');
    setFormProgressBadge('Hoàn thành');
    setFormVerb('');
    setFormContent('');
    setEditModal({ mode: 'add', initialLane: laneTitle, initialSubject: subject });
  };

  // Mở modal sửa thẻ
  const handleOpenEdit = (item) => {
    setFormSubject(item.subject || 'Liên hợp quốc');
    setFormPeriod(item.period || timelineLanes[0]?.title || '1945 – 1975');
    setFormProgressBadge(item.progressBadge || 'Hoàn thành');
    setFormVerb(item.verb || '');
    setFormContent(item.content || '');
    setEditModal({ mode: 'edit', id: item.id });
  };

  // Lưu thẻ
  const handleSaveModal = (e) => {
    e?.preventDefault();
    if (!formVerb.trim() || !formContent.trim()) return;

    const itemData = {
      id: editModal.mode === 'edit' ? editModal.id : 'ax-' + Date.now(),
      subject: formSubject.trim(),
      period: formPeriod.trim(),
      progressBadge: formProgressBadge,
      verb: formVerb.trim(),
      content: formContent.trim(),
    };

    let nextList = [...axes];
    if (editModal.mode === 'edit') {
      nextList = nextList.map((ax) => (ax.id === editModal.id ? { ...ax, ...itemData } : ax));
    } else {
      nextList.push(itemData);
    }

    onSaveAxes(nextList);
    setEditModal(null);
  };

  // Xoá thẻ
  const handleDeleteItem = (id) => {
    if (window.confirm('Em có chắc muốn xoá hành động này khỏi trục?')) {
      const nextList = axes.filter((ax) => ax.id !== id);
      onSaveAxes(nextList);
    }
  };

  // Thêm chặng thời gian mới
  const handleAddLane = (e) => {
    e?.preventDefault();
    if (!newLaneTitle.trim()) return;
    setTimelineLanes([
      ...timelineLanes,
      { id: 'lane-' + Date.now(), title: newLaneTitle.trim() },
    ]);
    setNewLaneTitle('');
    setIsAddingLaneModal(false);
  };

  // Tìm màu của badge tiến độ
  const getBadgeStyle = (badgeText) => {
    const found = PROGRESS_BADGES.find((b) => b.label === badgeText);
    if (found) return { color: found.color, background: found.bg, borderColor: found.color + '40' };
    return { color: '#BE123C', background: '#FFF0F3', borderColor: '#FECDD6' };
  };

  return (
    <div className="axes-hub-container">
      {/* 1. THANH CHỌN 3 KIỂU MẪU (TEMPLATES PICKER) */}
      <div className="axes-template-header">
        <div className="axes-template-tabs">
          <button
            type="button"
            className={`axis-tpl-tab ${templateMode === 'timeline-lanes' ? 'active' : ''}`}
            onClick={() => setTemplateMode('timeline-lanes')}
          >
            <span className="tpl-num">Kiểu 1</span>
            <span className="tpl-name">Chặng Thời Gian (Timeline Lanes)</span>
          </button>

          <button
            type="button"
            className={`axis-tpl-tab ${templateMode === 'subject-matrix' ? 'active' : ''}`}
            onClick={() => setTemplateMode('subject-matrix')}
          >
            <span className="tpl-num">Kiểu 2</span>
            <span className="tpl-name">Ma Trận Chủ Thể (Subject Matrix)</span>
          </button>

          <button
            type="button"
            className={`axis-tpl-tab ${templateMode === 'essence-dual' ? 'active' : ''}`}
            onClick={() => setTemplateMode('essence-dual')}
          >
            <span className="tpl-num">Kiểu 3</span>
            <span className="tpl-name">Trục Bản Chất (Bất Biến vs Vận Động)</span>
          </button>
        </div>

        <div className="axes-header-actions">
          {templateMode === 'timeline-lanes' && (
            <button
              type="button"
              className="ios-btn sm ios-btn-secondary"
              onClick={() => setIsAddingLaneModal(true)}
            >
              + Thêm Chặng Mới
            </button>
          )}
          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={() => handleOpenAdd()}
          >
            + Thêm Thẻ Hành Động
          </button>
        </div>
      </div>

      {/* 2. HIỂN THỊ NỘI DUNG THEO TỪNG KIỂU MẪU */}

      {/* =========================================================================
          KIỂU 1: CHIA TRỤC THEO CHẶNG THỜI GIAN (TIMELINE LANES)
          ========================================================================= */}
      {templateMode === 'timeline-lanes' && (
        <div className="timeline-lanes-board">
          {timelineLanes.map((lane) => {
            // Lọc các thẻ thuộc chặng này
            const laneItems = axes.filter((ax) => {
              if (!ax.period) return false;
              return lane.title.includes(ax.period.slice(0, 9)) || ax.period.includes(lane.title.slice(0, 9));
            });

            return (
              <div key={lane.id} className="lane-column">
                <div className="lane-header">
                  <div className="lane-title-wrap">
                    <span className="lane-icon">⏱</span>
                    <h4 className="lane-title">{lane.title}</h4>
                  </div>
                  <span className="lane-counter">{laneItems.length} thẻ</span>
                </div>

                <div className="lane-cards-scroll">
                  {laneItems.length === 0 ? (
                    <div className="empty-lane-placeholder">
                      <span>Chưa có hành động nào trong chặng này.</span>
                      <button
                        type="button"
                        className="inline-add-text-btn"
                        onClick={() => handleOpenAdd(lane.title)}
                      >
                        + Thêm thẻ đầu tiên
                      </button>
                    </div>
                  ) : (
                    laneItems.map((item) => (
                      <div key={item.id} className="action-lane-card">
                        <div className="card-top-row">
                          <span className="subject-chip">{item.subject}</span>
                          <div className="card-mini-actions">
                            <button
                              type="button"
                              className="card-mini-btn"
                              title="Chỉnh sửa"
                              onClick={() => handleOpenEdit(item)}
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              className="card-mini-btn delete"
                              title="Xoá"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Định dạng thẻ 3 phần: [Tiến độ] + [Động từ đỏ hồng] + [Nội dung] */}
                        <div className="card-triplet-body">
                          <span
                            className="badge-progress-pill"
                            style={getBadgeStyle(item.progressBadge)}
                          >
                            {item.progressBadge}
                          </span>
                          <span className="verb-highlight">{item.verb}</span>
                          <span className="content-detail">{item.content}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className="lane-add-footer-btn"
                  onClick={() => handleOpenAdd(lane.title)}
                >
                  + Thêm hành động vào chặng này
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          KIỂU 2: CHIA TRỤC THEO CHỦ THỂ / LĨNH VỰC (SUBJECT MATRIX)
          ========================================================================= */}
      {templateMode === 'subject-matrix' && (
        <div className="subject-matrix-container">
          <div className="matrix-filter-bar">
            <span className="small muted">Lọc chủ thể:</span>
            <div className="subject-filter-chips">
              <button
                type="button"
                className={`sub-chip ${selectedSubject === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedSubject('ALL')}
              >
                Tất cả chủ thể
              </button>
              {uniqueSubjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`sub-chip ${selectedSubject === sub ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div className="subject-matrix-rows">
            {uniqueSubjects
              .filter((sub) => selectedSubject === 'ALL' || selectedSubject === sub)
              .map((subjectName) => {
                const subItems = axes.filter((ax) => ax.subject === subjectName);

                return (
                  <div key={subjectName} className="subject-row-box">
                    <div className="subject-row-header">
                      <div className="row" style={{ gap: '10px' }}>
                        <span className="subject-avatar-badge">🏛</span>
                        <div>
                          <h4 className="subject-name-head">{subjectName}</h4>
                          <span className="small muted">
                            {subItems.length} hành động & chủ trương qua các thời kỳ
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ios-btn sm ios-btn-secondary"
                        onClick={() => handleOpenAdd(null, subjectName)}
                      >
                        + Thêm vào {subjectName}
                      </button>
                    </div>

                    <div className="subject-items-flow">
                      {subItems.length === 0 ? (
                        <p className="empty-sub-text">Chưa có dữ liệu hành động cho chủ thể này.</p>
                      ) : (
                        subItems.map((item) => (
                          <div key={item.id} className="subject-flow-card">
                            <div className="flow-card-head">
                              <span className="period-tag">📅 {item.period}</span>
                              <div className="card-mini-actions">
                                <button
                                  type="button"
                                  className="card-mini-btn"
                                  onClick={() => handleOpenEdit(item)}
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  className="card-mini-btn delete"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            <div className="card-triplet-body">
                              <span
                                className="badge-progress-pill"
                                style={getBadgeStyle(item.progressBadge)}
                              >
                                {item.progressBadge}
                              </span>
                              <span className="verb-highlight">{item.verb}</span>
                              <span className="content-detail">{item.content}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          KIỂU 3: CHIA ĐÔI TRỤC BẢN CHẤT: BẤT BIẾN VS VẬN ĐỘNG (LÕI 4)
          ========================================================================= */}
      {templateMode === 'essence-dual' && (
        <div className="essence-dual-container">
          {/* Bộ chọn chuyên đề quá trình dài */}
          <div className="essence-topic-picker">
            <span className="small muted" style={{ fontWeight: 750 }}>Chọn quá trình lịch sử dài:</span>
            <div className="topic-pill-tabs">
              {DEFAULT_AXIS_DATA.essenceTopics.map((top) => (
                <button
                  key={top.id}
                  type="button"
                  className={`topic-pill-tab ${selectedEssenceTopic === top.id ? 'active' : ''}`}
                  onClick={() => setSelectedEssenceTopic(top.id)}
                >
                  {top.title}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const currentTopic =
              DEFAULT_AXIS_DATA.essenceTopics.find((t) => t.id === selectedEssenceTopic) ||
              DEFAULT_AXIS_DATA.essenceTopics[0];

            return (
              <div className="essence-dual-split">
                {/* CỘT TRÁI: BẤT BIẾN (XUYÊN SUỐT KHÔNG ĐỔI) */}
                <div className="essence-column invariable-col">
                  <div className="col-header invariable-head">
                    <div className="row" style={{ gap: '8px' }}>
                      <span className="essence-col-badge invariable">BẤT BIẾN</span>
                      <div>
                        <h4 className="col-title">Nguyên tắc & Mục tiêu Xuyên suốt</h4>
                        <p className="col-sub">Giữ nguyên không thay đổi qua mọi giai đoạn lịch sử</p>
                      </div>
                    </div>
                    <span className="counter-pill">{currentTopic.invariable.length}</span>
                  </div>

                  <div className="essence-cards-list">
                    {currentTopic.invariable.map((inv) => (
                      <div key={inv.id} className="essence-node-card invariable-card">
                        <div className="card-triplet-body">
                          <span
                            className="badge-progress-pill"
                            style={getBadgeStyle(inv.progressBadge)}
                          >
                            {inv.progressBadge}
                          </span>
                          <span className="verb-highlight invariable-verb">{inv.verb}</span>
                          <span className="content-detail">{inv.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-footer-note">
                    💡 <b>Quy tắc làm bài:</b> Các mệnh đề đề thi khẳng định "thay đổi mục tiêu cơ bản" hoặc "xoá bỏ nguyên tắc đồng thuận" đều là <b>Mệnh đề SAI</b>.
                  </div>
                </div>

                {/* CỘT PHẢI: VẬN ĐỘNG (TỪNG BƯỚC / PHÁT TRIỂN DẦN) */}
                <div className="essence-column dynamic-col">
                  <div className="col-header dynamic-head">
                    <div className="row" style={{ gap: '8px' }}>
                      <span className="essence-col-badge dynamic">VẬN ĐỘNG</span>
                      <div>
                        <h4 className="col-title">Biện pháp & Cơ cấu Phát triển dần</h4>
                        <p className="col-sub">Từng bước mở rộng, linh hoạt thích ứng với thời cuộc</p>
                      </div>
                    </div>
                    <span className="counter-pill">{currentTopic.dynamic.length}</span>
                  </div>

                  <div className="essence-cards-list">
                    {currentTopic.dynamic.map((dyn) => (
                      <div key={dyn.id} className="essence-node-card dynamic-card">
                        <div className="card-triplet-body">
                          <span
                            className="badge-progress-pill"
                            style={getBadgeStyle(dyn.progressBadge)}
                          >
                            {dyn.progressBadge}
                          </span>
                          <span className="verb-highlight dynamic-verb">{dyn.verb}</span>
                          <span className="content-detail">{dyn.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-footer-note dynamic-footer">
                    🚀 <b>Quy tắc làm bài:</b> Các mệnh đề đề thi nhấn mạnh "đã mở rộng ngay từ đầu" hay "hoàn thành lập tức" đều là bẫy phóng đại. Luôn chú ý chữ <b>"Từng bước"</b>, <b>"Bước đầu"</b>!
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          MODAL THÊM / CHỈNH SỬA THẺ HÀNH ĐỘNG
          ========================================================================= */}
      {editModal && (
        <FormDialog
          title={editModal.mode === 'edit' ? 'Chỉnh sửa Thẻ Hành Động' : '+ Thêm Thẻ Hành Động Vào Trục'}
          onClose={() => setEditModal(null)}
        >
          <form onSubmit={handleSaveModal} className="axis-form-dialog">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Chủ thể / Tổ chức *</span>
                <input
                  type="text"
                  required
                  list="subjects-datalist"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="VD: Liên hợp quốc, ASEAN, Đảng CSVN..."
                />
                <datalist id="subjects-datalist">
                  {uniqueSubjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>

              <label className="field">
                <span>Chặng thời gian / Giai đoạn *</span>
                <input
                  type="text"
                  required
                  list="lanes-datalist"
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(e.target.value)}
                  placeholder="VD: 1945 – 1975, 1986 – 1995..."
                />
                <datalist id="lanes-datalist">
                  {timelineLanes.map((l) => (
                    <option key={l.id} value={l.title} />
                  ))}
                </datalist>
              </label>
            </div>

            {/* 1. Badge Tiến độ / Tính chất */}
            <div className="field">
              <span>1. Badge Tiến độ / Tính chất (Chọn 1 chạm nhanh):</span>
              <div className="progress-selector-grid">
                {PROGRESS_BADGES.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    className={`progress-chip-btn ${formProgressBadge === b.label ? 'is-selected' : ''}`}
                    style={formProgressBadge === b.label ? { background: b.color, color: '#FFFFFF', borderColor: b.color } : { color: b.color, borderColor: b.color + '60' }}
                    onClick={() => setFormProgressBadge(b.label)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Động từ chính */}
            <label className="field">
              <span>2. Động từ chính * (Tô màu đỏ hồng nổi bật đầu câu):</span>
              <div className="verb-input-row">
                <input
                  type="text"
                  required
                  value={formVerb}
                  onChange={(e) => setFormVerb(e.target.value)}
                  placeholder="VD: Thông qua, Ký kết, Triển khai, Kiên định..."
                />
              </div>
              <div className="verb-suggestions-row">
                <span className="small muted">Gợi ý nhanh:</span>
                {COMMON_ACTION_VERBS.slice(0, 6).map((vb) => (
                  <button
                    key={vb}
                    type="button"
                    className="verb-quick-tag"
                    onClick={() => setFormVerb(vb)}
                  >
                    {vb}
                  </button>
                ))}
              </div>
            </label>

            {/* 3. Nội dung chi tiết */}
            <label className="field">
              <span>3. Nội dung chi tiết phía sau * (Mục tiêu, đối tượng, kết quả):</span>
              <textarea
                rows={3}
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="VD: Hiến chương Liên hợp quốc xác lập nguyên tắc nhất trí 5 nước lớn HĐBA."
              />
            </label>

            <div className="row between" style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => setEditModal(null)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="ios-btn sm ios-btn-primary">
                {editModal.mode === 'edit' ? 'Cập nhật Thẻ' : 'Lưu Thẻ Vào Trục'}
              </button>
            </div>
          </form>
        </FormDialog>
      )}

      {/* =========================================================================
          MODAL THÊM CHẶNG THỜI GIAN MỚI
          ========================================================================= */}
      {isAddingLaneModal && (
        <FormDialog
          title="+ Thêm Chặng Thời Gian Mới"
          onClose={() => setIsAddingLaneModal(false)}
        >
          <form onSubmit={handleAddLane} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
            <label className="field">
              <span>Tiêu đề chặng thời gian *</span>
              <input
                type="text"
                required
                value={newLaneTitle}
                onChange={(e) => setNewLaneTitle(e.target.value)}
                placeholder="VD: 1986 – 1995 (Giai đoạn đầu Đổi mới)..."
              />
            </label>

            <div className="row between" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="ios-btn sm ios-btn-secondary"
                onClick={() => setIsAddingLaneModal(false)}
              >
                Huỷ bỏ
              </button>
              <button type="submit" className="ios-btn sm ios-btn-primary">
                Tạo Chặng
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}

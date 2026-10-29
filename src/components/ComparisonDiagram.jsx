import { useState } from 'react';
import { FormDialog } from './Modal';

// Dữ liệu mẫu phong phú cho Bài 1 (Lõi 5)
export const DEFAULT_COMPARISONS_LIST = [
  {
    id: 'cmp-lhq-asean',
    title: 'Đối chiếu Liên hợp quốc (1945) vs ASEAN (1967)',
    columns: [
      { id: 'col-lhq', name: 'Liên hợp quốc (1945)', sub: 'Tổ chức đa phương toàn cầu' },
      { id: 'col-asean', name: 'ASEAN (1967)', sub: 'Tổ chức liên chính phủ khu vực ĐNA' },
    ],
    rows: [
      {
        id: 'r-1',
        criteria: '1. Bối cảnh lịch sử',
        isMerged: false,
        values: {
          'col-lhq': 'Sau CTTG II (1945), nhân loại cần một tổ chức toàn cầu ngăn chặn thảm hoạ chiến tranh thế giới mới.',
          'col-asean': 'Trong Chiến tranh lạnh (1967), các nước ĐNA sau khi độc lập cần hợp tác phát triển kinh tế và bảo vệ an ninh.',
        },
        mergedValue: '',
      },
      {
        id: 'r-2',
        criteria: '2. Nhiệm vụ / Mục tiêu hàng đầu',
        isMerged: true, // GỘP Ô XANH (TƯƠNG ĐỒNG)
        values: {},
        mergedValue: '✓ Đều là tổ chức liên chính phủ nhằm duy trì nền hoà bình, an ninh và thúc đẩy hợp tác phát triển bền vững giữa các quốc gia thành viên.',
      },
      {
        id: 'r-3',
        criteria: '3. Cơ chế biểu quyết / Nguyên tắc',
        isMerged: false,
        values: {
          'col-lhq': 'Áp dụng nguyên tắc nhất trí giữa 5 nước lớn thường trực Hội đồng Bảo an (quyền phủ quyết veto).',
          'col-asean': 'Áp dụng tuyệt đối nguyên tắc đồng thuận (consensus) giữa tất cả các nước thành viên ("Phương cách ASEAN").',
        },
        mergedValue: '',
      },
      {
        id: 'r-4',
        criteria: '4. Phương thức / Phạm vi giải quyết',
        isMerged: false,
        values: {
          'col-lhq': 'Quy mô toàn cầu (193 quốc gia thành viên), giải quyết các vấn đề an ninh tập thể đa phương.',
          'col-asean': 'Quy mô khu vực Đông Nam Á (hiện có 10 thành viên), tập trung liên kết nội khối và vai trò trung tâm khu vực.',
        },
        mergedValue: '',
      },
    ],
    lessons: [
      {
        id: 'ls-1',
        practicalHistory: 'Nguyên tắc bình đẳng chủ quyền và tôn trọng luật pháp quốc tế của LHQ và ASEAN.',
        currentLesson: 'Thực hiện nhất quán đường lối đối ngoại độc lập, tự chủ, đa phương hoá, đa dạng hoá; chủ động và tích cực hội nhập quốc tế toàn diện, sâu rộng.',
      },
      {
        id: 'ls-2',
        practicalHistory: 'Việt Nam nâng cao vị thế trong LHQ và ASEAN nhờ tiềm lực kinh tế và uy tín quốc tế ngày càng tăng.',
        currentLesson: 'Thực lực quốc gia là điều kiện tiên quyết cho thắng lợi của ngoại giao; kết hợp chặt chẽ sức mạnh dân tộc với sức mạnh thời đại.',
      },
    ],
    wartimeBlacklist: [
      'liên minh phòng thủ quân sự',
      'đấu tranh quân sự',
      'hoàn thành cách mạng dân tộc dân chủ nhân dân',
      'đối đầu khối quân sự',
      'bao cấp kinh tế',
    ],
  },
  {
    id: 'cmp-ianta-versailles',
    title: 'Đối chiếu Hội nghị I-an-ta (1945) vs Hệ thống Véc-xai - Oa-sinh-tơn (1919)',
    columns: [
      { id: 'col-ianta', name: 'Trật tự I-an-ta (1945)', sub: 'Sau CTTG II (Hai cực Mỹ - Xô)' },
      { id: 'col-ver', name: 'Trật tự Véc-xai - Oa-sinh-tơn (1919)', sub: 'Sau CTTG I (Đế quốc thắng trận)' },
    ],
    rows: [
      {
        id: 'r-v1',
        criteria: '1. Bối cảnh lịch sử',
        isMerged: true,
        values: {},
        mergedValue: '✓ Đều được ký kết vào giai đoạn kết thúc của một cuộc Chiến tranh thế giới nhằm phân chia quyền lợi và xác lập trật tự thế giới mới.',
      },
      {
        id: 'r-v2',
        criteria: '2. Nhiệm vụ / Mục tiêu hàng đầu',
        isMerged: false,
        values: {
          'col-ianta': 'Tiêu diệt tận gốc phát xít, duy trì hoà bình thế giới thông qua tổ chức Liên hợp quốc (có sự tham gia của Liên Xô).',
          'col-ver': 'Phân chia quyền lợi thuộc địa giữa các đế quốc thắng trận, đàn áp phong trào cách mạng và cô lập nước Nga Xô viết.',
        },
        mergedValue: '',
      },
      {
        id: 'r-v3',
        criteria: '3. Cơ cấu lực lượng tham gia',
        isMerged: false,
        values: {
          'col-ianta': 'Gồm 2 phe đối lập về ý thức hệ: Tư bản chủ nghĩa (Mỹ, Anh) và Xã hội chủ nghĩa (Liên Xô).',
          'col-ver': 'Hoàn toàn là các nước đế quốc tư bản thắng trận (Anh, Pháp, Mỹ, Nhật...).',
        },
        mergedValue: '',
      },
      {
        id: 'r-v4',
        criteria: '4. Tính chất trật tự',
        isMerged: false,
        values: {
          'col-ianta': 'Có mặt tích cực: giải giáp phát xít, công nhận quyền độc lập tự quyết của nhiều dân tộc Á - Phi.',
          'col-ver': 'Mang tính chất phản động, áp đặt và chia chác thuộc địa, làm nảy sinh mầm mống CTTG II.',
        },
        mergedValue: '',
      },
    ],
    lessons: [
      {
        id: 'ls-v1',
        practicalHistory: 'Sự thoả hiệp giữa các cường quốc tại I-an-ta phân chia phạm vi ảnh hưởng ở châu Á.',
        currentLesson: 'Kiên quyết giữ vững độc lập, tự chủ; không để bị lôi kéo hoặc trở thành quân cờ trong sự cạnh tranh chiến lược giữa các nước lớn.',
      },
    ],
    wartimeBlacklist: [
      'liên minh với một nước lớn chống nước lớn khác',
      'đối đầu ý thức hệ cực đoan',
      'bế quan toả cảng',
    ],
  },
];

export default function ComparisonDiagram({ comparisons = [], onSaveComparisons }) {
  const list = comparisons.length > 0 ? comparisons : DEFAULT_COMPARISONS_LIST;

  // Bảng đối chiếu đang xem
  const [selectedId, setSelectedId] = useState(list[0]?.id || 'cmp-lhq-asean');
  const currentCmp = list.find((it) => it.id === selectedId) || list[0];

  // Modal thêm / chỉnh sửa bảng đối chiếu
  const [editModal, setEditModal] = useState(null); // { mode: 'add' | 'edit', data?: object }

  // State thêm từ khoá blacklist nhanh
  const [newBlacklistWord, setNewBlacklistWord] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCol1, setFormCol1] = useState('');
  const [formCol2, setFormCol2] = useState('');
  const [formCol3, setFormCol3] = useState('');
  const [formLessonHistory, setFormLessonHistory] = useState('');
  const [formLessonCurrent, setFormLessonCurrent] = useState('');

  // Chuyển đổi trạng thái Gộp ô (Tương đồng) <-> Tách cột (Khác biệt) của 1 hàng
  const toggleRowMerge = (rowId) => {
    const updatedRows = currentCmp.rows.map((r) => {
      if (r.id !== rowId) return r;
      if (r.isMerged) {
        // Đổi từ Gộp -> Tách cột
        return {
          ...r,
          isMerged: false,
          values: {
            [currentCmp.columns[0]?.id || 'col-1']: r.mergedValue.replace('✓ ', '') + ' (Đặc điểm A)',
            [currentCmp.columns[1]?.id || 'col-2']: r.mergedValue.replace('✓ ', '') + ' (Đặc điểm B)',
          },
        };
      } else {
        // Đổi từ Tách cột -> Gộp ô xanh
        const firstVal = Object.values(r.values)[0] || '';
        return {
          ...r,
          isMerged: true,
          mergedValue: `✓ ${firstVal}`,
        };
      }
    });

    const updatedCmp = { ...currentCmp, rows: updatedRows };
    const nextList = list.map((it) => (it.id === currentCmp.id ? updatedCmp : it));
    onSaveComparisons(nextList);
  };

  // Thêm hàng tiêu chí mới
  const handleAddRow = () => {
    const newCriteriaName = window.prompt('Nhập tên tiêu chí đối chiếu mới (VD: Ý thức hệ, Vai trò đối với phong trào giải phóng dân tộc...):');
    if (!newCriteriaName?.trim()) return;

    const newRow = {
      id: 'r-' + Date.now(),
      criteria: newCriteriaName.trim(),
      isMerged: false,
      values: {
        [currentCmp.columns[0]?.id || 'col-1']: 'Đặc điểm của ' + (currentCmp.columns[0]?.name || 'Đối tượng A'),
        [currentCmp.columns[1]?.id || 'col-2']: 'Đặc điểm của ' + (currentCmp.columns[1]?.name || 'Đối tượng B'),
      },
      mergedValue: '',
    };

    const updatedCmp = { ...currentCmp, rows: [...currentCmp.rows, newRow] };
    const nextList = list.map((it) => (it.id === currentCmp.id ? updatedCmp : it));
    onSaveComparisons(nextList);
  };

  // Thêm từ khoá blacklist thời chiến
  const handleAddBlacklistWord = (e) => {
    e?.preventDefault();
    if (!newBlacklistWord.trim()) return;
    const word = newBlacklistWord.trim().toLowerCase();
    if (currentCmp.wartimeBlacklist?.includes(word)) return;

    const nextBlacklist = [...(currentCmp.wartimeBlacklist || []), word];
    const updatedCmp = { ...currentCmp, wartimeBlacklist: nextBlacklist };
    const nextList = list.map((it) => (it.id === currentCmp.id ? updatedCmp : it));
    onSaveComparisons(nextList);
    setNewBlacklistWord('');
  };

  // Xoá từ khoá blacklist
  const handleRemoveBlacklistWord = (w) => {
    const nextBlacklist = (currentCmp.wartimeBlacklist || []).filter((item) => item !== w);
    const updatedCmp = { ...currentCmp, wartimeBlacklist: nextBlacklist };
    const nextList = list.map((it) => (it.id === currentCmp.id ? updatedCmp : it));
    onSaveComparisons(nextList);
  };

  // Mở modal thêm bảng đối chiếu mới
  const handleOpenAdd = () => {
    setFormTitle('');
    setFormCol1('Sự kiện / Chiến lược A');
    setFormCol2('Sự kiện / Chiến lược B');
    setFormCol3('');
    setFormLessonHistory('');
    setFormLessonCurrent('');
    setEditModal({ mode: 'add' });
  };

  // Lưu bảng đối chiếu
  const handleSaveModal = (e) => {
    e?.preventDefault();
    if (!formTitle.trim() || !formCol1.trim() || !formCol2.trim()) return;

    const cols = [
      { id: 'col-1', name: formCol1.trim(), sub: 'Đối tượng 1' },
      { id: 'col-2', name: formCol2.trim(), sub: 'Đối tượng 2' },
    ];
    if (formCol3.trim()) {
      cols.push({ id: 'col-3', name: formCol3.trim(), sub: 'Đối tượng 3' });
    }

    const defaultRows = [
      {
        id: 'r-1',
        criteria: '1. Bối cảnh lịch sử',
        isMerged: false,
        values: { 'col-1': 'Bối cảnh xuất hiện của ' + formCol1, 'col-2': 'Bối cảnh xuất hiện của ' + formCol2 },
        mergedValue: '',
      },
      {
        id: 'r-2',
        criteria: '2. Nhiệm vụ / Mục tiêu hàng đầu',
        isMerged: true,
        values: {},
        mergedValue: '✓ Điểm tương đồng về mục tiêu chiến lược giữa các đối tượng.',
      },
      {
        id: 'r-3',
        criteria: '3. Lực lượng tham gia / Cơ chế',
        isMerged: false,
        values: { 'col-1': 'Lực lượng của ' + formCol1, 'col-2': 'Lực lượng của ' + formCol2 },
        mergedValue: '',
      },
      {
        id: 'r-4',
        criteria: '4. Phương thức / Phạm vi giải quyết',
        isMerged: false,
        values: { 'col-1': 'Phương thức của ' + formCol1, 'col-2': 'Phương thức của ' + formCol2 },
        mergedValue: '',
      },
    ];

    const newCmp = {
      id: editModal.mode === 'edit' ? editModal.id : 'cmp-' + Date.now(),
      title: formTitle.trim(),
      columns: cols,
      rows: defaultRows,
      lessons: [
        {
          id: 'ls-' + Date.now(),
          practicalHistory: formLessonHistory.trim() || 'Thực tiễn lịch sử qua các sự kiện đối chiếu.',
          currentLesson: formLessonCurrent.trim() || 'Bài học vận dụng giữ vững độc lập tự chủ và hội nhập quốc tế.',
        },
      ],
      wartimeBlacklist: [
        'liên minh phòng thủ quân sự',
        'đấu tranh quân sự',
        'hoàn thành cách mạng dân tộc dân chủ nhân dân',
      ],
    };

    let nextList = [...list];
    if (editModal.mode === 'edit') {
      nextList = nextList.map((it) => (it.id === editModal.id ? newCmp : it));
    } else {
      nextList.push(newCmp);
      setSelectedId(newCmp.id);
    }

    onSaveComparisons(nextList);
    setEditModal(null);
  };

  // Xoá bảng đối chiếu
  const handleDelete = (id) => {
    if (window.confirm('Em có chắc chắn muốn xoá bảng đối chiếu này?')) {
      const nextList = list.filter((it) => it.id !== id);
      onSaveComparisons(nextList);
      if (nextList.length > 0) setSelectedId(nextList[0].id);
    }
  };

  if (!currentCmp) return null;

  const cols = currentCmp.columns || [];

  return (
    <div className="comparison-hub-container">
      {/* 1. THANH CHỌN BẢNG ĐỐI CHIẾU */}
      <div className="cmp-top-control-bar">
        <div className="cmp-topic-pill-tabs">
          {list.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`cmp-tab-btn ${selectedId === it.id ? 'active' : ''}`}
              onClick={() => setSelectedId(it.id)}
            >
              <span className="cmp-tab-icon">⚖️</span>
              <span className="cmp-tab-text">{it.title}</span>
            </button>
          ))}
        </div>

        <div className="cmp-control-actions">
          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={handleOpenAdd}
          >
            + Tạo Bảng Đối Chiếu Mới
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. BÀN CÂN ĐỐI CHIẾU (SO SÁNH 2-3 CỘT VỚI TÍNH NĂNG GỘP Ô & TÔ SÁNG)
          ========================================================================= */}
      <div className="cmp-main-scale-card">
        <div className="cmp-table-head-info">
          <div>
            <h3 className="cmp-table-title">{currentCmp.title}</h3>
            <p className="cmp-table-sub">
              Bảng so sánh đa chiều. Chạm nút <b>[✓ Giống nhau]</b> ở mỗi hàng để gộp ô xanh tương đồng, hoặc <b>[★ Khác biệt]</b> để tách cột và làm nổi bật từ khóa đối chiếu.
            </p>
          </div>

          <button
            type="button"
            className="ios-btn sm ios-btn-secondary"
            onClick={handleAddRow}
          >
            + Thêm Hàng Tiêu Chí
          </button>
        </div>

        {/* BẢNG SO SÁNH NÂNG CAO */}
        <div className="cmp-table-responsive-box">
          <table className="cmp-interactive-table">
            <thead>
              <tr>
                <th className="th-criteria" style={{ width: '22%' }}>
                  Tiêu chí đối chiếu
                </th>
                {cols.map((col, ci) => (
                  <th key={col.id || ci} style={{ width: `${78 / cols.length}%` }}>
                    <div className="th-col-content">
                      <span className="col-name">{col.name}</span>
                      {col.sub && <span className="col-sub">{col.sub}</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentCmp.rows?.map((row) => {
                const isMerged = row.isMerged;

                return (
                  <tr key={row.id} className={`cmp-row ${isMerged ? 'is-merged-row' : 'is-diff-row'}`}>
                    {/* Cột 1: Tên tiêu chí & nút chuyển Gộp / Tách */}
                    <td className="td-criteria">
                      <div className="criteria-wrap">
                        <span className="criteria-name">{row.criteria}</span>
                        <button
                          type="button"
                          className={`row-toggle-btn ${isMerged ? 'btn-merged' : 'btn-diff'}`}
                          title="Bấm để chuyển giữa Tương đồng (Gộp ô) và Khác biệt (Tách cột)"
                          onClick={() => toggleRowMerge(row.id)}
                        >
                          {isMerged ? '✓ Tương đồng (Đã gộp)' : '★ Khác biệt (Tách cột)'}
                        </button>
                      </div>
                    </td>

                    {/* Trường hợp 1: HÀNG GỘP Ô XANH (TƯƠNG ĐỒNG) */}
                    {isMerged ? (
                      <td colSpan={cols.length} className="td-merged-cell">
                        <div className="merged-highlight-box">
                          <span className="merged-badge">✓ ĐIỂM TƯƠNG ĐỒNG CỐT LÕI</span>
                          <p className="merged-text">{row.mergedValue || 'Điểm tương đồng giữa các đối tượng.'}</p>
                        </div>
                      </td>
                    ) : (
                      /* Trường hợp 2: HÀNG TÁCH CỘT VÀ TÔ SÁNG TỪ KHOÁ KHÁC BIỆT */
                      cols.map((col) => {
                        const cellText = row.values?.[col.id] || row.values?.[cols[0]?.id] || 'Đang cập nhật...';
                        return (
                          <td key={col.id} className="td-diff-cell">
                            <div className="diff-cell-box">
                              <span className="diff-col-indicator">{col.name}</span>
                              <p className="diff-cell-text">{cellText}</p>
                            </div>
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          3. KHUNG RÚT RA BÀI HỌC KINH NGHIỆM CHO HIỆN NAY (LÕI 5)
          ========================================================================= */}
      <div className="cmp-lessons-section">
        <div className="lessons-section-head">
          <div className="row" style={{ gap: '10px' }}>
            <span className="lesson-badge-icon">⭐</span>
            <div>
              <h4 className="lessons-head-title">Bài học kinh nghiệm vận dụng cho hiện nay</h4>
              <p className="lessons-head-sub">
                Cầu nối từ <b>Thực tiễn lịch sử</b> ➔ <b>Bài học xây dựng, bảo vệ Tổ quốc & đối ngoại hôm nay</b>
              </p>
            </div>
          </div>
        </div>

        <div className="lessons-cards-grid">
          {currentCmp.lessons?.map((ls) => (
            <div key={ls.id} className="lesson-bridge-card">
              {/* Vế 1: Thực tiễn lịch sử */}
              <div className="bridge-part history-part">
                <span className="bridge-tag tag-history">THỰC TIỄN LỊCH SỬ</span>
                <p className="bridge-content">{ls.practicalHistory}</p>
              </div>

              {/* Mũi tên bắc cầu */}
              <div className="bridge-arrow">➔</div>

              {/* Vế 2: Bài học hiện nay */}
              <div className="bridge-part current-part">
                <span className="bridge-tag tag-current">BÀI HỌC VẬN DỤNG HIỆN NAY</span>
                <p className="bridge-content">{ls.currentLesson}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. THẺ TỪ KHÓA THỜI CHIẾN BỊ LOẠI TRỪ (BLACKLIST BOX)
          ========================================================================= */}
      <div className="cmp-blacklist-container">
        <div className="blacklist-top-row">
          <div className="row" style={{ gap: '8px' }}>
            <span className="blacklist-ban-icon">⛔</span>
            <div>
              <h4 className="blacklist-head-title">
                Từ khoá thời chiến BỊ LOẠI TRỪ (Không chọn cho câu hỏi vận dụng hiện nay)
              </h4>
              <p className="blacklist-head-sub">
                Đề thi thường cài các từ mang tính chất thời chiến vào đáp án gây nhiễu. Gặp các từ này trong câu hỏi thời kỳ Đổi mới ➔ <b>LOẠI TRỪ NGAY</b>!
              </p>
            </div>
          </div>
        </div>

        <div className="blacklist-chips-display">
          {currentCmp.wartimeBlacklist?.map((word, wi) => (
            <span key={wi} className="blacklist-word-chip">
              <span className="bl-x">✕</span>
              <span className="bl-text">"{word}"</span>
              <button
                type="button"
                className="bl-remove-btn"
                title="Xoá từ này"
                onClick={() => handleRemoveBlacklistWord(word)}
              >
                ×
              </button>
            </span>
          ))}

          {/* Form thêm từ khoá nhanh */}
          <form onSubmit={handleAddBlacklistWord} className="bl-inline-add-form">
            <input
              type="text"
              placeholder="+ Thêm từ khoá bị loại trừ..."
              value={newBlacklistWord}
              onChange={(e) => setNewBlacklistWord(e.target.value)}
              className="bl-inline-input"
            />
            {newBlacklistWord.trim() && (
              <button type="submit" className="bl-inline-submit-btn">
                Thêm
              </button>
            )}
          </form>
        </div>
      </div>

      {/* =========================================================================
          MODAL THÊM / CHỈNH SỬA BẢNG ĐỐI CHIẾU
          ========================================================================= */}
      {editModal && (
        <FormDialog
          title={editModal.mode === 'edit' ? 'Chỉnh sửa Bảng Đối Chiếu' : '+ Tạo Bảng Đối Chiếu Mới'}
          onClose={() => setEditModal(null)}
        >
          <form onSubmit={handleSaveModal} className="cmp-form-dialog">
            <label className="field">
              <span>Tiêu đề bảng đối chiếu *</span>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="VD: Đối chiếu Chiến tranh đặc biệt (1961-1965) vs Chiến tranh cục bộ (1965-1968)..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <label className="field">
                <span>Cột đối tượng 1 *</span>
                <input
                  type="text"
                  required
                  value={formCol1}
                  onChange={(e) => setFormCol1(e.target.value)}
                  placeholder="VD: Chiến tranh đặc biệt"
                />
              </label>

              <label className="field">
                <span>Cột đối tượng 2 *</span>
                <input
                  type="text"
                  required
                  value={formCol2}
                  onChange={(e) => setFormCol2(e.target.value)}
                  placeholder="VD: Chiến tranh cục bộ"
                />
              </label>

              <label className="field">
                <span>Cột đối tượng 3 (Tuỳ chọn)</span>
                <input
                  type="text"
                  value={formCol3}
                  onChange={(e) => setFormCol3(e.target.value)}
                  placeholder="VD: Việt Nam hoá chiến tranh"
                />
              </label>
            </div>

            <label className="field">
              <span>Thực tiễn lịch sử cốt lõi</span>
              <textarea
                rows={2}
                value={formLessonHistory}
                onChange={(e) => setFormLessonHistory(e.target.value)}
                placeholder="Tóm tắt thực tiễn lịch sử nổi bật..."
              />
            </label>

            <label className="field">
              <span>Bài học vận dụng cho công cuộc bảo vệ Tổ quốc & đối ngoại hiện nay</span>
              <textarea
                rows={3}
                value={formLessonCurrent}
                onChange={(e) => setFormLessonCurrent(e.target.value)}
                placeholder="VD: Kết hợp sức mạnh dân tộc với sức mạnh thời đại; xây dựng thế trận lòng dân..."
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
                {editModal.mode === 'edit' ? 'Cập nhật' : 'Tạo Bảng Đối Chiếu'}
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}

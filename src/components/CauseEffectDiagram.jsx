import { useState } from 'react';
import { FormDialog } from './Modal';

// Dữ liệu mẫu phong phú cho Bài 1 (LHQ & ASEAN)
export const DEFAULT_CAUSE_EFFECT_LIST = [
  {
    id: 'ce-un',
    eventTitle: 'Sự ra đời và hoạt động của Liên hợp quốc (1945 – nay)',
    time: '24-10-1945 – nay',
    coreResult: 'Hiến chương chính thức có hiệu lực, xác lập tổ chức đa phương toàn cầu lớn nhất hành tinh với nguyên tắc nhất trí 5 nước lớn thường trực HĐBA.',
    inputsKhachQuan: [
      'Chiến tranh thế giới thứ hai tàn phá khốc liệt nhân loại, để lại hậu quả thảm hoạ vô cùng nặng nề.',
      'Nguyện vọng tha thiết của nhân dân toàn thế giới là duy trì nền hoà bình và an ninh quốc tế bền vững.',
      'Sự thoả hiệp và nhất trí chiến lược giữa 3 cường quốc lớn (Liên Xô, Mỹ, Anh) tại Hội nghị I-an-ta.'
    ],
    inputsChuQuan: [
      'Ý chí quyết tâm ngăn ngừa thảm hoạ chiến tranh mới của 50 quốc gia tham gia soạn thảo Hiến chương.',
      'Sự tiến bộ trong nhận thức pháp lý quốc tế về quyền dân tộc tự quyết và quyền bình đẳng con người.'
    ],
    outputsDirect: [
      'Thành lập 6 cơ quan chính (Đại hội đồng, Hội đồng Bảo an, Ban Thư ký...) và các tổ chức chuyên môn (UNESCO, UNICEF, WHO).',
      'Thách thức: Cơ chế đồng thuận của 5 nước lớn bị cản trở bởi mâu thuẫn thời Chiến tranh lạnh; nhiều xung đột cục bộ chưa ngăn chặn kịp thời.'
    ],
    outputsVietNam: [
      'Tạo diễn đàn quốc tế đa phương giúp Việt Nam nâng cao vị thế và uy tín trên trường quốc tế.',
      'Việt Nam 2 lần đảm nhiệm xuất sắc Uỷ viên không thường trực Hội đồng Bảo an (nhiệm kỳ 2008-2009 và 2020-2021).',
      'Đóng góp tích cực vào lực lượng gìn giữ hoà bình LHQ (Phái bộ Nam Xu-đăng và CH Trung Phi).'
    ],
    outputsQuocTe: [
      'Ngăn ngừa thành công nguy cơ bùng nổ một cuộc Chiến tranh thế giới thứ ba mang tính hủy diệt hạt nhân.',
      'Thúc đẩy quá trình phi thực dân hoá, xoá bỏ chủ nghĩa thực dân cũ và chế độ phân biệt chủng tộc Apartheid.',
      'Đề ra và thúc đẩy 17 Mục tiêu Phát triển Bền vững (SDGs 2030) trên quy mô toàn cầu.'
    ],
    exaggerationTraps: [
      'Bẫy sai bản chất: "Liên hợp quốc là chính phủ toàn cầu có thẩm quyền lập pháp can thiệp trực tiếp vào luật pháp nội bộ của các quốc gia". (Sai: Bình đẳng chủ quyền, không can thiệp nội bộ).',
      'Bẫy phóng đại mức độ: "Liên hợp quốc đã giải quyết triệt để mọi tranh chấp và loại bỏ hoàn toàn các cuộc xung đột vũ trang trên thế giới". (Sai: Xung đột cục bộ và chạy đua vũ trang vẫn diễn ra phức tạp).',
      'Bẫy thời điểm: "Liên hợp quốc thành lập ngay trong khi CTTG II đang diễn ra khốc liệt". (Sai: Hội nghị Xan Phran-xi-xcô họp từ tháng 4 đến tháng 6/1945 và Hiến chương có hiệu lực ngày 24-10-1945 sau khi CTTG II đã kết thúc).'
    ]
  },
  {
    id: 'ce-asean',
    eventTitle: 'Sự thành lập và phát triển của ASEAN (1967 – 2015)',
    time: '8-8-1967 – 31-12-2015',
    coreResult: 'Ký Tuyên bố Băng Cốc (1967), từng bước mở rộng thành ASEAN 10 và chính thức thành lập Cộng đồng ASEAN với 3 trụ cột vững chắc vào ngày 31-12-2015.',
    inputsKhachQuan: [
      'Tác động của cuộc Chiến tranh lạnh và sự can thiệp của các nước lớn vào khu vực Đông Nam Á.',
      'Sự xuất hiện và thành công của các mô hình liên kết khu vực trên thế giới (điển hình là Cộng đồng châu Âu - EC).'
    ],
    inputsChuQuan: [
      'Nhu cầu liên kết, hợp tác giữa các nước sau khi giành độc lập để cùng phát triển kinh tế và bảo vệ chủ quyền.',
      'Mong muốn hạn chế sự can thiệp của các cường quốc bên ngoài vào nội bộ Đông Nam Á.'
    ],
    outputsDirect: [
      'Thành tựu: Biến Đông Nam Á từ khu vực chia rẽ, đối đầu thành khu vực hoà bình, ổn định và liên kết kinh tế năng động.',
      'Thách thức: Khoảng cách phát triển kinh tế giữa các nước thành viên; thách thức an ninh biển và cơ chế đồng thuận khi có bất đồng quan điểm.'
    ],
    outputsVietNam: [
      'Đánh dấu bước ngoặt lớn trong chính sách đối ngoại Đổi mới (28-7-1995: VN là thành viên thứ 7).',
      'Tạo môi trường hoà bình, thuận lợi để Việt Nam phát triển kinh tế - xã hội và hội nhập quốc tế sâu rộng.',
      'Việt Nam nhiều lần giữ vai trò Chủ tịch luân phiên ASEAN (1998, 2010, 2020) và đề ra nhiều sáng kiến chiến lược.'
    ],
    outputsQuocTe: [
      'Khẳng định vai trò trung tâm (Centrality) của ASEAN trong các cấu trúc hợp tác an ninh khu vực Châu Á - Thái Bình Dương (ARF, EAS, ASEAN+3).',
      'Tạo dựng chuẩn mực ứng xử quốc tế tiến bộ thông qua Hiệp ước Thân thiện và Hợp tác Đông Nam Á (TAC).'
    ],
    exaggerationTraps: [
      'Bẫy sai tính chất: "ASEAN là một liên minh phòng thủ quân sự nhằm đối trọng với các cường quốc". (Sai: ASEAN là tổ chức liên kết hợp tác toàn diện về chính trị, kinh tế, văn hoá, KHÔNG PHẢI khối quân sự).',
      'Bẫy phóng đại thành viên: "Ngay khi thành lập năm 1967, ASEAN đã bao gồm đầy đủ toàn bộ 10 quốc gia Đông Nam Á". (Sai: Năm 1967 chỉ có 5 nước sáng lập, đến năm 1999 mới hoàn tất ASEAN 10).',
      'Bẫy cơ chế: "Các quyết định của ASEAN được thông qua bằng phương thức biểu quyết theo đa số quá bán". (Sai: Tuyệt đối tuân thủ nguyên tắc đồng thuận - Consensus).'
    ]
  }
];

export default function CauseEffectDiagram({ causeEffects = [], onSaveCauseEffects }) {
  // Danh sách sơ đồ nhân quả đang dùng (lấy từ props hoặc mặc định)
  const list = causeEffects.length > 0 ? causeEffects : DEFAULT_CAUSE_EFFECT_LIST;

  // Sơ đồ đang chọn để xem/tương tác
  const [selectedId, setSelectedId] = useState(list[0]?.id || 'ce-un');
  const currentCE = list.find((item) => item.id === selectedId) || list[0];

  // Modal thêm / sửa sơ đồ
  const [editModal, setEditModal] = useState(null); // { mode: 'add' | 'edit', data?: object }

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCoreResult, setFormCoreResult] = useState('');
  const [formInputsKhachQuan, setFormInputsKhachQuan] = useState('');
  const [formInputsChuQuan, setFormInputsChuQuan] = useState('');
  const [formOutputsDirect, setFormOutputsDirect] = useState('');
  const [formOutputsVietNam, setFormOutputsVietNam] = useState('');
  const [formOutputsQuocTe, setFormOutputsQuocTe] = useState('');
  const [formTraps, setFormTraps] = useState('');

  // Mở modal thêm sơ đồ mới
  const handleOpenAdd = () => {
    setFormTitle('');
    setFormTime('');
    setFormCoreResult('');
    setFormInputsKhachQuan('');
    setFormInputsChuQuan('');
    setFormOutputsDirect('');
    setFormOutputsVietNam('');
    setFormOutputsQuocTe('');
    setFormTraps('');
    setEditModal({ mode: 'add' });
  };

  // Mở modal chỉnh sửa sơ đồ hiện tại
  const handleOpenEdit = (item) => {
    setFormTitle(item.eventTitle || '');
    setFormTime(item.time || '');
    setFormCoreResult(item.coreResult || '');
    setFormInputsKhachQuan(item.inputsKhachQuan?.join('\n') || '');
    setFormInputsChuQuan(item.inputsChuQuan?.join('\n') || '');
    setFormOutputsDirect(item.outputsDirect?.join('\n') || '');
    setFormOutputsVietNam(item.outputsVietNam?.join('\n') || '');
    setFormOutputsQuocTe(item.outputsQuocTe?.join('\n') || '');
    setFormTraps(item.exaggerationTraps?.join('\n') || '');
    setEditModal({ mode: 'edit', id: item.id });
  };

  // Lưu sơ đồ
  const handleSaveModal = (e) => {
    e?.preventDefault();
    if (!formTitle.trim()) return;

    const parseLines = (text) =>
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

    const newItem = {
      id: editModal.mode === 'edit' ? editModal.id : 'ce-' + Date.now(),
      eventTitle: formTitle.trim(),
      time: formTime.trim() || 'Thời kỳ hiện đại',
      coreResult: formCoreResult.trim() || 'Sự kiện tạo ra chuyển biến to lớn trong tiến trình lịch sử.',
      inputsKhachQuan: parseLines(formInputsKhachQuan),
      inputsChuQuan: parseLines(formInputsChuQuan),
      outputsDirect: parseLines(formOutputsDirect),
      outputsVietNam: parseLines(formOutputsVietNam),
      outputsQuocTe: parseLines(formOutputsQuocTe),
      exaggerationTraps: parseLines(formTraps),
    };

    let nextList = [...list];
    if (editModal.mode === 'edit') {
      nextList = nextList.map((it) => (it.id === editModal.id ? newItem : it));
    } else {
      nextList.push(newItem);
      setSelectedId(newItem.id);
    }

    onSaveCauseEffects(nextList);
    setEditModal(null);
  };

  // Xoá sơ đồ
  const handleDelete = (id) => {
    if (window.confirm('Em có chắc chắn muốn xoá sơ đồ nhân quả này?')) {
      const nextList = list.filter((it) => it.id !== id);
      onSaveCauseEffects(nextList);
      if (nextList.length > 0) setSelectedId(nextList[0].id);
    }
  };

  if (!currentCE) return null;

  return (
    <div className="cause-effect-hub">
      {/* 1. THANH CHUYỂN ĐỔI GIỮA CÁC SƠ ĐỒ NHÂN QUẢ */}
      <div className="ce-top-control-bar">
        <div className="ce-event-pill-tabs">
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ce-event-tab-btn ${selectedId === item.id ? 'active' : ''}`}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="ce-tab-icon">⚡</span>
              <span className="ce-tab-text">{item.eventTitle.slice(0, 38)}...</span>
            </button>
          ))}
        </div>

        <div className="ce-control-actions">
          <button
            type="button"
            className="ios-btn sm ios-btn-secondary"
            onClick={() => handleOpenEdit(currentCE)}
          >
            ✎ Sửa Sơ Đồ Này
          </button>
          <button
            type="button"
            className="ios-btn sm ios-btn-primary"
            onClick={handleOpenAdd}
          >
            + Thêm Sơ Đồ Mới
          </button>
        </div>
      </div>

      {/* 2. SƠ ĐỒ 3 KHỐI NỐI MŨI TÊN NGANG */}
      <div className="ce-horizontal-flow-stage">
        {/* =========================================================================
            KHỐI 1: ĐẦU VÀO (TRƯỚC SỰ KIỆN)
            ========================================================================= */}
        <div className="ce-stage-block block-input">
          <div className="stage-block-header input-head">
            <span className="block-step-badge">KHỐI 1 · TRƯỚC SỰ KIỆN</span>
            <h4 className="block-title">ĐẦU VÀO: Bối Cảnh & Nguyên Nhân</h4>
          </div>

          <div className="stage-compartments-container">
            {/* Ngăn 1: Khách quan (Bên ngoài) */}
            <div className="ce-compartment comp-khach-quan">
              <div className="comp-badge-row">
                <span className="comp-pill tag-khach-quan">Khách quan (Bên ngoài)</span>
                <span className="small muted">Bối cảnh thế giới & thời đại</span>
              </div>
              <ul className="comp-bullet-list">
                {currentCE.inputsKhachQuan?.length > 0 ? (
                  currentCE.inputsKhachQuan.map((item, idx) => <li key={idx}>{item}</li>)
                ) : (
                  <li className="muted">Chưa có dữ liệu nguyên nhân khách quan.</li>
                )}
              </ul>
            </div>

            {/* Ngăn 2: Chủ quan (Nội lực quyết định) */}
            <div className="ce-compartment comp-chu-quan">
              <div className="comp-badge-row">
                <span className="comp-pill tag-chu-quan">Chủ quan (Nội lực quyết định)</span>
                <span className="small muted">Ý chí & sự chuẩn bị nội tại</span>
              </div>
              <ul className="comp-bullet-list">
                {currentCE.inputsChuQuan?.length > 0 ? (
                  currentCE.inputsChuQuan.map((item, idx) => <li key={idx}>{item}</li>)
                ) : (
                  <li className="muted">Chưa có dữ liệu nguyên nhân chủ quan.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* MŨI TÊN DÒNG CHẢY 1 */}
        <div className="ce-flow-arrow">
          <div className="arrow-pulse-line" />
          <span className="arrow-head-icon">➔</span>
        </div>

        {/* =========================================================================
            KHỐI 2: SỰ KIỆN TRUNG TÂM (TRONG SỰ KIỆN)
            ========================================================================= */}
        <div className="ce-stage-block block-center-event">
          <div className="stage-block-header center-head">
            <span className="block-step-badge badge-center">KHỐI 2 · TRUNG TÂM</span>
            <span className="center-time-pill">📅 {currentCE.time}</span>
          </div>

          <div className="center-event-body">
            <h3 className="center-event-name">{currentCE.eventTitle}</h3>

            <div className="center-result-box">
              <span className="res-tag">KẾT QUẢ CỐT LÕI:</span>
              <p className="res-text">{currentCE.coreResult}</p>
            </div>
          </div>
        </div>

        {/* MŨI TÊN DÒNG CHẢY 2 */}
        <div className="ce-flow-arrow">
          <div className="arrow-pulse-line" />
          <span className="arrow-head-icon">➔</span>
        </div>

        {/* =========================================================================
            KHỐI 3: ĐẦU RA (SAU SỰ KIỆN)
            ========================================================================= */}
        <div className="ce-stage-block block-output">
          <div className="stage-block-header output-head">
            <span className="block-step-badge badge-output">KHỐI 3 · SAU SỰ KIỆN</span>
            <h4 className="block-title">ĐẦU RA: Ý Nghĩa & Hệ Quả</h4>
          </div>

          <div className="stage-compartments-container">
            {/* Ngăn 1: Thành tựu / Thách thức trực tiếp */}
            {currentCE.outputsDirect?.length > 0 && (
              <div className="ce-compartment comp-direct">
                <div className="comp-badge-row">
                  <span className="comp-pill tag-direct">Thành tựu & Thách thức trực tiếp</span>
                </div>
                <ul className="comp-bullet-list">
                  {currentCE.outputsDirect.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ngăn 2: Ý nghĩa đối với Việt Nam */}
            <div className="ce-compartment comp-viet-nam">
              <div className="comp-badge-row">
                <span className="comp-pill tag-viet-nam">🇻🇳 Ý nghĩa đối với Việt Nam</span>
                <span className="small muted">Vị thế & cơ hội phát triển</span>
              </div>
              <ul className="comp-bullet-list">
                {currentCE.outputsVietNam?.length > 0 ? (
                  currentCE.outputsVietNam.map((item, idx) => <li key={idx}>{item}</li>)
                ) : (
                  <li className="muted">Chưa có ghi chú ý nghĩa đối với Việt Nam.</li>
                )}
              </ul>
            </div>

            {/* Ngăn 3: Ý nghĩa đối với Quốc tế */}
            <div className="ce-compartment comp-quoc-te">
              <div className="comp-badge-row">
                <span className="comp-pill tag-quoc-te">🌐 Ý nghĩa đối với Quốc tế</span>
                <span className="small muted">Trật tự & hoà bình thế giới</span>
              </div>
              <ul className="comp-bullet-list">
                {currentCE.outputsQuocTe?.length > 0 ? (
                  currentCE.outputsQuocTe.map((item, idx) => <li key={idx}>{item}</li>)
                ) : (
                  <li className="muted">Chưa có ghi chú ý nghĩa đối với Quốc tế.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. GHIM "BẪY PHÓNG ĐẠI KẾT QUẢ" (RED FLAG BOX CỜ ĐỎ)
          ========================================================================= */}
      {currentCE.exaggerationTraps?.length > 0 && (
        <div className="ce-red-flag-banner">
          <div className="red-flag-header">
            <div className="row" style={{ gap: '10px' }}>
              <span className="flag-icon-anim">🚩</span>
              <div>
                <h4 className="flag-title">Bẫy phóng đại kết quả trong đề thi THPT Quốc Gia</h4>
                <p className="flag-sub">
                  Các nhận định sai sự thật do <b>tuyệt đối hoá mức độ</b> mà sự kiện chưa đạt tới. Đọc kỹ để tránh bẫy câu hỏi Đúng / Sai!
                </p>
              </div>
            </div>
            <span className="flag-count-pill">{currentCE.exaggerationTraps.length} cờ đỏ</span>
          </div>

          <div className="red-flag-items-list">
            {currentCE.exaggerationTraps.map((trap, idx) => (
              <div key={idx} className="red-flag-item-card">
                <span className="red-flag-bullet">⛔</span>
                <span className="red-flag-text">{trap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL THÊM / CHỈNH SỬA SƠ ĐỒ NHÂN QUẢ
          ========================================================================= */}
      {editModal && (
        <FormDialog
          title={editModal.mode === 'edit' ? 'Chỉnh sửa Sơ Đồ Nhân - Quả' : '+ Thêm Sơ Đồ Nhân - Quả Mới'}
          onClose={() => setEditModal(null)}
        >
          <form onSubmit={handleSaveModal} className="ce-form-dialog">
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Tên sự kiện trung tâm *</span>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Tiến công chiến lược 1972, Cách mạng tháng Tám 1945..."
                />
              </label>

              <label className="field">
                <span>Mốc thời gian</span>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="VD: 1945, 1967 – 2015..."
                />
              </label>
            </div>

            <label className="field">
              <span>Kết quả cốt lõi của sự kiện</span>
              <textarea
                rows={2}
                value={formCoreResult}
                onChange={(e) => setFormCoreResult(e.target.value)}
                placeholder="Tóm tắt bước ngoặt hoặc chuyển biến do sự kiện mang lại..."
              />
            </label>

            {/* Khối 1: Đầu vào */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Nguyên nhân Khách quan (Mỗi ý 1 dòng)</span>
                <textarea
                  rows={3}
                  value={formInputsKhachQuan}
                  onChange={(e) => setFormInputsKhachQuan(e.target.value)}
                  placeholder="VD: Bối cảnh quốc tế, thời cơ bên ngoài..."
                />
              </label>

              <label className="field">
                <span>Nguyên nhân Chủ quan (Mỗi ý 1 dòng)</span>
                <textarea
                  rows={3}
                  value={formInputsChuQuan}
                  onChange={(e) => setFormInputsChuQuan(e.target.value)}
                  placeholder="VD: Sự chuẩn bị của lực lượng, đường lối lãnh đạo..."
                />
              </label>
            </div>

            {/* Khối 3: Đầu ra */}
            <label className="field">
              <span>Thành tựu & Thách thức trực tiếp (Mỗi ý 1 dòng)</span>
              <textarea
                rows={2}
                value={formOutputsDirect}
                onChange={(e) => setFormOutputsDirect(e.target.value)}
                placeholder="VD: Ký kết hiệp định, buộc đối phương xuống thang..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Ý nghĩa đối với Việt Nam (Mỗi ý 1 dòng)</span>
                <textarea
                  rows={3}
                  value={formOutputsVietNam}
                  onChange={(e) => setFormOutputsVietNam(e.target.value)}
                  placeholder="VD: Củng cố niềm tin, mở ra bước ngoặt mới..."
                />
              </label>

              <label className="field">
                <span>Ý nghĩa đối với Quốc tế (Mỗi ý 1 dòng)</span>
                <textarea
                  rows={3}
                  value={formOutputsQuocTe}
                  onChange={(e) => setFormOutputsQuocTe(e.target.value)}
                  placeholder="VD: Cổ vũ phong trào giải phóng dân tộc..."
                />
              </label>
            </div>

            {/* Bẫy phóng đại cờ đỏ */}
            <label className="field">
              <span>🚩 Các bẫy phóng đại sai sự thật thường gặp trong đề thi (Mỗi bẫy 1 dòng)</span>
              <textarea
                rows={3}
                value={formTraps}
                onChange={(e) => setFormTraps(e.target.value)}
                placeholder="VD: Chưa làm sụp đổ hoàn toàn chính quyền Sài Gòn, Mỹ chưa lập tức rút quân..."
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
                {editModal.mode === 'edit' ? 'Cập nhật Sơ Đồ' : 'Lưu Sơ Đồ Nhân - Quả'}
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}

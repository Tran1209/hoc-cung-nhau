import { useRef, useState } from 'react';
import { data } from '../data';

/**
 * Nút chọn/chụp ảnh và tải lên. Gọi onUploaded(paths[]) khi xong.
 * Trên điện thoại sẽ cho chọn "Chụp ảnh" hoặc "Thư viện".
 */
export default function Uploader({ folder, onUploaded, label = '+ Thêm tư liệu ảnh', multiple = true, accept = 'image/*,application/pdf', small }) {
  const ref = useRef();
  const [progress, setProgress] = useState(null);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setErr('');
    const paths = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1}/${files.length}`);
        paths.push(await data.upload(files[i], folder));
      }
      await onUploaded(paths);
    } catch (e2) {
      setErr('Tải lên lỗi: ' + e2.message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <span className="uploader">
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden onChange={pick} />
      <button type="button" className={`btn ${small ? 'sm' : ''}`} disabled={!!progress} onClick={() => ref.current.click()}>
        {progress ? `Đang tải ${progress}…` : label}
      </button>
      {err && <span className="error inline">{err}</span>}
    </span>
  );
}

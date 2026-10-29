import { useEffect, useState } from 'react';
import { data } from '../data';
import { isPdf } from '../lib/format';

/** Hiển thị 1 file (ảnh hoặc PDF) từ kho lưu trữ */
export function FileThumb({ path, onOpen, className = '' }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let alive = true;
    data.fileUrl(path).then((u) => alive && setUrl(u)).catch(() => {});
    return () => { alive = false; };
  }, [path]);

  if (isPdf(path)) {
    return (
      <a className={`thumb pdf ${className}`} href={url || undefined} target="_blank" rel="noreferrer">
        PDF
      </a>
    );
  }
  return (
    <button type="button" className={`thumb ${className}`} onClick={() => url && onOpen?.(url)}>
      {url ? <img src={url} alt="" loading="lazy" /> : <span className="muted">…</span>}
    </button>
  );
}

/**
 * Lưới ảnh có phóng to.
 * items: [{ path, caption?, id? , canDelete? }]
 */
export function Gallery({ items, onDelete, empty = 'Chưa có ảnh nào.' }) {
  const [open, setOpen] = useState(null);
  if (!items?.length) return <div className="empty sm">{empty}</div>;
  return (
    <>
      <div className="gallery">
        {items.map((it, i) => (
          <figure key={it.id || it.path || i} className="gitem">
            <FileThumb path={it.path} onOpen={(url) => setOpen({ url, caption: it.caption })} />
            {(it.caption || it.meta) && (
              <figcaption>
                {it.caption}
                {it.meta && <small className="muted"> {it.meta}</small>}
              </figcaption>
            )}
            {onDelete && it.canDelete !== false && (
              <button className="gdel" title="Xoá tư liệu" onClick={() => onDelete(it)}>Xoá</button>
            )}
          </figure>
        ))}
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(null)}>
          <img src={open.url} alt="" />
          {open.caption && <div className="lb-cap">{open.caption}</div>}
          <a className="btn sm lb-open" href={open.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            Mở ảnh gốc ↗
          </a>
        </div>
      )}
    </>
  );
}

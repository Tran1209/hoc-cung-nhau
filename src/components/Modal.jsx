import { useEffect, useState } from 'react';

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/**
 * Hộp thoại form đơn giản.
 * fields: [{ name, label, type: 'text'|'textarea'|'number'|'color', placeholder }]
 */
export function FormDialog({ title, fields = [], initial = {}, onSubmit, onClose, submitText = 'Lưu', children, wide }) {
  if (children) {
    return (
      <Modal title={title} onClose={onClose} wide={wide}>
        {children}
      </Modal>
    );
  }

  const [values, setValues] = useState(() => {
    const v = {};
    if (Array.isArray(fields)) {
      fields.forEach((f) => (v[f.name] = initial[f.name] ?? f.default ?? ''));
    }
    return v;
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const out = { ...values };
      if (Array.isArray(fields)) {
        fields.forEach((f) => {
          if (f.type === 'number') out[f.name] = out[f.name] === '' ? 0 : Number(out[f.name]);
        });
      }
      await onSubmit?.(out);
      onClose?.();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="form">
        {fields.map((f) => (
          <label key={f.name} className="field">
            <span>{f.label}</span>
            {f.type === 'textarea' ? (
              <textarea
                rows={f.rows || 4}
                value={values[f.name]}
                placeholder={f.placeholder}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              />
            ) : (
              <input
                type={f.type || 'text'}
                value={values[f.name]}
                placeholder={f.placeholder}
                required={f.required}
                autoFocus={f.autoFocus}
                onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              />
            )}
          </label>
        ))}
        {err && <div className="error">{err}</div>}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>Huỷ</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Đang lưu…' : submitText}</button>
        </div>
      </form>
    </Modal>
  );
}

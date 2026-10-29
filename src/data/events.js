// Bộ phát sự kiện "dữ liệu vừa thay đổi" -> các trang tự tải lại.
const listeners = new Set();
let timer = null;

export function onDataChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function emitDataChange() {
  // gộp nhiều thay đổi liên tiếp thành 1 lần tải lại
  clearTimeout(timer);
  timer = setTimeout(() => listeners.forEach((cb) => cb()), 120);
}

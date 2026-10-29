// Cấu hình chung của web
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Có điền Supabase => chế độ CLOUD (đồng bộ 2 máy). Không => chế độ DEMO (lưu trên trình duyệt).
export const IS_CLOUD = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Phiên bản database mà code này cần. Mỗi khi thêm migration mới (0002, 0003...) thì tăng số này.
export const APP_SCHEMA_VERSION = 1;

// Phiên bản web (ghi vào CHANGELOG.md mỗi lần cập nhật thứ 7)
export const APP_VERSION = '1.0.0';

export const BUCKET = 'study';

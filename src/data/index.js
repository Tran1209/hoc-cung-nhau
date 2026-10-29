// Chọn backend: Cloud (Supabase) nếu đã cấu hình, ngược lại dùng Demo (trình duyệt).
// Toàn bộ web chỉ gọi `data.xxx` => sau này đổi/ nâng cấp backend không phải sửa giao diện.
import { IS_CLOUD } from '../config';
import { cloud } from './cloud';
import { local } from './local';

export const data = IS_CLOUD ? cloud : local;

/** Ghi nhật ký hoạt động (không làm hỏng thao tác chính nếu lỗi) */
export async function logActivity(type, message, link = null) {
  try {
    await data.insert('activity', { type, message, link, actor_id: data.me()?.id });
  } catch (e) {
    console.warn('activity log failed', e);
  }
}

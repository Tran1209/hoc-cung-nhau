# Hướng Dẫn Liên Kết Với Web Tình Yêu Của Hai Bạn 💕

Hệ thống đã được thiết kế sẵn để sau này khi bạn xây dựng **Web Tình Yêu** (hoặc đã có sẵn), 2 web có thể trò chuyện với nhau cực kỳ mượt mà thông qua chung một Database Cloud.

---

## 1. Cơ Chế Kết Nối Chung Một Database
Khi làm Web Tình Yêu:
1. Bạn chỉ cần dùng chung **SUPABASE_URL** và **SUPABASE_ANON_KEY** của dự án này.
2. Web Tình Yêu dùng chung bảng tài khoản (`profiles`), không cần tạo thêm tài khoản mới.

---

## 2. Dữ Liệu Sẵn Sàng Dùng Cho Web Tình Yêu

Trong Database đã tạo sẵn một View đặc biệt tên là `love_stats`:

```sql
select * from public.love_stats;
```
Kết quả trả về gồm:
- **`total_hearts`**: Tổng số Tim bạn đã thưởng cho bạn gái khi chấm điểm các bài học.
- **`graded_count`**: Tổng số bài học/bài tập bạn gái đã hoàn thành.
- **`avg_score`**: Điểm trung bình tất cả các bài đã làm (thang điểm 10).

---

## 3. Các Ý Tưởng Hay Khi Liên Kết Vào Web Tình Yêu:
1. **Đổi Quà Bằng Tim:**
   - Cứ mỗi 10 ❤️ tích lũy được từ việc làm bài học chăm chỉ, bạn gái có thể bấm "Đổi 1 buổi đi ăn trà sữa" hoặc "Đổi 1 vé xem phim do anh bao trọn gói" ngay trên Web Tình Yêu.
2. **Cây Tình Yêu / Thú Cưng Học Tập:**
   - Mỗi bài tập nộp và được chấm đạt trên 8 điểm $\rightarrow$ Cây tình yêu lớn lên 1 nấc hoặc thú cưng được cho ăn.
3. **Chuỗi Ngày Chăm Chỉ (Streak):**
   - Đếm số ngày liên tiếp hai bạn cùng vào học và nộp bài $\rightarrow$ Hiển thị ngọn lửa tình yêu 🔥 trên trang chủ Web Tình Yêu.
4. **Nhật Ký Tình Yêu & Học Tập Chung:**
   - Bảng `activity` lưu lại từng cột mốc: ngày đầu tiên nộp bài 1, ngày đạt điểm 10 đầu tiên, ngày hoàn thành xong cả Chương 1... hiển thị lên Dòng Thời Gian Kỷ Niệm (Timeline) của hai bạn.

---

## 4. Đoạn Code Mẫu Cho Web Tình Yêu Lấy Dữ Liệu:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('URL_CỦA_BẠN', 'ANON_KEY_CỦA_BẠN');

// Lấy số tim và điểm số học tập của người yêu
async function getStudyLoveStats() {
  const { data, error } = await supabase.from('love_stats').select('*').single();
  console.log('Tổng tim:', data.total_hearts);
  console.log('Số bài đã hoàn thành:', data.graded_count);
  console.log('Điểm trung bình:', data.avg_score);
  return data;
}
```

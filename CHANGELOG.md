# Quy Trình Cập Nhật Thứ 7 Hàng Tuần (Không Lo Mất Dữ Liệu) 🗓️

Web được thiết kế đặc biệt để bạn có thể liên tục cải tiến, thêm tính năng vào mỗi thứ 7 hàng tuần trong nhiều tháng mà **toàn bộ bài học, ảnh chụp, bài nộp, điểm số và số tim tích lũy không bao giờ bị mất**.

---

## 3 Nguyên Tắc Vàng Giữ Dữ Liệu An Toàn Tuyệt Đối:
1. **Dữ liệu và Code hoàn toàn độc lập:** 
   - Mã nguồn web (React/Vite) nằm ở máy bạn hoặc trên Vercel/Netlify.
   - Toàn bộ dữ liệu & hình ảnh nằm an toàn trên Supabase Cloud Database & Storage.
   - Sửa giao diện, đổi màu sắc, thêm nút bấm... không bao giờ ảnh hưởng tới dữ liệu đã lưu.
2. **Quy tắc Migration Database:** 
   - Tuyệt đối **không sửa** file `0001_init.sql` cũ khi đã chạy.
   - Khi cần thêm bảng hoặc cột mới, chỉ cần tạo file mới: `0002_ten_tinh_nang.sql`, `0003_xxx.sql`... và chỉ dùng lệnh `ADD COLUMN` hoặc `CREATE TABLE IF NOT EXISTS`.
3. **Sao lưu trước khi cập nhật:**
   - Vào menu **Cài đặt (⚙️) -> Tải file sao lưu (.json)** để tải về 1 bản cất vào Google Drive/máy tính trước mỗi đợt nâng cấp lớn.

---

## Nhật Ký Cập Nhật (Changelog Template)

### [v1.0.0] - Khởi tạo ban đầu
- ✅ Quản lý Môn học -> Chương -> Bài học.
- ✅ Bài học: Lưu ảnh sơ đồ tư duy (Mindmap), ảnh bài em đã làm, tài liệu ôn tập.
- ✅ Ôn tập chương & Bài kiểm tra tổng hợp cuối chương.
- ✅ 3 hình thức bài tập:
  - 📸 Nộp ảnh vở làm tay (kèm lời nhắn, phóng to xem ảnh, nén ảnh tiết kiệm dung lượng).
  - 📝 Trắc nghiệm & Tự luận online (nhập đề nhanh từ văn bản với cú pháp `*B.`, tự chấm trắc nghiệm).
  - ⏱️ Bài thi online (đếm ngược thời gian, tự nộp khi hết giờ, chỉ được làm 1 lần).
- ✅ Bàn chấm bài cho Anh: Chấm điểm tự luận, lời phê, thưởng Tim 💕.
- ✅ Hỗ trợ 2 chế độ:
  - **Demo:** Chạy thử trên máy không cần cài đặt Supabase.
  - **Cloud:** Kết nối Supabase Realtime đồng bộ tức thì giữa 2 máy.
- ✅ Sẵn sàng view `love_stats` để nối sang Web Tình Yêu.

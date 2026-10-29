# 📚💕 Web Quản Lý Học Tập Cùng Nhau

> Hệ thống quản lý học tập dành riêng cho 2 người (Bạn làm gia sư / quản lý & Người yêu làm học viên).
> Đồng bộ dữ liệu & hình ảnh an toàn trên Cloud, không sợ mất dữ liệu khi nâng cấp, và sẵn sàng liên kết với Web Tình Yêu.

---

## 🌟 Tính Năng Nổi Bật

1. **Cấu trúc cây bài học trực quan:**
   - **Môn học** (VD: *Toán 12, Tiếng Anh...*) $\rightarrow$ **Chương** $\rightarrow$ **Bài học**.
   - Mỗi bài học có 3 mục riêng biệt:
     - 🧠 **Sơ đồ tư duy (Mindmap):** Lưu ảnh tóm tắt kiến thức cốt lõi.
     - 📸 **Bài em đã làm:** Lưu các ảnh chụp quá trình học, bài vở trên lớp của người yêu.
     - 📎 **Tài liệu học:** File tài liệu, ảnh công thức cần nhớ.
2. **Hệ thống bài tập & Kiểm tra phong phú:**
   - 📸 **Bài tập nộp ảnh:** Người yêu làm ra vở, chụp ảnh nộp lên. Bạn chấm điểm, ghi lời phê và thưởng Tim 💕.
   - 📝 **Trắc nghiệm & Tự luận Online:** Làm trực tiếp trên web. Hệ thống tự động chấm trắc nghiệm ngay khi nộp!
   - ⏱️ **Bài thi đếm ngược:** Đếm ngược thời gian làm bài, tự động nộp bài khi hết giờ, chỉ được làm 1 lần.
   - 🔁 **Bài ôn tập chương:** Nằm ở cuối mỗi chương để kiểm tra tổng hợp kiến thức cả chương.
   - ⚡ **Soạn đề siêu nhanh:** Chỉ cần copy/paste văn bản có tiền tố `*B.` để chọn đáp án đúng!
3. **Đồng bộ thời gian thực (Real-time):**
   - Bạn vừa giao bài hoặc chấm điểm $\rightarrow$ máy người yêu hiện thông báo ngay.
   - Người yêu vừa nộp ảnh bài làm $\rightarrow$ màn hình bạn nhận bài ngay lập tức.
4. **Không bao giờ mất dữ liệu:**
   - Dữ liệu và hình ảnh lưu trữ an toàn trên Supabase (Cloud Database + Storage).
   - Nén ảnh thông minh trước khi tải lên (giữ độ sắc nét mà tiết kiệm dung lượng).
   - Menu **Cài đặt** có nút tải file sao lưu (.json) dự phòng bất cứ lúc nào.
5. **Cầu nối sang Web Tình Yêu:**
   - Cung cấp sẵn bảng `love_stats` (tổng tim thưởng, số bài hoàn thành, điểm trung bình) để sau này Web Tình Yêu dùng chung.

---

## 🚀 Cách Bắt Đầu Nhanh

### Cách 1: Chạy Thử Ngay (Chế độ Demo)
Không cần cấu hình gì cả! Web sẽ lưu dữ liệu trên trình duyệt này để bạn trải nghiệm thử:
1. Nhấp đúp vào file `chay-web.bat` (hoặc mở terminal gõ `npm run dev`).
2. Mở trình duyệt vào link `http://localhost:5173`.
3. Bạn có thể chọn đăng nhập với vai **Anh (quản lý)** hoặc **Em (học viên)**.

---

### Cách 2: Kết Nối Supabase Cloud (Đồng bộ 2 máy & Dùng thật)
Để hai bạn dùng ở 2 điện thoại / máy tính khác nhau và lưu trữ an toàn nhiều tháng:

1. **Tạo tài khoản Supabase (Miễn phí 100%):**
   - Vào [supabase.com](https://supabase.com) bấm **Start your project**.
   - Đặt tên project (VD: `hoc-cung-nhau`), chọn Password Database và Region (khuyên chọn **Singapore** cho tốc độ nhanh nhất tại VN).
2. **Khởi tạo Database & Bảng dữ liệu:**
   - Trong bảng điều khiển Supabase, bấm vào menu **SQL Editor** ở cột trái.
   - Mở file `supabase/migrations/0001_init.sql` trong thư mục dự án, copy toàn bộ nội dung và dán vào SQL Editor rồi bấm **Run**.
3. **Lấy API Key điền vào file `.env`:**
   - Vào **Project Settings** (biểu tượng bánh răng ⚙️) $\rightarrow$ **API**.
   - Copy `Project URL` và `anon / public key`.
   - Tạo một file tên là `.env` ở thư mục gốc của web (cùng chỗ với file `.env.example`) và điền vào:
     ```env
     VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJh......
     ```
4. **Tạo tài khoản cho 2 người:**
   - Khởi động lại web: Người tạo tài khoản đầu tiên sẽ tự động là **Quản lý (Anh)**.
   - Người thứ hai tạo tài khoản sẽ tự động là **Học viên (Em)**.
   - Hệ thống tự động khoá bảo mật, không cho phép người thứ 3 tạo tài khoản!

---

## 🗓️ Cập Nhật Thứ 7 Hàng Tuần Suốt Nhiều Tháng

Xem chi tiết hướng dẫn tại file [CHANGELOG.md](file:///e:/web%20học/CHANGELOG.md).
- **Trước khi cập nhật:** Vào mục *Cài đặt* bấm *Tải file sao lưu (.json)*.
- **Thêm tính năng:** Bạn chỉ cần nói với mình (AI Assistant) tính năng bạn muốn thêm vào mỗi thứ 7.
- **Cập nhật database an toàn:** Mọi thay đổi dữ liệu đều được lưu thành file `0002_xxx.sql`, `0003_xxx.sql`... không bao giờ ghi đè hay xoá dữ liệu cũ của hai bạn!

---

## 📂 Cấu Trúc Mã Nguồn

```
e:\web học\
├── chay-web.bat            # File nhấp đúp để chạy web ngay
├── CHANGELOG.md            # Quy trình cập nhật thứ 7 không mất dữ liệu
├── docs/
│   └── LIEN_KET_WEB_TINH_YEU.md # Hướng dẫn nối sang Web Tình Yêu
├── supabase/
│   └── migrations/
│       └── 0001_init.sql   # Script SQL tạo database, bảo mật RLS & Realtime
├── src/
│   ├── config.js           # Biến môi trường & cấu hình
│   ├── data/               # Tầng dữ liệu (Cloud Supabase / Local Demo)
│   ├── components/         # Giao diện tái sử dụng (Gallery, Uploader, Quiz...)
│   ├── pages/              # Các trang chính (Dashboard, Soạn bài, Chấm bài...)
│   └── styles.css          # Giao diện màu pastel hồng - tím nhẹ nhàng
└── package.json
```

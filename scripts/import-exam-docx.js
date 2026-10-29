import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { parseThptqgExam } from '../src/lib/examParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CLI Tool nạp đề thi THPT Quốc Gia 2026 từ file Word (.docx) vào hệ thống
 *
 * Cách sử dụng:
 *   node scripts/import-exam-docx.js <duong-dan-file.docx> [--lesson 1] [--bt BT2] [--title "Tên bài tập"]
 *
 * Ví dụ:
 *   node scripts/import-exam-docx.js "./de_thi_bt2.docx" --lesson 1 --bt BT2 --title "BT2: Đề ôn luyện THPTQG số 2"
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
===================================================================
  CÔNG CỤ NẠP ĐỀ THI WORD (.docx) CHUẨN THPTQG 2026 CHO WEB HỌC
===================================================================
Cách dùng:
  node scripts/import-exam-docx.js <file-word.docx> [tuỳ chọn]

Tuỳ chọn:
  --lesson <số bài>   Số thứ tự bài học trong SGK Lịch Sử 12 (Mặc định: 1)
  --bt <mã BT>        Mã bài tập (ví dụ: BT1, BT2, BT3, BT4... Mặc định: BT2)
  --title <tiêu đề>   Tiêu đề bài tập hiển thị trên web
  --chapter <chủ đề>  Tên chủ đề nếu cần gán riêng

Ví dụ:
  node scripts/import-exam-docx.js ./de_so_2.docx --lesson 1 --bt BT2 --title "BT2: Đề rèn luyện kĩ năng số 2"
===================================================================
`);
    process.exit(0);
  }

  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Lỗi: Không tìm thấy file "${filePath}"`);
    process.exit(1);
  }

  // Parse args
  let lessonNum = 1;
  let btCode = 'BT2';
  let customTitle = '';

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--lesson' && args[i + 1]) {
      lessonNum = parseInt(args[i + 1], 10) || 1;
      i++;
    } else if (args[i] === '--bt' && args[i + 1]) {
      btCode = args[i + 1].toUpperCase();
      i++;
    } else if (args[i] === '--title' && args[i + 1]) {
      customTitle = args[i + 1];
      i++;
    }
  }

  console.log(`\n⏳ Đang đọc nội dung file Word: ${filePath}...`);
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value;

  console.log(`✓ Đã trích xuất ${rawText.length} ký tự văn bản từ Word.`);
  console.log(`⏳ Đang bóc tách cấu trúc câu hỏi THPTQG 2026 (24 MCQ + 4 Đúng/Sai)...`);

  const questions = parseThptqgExam(rawText);
  if (!questions || questions.length === 0) {
    console.error(`❌ Lỗi: Không nhận diện được câu hỏi nào từ file Word. Vui lòng kiểm tra lại định dạng file.`);
    process.exit(1);
  }

  const mcqCount = questions.filter((q) => q.type === 'mcq').length;
  const tfCount = questions.filter((q) => q.type === 'tf').length;
  console.log(`✓ Nhận diện thành công ${questions.length} câu hỏi:`);
  console.log(`  - Phần I:  ${mcqCount} câu trắc nghiệm nhiều lựa chọn (thang 0.25đ/câu)`);
  console.log(`  - Phần II: ${tfCount} câu trắc nghiệm Đúng / Sai theo tư liệu (thang 1.0đ/câu)`);

  const finalTitle = customTitle || `${btCode}: Đề luyện thi THPT Quốc Gia 2026 (Bài ${lessonNum})`;

  // Cập nhật vào src/data/historyCurriculum.js
  const curriculumPath = path.resolve(__dirname, '../src/data/historyCurriculum.js');
  let curriculumCode = fs.readFileSync(curriculumPath, 'utf-8');

  // Chuẩn bị payload câu hỏi để lưu trữ
  const assignmentPayload = {
    btCode,
    lessonNum,
    title: finalTitle,
    questions,
  };

  // Tạo file JSON chứa bài tập mới trong src/data/
  const outJsonPath = path.resolve(__dirname, `../src/data/exam_${btCode.toLowerCase()}_lesson${lessonNum}.json`);
  fs.writeFileSync(outJsonPath, JSON.stringify(assignmentPayload, null, 2), 'utf-8');
  console.log(`✓ Đã lưu gói dữ liệu đề thi vào: ${outJsonPath}`);

  console.log(`\n🎉 HOÀN TẤT NẠP ĐỀ THI TỪ FILE WORD!`);
  console.log(`- Mã bài tập: ${btCode}`);
  console.log(`- Tiêu đề:    ${finalTitle}`);
  console.log(`- Cấu trúc:   ${mcqCount} câu trắc nghiệm + ${tfCount} câu Đúng/Sai (${questions.length} câu tổng)`);
  console.log(`- Bài học:    Bài ${lessonNum} (Lịch Sử 12)\n`);
}

main().catch((err) => {
  console.error('❌ Lỗi xử lý:', err);
  process.exit(1);
});

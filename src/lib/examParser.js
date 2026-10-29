import mammoth from 'mammoth';

/**
 * Tạo khung mẫu chuẩn Đề thi Tốt nghiệp THPT Quốc Gia 2026 môn Lịch Sử:
 * - Phần I: 24 câu trắc nghiệm nhiều lựa chọn (mỗi câu 0.25đ = 6.0đ)
 * - Phần II: 4 câu trắc nghiệm Đúng / Sai theo tư liệu (mỗi câu 1.0đ = 4.0đ)
 * Tổng cộng: 28 câu = 10.0 điểm
 */
export function generateThptqg2026Template(topicTitle = 'Lịch Sử 12') {
  const questions = [];

  // 1. Phần I: 24 câu trắc nghiệm nhiều phương án lựa chọn (A, B, C, D)
  for (let i = 1; i <= 24; i++) {
    questions.push({
      id: 'q-mcq-' + i + '-' + Math.random().toString(36).slice(2, 7),
      type: 'mcq',
      prompt: `[Phần I - Câu ${i}] Nhập nội dung câu hỏi trắc nghiệm số ${i}...`,
      options: [
        'Phương án A...',
        'Phương án B...',
        'Phương án C...',
        'Phương án D...',
      ],
      correct: 0,
      points: 0.25,
      explanation: `Giải thích chi tiết cho câu ${i} (học sinh xem sau khi nộp bài).`,
    });
  }

  // 2. Phần II: 4 câu trắc nghiệm Đúng / Sai theo tư liệu lịch sử
  for (let i = 1; i <= 4; i++) {
    questions.push({
      id: 'q-tf-' + i + '-' + Math.random().toString(36).slice(2, 7),
      type: 'tf',
      prompt: `[Phần II - Câu ${i}] Đọc đoạn tư liệu sau đây về ${topicTitle}:\n\n"Nhập đoạn trích văn kiện hoặc tư liệu lịch sử số ${i} vào đây..."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:`,
      options: [
        `Mệnh đề a) của câu ${i}...`,
        `Mệnh đề b) của câu ${i}...`,
        `Mệnh đề c) của câu ${i}...`,
        `Mệnh đề d) của câu ${i}...`,
      ],
      correct: { 0: true, 1: false, 2: false, 3: true },
      points: 1.0,
      explanation: `Giải thích căn cứ lịch sử cho từng ý a, b, c, d của câu ${i}.`,
    });
  }

  return questions;
}

/**
 * Trích xuất bảng đáp án ở cuối văn bản nếu có:
 * Ví dụ: "ĐÁP ÁN: 1.A 2.B 3.C ... 24.D"
 * hoặc "Câu 1: a-Đ, b-S, c-Đ, d-S"
 */
function extractAnswerKeys(text) {
  const mcqKeys = {};
  const tfKeys = {};

  const ansIndex = text.search(/(bảng\s*đáp\s*án|đáp\s*án\s*:|hướng\s*dẫn\s*chấm)/i);
  if (ansIndex === -1) return { mcqKeys, tfKeys, mainText: text };

  const mainText = text.slice(0, ansIndex);
  const ansText = text.slice(ansIndex);

  // 1. Quét đáp án MCQ: 1.A, 1-A, 1A, Câu 1: A
  const mcqMatches = ansText.matchAll(/(?:câu\s*)?(\d+)[\s.:\-)_]*([A-Da-d])\b/g);
  for (const m of mcqMatches) {
    const qNum = parseInt(m[1], 10);
    const letter = m[2].toUpperCase();
    const idx = 'ABCD'.indexOf(letter);
    if (idx !== -1) mcqKeys[qNum] = idx;
  }

  // 2. Quét đáp án Đúng/Sai: Câu 1: a-Đ, b-S... hoặc 1: aĐ, bS...
  const tfBlocks = ansText.split(/(?:câu\s*)(\d+)[\s.:\-)_]/gi);
  for (let i = 1; i < tfBlocks.length; i += 2) {
    const qNum = parseInt(tfBlocks[i], 10);
    const content = tfBlocks[i + 1] || '';
    const items = {};
    const itemMatches = content.matchAll(/([a-d])[\s.:\-)_]*(đ|s|đúng|sai)\b/gi);
    for (const im of itemMatches) {
      const letterIdx = 'abcd'.indexOf(im[1].toLowerCase());
      const val = im[2].toLowerCase().startsWith('đ');
      if (letterIdx !== -1) items[letterIdx] = val;
    }
    if (Object.keys(items).length) tfKeys[qNum] = items;
  }

  return { mcqKeys, tfKeys, mainText };
}

/**
 * Tách 4 phương án A, B, C, D của câu trắc nghiệm (hỗ trợ cả cùng dòng và từng dòng)
 */
function extractMcqOptions(optText) {
  const options = ['', '', '', ''];
  let correct = null;

  const letters = ['A', 'B', 'C', 'D'];
  const positions = [];

  for (let idx = 0; idx < letters.length; idx++) {
    const letter = letters[idx];
    const regex = new RegExp(`(?:^|\\s|\\n)([*]?)\\s*${letter}[.)]\\s*`, 'i');
    const m = regex.exec(optText);
    if (m) {
      positions.push({
        letterIdx: idx,
        startIndex: m.index + (m[0].length - m[0].trimStart().length),
        contentStart: m.index + m[0].length,
        isMarked: m[1] === '*',
      });
    }
  }

  positions.sort((a, b) => a.startIndex - b.startIndex);

  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i];
    const nextStart = i + 1 < positions.length ? positions[i + 1].startIndex : optText.length;
    let optStr = optText.slice(cur.contentStart, nextStart).trim();

    if (optStr.startsWith('*')) {
      cur.isMarked = true;
      optStr = optStr.slice(1).trim();
    }
    if (optStr.endsWith('*')) {
      cur.isMarked = true;
      optStr = optStr.slice(0, -1).trim();
    }

    options[cur.letterIdx] = optStr;
    if (cur.isMarked) correct = cur.letterIdx;
  }

  if (positions.length < 2) {
    const lines = optText.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const l of lines) {
      const lm = l.match(/^([*]?)\s*([A-D])[.)]\s*(.*)$/i);
      if (lm) {
        const idx = 'ABCD'.indexOf(lm[2].toUpperCase());
        if (idx !== -1) {
          options[idx] = lm[3].trim();
          if (lm[1] === '*') correct = idx;
        }
      }
    }
  }

  return { options, correct };
}

/**
 * Bộ bóc tách thông minh văn bản đề thi THPT Quốc Gia:
 * Nhận diện tự động 24 câu trắc nghiệm (Phần I) + 4 câu Đúng/Sai (Phần II)
 */
export function parseThptqgExam(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const { mcqKeys, tfKeys, mainText } = extractAnswerKeys(clean);

  // Tách văn bản thành các khối câu hỏi theo mẫu: "Câu 1.", "Câu 1:", "CÂU 1"
  const rawBlocks = mainText.split(/(?=(?:^|\n)\s*(?:câu|cau)\s*\d+[\s.:\-)])/gi).map((b) => b.trim()).filter(Boolean);

  const questions = [];
  let detectedMcqCount = 0;
  let detectedTfCount = 0;

  for (const block of rawBlocks) {
    const numMatch = block.match(/^(?:câu|cau)\s*(\d+)[\s.:\-)]([\s\S]*)$/i);
    const qNum = numMatch ? parseInt(numMatch[1], 10) : null;
    const blockBody = numMatch ? numMatch[2].trim() : block;

    // Mệnh đề Đúng/Sai viết chữ thường: a), b), c), d)
    const tfLineMatches = blockBody.match(/(?:^|\n)\s*[a-d][.)]/g) || [];
    const isTfQuestion = tfLineMatches.length >= 2;

    // Phương án trắc nghiệm viết chữ hoa: A., B., C., D.
    const mcqLineMatches = blockBody.match(/(?:^|\n|\s{2,})[*]?\s*[A-D][.)]/g) || [];
    const isMcqQuestion = mcqLineMatches.length >= 2;

    if (isTfQuestion) {
      // ----------------------------------------------------
      // XỬ LÝ CÂU HỎI ĐÚNG / SAI (PHẦN II)
      // ----------------------------------------------------
      detectedTfCount++;
      const lines = blockBody.split('\n').map((l) => l.trim()).filter(Boolean);
      const promptLines = [];
      const tfStatements = {};
      const tfKey = tfKeys[detectedTfCount] || tfKeys[qNum] || {};

      let currentLetterIdx = null;

      for (const line of lines) {
        const stmtMatch = line.match(/^([a-d])[\s.:\-)]([\s\S]*)$/i);
        if (stmtMatch) {
          currentLetterIdx = 'abcd'.indexOf(stmtMatch[1].toLowerCase());
          let stmtText = stmtMatch[2].trim();

          const markMatch = stmtText.match(/(?:[\(\[\{]|\s-\s|\s:\s)(đúng|sai|đ|s)[\)\]\}]?\s*$/i);
          if (markMatch) {
            const isTrue = markMatch[1].toLowerCase().startsWith('đ');
            tfKey[currentLetterIdx] = isTrue;
            stmtText = stmtText.slice(0, markMatch.index).trim();
          }

          tfStatements[currentLetterIdx] = stmtText;
        } else if (currentLetterIdx !== null) {
          tfStatements[currentLetterIdx] += ' ' + line;
        } else {
          promptLines.push(line);
        }
      }

      const options = ['a', 'b', 'c', 'd'].map((_, idx) => tfStatements[idx] || '');

      for (let k = 0; k < 4; k++) {
        if (tfKey[k] === undefined) tfKey[k] = false;
      }

      questions.push({
        id: 'q-tf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type: 'tf',
        prompt: promptLines.join('\n').trim() || `Đoạn tư liệu lịch sử câu ${detectedTfCount}:`,
        options,
        correct: tfKey,
        points: 1.0,
        explanation: '',
      });
    } else if (isMcqQuestion) {
      // ----------------------------------------------------
      // XỬ LÝ CÂU TRẮC NGHIỆM 4 PHƯƠNG ÁN (PHẦN I)
      // ----------------------------------------------------
      detectedMcqCount++;

      const firstOptMatch = blockBody.search(/(?:^|\n|\s{2,})([*]?\s*[A-D][.)]\s*)/i);
      let promptText = firstOptMatch !== -1 ? blockBody.slice(0, firstOptMatch).trim() : blockBody;
      const optText = firstOptMatch !== -1 ? blockBody.slice(firstOptMatch) : '';

      const { options, correct: extractedCorrect } = extractMcqOptions(optText);
      let correct = mcqKeys[detectedMcqCount] !== undefined ? mcqKeys[detectedMcqCount] : mcqKeys[qNum] ?? extractedCorrect;

      if (correct === null) {
        const trailingKey = blockBody.match(/(?:đáp\s*án|chọn)\s*:?\s*([A-D])\b/i);
        if (trailingKey) {
          correct = 'ABCD'.indexOf(trailingKey[1].toUpperCase());
        }
      }

      questions.push({
        id: 'q-mcq-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type: 'mcq',
        prompt: promptText || `Câu hỏi trắc nghiệm số ${detectedMcqCount}:`,
        options,
        correct: correct ?? 0,
        points: 0.25,
        explanation: '',
      });
    } else {
      questions.push({
        id: 'q-essay-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type: 'essay',
        prompt: blockBody,
        options: [],
        correct: null,
        points: 1.0,
        explanation: '',
      });
    }
  }

  return questions;
}

/**
 * Nạp trực tiếp từ file Word (.docx) bằng Mammoth
 */
export async function parseDocxFile(file) {
  if (!file) throw new Error('Chưa chọn file Word (.docx)');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';
  if (!rawText.trim()) throw new Error('File Word rỗng hoặc không chứa văn bản.');
  return parseThptqgExam(rawText);
}

/**
 * Bộ trích xuất kiến thức lịch sử thông minh (Knowledge Evidence Extractor)
 * Tự động tìm kiếm và trích dẫn dẫn chứng từ SGK (Kiến thức bài học)
 * Bút dạ quang hồng (Rose Milk Highlight Tape) chuẩn Apple Editorial Folio
 */

// Danh sách stop words tiếng Việt cần loại bỏ khi bóc tách từ khóa tìm kiếm
const STOP_WORDS = new Set([
  'là', 'của', 'và', 'các', 'những', 'trong', 'với', 'cho', 'về', 'này', 'đó',
  'có', 'được', 'sau', 'khi', 'tại', 'từ', 'đến', 'nào', 'sao', 'gì', 'ở', 'đâu',
  'ngày', 'tháng', 'năm', 'theo', 'nhất', 'bởi', 'thì', 'mà', 'ra', 'vào', 'do',
  'như', 'hãy', 'đọc', 'đoạn', 'tư', 'liệu', 'dưới', 'đây', 'thí', 'sinh', 'chọn',
  'đúng', 'sai', 'mỗi', 'ý', 'câu', 'hỏi', 'sau', 'đây', 'nào'
]);

function cleanMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // Bỏ ảnh markdown
    .replace(/^#+\s+/gm, '') // Bỏ tiêu đề h1-h6
    .replace(/^[*\-+]\s+/gm, '') // Bỏ bullet list
    .replace(/^>\s*/gm, '') // Bỏ blockquote
    .trim();
}

/**
 * Chuẩn hoá chuỗi ngày tháng để so khớp:
 * "24 - 10 - 1945" -> "24-10-1945"
 */
function normalizeDate(str) {
  if (!str) return '';
  return str.replace(/(\d+)\s*[-/.]\s*(\d+)\s*[-/.]\s*(\d+)/g, '$1-$2-$3')
            .replace(/(\d+)\s*[-/.]\s*(\d+)/g, '$1-$2');
}

/**
 * Bóc tách các từ khóa quan trọng (> 2 ký tự và không thuộc stop words)
 */
function extractKeywords(str) {
  if (!str) return [];
  const norm = normalizeDate(str);
  const words = norm
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
  return Array.from(new Set(words));
}

// Các thực thể & thuật ngữ lịch sử tiêu biểu cần ưu tiên highlight nguyên cụm
const HISTORICAL_TERMS = [
  'Liên hợp quốc', 'Hội đồng Bảo an', 'Hiến chương Liên hợp quốc', 'Hiến chương',
  'Xan Phran-xi-xcô', 'Hội nghị I-an-ta', 'I-an-ta', 'Niu Oóc', 'Đại hội đồng',
  'Toà án Quốc tế', 'Ban Thư ký', 'quyền phủ quyết', '50 quốc gia', '51 quốc gia',
  '149 quốc gia', '193 quốc gia', 'thành viên thứ 149', '5 nước lớn',
  '5 nước uỷ viên thường trực', 'ngày 24-10', '24-10-1945', 'Ngày Liên hợp quốc',
  'Nam Xu-đăng', 'duy trì hoà bình', 'quyền tự quyết', 'bình đẳng chủ quyền',
  'không can thiệp', 'biện pháp hoà bình'
];

/**
 * Bọc highlight-tape quanh các cụm từ khóa hoặc chuyển đổi **...** thành highlight-tape
 * Đảm bảo không bọc lồng nhau (<mark><mark>...</mark></mark>)
 */
export function wrapHighlightTape(text, targetKeywords = []) {
  if (!text) return '';

  // 1. Chuyển đổi **...** sẵn có trong markdown thành highlight-tape
  let html = text.replace(/\*\*(.*?)\*\*/g, '<mark class="highlight-tape">$1</mark>');

  // 2. Gom cụm từ khóa: ưu tiên cụm thực thể dài trước, sau đó mới đến các từ khóa cụ thể
  const allPhrases = [];
  
  // Tìm các thực thể lịch sử có trong text
  for (const term of HISTORICAL_TERMS) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      allPhrases.push(term);
    }
  }

  // Thêm các từ khóa từ đáp án (lọc bỏ từ đơn ngắn < 4 ký tự trừ ngày tháng)
  for (const kw of targetKeywords) {
    if (!kw) continue;
    if (/\d+/.test(kw) || kw.length >= 4) {
      allPhrases.push(kw);
    }
  }

  // Sắp xếp dài trước, ngắn sau để tránh match cụm con trước
  const uniquePhrases = Array.from(new Set(allPhrases)).sort((a, b) => b.length - a.length);

  for (const phrase of uniquePhrases) {
    if (!phrase) continue;
    // Bỏ qua nếu là số năm 4 chữ số đơn thuần mà text đã có highlight khác
    if (/^\d{4}$/.test(phrase) && html.includes('highlight-tape')) continue;

    const safePhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Chỉ match nếu KHÔNG nằm trong thẻ HTML
    const reg = new RegExp(`(?<!<[^>]*>)\\b(${safePhrase})\\b(?![^<]*<\\/mark>)`, 'gi');
    html = html.replace(reg, '<mark class="highlight-tape">$1</mark>');
  }

  // Dọn dẹp nếu có lồng nhau hy hữu
  html = html.replace(/<mark class="highlight-tape">\s*<mark class="highlight-tape">(.*?)<\/mark>\s*<\/mark>/gi, '<mark class="highlight-tape">$1</mark>');

  return html;
}

/**
 * Trích xuất đoạn dẫn chứng từ SGK (lessonContent) và Lời giải thích từ Anh
 */
export function extractEvidence({
  question,
  selectedAnswer, // MCQ: number (0, 1, 2, 3), TF: { [key]: boolean }
  selectedTfIndex = null, // Nếu đang bấm vào ý a, b, c, d cụ thể của câu TF
  lessonContent = '',
  studyHint = null,
}) {
  if (!question) return null;

  const isTf = question.type === 'tf';
  const explanation = studyHint?.explanation || question.explanation || '';
  const options = question.options || [];

  // ==========================================
  // TRƯỜNG HỢP 1: TRẮC NGHIỆM 4 LỰA CHỌN (MCQ)
  // ==========================================
  if (!isTf) {
    const optIdx = typeof selectedAnswer === 'number' ? selectedAnswer : -1;
    if (optIdx < 0 || optIdx >= options.length) return null;

    const optText = options[optIdx] || '';
    const normOpt = normalizeDate(optText);
    const promptKeywords = extractKeywords(question.prompt);
    const optKeywords = extractKeywords(optText);

    // Danh sách các dòng ứng viên từ SGK (Kiến thức bài học)
    const candidates = [];
    if (lessonContent) {
      const lines = lessonContent.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.replace(/^[*\-+#>\s]+/, '').trim();
        if (line.length > 20 && !line.startsWith('|') && !line.startsWith('![')) {
          candidates.push(line);
        }
      }
    }

    // Tính điểm chấm đoạn SGK phù hợp nhất
    let bestLine = null;
    let maxScore = 0;

    for (const line of candidates) {
      const normLine = normalizeDate(line);
      let score = 0;

      // Ưu tiên cao: dòng chứa đáp án hoặc ngày tháng trùng khớp
      if (normLine.toLowerCase().includes(normOpt.toLowerCase()) || 
          line.toLowerCase().includes(optText.toLowerCase())) {
        score += 15;
      }

      // Điểm cộng cho các từ khóa từ đáp án
      for (const kw of optKeywords) {
        if (normLine.toLowerCase().includes(kw)) score += 4;
      }

      // Điểm cộng cho từ khóa câu hỏi
      for (const kw of promptKeywords) {
        if (normLine.toLowerCase().includes(kw)) score += 2;
      }

      if (score > maxScore) {
        maxScore = score;
        bestLine = line;
      }
    }

    // Tạo HTML dẫn chứng
    let excerptHtml = '';
    let isDirectSgk = false;

    if (bestLine && maxScore >= 8) {
      isDirectSgk = true;
      excerptHtml = wrapHighlightTape(bestLine, [normOpt, ...optKeywords]);
    } else if (explanation) {
      excerptHtml = wrapHighlightTape(explanation, [normOpt, ...optKeywords]);
    } else {
      excerptHtml = `Căn cứ kiến thức bài học: Phương án lựa chọn <b>${optText}</b> liên quan trực tiếp đến nội dung câu hỏi về <i>${question.prompt.slice(0, 80)}...</i>`;
    }

    // Note giải thích từ Anh
    let noteHtml = '';
    if (explanation) {
      noteHtml = wrapHighlightTape(explanation, [normOpt, ...optKeywords]);
    }

    return {
      type: 'mcq',
      isDirectSgk,
      sourceTitle: isDirectSgk ? 'Trích xuất trực tiếp từ SGK Lịch Sử 12 (Trang kiến thức)' : 'Ghi chú trọng tâm bài học',
      excerptHtml,
      noteHtml,
      selectedLabel: optText,
    };
  }

  // ==========================================
  // TRƯỜNG HỢP 2: ĐÚNG / SAI THEO TƯ LIỆU (TF)
  // ==========================================
  const tfAnswers = typeof selectedAnswer === 'object' && selectedAnswer !== null ? selectedAnswer : {};
  const activeIndex = selectedTfIndex !== null ? selectedTfIndex : Object.keys(tfAnswers)[0];
  
  if (activeIndex === undefined) return null;

  const idxNum = Number(activeIndex);
  const stmt = options[idxNum] || '';
  const userChoice = tfAnswers[idxNum]; // true hoặc false
  const letter = ['a', 'b', 'c', 'd'][idxNum] || String.fromCharCode(97 + idxNum);

  // Trích xuất lời giải thích riêng cho ý a, b, c hoặc d từ explanation
  let stmtExplanation = '';
  if (explanation) {
    // Regex tìm đoạn "Ý a)..." hoặc "a)..."
    const reg = new RegExp(`(?:Ý\\s*)?${letter}\\)[^;.]*(?:[;.]|$)`, 'i');
    const m = explanation.match(reg);
    if (m) {
      stmtExplanation = m[0].trim();
    } else {
      stmtExplanation = explanation;
    }
  }

  // Tìm tư liệu tương ứng từ đoạn trích trong đề bài hoặc SGK
  let passageQuote = '';
  // Nếu câu hỏi có đoạn tư liệu trong ngoặc kép "..."
  const quoteMatch = question.prompt.match(/"([^"]+)"/s);
  if (quoteMatch) {
    const passage = quoteMatch[1];
    // Tìm câu trong tư liệu khớp với ý a, b, c, d
    const sentences = passage.split(/[.\n]+/).map(s => s.trim()).filter(s => s.length > 15);
    const stmtKws = extractKeywords(stmt);
    let bestSent = null;
    let bestSentScore = 0;
    for (const sent of sentences) {
      let score = 0;
      for (const kw of stmtKws) {
        if (sent.toLowerCase().includes(kw)) score += 2;
      }
      if (score > bestSentScore) {
        bestSentScore = score;
        bestSent = sent;
      }
    }
    passageQuote = bestSent || passage.slice(0, 160) + '...';
  } else if (lessonContent) {
    // Tìm trong SGK
    const lines = lessonContent.split('\n').map(l => l.replace(/^[*\-+#>\s]+/, '').trim()).filter(l => l.length > 20);
    const stmtKws = extractKeywords(stmt);
    let bestLine = null;
    let maxS = 0;
    for (const line of lines) {
      let sc = 0;
      for (const kw of stmtKws) {
        if (line.toLowerCase().includes(kw)) sc += 2;
      }
      if (sc > maxS) {
        maxS = sc;
        bestLine = line;
      }
    }
    passageQuote = bestLine || '';
  }

  const stmtKeywords = extractKeywords(stmt);
  const excerptHtml = passageQuote
    ? wrapHighlightTape(passageQuote, stmtKeywords)
    : wrapHighlightTape(stmtExplanation || stmt, stmtKeywords);

  const noteHtml = stmtExplanation
    ? wrapHighlightTape(stmtExplanation, stmtKeywords)
    : `Em đã đánh giá ý <b>${letter})</b> là <b>${userChoice ? 'ĐÚNG' : 'SAI'}</b>.`;

  return {
    type: 'tf',
    isDirectSgk: Boolean(passageQuote),
    sourceTitle: quoteMatch ? 'Dẫn chứng từ Đoạn tư liệu Lịch sử' : 'Dẫn chứng từ SGK Lịch Sử 12',
    letter,
    statement: stmt,
    userChoice,
    excerptHtml,
    noteHtml,
  };
}

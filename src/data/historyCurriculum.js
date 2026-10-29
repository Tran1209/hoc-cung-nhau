import su12Json from './su12_extracted.json';

const getSu12 = (num, fallbackTitle) => {
  const item = su12Json[String(num)];
  return {
    title: fallbackTitle,
    content: item?.content || '',
  };
};

// Toàn bộ chương trình Lịch Sử 10, 11, 12 - Bộ Kết Nối Tri Thức Với Cuộc Sống
export const HISTORY_CURRICULUM = [
  {
    title: 'Lịch Sử 10',
    icon: '',
    color: '#3b82f6',
    description: 'Bộ Kết nối tri thức với cuộc sống — Khái quát Sử học và các nền văn minh thế giới, Đông Nam Á, Việt Nam',
    chapters: [
      {
        title: 'Chủ đề 1: Lịch sử và Sử học',
        description: 'Khái niệm, hiện thực lịch sử, nhận thức lịch sử và tri thức lịch sử với cuộc sống',
        lessons: [
          'Bài 1: Hiện thực lịch sử và nhận thức lịch sử',
          'Bài 2: Tri thức lịch sử và cuộc sống',
        ],
      },
      {
        title: 'Chủ đề 2: Vai trò của Sử học',
        description: 'Sử học với các lĩnh vực khoa học và các ngành nghề hiện đại',
        lessons: [
          'Bài 3: Sử học với các lĩnh vực khoa học',
          'Bài 4: Sử học với một số lĩnh vực, ngành nghề hiện đại',
        ],
      },
      {
        title: 'Chủ đề 3: Một số nền văn minh thế giới thời kì cổ – trung đại',
        description: 'Văn minh phương Đông và phương Tây thời kì cổ – trung đại',
        lessons: [
          'Bài 5: Khái niệm văn minh. Một số nền văn minh phương Đông thời kì cổ – trung đại',
          'Bài 6: Một số nền văn minh phương Tây thời kì cổ – trung đại',
        ],
      },
      {
        title: 'Chủ đề 4: Các cuộc cách mạng công nghiệp trong lịch sử thế giới',
        description: 'Cách mạng công nghiệp thời kì cận đại và hiện đại',
        lessons: [
          'Bài 7: Các cuộc cách mạng công nghiệp thời kì cận đại',
          'Bài 8: Các cuộc cách mạng công nghiệp thời kì hiện đại',
        ],
      },
      {
        title: 'Chủ đề 5: Văn minh Đông Nam Á',
        description: 'Cơ sở hình thành, hành trình phát triển và thành tựu văn minh Đông Nam Á thời kì cổ – trung đại',
        lessons: [
          'Bài 9: Cơ sở hình thành văn minh Đông Nam Á thời kì cổ – trung đại',
          'Bài 10: Hành trình phát triển và thành tựu của văn minh Đông Nam Á (thời kì cổ – trung đại)',
        ],
      },
      {
        title: 'Chủ đề 6: Một số nền văn minh trên đất nước Việt Nam (trước năm 1858)',
        description: 'Các nền văn minh cổ và Văn minh Đại Việt',
        lessons: [
          'Bài 11: Một số nền văn minh cổ trên đất nước Việt Nam',
          'Bài 12: Văn minh Đại Việt',
        ],
      },
      {
        title: 'Chủ đề 7: Cộng đồng các dân tộc Việt Nam',
        description: 'Đời sống vật chất, tinh thần và khối đại đoàn kết dân tộc trong lịch sử Việt Nam',
        lessons: [
          'Bài 13: Đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam',
          'Bài 14: Khối đại đoàn kết dân tộc trong lịch sử Việt Nam',
        ],
      },
    ],
  },
  {
    title: 'Lịch Sử 11',
    icon: '',
    color: '#8b5cf6',
    description: 'Bộ Kết nối tri thức với cuộc sống — Cách mạng tư sản, CNXH, Độc lập ĐNÁ, Chiến tranh bảo vệ Tổ quốc, Cải cách và Biển Đông',
    chapters: [
      {
        title: 'Chủ đề 1: Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản',
        description: 'Một số vấn đề chung về cách mạng tư sản, sự xác lập và phát triển của CNTB',
        lessons: [
          'Bài 1: Một số vấn đề chung về cách mạng tư sản',
          'Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản',
        ],
      },
      {
        title: 'Chủ đề 2: Chủ nghĩa xã hội từ năm 1917 đến nay',
        description: 'Sự hình thành Liên bang Xô Viết và sự phát triển của CNXH sau CTTG II',
        lessons: [
          'Bài 3: Sự hình thành Liên bang Cộng hoà xã hội chủ nghĩa Xô Viết',
          'Bài 4: Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai đến nay',
        ],
      },
      {
        title: 'Chủ đề 3: Quá trình giành độc lập dân tộc của các quốc gia Đông Nam Á',
        description: 'Sự xâm lược của chủ nghĩa thực dân và hành trình đi đến độc lập ở Đông Nam Á',
        lessons: [
          'Bài 5: Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á',
          'Bài 6: Hành trình đi đến độc lập dân tộc ở Đông Nam Á',
        ],
      },
      {
        title: 'Chủ đề 4: Chiến tranh bảo vệ Tổ quốc và giải phóng dân tộc (trước 1945)',
        description: 'Khái quát chiến tranh bảo vệ Tổ quốc và một số cuộc khởi nghĩa lớn trong lịch sử Việt Nam',
        lessons: [
          'Bài 7: Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam',
          'Bài 8: Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam',
        ],
      },
      {
        title: 'Chủ đề 5: Một số cuộc cải cách lớn trong lịch sử Việt Nam (trước 1858)',
        description: 'Cải cách của Hồ Quý Ly, Lê Thánh Tông và Minh Mạng',
        lessons: [
          'Bài 9: Cuộc cải cách của Hồ Quý Ly và Triều Hồ (đầu thế kỉ XV)',
          'Bài 10: Cuộc cải cách của Lê Thánh Tông (thế kỉ XV)',
          'Bài 11: Cuộc cải cách của Minh Mạng (nửa đầu thế kỉ XIX)',
        ],
      },
      {
        title: 'Chủ đề 6: Lịch sử bảo vệ chủ quyền và lợi ích của Việt Nam ở Biển Đông',
        description: 'Vị trí, tầm quan trọng của Biển Đông và chủ quyền của Việt Nam',
        lessons: [
          'Bài 12: Vị trí và tầm quan trọng của Biển Đông',
          'Bài 13: Việt Nam và Biển Đông',
        ],
      },
    ],
  },
  {
    title: 'Lịch Sử 12',
    icon: '',
    color: '#ec4899',
    description: 'Bộ Kết nối tri thức với cuộc sống — Trật tự thế giới, ASEAN, Kháng chiến 1945-nay, Đổi mới 1986, Đối ngoại và Hồ Chí Minh',
    chapters: [
      {
        title: 'Chủ đề 1: Thế giới trong và sau Chiến tranh lạnh',
        description: 'Liên hợp quốc, Trật tự thế giới trong và sau Chiến tranh lạnh',
        lessons: [
          getSu12(1, 'Bài 1: Liên hợp quốc'),
          getSu12(2, 'Bài 2: Trật tự thế giới trong Chiến tranh lạnh'),
          getSu12(3, 'Bài 3: Trật tự thế giới sau Chiến tranh lạnh'),
        ],
      },
      {
        title: 'Chủ đề 2: ASEAN: Những chặng đường lịch sử',
        description: 'Sự ra đời, phát triển của ASEAN và Cộng đồng ASEAN từ ý tưởng đến hiện thực',
        lessons: [
          getSu12(4, 'Bài 4: Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN)'),
          getSu12(5, 'Bài 5: Cộng đồng ASEAN: Từ ý tưởng đến hiện thực'),
        ],
      },
      {
        title: 'Chủ đề 3: Cách mạng tháng Tám 1945, Kháng chiến giải phóng và bảo vệ Tổ quốc (1945 – nay)',
        description: 'Cách mạng tháng Tám, kháng chiến chống Pháp, Mỹ và bảo vệ Tổ quốc',
        lessons: [
          getSu12(6, 'Bài 6: Cách mạng tháng Tám năm 1945'),
          getSu12(7, 'Bài 7: Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)'),
          getSu12(8, 'Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)'),
          getSu12(9, 'Bài 9: Cuộc đấu tranh bảo vệ Tổ quốc từ sau tháng 4 – 1975 đến nay. Một số bài học lịch sử'),
        ],
      },
      {
        title: 'Chủ đề 4: Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay',
        description: 'Khái quát, thành tựu cơ bản và bài học của công cuộc Đổi mới',
        lessons: [
          getSu12(10, 'Bài 10: Khái quát về công cuộc Đổi mới từ năm 1986 đến nay'),
          getSu12(11, 'Bài 11: Thành tựu cơ bản và bài học của công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay'),
        ],
      },
      {
        title: 'Chủ đề 5: Lịch sử đối ngoại của Việt Nam thời cận – hiện đại',
        description: 'Hoạt động đối ngoại qua các giai đoạn 1945, 1945-1975 và từ 1975 đến nay',
        lessons: [
          getSu12(12, 'Bài 12: Hoạt động đối ngoại của Việt Nam trong đấu tranh giành độc lập dân tộc (từ đầu thế kỉ XX đến CMT8 1945)'),
          getSu12(13, 'Bài 13: Hoạt động đối ngoại của Việt Nam trong kháng chiến chống Pháp (1945 – 1954) và chống Mỹ (1954 – 1975)'),
          getSu12(14, 'Bài 14: Hoạt động đối ngoại của Việt Nam từ năm 1975 đến nay'),
        ],
      },
      {
        title: 'Chủ đề 6: Hồ Chí Minh trong lịch sử Việt Nam',
        description: 'Cuộc đời sự nghiệp, anh hùng giải phóng dân tộc và dấu ấn trong lòng nhân dân',
        lessons: [
          getSu12(15, 'Bài 15: Khái quát cuộc đời và sự nghiệp của Hồ Chí Minh'),
          getSu12(16, 'Bài 16: Hồ Chí Minh – Anh hùng giải phóng dân tộc'),
          getSu12(17, 'Bài 17: Dấu ấn Hồ Chí Minh trong lòng nhân dân thế giới và Việt Nam'),
        ],
      },
    ],
  },
];

export async function seedHistoryCurriculum(dataApi) {
  let count = 0;
  for (let sIdx = 0; sIdx < HISTORY_CURRICULUM.length; sIdx++) {
    const s = HISTORY_CURRICULUM[sIdx];
    const existingSubs = await dataApi.list('subjects', { where: { title: s.title } });
    let sub = existingSubs?.[0];
    if (!sub) {
      sub = await dataApi.insert('subjects', {
        title: s.title,
        icon: s.icon,
        color: s.color,
        description: s.description,
        position: sIdx + 1,
      });
      count++;
    }

    for (let cIdx = 0; cIdx < s.chapters.length; cIdx++) {
      const c = s.chapters[cIdx];
      const existingChs = await dataApi.list('chapters', { where: { subject_id: sub.id, title: c.title } });
      let ch = existingChs?.[0];
      if (!ch) {
        ch = await dataApi.insert('chapters', {
          subject_id: sub.id,
          title: c.title,
          description: c.description,
          position: cIdx + 1,
        });
      }

      for (let lIdx = 0; lIdx < c.lessons.length; lIdx++) {
        const item = c.lessons[lIdx];
        const lTitle = typeof item === 'object' ? item.title : item;
        const lContent = typeof item === 'object' ? (item.content || '') : '';
        const existingLs = await dataApi.list('lessons', { where: { chapter_id: ch.id, title: lTitle } });
        let lessonId;
        if (!existingLs?.length) {
          const newLesson = await dataApi.insert('lessons', {
            chapter_id: ch.id,
            title: lTitle,
            content: lContent,
            position: lIdx + 1,
          });
          lessonId = newLesson.id;
        } else {
          lessonId = existingLs[0].id;
          if (!existingLs[0].content && lContent) {
            await dataApi.update('lessons', existingLs[0].id, { content: lContent });
          }
        }

        // Tự động gieo sẵn các bài tập BT1, BT2, BT3 chuẩn Đề thi THPTQG 2026 cho Bài 1: Liên Hợp Quốc
        if (lTitle.toLowerCase().includes('liên hợp quốc') && lessonId) {
          await seedBtAssignmentsForLesson(dataApi, lessonId, ch.id);
        }
      }
    }
  }
  return count;
}

/**
 * Gieo hệ thống bài tập BT1, BT2,... chuẩn định dạng Đề thi THPT Quốc Gia 2026 của Bộ GD&ĐT:
 * BT1: Có sẵn form 24 câu trắc nghiệm (Phần I - 6.0đ) + 4 câu Đúng/Sai mỗi câu 4 ý (Phần II - 4.0đ) = 10.0 điểm
 */
export async function seedBtAssignmentsForLesson(dataApi, lessonId, chapterId) {
  const existingAs = await dataApi.list('assignments', { where: { lesson_id: lessonId } });
  const bt1 = existingAs.find((a) => (a.title || '').includes('BT1'));
  if (bt1) {
    const qs = await dataApi.list('questions', { where: { assignment_id: bt1.id } });
    if (qs.length >= 28) return; // Đã có đầy đủ 28 câu chuẩn THPTQG 2026
  }

  // Thu hồi các bài tập cũ để làm mới theo form chuẩn THPTQG 2026
  for (const oldA of existingAs) {
    await dataApi.remove('assignments', oldA.id);
    const oldQs = await dataApi.list('questions', { where: { assignment_id: oldA.id } });
    for (const q of oldQs) await dataApi.remove('questions', q.id);
  }

  // 1. BT1: ĐỀ THI CHUẨN THPTQG 2026 (24 CÂU TRẮC NGHIỆM + 4 CÂU ĐÚNG/SAI)
  const a1 = await dataApi.insert('assignments', {
    chapter_id: chapterId,
    lesson_id: lessonId,
    title: 'BT1: Đề thi thử THPT Quốc Gia 2026 (24 câu trắc nghiệm + 4 câu Đúng / Sai)',
    kind: 'quiz',
    instructions: 'Cấu trúc bám sát 100% định dạng Đề thi Tốt nghiệp THPT Quốc Gia 2026 của Bộ GD&ĐT:\n- Phần I: 24 câu trắc nghiệm 4 lựa chọn (0.25đ/câu = 6.0đ)\n- Phần II: 4 câu trắc nghiệm Đúng/Sai (1.0đ/câu = 4.0đ)\nTổng điểm: 10.0 điểm.',
    max_score: 10,
    position: 1,
    is_published: true,
  });

  // 24 CÂU TRẮC NGHIỆM PHẦN I (0.25đ / câu = 6.0đ)
  const mcq24 = [
    {
      prompt: 'Bản Hiến chương Liên hợp quốc chính thức có hiệu lực vào ngày tháng năm nào?',
      options: ['24 - 10 - 1945', '02 - 09 - 1945', '08 - 08 - 1967', '20 - 09 - 1977'],
      correct: 0,
      points: 0.25,
      explanation: 'Ngày 24-10-1945, Hiến chương Liên hợp quốc chính thức có hiệu lực. Ngày 24-10 hàng năm là "Ngày Liên hợp quốc".',
    },
    {
      prompt: 'Trụ sở chính thức của tổ chức Liên hợp quốc hiện nay đặt tại thành phố nào?',
      options: ['Giơ-ne-vơ (Thuỵ Sĩ)', 'Niu Oóc (New York, Mỹ)', 'Pa-ri (Pháp)', 'Luân Đôn (Anh)'],
      correct: 1,
      points: 0.25,
      explanation: 'Trụ sở chính của Liên hợp quốc đặt tại thành phố Niu Oóc (Mỹ).',
    },
    {
      prompt: 'Hội nghị quyết định thành lập một tổ chức quốc tế để duy trì trật tự thế giới sau Chiến tranh thế giới thứ hai diễn ra tại I-an-ta vào thời gian nào?',
      options: ['Tháng 2 - 1945', 'Tháng 4 - 1945', 'Tháng 8 - 1945', 'Tháng 10 - 1945'],
      correct: 0,
      points: 0.25,
      explanation: 'Hội nghị I-an-ta (Liên Xô) diễn ra từ ngày 4 đến 12-2-1945.',
    },
    {
      prompt: 'Hội nghị quốc tế thảo luận và thông qua bản Hiến chương Liên hợp quốc diễn ra tại thành phố nào?',
      options: ['Xan Phran-xi-xcô (Mỹ)', 'Oa-sinh-tơn (Mỹ)', 'Mát-xcơ-va (Liên Xô)', 'Béc-lin (Đức)'],
      correct: 0,
      points: 0.25,
      explanation: 'Hội nghị Xan Phran-xi-xcô diễn ra từ 25-4 đến 26-6-1945.',
    },
    {
      prompt: 'Có bao nhiêu quốc gia ban đầu tham gia thảo luận và ký bản Hiến chương Liên hợp quốc năm 1945?',
      options: ['50 quốc gia', '51 quốc gia', '149 quốc gia', '193 quốc gia'],
      correct: 0,
      points: 0.25,
      explanation: 'Đại biểu của 50 quốc gia đã tham gia Hội nghị Xan Phran-xi-xcô (sau đó Ba Lan ký bổ sung là nước thứ 51).',
    },
    {
      prompt: 'Ngày 24-10 hàng năm được chọn làm ngày kỷ niệm gì của cộng đồng quốc tế?',
      options: ['Ngày Hoà bình Thế giới', 'Ngày Liên hợp quốc', 'Ngày Nhân quyền Quốc tế', 'Ngày Quốc tế Lao động'],
      correct: 1,
      points: 0.25,
      explanation: 'Ngày 24-10 hàng năm được chọn là "Ngày Liên hợp quốc".',
    },
    {
      prompt: 'Cơ quan nào của Liên hợp quốc giữ vai trò trọng yếu nhất trong việc duy trì hoà bình và an ninh quốc tế?',
      options: ['Đại hội đồng', 'Ban Thư ký', 'Hội đồng Bảo an', 'Toà án Công lý Quốc tế'],
      correct: 2,
      points: 0.25,
      explanation: 'Hội đồng Bảo an là cơ quan chịu trách nhiệm chính về an ninh và hoà bình quốc tế.',
    },
    {
      prompt: 'Năm quốc gia uỷ viên thường trực của Hội đồng Bảo an Liên hợp quốc gồm những nước nào?',
      options: [
        'Liên Xô (Nga), Mỹ, Anh, Pháp, Trung Quốc',
        'Mỹ, Anh, Pháp, Đức, Nhật Bản',
        'Liên Xô (Nga), Mỹ, Anh, Pháp, Đức',
        'Mỹ, Trung Quốc, Nhật Bản, Ấn Độ, Anh',
      ],
      correct: 0,
      points: 0.25,
      explanation: '5 nước thường trực là Liên Xô (nay là Nga), Mỹ, Anh, Pháp, Trung Quốc.',
    },
    {
      prompt: 'Nguyên tắc biểu quyết mang tính quyết định của 5 nước uỷ viên thường trực Hội đồng Bảo an là gì?',
      options: ['Nguyên tắc đa số giản đơn', 'Nguyên tắc nhất trí giữa 5 nước lớn', 'Nguyên tắc 2/3 số phiếu', 'Nguyên tắc luân phiên'],
      correct: 1,
      points: 0.25,
      explanation: 'Chỉ cần 1 nước thường trực bỏ phiếu chống thì nghị quyết sẽ không được thông qua (quyền phủ quyết).',
    },
    {
      prompt: 'Cơ quan nào của Liên hợp quốc bao gồm đại biểu của tất cả các quốc gia thành viên và họp thường niên vào tháng 9 hàng năm?',
      options: ['Đại hội đồng', 'Hội đồng Quản thác', 'Hội đồng Bảo an', 'Ban Thư ký'],
      correct: 0,
      points: 0.25,
      explanation: 'Đại hội đồng gồm đại biểu của toàn bộ 193 nước thành viên.',
    },
    {
      prompt: 'Cơ quan xét xử và giải quyết các tranh chấp pháp lý quốc tế của Liên hợp quốc có trụ sở tại La Hay (Hà Lan) là?',
      options: ['Toà án Hình sự Quốc tế', 'Toà án Công lý Quốc tế (ICJ)', 'Uỷ ban Luật pháp Quốc tế', 'Hội đồng Nhân quyền'],
      correct: 1,
      points: 0.25,
      explanation: 'Toà án Công lý Quốc tế là cơ quan tư pháp chính của Liên hợp quốc.',
    },
    {
      prompt: 'Người đứng đầu cơ quan hành chính của Liên hợp quốc giữ chức vụ gì?',
      options: ['Chủ tịch Đại hội đồng', 'Tổng Thư ký Liên hợp quốc', 'Chủ tịch Hội đồng Bảo an', 'Thủ tướng Liên hợp quốc'],
      correct: 1,
      points: 0.25,
      explanation: 'Ban Thư ký do Tổng Thư ký đứng đầu, nhiệm kỳ 5 năm.',
    },
    {
      prompt: 'Theo Điều 1 Hiến chương Liên hợp quốc, mục tiêu hàng đầu và xuyên suốt của tổ chức là gì?',
      options: [
        'Duy trì hoà bình và an ninh quốc tế',
        'Thúc đẩy thương mại tự do toàn cầu',
        'Xoá bỏ các rào cản tiền tệ quốc tế',
        'Phát triển khoa học công nghệ vũ trụ',
      ],
      correct: 0,
      points: 0.25,
      explanation: 'Mục tiêu số 1 là duy trì hoà bình và an ninh quốc tế.',
    },
    {
      prompt: 'Nguyên tắc hoạt động cốt lõi đầu tiên được ghi nhận tại Điều 2 Hiến chương Liên hợp quốc là?',
      options: [
        'Bình đẳng về chủ quyền giữa tất cả các quốc gia thành viên',
        'Ưu tiên quyền lợi cho các cường quốc kinh tế',
        'Giải quyết tranh chấp bằng biện pháp quân sự',
        'Các nước nhỏ phải phục tùng quyết định của các nước lớn',
      ],
      correct: 0,
      points: 0.25,
      explanation: 'Bình đẳng về chủ quyền giữa tất cả các quốc gia là nguyên tắc nền tảng.',
    },
    {
      prompt: 'Về phương thức giải quyết các tranh chấp quốc tế, Hiến chương Liên hợp quốc quy định phải:',
      options: [
        'Giải quyết bằng biện pháp hoà bình, không dùng vũ lực hoặc đe doạ dùng vũ lực',
        'Sử dụng sức mạnh quân sự áp đảo để chấm dứt xung đột',
        'Uỷ quyền cho các liên minh quân sự khu vực can thiệp',
        'Cô lập kinh tế và phong toả biên giới vô điều kiện',
      ],
      correct: 0,
      points: 0.25,
      explanation: 'Hiến chương nghiêm cấm đe doạ sử dụng vũ lực hoặc dùng vũ lực.',
    },
    {
      prompt: 'Nguyên tắc nào sau đây của Liên hợp quốc đóng vai trò then chốt bảo vệ nền độc lập tự chủ của các quốc gia?',
      options: [
        'Không can thiệp vào công việc nội bộ của bất kỳ quốc gia nào',
        'Mở cửa biên giới cho các lực lượng gìn giữ hoà bình',
        'Tự do thành lập các căn cứ quân sự ở nước ngoài',
        'Tự do thay đổi đường biên giới lãnh thổ',
      ],
      correct: 0,
      points: 0.25,
      explanation: 'Nguyên tắc tôn trọng chủ quyền và không can thiệp nội bộ.',
    },
    {
      prompt: 'Việt Nam chính thức được kết nạp làm thành viên thứ 149 của Liên hợp quốc vào ngày tháng năm nào?',
      options: ['30 - 04 - 1975', '20 - 09 - 1977', '28 - 07 - 1995', '11 - 01 - 2007'],
      correct: 1,
      points: 0.25,
      explanation: 'Ngày 20-9-1977, tại khoá họp 32 Đại hội đồng LHQ, Việt Nam chính thức trở thành thành viên thứ 149.',
    },
    {
      prompt: 'Sự kiện lá cờ đỏ sao vàng của Việt Nam được thượng cờ tại trụ sở Liên hợp quốc diễn ra tại khoá họp thứ mấy của Đại hội đồng?',
      options: ['Khoá họp thứ 30', 'Khoá họp thứ 32', 'Khoá họp thứ 35', 'Khoá họp thứ 40'],
      correct: 1,
      points: 0.25,
      explanation: 'Khoá họp thứ 32 của Đại hội đồng Liên hợp quốc.',
    },
    {
      prompt: 'Lần đầu tiên Việt Nam được tín nhiệm bầu làm Uỷ viên không thường trực Hội đồng Bảo an Liên hợp quốc vào nhiệm kỳ nào?',
      options: ['Nhiệm kỳ 1995 - 1996', 'Nhiệm kỳ 2008 - 2009', 'Nhiệm kỳ 2014 - 2015', 'Nhiệm kỳ 2020 - 2021'],
      correct: 1,
      points: 0.25,
      explanation: 'Nhiệm kỳ đầu tiên của Việt Nam là 2008 - 2009.',
    },
    {
      prompt: 'Trong lần thứ hai trúng cử Uỷ viên không thường trực HĐBA (nhiệm kỳ 2020 - 2021), Việt Nam đạt số phiếu ủng hộ kỷ lục là bao nhiêu?',
      options: ['150 / 193 phiếu', '175 / 193 phiếu', '185 / 193 phiếu', '192 / 193 phiếu'],
      correct: 3,
      points: 0.25,
      explanation: 'Việt Nam trúng cử với số phiếu kỷ lục 192 trên tổng số 193 quốc gia bỏ phiếu.',
    },
    {
      prompt: 'Việt Nam chính thức cử lực lượng tham gia hoạt động Gìn giữ hoà bình của Liên hợp quốc từ năm nào?',
      options: ['Năm 1977', 'Năm 1995', 'Năm 2014', 'Năm 2020'],
      correct: 2,
      points: 0.25,
      explanation: 'Năm 2014, Việt Nam chính thức cử các sĩ quan đầu tiên tham gia phái bộ gìn giữ hoà bình.',
    },
    {
      prompt: 'Lực lượng quân y chuyên trách của Việt Nam đã nhiều lần cử đến thực hiện nhiệm vụ gìn giữ hoà bình tại phái bộ UNMISS (Nam Xu-đăng) là?',
      options: ['Bệnh viện dã chiến cấp 1', 'Bệnh viện dã chiến cấp 2', 'Bệnh viện dã chiến cấp 3', 'Đội cứu hộ nhân đạo quốc tế'],
      correct: 1,
      points: 0.25,
      explanation: 'Bệnh viện dã chiến cấp 2 của Việt Nam tại Nam Xu-đăng được quốc tế đánh giá rất cao.',
    },
    {
      prompt: 'Tại phái bộ UNISFA ở khu vực Abyei, Việt Nam đã cử đơn vị quân đội nào tham gia hỗ trợ tái thiết hạ tầng và hỗ trợ nhân đạo?',
      options: ['Đội công binh số 1 và số 2', 'Lực lượng đặc công', 'Không quân vận tải', 'Đội cảnh vệ biển'],
      correct: 0,
      points: 0.25,
      explanation: 'Đội công binh Việt Nam đã tham gia phái bộ UNISFA tại khu vực Abyei.',
    },
    {
      prompt: 'Tổ chức chuyên môn nào của Liên hợp quốc có chức năng bảo tồn Di sản văn hoá, thúc đẩy giáo dục và khoa học toàn cầu?',
      options: ['UNICEF', 'UNESCO', 'WHO', 'UNDP'],
      correct: 1,
      points: 0.25,
      explanation: 'UNESCO là Tổ chức Giáo dục, Khoa học và Văn hoá của Liên hợp quốc.',
    },
  ];

  for (let idx = 0; idx < mcq24.length; idx++) {
    const q = mcq24[idx];
    const createdQ = await dataApi.insert('questions', {
      assignment_id: a1.id,
      type: 'mcq',
      prompt: `Câu ${idx + 1}. ${q.prompt}`,
      options: q.options,
      points: q.points,
      position: idx + 1,
    });
    await dataApi.upsert(
      'answer_keys',
      { question_id: createdQ.id, correct: q.correct, explanation: q.explanation },
      'question_id',
    );
  }

  // 4 CÂU ĐÚNG / SAI PHẦN II (1.0đ / câu = 4.0đ)
  const tf4 = [
    {
      prompt: 'Câu 1. Đọc đoạn tư liệu sau đây về sự hình thành và mục tiêu của Liên hợp quốc:\n\n"Tại Hội nghị Xan Phran-xi-xcô (Mỹ, từ ngày 25-4 đến 26-6-1945), đại biểu của 50 quốc gia đã thông qua bản Hiến chương Liên hợp quốc. Ngày 24-10-1945, Hiến chương chính thức có hiệu lực sau khi được các nước phê chuẩn. Mục tiêu hàng đầu của tổ chức là duy trì hoà bình và an ninh quốc tế; phát triển mối quan hệ hữu nghị giữa các dân tộc trên cơ sở tôn trọng quyền bình đẳng và quyền tự quyết của các dân tộc; thực hiện hợp tác quốc tế trong việc giải quyết các vấn đề toàn cầu."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:',
      options: [
        'Hội nghị Xan Phran-xi-xcô (1945) có sự tham gia thảo luận của đại biểu 193 quốc gia trên toàn thế giới.',
        'Ngày 24-10 hàng năm được chọn làm "Ngày Liên hợp quốc" vì đây là thời điểm bản Hiến chương chính thức có hiệu lực.',
        'Mục tiêu duy trì hoà bình của Liên hợp quốc cho phép các cường quốc can thiệp quân sự vào công việc nội bộ của các quốc gia nhỏ mà không cần sự đồng thuận.',
        'Đoạn tư liệu khẳng định việc tôn trọng quyền bình đẳng và quyền tự quyết của các dân tộc là cơ sở cốt lõi để phát triển quan hệ hữu nghị giữa các quốc gia.',
      ],
      correct: { 0: false, 1: true, 2: false, 3: true },
      points: 1.0,
      explanation: 'Ý a) Sai vì năm 1945 chỉ có đại biểu 50 nước tham gia; Ý b) Đúng; Ý c) Sai vì nguyên tắc Hiến chương nghiêm cấm can thiệp nội bộ; Ý d) Đúng theo Điều 1 Hiến chương.',
    },
    {
      prompt: 'Câu 2. Đọc đoạn tư liệu sau đây về cơ cấu tổ chức và nguyên tắc hoạt động của Hội đồng Bảo an:\n\n"Hội đồng Bảo an là cơ quan giữ vai trò trọng yếu trong việc duy trì hoà bình và an ninh quốc tế. Mọi quyết định quan trọng của Hội đồng Bảo an chỉ được thông qua khi có sự nhất trí của 5 nước uỷ viên thường trực (Liên Xô/Nga, Mỹ, Anh, Pháp, Trung Quốc). Chỉ cần một nước thường trực bỏ phiếu chống thì nghị quyết sẽ không được thông qua."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:',
      options: [
        'Hội đồng Bảo an là cơ quan duy nhất của Liên hợp quốc có quyền xem xét mọi vấn đề phát triển kinh tế, y tế và văn hoá xã hội.',
        'Nguyên tắc nhất trí giữa 5 nước lớn nhằm bảo đảm không xảy ra xung đột quân sự trực tiếp giữa các siêu cường hạt nhân sau Chiến tranh thế giới thứ hai.',
        'Nếu 4 nước uỷ viên thường trực bỏ phiếu thuận và 1 nước thường trực bỏ phiếu chống, nghị quyết của Hội đồng Bảo an vẫn được thông qua theo nguyên tắc đa số.',
        'Cơ chế biểu quyết đặc biệt của 5 nước uỷ viên thường trực tại Hội đồng Bảo an thường được gọi là quyền phủ quyết (veto).',
      ],
      correct: { 0: false, 1: true, 2: false, 3: true },
      points: 1.0,
      explanation: 'Ý a) Sai vì các vấn đề kinh tế xã hội thuộc chức năng của ECOSOC và Đại hội đồng; Ý b) Đúng; Ý c) Sai vì chỉ cần 1 phiếu chống là nghị quyết bị phủ quyết ngay; Ý d) Đúng.',
    },
    {
      prompt: 'Câu 3. Đọc đoạn tư liệu sau đây về các nguyên tắc hoạt động cốt lõi của Liên hợp quốc:\n\n"Điều 2 Hiến chương Liên hợp quốc quy định các nguyên tắc hoạt động cơ bản bao gồm: Bình đẳng về chủ quyền quốc gia; Tôn trọng toàn vẹn lãnh thổ và độc lập chính trị; Giải quyết các tranh chấp quốc tế bằng biện pháp hoà bình; Không can thiệp vào công việc nội bộ của bất kỳ quốc gia nào; Tôn trọng các nghĩa vụ quốc tế và luật pháp quốc tế."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:',
      options: [
        'Nguyên tắc bình đẳng chủ quyền thừa nhận mọi quốc gia thành viên đều có vị thế pháp lý ngang nhau trong khuôn khổ Hiến chương.',
        'Hiến chương cho phép các nước thành viên sử dụng vũ lực đơn phương để giải quyết tranh chấp biên giới nếu thấy cần thiết.',
        'Tôn trọng luật pháp quốc tế là nghĩa vụ bắt buộc đối với tất cả các quốc gia khi tham gia Liên hợp quốc.',
        'Nguyên tắc không can thiệp nội bộ đồng nghĩa với việc Liên hợp quốc không có quyền can thiệp vào chế độ chính trị của các nước thành viên.',
      ],
      correct: { 0: true, 1: false, 2: true, 3: true },
      points: 1.0,
      explanation: 'Ý a) Đúng; Ý b) Sai vì Điều 2 cấm dùng vũ lực hoặc đe doạ dùng vũ lực; Ý c) Đúng; Ý d) Đúng.',
    },
    {
      prompt: 'Câu 4. Đọc đoạn tư liệu sau đây về quan hệ Việt Nam - Liên hợp quốc:\n\n"Ngày 20-9-1977, Việt Nam chính thức trở thành thành viên thứ 149 của Liên hợp quốc. Trong hơn 4 thập kỷ qua, Việt Nam từ một nước tiếp nhận viện trợ nhân đạo sau chiến tranh đã vươn lên trở thành đối tác tích cực, đóng góp trách nhiệm vào các vấn đề toàn cầu: 2 lần đảm nhiệm Uỷ viên không thường trực HĐBA (2008-2009 và 2020-2021), cử lực lượng tham gia Gìn giữ hoà bình tại Nam Xu-đăng và Abyei."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:',
      options: [
        'Việt Nam gia nhập Liên hợp quốc ngay sau khi bản Hiến chương được ký kết năm 1945 tại Xan Phran-xi-xcô.',
        'Việt Nam là thành viên thứ 149 của tổ chức quốc tế lớn nhất hành tinh này.',
        'Việc cử bệnh viện dã chiến và công binh tham gia gìn giữ hoà bình thể hiện đường lối đối ngoại độc lập, tự chủ, đa phương hoá và trách nhiệm quốc tế của Việt Nam.',
        'Việt Nam đã 2 lần đảm nhiệm xuất sắc cương vị Uỷ viên không thường trực Hội đồng Bảo an Liên hợp quốc.',
      ],
      correct: { 0: false, 1: true, 2: true, 3: true },
      points: 1.0,
      explanation: 'Ý a) Sai vì Việt Nam gia nhập năm 1977 sau ngày đất nước thống nhất; Ý b) Đúng; Ý c) Đúng; Ý d) Đúng.',
    },
  ];

  for (let idx = 0; idx < tf4.length; idx++) {
    const q = tf4[idx];
    const createdQ = await dataApi.insert('questions', {
      assignment_id: a1.id,
      type: 'tf',
      prompt: q.prompt,
      options: q.options,
      points: q.points,
      position: 24 + idx + 1,
    });
    await dataApi.upsert(
      'answer_keys',
      { question_id: createdQ.id, correct: q.correct, explanation: q.explanation },
      'question_id',
    );
  }
}

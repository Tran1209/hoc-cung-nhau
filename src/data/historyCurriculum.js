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
 * Gieo hệ thống bài tập BT1, BT2, BT3 chuẩn định dạng Đề thi THPT Quốc Gia 2026 của Bộ GD&ĐT
 */
export async function seedBtAssignmentsForLesson(dataApi, lessonId, chapterId) {
  const existingAs = await dataApi.list('assignments', { where: { lesson_id: lessonId } });
  const hasBt2 = existingAs.some((a) => (a.title || '').includes('BT2'));
  if (hasBt2) return;

  // Thu hồi các bài tập cũ chưa đánh số BT
  for (const oldA of existingAs) {
    if (!oldA.title.startsWith('BT')) {
      await dataApi.remove('assignments', oldA.id);
      const oldQs = await dataApi.list('questions', { where: { assignment_id: oldA.id } });
      for (const q of oldQs) await dataApi.remove('questions', q.id);
    }
  }

  // 1. BT1: Trắc nghiệm 4 lựa chọn (Phần I - THPTQG 2026)
  const a1 = await dataApi.insert('assignments', {
    chapter_id: chapterId,
    lesson_id: lessonId,
    title: 'BT1: Trắc nghiệm nhiều lựa chọn (Phần I - Đề thi THPTQG 2026)',
    kind: 'quiz',
    instructions: 'Gồm các câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) kiểm tra kiến thức cốt lõi Bài 1: Liên hợp quốc.',
    max_score: 10,
    position: 1,
    is_published: true,
  });

  const qList1 = [
    {
      type: 'mcq',
      prompt: 'Bản Hiến chương Liên hợp quốc chính thức có hiệu lực vào ngày tháng năm nào?',
      options: ['24 - 10 - 1945', '02 - 09 - 1945', '08 - 08 - 1967', '20 - 09 - 1977'],
      correct: 0,
      points: 2,
      explanation: 'Ngày 24-10-1945, sau khi được các nước phê chuẩn, Hiến chương Liên hợp quốc chính thức có hiệu lực. Ngày 24-10 hàng năm được chọn làm "Ngày Liên hợp quốc".',
    },
    {
      type: 'mcq',
      prompt: 'Trụ sở chính thức của tổ chức Liên hợp quốc hiện nay đặt tại thành phố nào?',
      options: ['Giơ-ne-vơ (Thuỵ Sĩ)', 'Niu Oóc (New York, Mỹ)', 'Pa-ri (Pháp)', 'Luân Đôn (Anh)'],
      correct: 1,
      points: 2,
      explanation: 'Trụ sở chính của Liên hợp quốc được đặt tại thành phố Niu Oóc (New York, Mỹ).',
    },
    {
      type: 'mcq',
      prompt: 'Cơ quan nào của Liên hợp quốc giữ vai trò trọng yếu nhất trong việc duy trì hoà bình và an ninh quốc tế?',
      options: ['Đại hội đồng', 'Ban Thư ký', 'Hội đồng Bảo an', 'Toà án Công lý Quốc tế'],
      correct: 2,
      points: 2,
      explanation: 'Hội đồng Bảo an là cơ quan chịu trách nhiệm chính về duy trì hoà bình và an ninh quốc tế.',
    },
    {
      type: 'mcq',
      prompt: 'Nguyên tắc biểu quyết mang tính quyết định của 5 nước uỷ viên thường trực Hội đồng Bảo an là gì?',
      options: ['Nguyên tắc đa số giản đơn', 'Nguyên tắc nhất trí tuyệt đối giữa 5 cường quốc lớn', 'Nguyên tắc 2/3 số phiếu', 'Nguyên tắc luân phiên'],
      correct: 1,
      points: 2,
      explanation: 'Chỉ cần 1 nước trong 5 nước thường trực (Liên Xô/Nga, Mỹ, Anh, Pháp, Trung Quốc) bỏ phiếu chống là nghị quyết không được thông qua (quyền phủ quyết).',
    },
    {
      type: 'mcq',
      prompt: 'Việt Nam chính thức được kết nạp làm thành viên thứ 149 của Liên hợp quốc vào ngày tháng năm nào?',
      options: ['30 - 04 - 1975', '20 - 09 - 1977', '28 - 07 - 1995', '11 - 01 - 2007'],
      correct: 1,
      points: 2,
      explanation: 'Ngày 20-9-1977, tại khoá họp 32 Đại hội đồng LHQ, Việt Nam chính thức trở thành thành viên thứ 149 của tổ chức.',
    },
  ];

  for (let idx = 0; idx < qList1.length; idx++) {
    const q = qList1[idx];
    const createdQ = await dataApi.insert('questions', {
      assignment_id: a1.id,
      type: q.type,
      prompt: q.prompt,
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

  // 2. BT2: Trắc nghiệm Đúng / Sai theo tư liệu lịch sử (Phần II - Định dạng mới THPTQG 2026)
  const a2 = await dataApi.insert('assignments', {
    chapter_id: chapterId,
    lesson_id: lessonId,
    title: 'BT2: Trắc nghiệm Đúng / Sai theo tư liệu (Phần II - Định dạng mới THPTQG 2026)',
    kind: 'quiz',
    instructions: 'Mỗi câu hỏi có 1 đoạn trích tư liệu lịch sử kèm 4 mệnh đề a, b, c, d. Thí sinh chọn Đúng hoặc Sai cho từng mệnh đề theo chuẩn quy chế thi THPTQG 2026 của Bộ GD&ĐT.',
    max_score: 10,
    position: 2,
    is_published: true,
  });

  const qList2 = [
    {
      type: 'tf',
      prompt: 'Đọc đoạn tư liệu sau đây về sự hình thành và mục tiêu của Liên hợp quốc:\n\n"Tại Hội nghị Xan Phran-xi-xcô (Mỹ, từ ngày 25-4 đến 26-6-1945), đại biểu của 50 quốc gia đã thông qua bản Hiến chương Liên hợp quốc. Ngày 24-10-1945, Hiến chương chính thức có hiệu lực sau khi được các nước phê chuẩn. Mục tiêu hàng đầu của tổ chức là duy trì hoà bình và an ninh quốc tế; phát triển mối quan hệ hữu nghị giữa các dân tộc trên cơ sở tôn trọng quyền bình đẳng và quyền tự quyết của các dân tộc; thực hiện hợp tác quốc tế trong việc giải quyết các vấn đề toàn cầu."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:',
      options: [
        'Hội nghị Xan Phran-xi-xcô (1945) có sự tham gia thảo luận của đại biểu 193 quốc gia trên toàn thế giới.',
        'Ngày 24-10 hàng năm được chọn làm "Ngày Liên hợp quốc" vì đây là thời điểm bản Hiến chương chính thức có hiệu lực.',
        'Mục tiêu duy trì hoà bình của Liên hợp quốc cho phép các cường quốc can thiệp quân sự vào công việc nội bộ của các quốc gia nhỏ mà không cần sự đồng thuận.',
        'Đoạn tư liệu khẳng định việc tôn trọng quyền bình đẳng và quyền tự quyết của các dân tộc là cơ sở cốt lõi để phát triển quan hệ hữu nghị giữa các quốc gia.',
      ],
      correct: { 0: false, 1: true, 2: false, 3: true },
      points: 5,
      explanation: 'Ý a) Sai vì Hội nghị Xan Phran-xi-xcô năm 1945 chỉ có đại biểu 50 nước tham gia; Ý b) Đúng theo Điều lệ LHQ; Ý c) Sai vì nguyên tắc Hiến chương nghiêm cấm can thiệp công việc nội bộ; Ý d) Đúng theo Điều 1 Hiến chương.',
    },
    {
      type: 'tf',
      prompt: 'Đọc đoạn tư liệu sau đây về vai trò và nguyên tắc hoạt động của Hội đồng Bảo an:\n\n"Hội đồng Bảo an là cơ quan giữ vai trò trọng yếu trong việc duy trì hoà bình và an ninh quốc tế. Mọi quyết định quan trọng của Hội đồng Bảo an chỉ được thông qua khi có sự nhất trí của 5 nước uỷ viên thường trực (Liên Xô/Nga, Mỹ, Anh, Pháp, Trung Quốc). Chỉ cần một nước thường trực bỏ phiếu chống thì nghị quyết sẽ không được thông qua."\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:',
      options: [
        'Hội đồng Bảo an là cơ quan duy nhất của Liên hợp quốc có quyền xem xét mọi vấn đề phát triển kinh tế, y tế và văn hoá xã hội.',
        'Nguyên tắc nhất trí giữa 5 nước lớn nhằm bảo đảm không xảy ra xung đột quân sự trực tiếp giữa các siêu cường hạt nhân sau Chiến tranh thế giới thứ hai.',
        'Nếu 4 nước uỷ viên thường trực bỏ phiếu thuận và 1 nước thường trực bỏ phiếu chống, nghị quyết của Hội đồng Bảo an vẫn được thông qua theo nguyên tắc đa số.',
        'Cơ chế biểu quyết đặc biệt của 5 nước uỷ viên thường trực tại Hội đồng Bảo an thường được gọi là quyền phủ quyết (veto).',
      ],
      correct: { 0: false, 1: true, 2: false, 3: true },
      points: 5,
      explanation: 'Ý a) Sai vì các vấn đề kinh tế xã hội thuộc chức năng của ECOSOC và Đại hội đồng; Ý b) Đúng; Ý c) Sai vì chỉ cần 1 phiếu chống là nghị quyết bị phủ quyết ngay; Ý d) Đúng.',
    },
  ];

  for (let idx = 0; idx < qList2.length; idx++) {
    const q = qList2[idx];
    const createdQ = await dataApi.insert('questions', {
      assignment_id: a2.id,
      type: q.type,
      prompt: q.prompt,
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

  // 3. BT3: Vận dụng kiến thức & Phân tích sự kiện Lịch Sử
  const a3 = await dataApi.insert('assignments', {
    chapter_id: chapterId,
    lesson_id: lessonId,
    title: 'BT3: Vận dụng kiến thức & Phân tích sự kiện Lịch Sử',
    kind: 'quiz',
    instructions: 'Luyện tập câu hỏi đọc hiểu tư liệu kết hợp câu hỏi tự luận vận dụng thực tế quan hệ Việt Nam - Liên hợp quốc.',
    max_score: 10,
    position: 3,
    is_published: true,
  });

  const qList3 = [
    {
      type: 'mcq',
      prompt: 'Từ năm 2014 đến nay, lực lượng Gìn giữ hoà bình của Việt Nam đã được cử đến thực hiện nhiệm vụ quốc tế tại những phái bộ nào của Liên hợp quốc?',
      options: [
        'Phái bộ UNMISS tại Nam Xu-đăng và phái bộ UNISFA tại khu vực Abyei.',
        'Phái bộ tại Đông Ti-mo và phái bộ tại Béc-lin.',
        'Phái bộ tại Bờ Biển Ngà và phái bộ tại U-crai-na.',
        'Phái bộ tại Li-băng và phái bộ tại Cô-xô-vô.',
      ],
      correct: 0,
      points: 4,
      explanation: 'Việt Nam đã cử bệnh viện dã chiến cấp 2 đến Nam Xu-đăng (UNMISS) và đội công binh đến Abyei (UNISFA).',
    },
    {
      type: 'essay',
      prompt: 'Dựa vào kiến thức đã học, em hãy phân tích ngắn gọn (khoảng 5 - 7 dòng) ý nghĩa của nguyên tắc "Sự nhất trí giữa 5 nước uỷ viên thường trực Hội đồng Bảo an" đối với nền hoà bình thế giới.',
      options: [],
      correct: null,
      points: 6,
      explanation: 'Nguyên tắc nhất trí 5 nước lớn bảo đảm các cường quốc phải đối thoại, thương lượng; tránh nguy cơ đối đầu quân sự trực tiếp dẫn đến Chiến tranh thế giới thứ ba.',
    },
  ];

  for (let idx = 0; idx < qList3.length; idx++) {
    const q = qList3[idx];
    const createdQ = await dataApi.insert('questions', {
      assignment_id: a3.id,
      type: q.type,
      prompt: q.prompt,
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
}

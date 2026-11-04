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

  // 1. BT1: ĐỀ THI CHUẨN THPTQG 2026 (24 CÂU TRẮC NGHIỆM + 2 CÂU ĐÚNG/SAI)
  const a1 = await dataApi.insert('assignments', {
    chapter_id: chapterId,
    lesson_id: lessonId,
    title: 'BT1: Đề thi thử THPT Quốc Gia 2026 (24 câu trắc nghiệm + 2 câu Đúng / Sai)',
    kind: 'quiz',
    instructions: 'Đề thi trắc nghiệm Lịch Sử 12 - Bài 1: Liên hợp quốc (Bộ Kết nối tri thức với cuộc sống):\n- Phần I: 24 câu trắc nghiệm 4 lựa chọn theo ma trận 5 Lõi kiến thức (0.25đ/câu = 6.0đ)\n- Phần II: 2 câu trắc nghiệm Đúng / Sai theo đoạn tư liệu và bảng thông tin (2.0đ/câu = 4.0đ)\nTổng điểm: 10.0 điểm.',
    max_score: 10,
    position: 1,
    is_published: true,
  });

  // 24 CÂU TRẮC NGHIỆM PHẦN I (0.25đ / câu = 6.0đ)
  const mcq24 = [
  {
    "prompt": "Ngày 1 – 1 – 1942, đại diện 26 nước chống phát xít đã kí văn kiện nào sau đây, cam kết thành lập một tổ chức quốc tế vì hòa bình và an ninh sau chiến tranh?",
    "options": [
      "Hiệp ước Véc-xai năm 1919.",
      "Tuyên bố về Liên hợp quốc.",
      "Hiến chương Đại Tây Dương.",
      "Tuyên ngôn Độc lập của Hoa Kỳ."
    ],
    "correct": 1,
    "points": 0.25,
    "explanation": "Mốc 1 – 1 – 1942 gắn với bản Tuyên bố về Liên hợp quốc do 26 nước chống phát xít kí tại Oa-sinh-tơn (Mỹ). [Nhiễu]: A (Véc-xai 1919) thuộc CTTG I. C (Hiến chương Đại Tây Dương) là văn kiện năm 1941 của Mỹ và Anh. D thuộc thời kỳ khác.",
    "type": "mcq"
  },
  {
    "prompt": "Từ ngày 25 – 4 đến ngày 26 – 6 – 1945, hội nghị quốc tế nào sau đây đã thông qua bản Hiến chương Liên hợp quốc?",
    "options": [
      "Hội nghị Pốt-xđam.",
      "Hội nghị I-an-ta.",
      "Hội nghị Xan Phran-xi-xcô.",
      "Hội nghị Á – Phi Băng-đung."
    ],
    "correct": 2,
    "points": 0.25,
    "explanation": "Hội nghị Xan Phran-xi-xcô (Mỹ, 25-4 đến 26-6-1945) với đại biểu 50 nước đã thảo luận và thông qua bản Hiến chương Liên hợp quốc. [Nhiễu]: B (I-an-ta) chỉ quyết định thành lập và triệu tập hội nghị. A (Pốt-xđam) bàn về nước Đức. D (Băng-đung 1955) ngoài bài.",
    "type": "mcq"
  },
  {
    "prompt": "Năm 1948, Đại hội đồng Liên hợp quốc thông qua văn kiện nào sau đây, đưa ra những quyền và tự do cơ bản của con người?",
    "options": [
      "Tuyên ngôn Nhân quyền của Liên hợp quốc.",
      "Hiệp ước cấm phổ biến vũ khí hạt nhân.",
      "Công ước cấm vũ khí hóa học.",
      "Mục tiêu phát triển Thiên niên kỉ."
    ],
    "correct": 0,
    "points": 0.25,
    "explanation": "Năm 1948, Đại hội đồng Liên hợp quốc đã thông qua Tuyên ngôn Nhân quyền thế giới (UDHR). [Nhiễu]: B (1968), C (1992) thuộc giải trừ quân bị. D (2000) là chương trình phát triển.",
    "type": "mcq"
  },
  {
    "prompt": "Từ ngày 28 – 11 đến ngày 1 – 12 – 1943, hội nghị nào sau đây đã khẳng định quyết tâm thành lập Liên hợp quốc của ba nước Liên Xô, Mỹ, Anh?",
    "options": [
      "Hội nghị I-an-ta.",
      "Hội nghị Gio-ne-vơ.",
      "Hội nghị Véc-xai – Oa-sinh-tơn.",
      "Hội nghị Tê-hê-ran."
    ],
    "correct": 3,
    "points": 0.25,
    "explanation": "Hội nghị Tê-hê-ran (I-ran, từ 28-11 đến 1-12-1943) là nơi ba cường quốc Liên Xô, Mỹ, Anh khẳng định quyết tâm thành lập Liên hợp quốc. [Nhiễu]: A (I-an-ta) diễn ra vào tháng 2-1945. B và C thuộc bối cảnh khác.",
    "type": "mcq"
  },
  {
    "prompt": "Ngày 24 – 10 – 1945, tổ chức quốc tế nào sau đây chính thức được thành lập với 51 nước thành viên?",
    "options": [
      "Hội Quốc liên.",
      "Liên hợp quốc.",
      "Liên minh châu Âu.",
      "Tổ chức Hiệp ước Bắc Đại Tây Dương."
    ],
    "correct": 1,
    "points": 0.25,
    "explanation": "Ngày 24-10-1945, Hiến chương chính thức có hiệu lực sau khi được các nước phê chuẩn, Liên hợp quốc chính thức thành lập với 51 thành viên sáng lập (Ba Lan ký bổ sung). [Nhiễu]: A (Hội Quốc liên 1920-1946). C (EU) và D (NATO) thuộc các thời kỳ khác.",
    "type": "mcq"
  },
  {
    "prompt": "Năm 2015, Liên hợp quốc thông qua văn kiện nào sau đây, đặt ra 17 mục tiêu mang tính toàn cầu đến năm 2030?",
    "options": [
      "Hiệp ước cấm phổ biến vũ khí hạt nhân.",
      "Tuyên ngôn Nhân quyền của Liên hợp quốc.",
      "Chương trình nghị sự vì phát triển bền vững.",
      "Công ước cấm vũ khí hạt nhân."
    ],
    "correct": 2,
    "points": 0.25,
    "explanation": "Năm 2015, Liên hợp quốc thông qua Chương trình nghị sự 2030 vì sự phát triển bền vững với 17 mục tiêu toàn cầu (SDGs). [Nhiễu]: A (1968), B (1948), D (2017) khác năm và khác lĩnh vực.",
    "type": "mcq"
  },
  {
    "prompt": "Liên hợp quốc có hoạt động nào sau đây nhằm duy trì hòa bình, an ninh quốc tế?",
    "options": [
      "Triển khai hoạt động gìn giữ hòa bình ở nhiều khu vực.",
      "Điều hành trực tiếp công việc quản lý nội bộ các nước.",
      "Thành lập liên minh quân sự phòng thủ toàn cầu.",
      "Xây dựng thể chế chính trị chung cho các thành viên."
    ],
    "correct": 0,
    "points": 0.25,
    "explanation": "Liên hợp quốc triển khai hoạt động gìn giữ hòa bình ở En Xan-va-đo, Goa-tê-ma-la, Mô-dăm-bích, Nam Xu-đăng,... [Nhiễu]: B và D vi phạm nguyên tắc chủ quyền và không can thiệp nội bộ. C gán bản chất liên minh quân sự.",
    "type": "mcq"
  },
  {
    "prompt": "Nội dung nào sau đây không phải là nguyên tắc hoạt động của Liên hợp quốc?",
    "options": [
      "Bình đẳng về chủ quyền giữa các quốc gia.",
      "Không can thiệp vào công việc nội bộ các nước.",
      "Giải quyết tranh chấp quốc tế bằng biện pháp hòa bình.",
      "Sử dụng vũ lực để giải quyết tranh chấp quốc tế."
    ],
    "correct": 3,
    "points": 0.25,
    "explanation": "Điều 2 Hiến chương quy định từ bỏ đe dọa hoặc sử dụng vũ lực trong quan hệ quốc tế, nên phương án D trái với nguyên tắc cơ bản của Liên hợp quốc. [Nhiễu]: A, B, C đều là các nguyên tắc cốt lõi.",
    "type": "mcq"
  },
  {
    "prompt": "Liên hợp quốc có hoạt động nào sau đây nhằm thúc đẩy phát triển kinh tế, thương mại quốc tế?",
    "options": [
      "Trực tiếp điều hành hoạt động thương mại của các nước thành viên.",
      "Thống nhất đồng tiền chung cho tất cả các quốc gia thành viên.",
      "Đề ra chiến lược phát triển cho từng thập kỉ từ năm 1960.",
      "Thành lập khu vực thương mại tự do trên phạm vi toàn cầu."
    ],
    "correct": 2,
    "points": 0.25,
    "explanation": "Từ năm 1960, Đại hội đồng Liên hợp quốc đã đề ra các chiến lược phát triển kinh tế - xã hội cho từng thập kỉ nhằm huy động hợp tác quốc tế. [Nhiễu]: A bóp méo vai trò điều hòa. B và D là mô hình liên kết khu vực, không phải của Liên hợp quốc.",
    "type": "mcq"
  },
  {
    "prompt": "Liên hợp quốc không có hoạt động nào sau đây trong lĩnh vực đảm bảo quyền con người, phát triển văn hóa, xã hội?",
    "options": [
      "Thông qua Tuyên ngôn Nhân quyền vào năm 1948.",
      "Trực tiếp điều hành hệ thống giáo dục của các nước.",
      "Lập quỹ tài trợ quốc tế để phát triển giáo dục.",
      "Công nhận và hỗ trợ bảo tồn di sản văn hóa thế giới."
    ],
    "correct": 1,
    "points": 0.25,
    "explanation": "Liên hợp quốc hỗ trợ, tài trợ giáo dục (thông qua UNESCO, UNICEF) chứ không can thiệp hay trực tiếp điều hành hệ thống giáo dục của các quốc gia. [Nhiễu]: A (UDHR 1948), C (quỹ tài trợ giáo dục), D (di sản UNESCO) đều là hoạt động có thật.",
    "type": "mcq"
  },
  {
    "prompt": "Liên hợp quốc ra đời trong bối cảnh nào sau đây?",
    "options": [
      "Chiến tranh lạnh bùng nổ, hai phe đối đầu căng thẳng về quân sự.",
      "Phe phát xít chiếm ưu thế, việc thành lập tổ chức mới bị trì hoãn.",
      "Phe Đồng minh chiếm ưu thế, việc tổ chức lại thế giới càng cấp bách.",
      "Hệ thống thuộc địa sụp đổ hoàn toàn, nhiều quốc gia mới đòi hỏi tổ chức chung."
    ],
    "correct": 2,
    "points": 0.25,
    "explanation": "Đầu năm 1945, Chiến tranh thế giới thứ hai bước vào giai đoạn kết thúc, phe Đồng minh chiếm ưu thế áp đảo nên việc tổ chức lại thế giới sau chiến tranh trở nên hết sức cấp bách. [Nhiễu]: A lệch thời kỳ (sau 1947). B đảo ngược tương quan. D phóng đại thuộc địa sụp đổ hoàn toàn.",
    "type": "mcq"
  },
  {
    "prompt": "Nội dung nào sau đây là nguyên nhân thúc đẩy các nước Đồng minh chống phát xít mong muốn thành lập Liên hợp quốc?",
    "options": [
      "Hội Quốc liên không đủ sức mạnh để bảo vệ hòa bình thế giới.",
      "Các nước phát xít đã bị đánh bại hoàn toàn trên mọi mặt trận.",
      "Chiến tranh lạnh đã bùng nổ, chia thế giới thành hai phe.",
      "Các nước thuộc địa đồng loạt giành độc lập trên phạm vi toàn cầu."
    ],
    "correct": 0,
    "points": 0.25,
    "explanation": "Sự bất lực và sụp đổ của Hội Quốc liên (không ngăn chặn được CTTG II) là nguyên nhân thúc đẩy các nước Đồng minh mong muốn thành lập một tổ chức quốc tế mới đủ năng lực và cơ chế bảo vệ hòa bình bền vững. [Nhiễu]: B, C, D đều lệch pha hoặc phóng đại.",
    "type": "mcq"
  },
  {
    "prompt": "Nội dung nào sau đây là thành tựu của Liên hợp quốc trong lĩnh vực duy trì hòa bình, an ninh quốc tế?",
    "options": [
      "Chấm dứt hoàn toàn mọi cuộc xung đột vũ trang trên thế giới.",
      "Xóa bỏ triệt để các loại vũ khí hủy diệt hàng loạt.",
      "Giải quyết ngay lập tức mọi tranh chấp giữa các quốc gia.",
      "Góp phần ngăn ngừa không để xảy ra chiến tranh thế giới mới."
    ],
    "correct": 3,
    "points": 0.25,
    "explanation": "Thành tựu nổi bật và trước hết của Liên hợp quốc từ năm 1945 đến nay là góp phần ngăn ngừa, không để bùng nổ một cuộc chiến tranh thế giới mới giữa các siêu cường. [Nhiễu]: A, B, C dùng các từ tuyệt đối hóa sai thực tế.",
    "type": "mcq"
  },
  {
    "prompt": "Việc Liên hợp quốc triển khai hoạt động gìn giữ hòa bình ở nhiều khu vực đã",
    "options": [
      "ngăn chặn hoàn toàn mọi cuộc chiến tranh cục bộ trên thế giới.",
      "góp phần chấm dứt nhiều xung đột và hỗ trợ tái thiết ở nhiều quốc gia.",
      "xóa bỏ triệt để nguy cơ xung đột tại tất cả các khu vực.",
      "buộc ngay lập tức mọi lực lượng vũ trang phải giải giáp."
    ],
    "correct": 1,
    "points": 0.25,
    "explanation": "Hoạt động gìn giữ hòa bình (gửi phái bộ gìn giữ hòa bình) đã góp phần chấm dứt nhiều cuộc xung đột vũ trang, giám sát ngừng bắn và hỗ trợ tái thiết sau chiến tranh ở nhiều quốc gia. [Nhiễu]: A, C, D phóng đại tuyệt đối.",
    "type": "mcq"
  },
  {
    "prompt": "Việc Liên hợp quốc thúc đẩy quá trình giành độc lập dân tộc của các nước thuộc địa và phụ thuộc đã",
    "options": [
      "góp phần làm gia tăng số lượng thành viên của Liên hợp quốc.",
      "chấm dứt hoàn toàn mọi hình thức thống trị của chủ nghĩa thực dân.",
      "xóa bỏ mọi sự bất bình đẳng giữa các quốc gia thành viên.",
      "giúp các nước mới độc lập thoát khỏi đói nghèo ngay lập tức."
    ],
    "correct": 0,
    "points": 0.25,
    "explanation": "Quá trình phi thực dân hóa mạnh mẽ được Liên hợp quốc ủng hộ đã giúp hàng trăm quốc gia giành độc lập và gia nhập tổ chức, nâng tổng số thành viên từ 51 lên 193 nước. [Nhiễu]: B, C, D phóng đại hoặc đánh tráo kết quả kinh tế.",
    "type": "mcq"
  },
  {
    "prompt": "Nội dung nào sau đây là thành tựu của Liên hợp quốc trong việc nâng cao đời sống người dân?",
    "options": [
      "Xóa bỏ hoàn toàn tình trạng đói nghèo ở các nước đang phát triển.",
      "Điều hòa ngay lập tức sự chênh lệch giàu nghèo giữa các nước.",
      "Thực hiện nhiều dự án hỗ trợ xóa đói, giảm nghèo ở các nước đang phát triển.",
      "Thay thế mọi chính sách kinh tế của các chính phủ thành viên."
    ],
    "correct": 2,
    "points": 0.25,
    "explanation": "Thông qua các tổ chức chuyên môn (FAO, UNDP, WB, IMF), Liên hợp quốc triển khai hàng nghìn dự án hỗ trợ phát triển, xóa đói giảm nghèo tại các nước đang phát triển. [Nhiễu]: A, B cài tuyệt đối hóa; D vi phạm chủ quyền quốc gia.",
    "type": "mcq"
  },
  {
    "prompt": "Mục tiêu của Liên hợp quốc có đặc điểm nào sau đây?",
    "options": [
      "Đặt phát triển kinh tế lên trên mục tiêu duy trì hòa bình, an ninh.",
      "Lấy duy trì hòa bình, an ninh quốc tế làm cơ sở cho các mục tiêu khác.",
      "Tách biệt hoàn toàn mục tiêu chính trị với các mục tiêu xã hội.",
      "Ưu tiên tuyệt đối lợi ích của các nước thành viên thường trực."
    ],
    "correct": 1,
    "points": 0.25,
    "explanation": "Hiến chương khẳng định mục tiêu duy trì hòa bình và an ninh quốc tế là ưu tiên hàng đầu, đồng thời là cơ sở nền tảng để thực hiện các mục tiêu hợp tác kinh tế, văn hóa, xã hội và nhân đạo. [Nhiễu]: A đảo thứ tự ưu tiên. C và D sai bản chất tổ chức.",
    "type": "mcq"
  },
  {
    "prompt": "Nhận định nào sau đây đúng về vai trò của Liên hợp quốc từ năm 1945 đến nay?",
    "options": [
      "Giới hạn hoạt động trong lĩnh vực an ninh, quân sự giữa các nước lớn.",
      "Thay thế vai trò quản lý của chính phủ các quốc gia thành viên.",
      "Nhanh chóng xây dựng thể chế chính trị thống nhất toàn thế giới.",
      "Mở rộng hoạt động từ duy trì hòa bình sang phát triển, quyền con người."
    ],
    "correct": 3,
    "points": 0.25,
    "explanation": "Qua hơn 7 thập kỷ, vai trò của Liên hợp quốc không ngừng mở rộng: từ trọng tâm duy trì hòa bình, an ninh ban đầu sang các lĩnh vực toàn cầu như phát triển bền vững, ứng phó biến đổi khí hậu, quyền con người và y tế giáo dục. [Nhiễu]: A thu hẹp. B, C bóp méo quyền hạn.",
    "type": "mcq"
  },
  {
    "prompt": "Nội dung nào sau đây phản ánh đúng về nguyên tắc hoạt động của Liên hợp quốc?",
    "options": [
      "Cho phép các nước lớn quyết định công việc nội bộ của nước nhỏ.",
      "Dựa trên sức mạnh quân sự của các thành viên thường trực.",
      "Đặt trên cơ sở tôn trọng chủ quyền và độc lập chính trị của mọi quốc gia.",
      "Lấy việc thành lập liên minh quân sự làm cơ sở hoạt động."
    ],
    "correct": 2,
    "points": 0.25,
    "explanation": "Điều 2 Hiến chương quy định các nguyên tắc: Bình đẳng về chủ quyền, tôn trọng toàn vẹn lãnh thổ và độc lập chính trị, không can thiệp nội bộ, giải quyết hòa bình các tranh chấp. [Nhiễu]: A, B, D trái với nguyên tắc Hiến chương.",
    "type": "mcq"
  },
  {
    "prompt": "Nội dung nào sau đây phản ánh đúng quá trình hình thành Liên hợp quốc?",
    "options": [
      "Diễn ra từng bước từ cam kết năm 1942 đến thông qua Hiến chương năm 1945.",
      "Hoàn tất ngay trong năm 1942 nhờ sự thống nhất của 26 nước.",
      "Khởi đầu sau Chiến tranh lạnh bằng thỏa thuận giữa các cường quốc.",
      "Được quyết định đồng thời tại một hội nghị duy nhất ở Xan Phran-xi-xcô."
    ],
    "correct": 0,
    "points": 0.25,
    "explanation": "Liên hợp quốc được hình thành qua một quá trình chuẩn bị từng bước: Tuyên bố 26 nước (1-1942), Tuyên bố Mát-xcơ-va (10-1943), Hội nghị Tê-hê-ran (12-1943), Hội nghị I-an-ta (2-1945) và hoàn tất tại Xan Phran-xi-xcô (6-1945). [Nhiễu]: B, C, D sai tiến trình lịch sử.",
    "type": "mcq"
  },
  {
    "prompt": "So với Hội Quốc liên (thành lập năm 1920), Liên hợp quốc có điểm mới nào sau đây?",
    "options": [
      "Được lập ra để duy trì trật tự sau Chiến tranh thế giới thứ nhất.",
      "Chỉ gồm các nước thắng trận trong Chiến tranh thế giới thứ hai.",
      "Chính thức giải thể năm 1946 vì không bảo vệ được hòa bình.",
      "Tồn tại và phát huy vai trò duy trì hòa bình đến ngày nay."
    ],
    "correct": 3,
    "points": 0.25,
    "explanation": "Điểm khác biệt căn bản là Hội Quốc liên đã bất lực và tan rã năm 1946, trong khi Liên hợp quốc tiếp tục tồn tại vững chắc và phát huy vai trò duy trì hòa bình, an ninh quốc tế đến ngày nay. [Nhiễu]: A, C là của Hội Quốc liên. B sai thành phần thành viên.",
    "type": "mcq"
  },
  {
    "prompt": "Hội Quốc liên và Liên hợp quốc có điểm tương đồng nào sau đây?",
    "options": [
      "Đều giải thể do không đủ sức mạnh bảo vệ hòa bình thế giới.",
      "Đều ra đời nhằm duy trì hòa bình, an ninh sau chiến tranh thế giới.",
      "Đều có số lượng thành viên lên đến 193 quốc gia hiện nay.",
      "Đều thành lập sau khi Chiến tranh lạnh đã kết thúc ở châu Âu."
    ],
    "correct": 1,
    "points": 0.25,
    "explanation": "Cả Hội Quốc liên (sau CTTG I) và Liên hợp quốc (sau CTTG II) đều ra đời từ sáng kiến của các cường quốc với mục tiêu chung là duy trì hòa bình và an ninh quốc tế sau thảm họa chiến tranh thế giới. [Nhiễu]: A, C, D đều chỉ đúng với một bên hoặc sai thời kỳ.",
    "type": "mcq"
  },
  {
    "prompt": "Hoạt động của Liên hợp quốc đã để lại bài học kinh nghiệm nào sau đây cho Việt Nam trong hợp tác quốc tế hiện nay?",
    "options": [
      "Tham gia các liên minh quân sự phòng thủ để bảo đảm an ninh quốc gia.",
      "Giải quyết triệt để lợi ích của tất cả các nước tham gia tổ chức.",
      "Ưu tiên sử dụng sức mạnh quân sự để bảo vệ chủ quyền lãnh thổ.",
      "Đề cao hợp tác đa phương, tôn trọng luật pháp quốc tế, giải quyết tranh chấp hòa bình."
    ],
    "correct": 3,
    "points": 0.25,
    "explanation": "Nguyên tắc tôn trọng luật pháp quốc tế, giải quyết hòa bình các tranh chấp và tăng cường hợp tác đa phương là bài học sâu sắc, đồng thời là kim chỉ nam cho đường lối đối ngoại độc lập, tự chủ và hội nhập quốc tế của Việt Nam. [Nhiễu]: A, C trái với chính sách quốc phòng \"4 không\" của Việt Nam.",
    "type": "mcq"
  },
  {
    "prompt": "Việc Liên hợp quốc thúc đẩy Chương trình nghị sự 2030 vì phát triển bền vững để lại bài học kinh nghiệm nào sau đây cho Việt Nam hiện nay?",
    "options": [
      "Chủ động hợp tác quốc tế, gắn tăng trưởng kinh tế với bảo vệ môi trường.",
      "Tách biệt hoàn toàn phát triển kinh tế khỏi các mục tiêu xã hội.",
      "Dựa hoàn toàn vào viện trợ quốc tế để xóa đói, giảm nghèo.",
      "Ưu tiên khai thác tài nguyên để đạt tăng trưởng nhanh trước mắt."
    ],
    "correct": 0,
    "points": 0.25,
    "explanation": "Chương trình nghị sự 2030 nhấn mạnh sự kết hợp hài hòa giữa tăng trưởng kinh tế, tiến bộ xã hội và bảo vệ môi trường, mang lại bài học quý giá cho chiến lược phát triển bền vững, kinh tế xanh và chuyển đổi số của Việt Nam. [Nhiễu]: B, C, D đi ngược nguyên lý phát triển bền vững.",
    "type": "mcq"
  }
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
      explanation: q.explanation,
    });
    await dataApi.upsert(
      'answer_keys',
      { question_id: createdQ.id, correct: q.correct, explanation: q.explanation },
      'question_id',
    );
  }

  // 2 CÂU ĐÚNG / SAI PHẦN II (2.0đ / câu = 4.0đ)
  const tf2 = [
  {
    "type": "tf",
    "prompt": "Câu 1. Đọc đoạn tư liệu sau đây:\n\n\"Liên hợp quốc được thành lập nhằm bốn mục tiêu: duy trì hòa bình và an ninh quốc tế; thúc đẩy quan hệ hữu nghị giữa các dân tộc trên cơ sở tôn trọng quyền bình đẳng và quyền tự quyết dân tộc; thúc đẩy hợp tác quốc tế để giải quyết các vấn đề kinh tế, xã hội, văn hóa, nhân đạo, đảm bảo quyền con người; và đóng vai trò là trung tâm điều hòa các nỗ lực quốc tế vì những mục tiêu trên. Tổ chức này hoạt động trên các nguyên tắc: bình đẳng về chủ quyền quốc gia, từ bỏ đe dọa hoặc sử dụng vũ lực, không can thiệp vào công việc nội bộ các nước, giải quyết tranh chấp bằng biện pháp hòa bình.\"\n\n(Theo Điều 1 và Điều 2, Hiến chương Liên hợp quốc năm 1945, trích có lược bớt từ Tư liệu 1, 2 trong SGK Lịch sử 12, bộ Kết nối tri thức với cuộc sống, tr. 8 – 9)\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:",
    "options": [
      "Theo đoạn tư liệu, Hội đồng Bảo an giữ vai trò là trung tâm điều hòa các nỗ lực quốc tế, đồng thời thúc đẩy hợp tác giải quyết các vấn đề kinh tế, xã hội, văn hóa và nhân đạo.",
      "Thực tiễn hoạt động của Liên hợp quốc cho thấy tổ chức này lấy hòa bình, an ninh làm trọng tâm theo Hiến chương, đồng thời khẳng định quyền can thiệp vào công việc nội bộ các nước.",
      "Ba nước Liên Xô, Mỹ, Anh khẳng định quyết tâm thành lập Liên hợp quốc tại Hội nghị Tê-hê-ran năm 1943, rồi quyết định triệu tập hội nghị thông qua Hiến chương tại Hội nghị I-an-ta năm 1945.",
      "Trong các mục tiêu của Hiến chương, thúc đẩy hợp tác kinh tế, xã hội mới là cơ sở quyết định để thực hiện các mục tiêu khác, còn duy trì hòa bình chỉ giữ vai trò hỗ trợ."
    ],
    "correct": {
      "0": false,
      "1": false,
      "2": true,
      "3": false
    },
    "points": 2,
    "explanation": "Ý a) Sai: Tư liệu nêu rõ chủ thể là Liên hợp quốc, không phải Hội đồng Bảo an; Ý b) Sai: Vế sau trái nguyên tắc \"không can thiệp vào công việc nội bộ các nước\"; Ý c) Đúng: Tê-hê-ran (1943) khẳng định quyết tâm, I-an-ta (1945) quyết định triệu tập hội nghị; Ý d) Sai: Duy trì hòa bình, an ninh mới là cơ sở quyết định để thực hiện các mục tiêu khác."
  },
  {
    "type": "tf",
    "prompt": "Câu 2. Cho bảng thông tin sau đây:\n\n| Thời gian | Nội dung |\n|---|---|\n| 1 – 1 – 1942 | Đại diện 26 nước chống phát xít kí bản Tuyên bố về Liên hợp quốc, cam kết thành lập tổ chức quốc tế vì hòa bình, an ninh sau chiến tranh. |\n| Tháng 2 – 1945 | Tại Hội nghị I-an-ta, Liên Xô, Mỹ, Anh quyết định thành lập Liên hợp quốc và đồng ý triệu tập hội nghị để thông qua Hiến chương. |\n| 25 – 4 đến 26 – 6 – 1945 | Hội nghị Xan Phran-xi-xcô với đại biểu 50 nước thông qua bản Hiến chương Liên hợp quốc. |\n| 24 – 10 – 1945 | Liên hợp quốc chính thức được thành lập với 51 nước thành viên. |\n| 1948 | Đại hội đồng Liên hợp quốc thông qua Tuyên ngôn Nhân quyền. |\n| 2015 | Liên hợp quốc thông qua Chương trình nghị sự 2030 vì sự phát triển bền vững, đặt ra 17 mục tiêu toàn cầu. |\n\n(Nguồn: tổng hợp từ SGK Lịch sử 12, bộ Kết nối tri thức với cuộc sống, Bài 1)\n\nTrong mỗi ý a), b), c), d), thí sinh chọn đúng hoặc sai:",
    "options": [
      "Quá trình từ Tuyên bố năm 1942 đến Hiến chương năm 1945 phản ánh mối quan hệ giữa nhu cầu bảo vệ hòa bình sau chiến tranh với sự thống nhất hành động của các nước chống phát xít.",
      "Theo bảng thông tin, Hội nghị I-an-ta tháng 2-1945 của ba nước Liên Xô, Mỹ, Anh đã thông qua Hiến chương, qua đó hoàn thành toàn bộ quá trình thành lập Liên hợp quốc.",
      "Do Hội Quốc liên không đủ sức mạnh bảo vệ hòa bình, các nước Đồng minh chống phát xít mong muốn lập tổ chức mới, nên Tuyên bố năm 1942 là cam kết chính trị ban đầu.",
      "Năm 2015, Chương trình nghị sự 2030 khởi đầu cho việc Liên hợp quốc huy động hợp tác quốc tế vì các mục tiêu phát triển chung, đồng thời đặt ra 17 mục tiêu mang tính toàn cầu."
    ],
    "correct": {
      "0": true,
      "1": false,
      "2": true,
      "3": false
    },
    "points": 2,
    "explanation": "Ý a) Đúng: Quá trình 1942–1945 phản ánh nhu cầu hòa bình và sự thống nhất của phe chống phát xít; Ý b) Sai: I-an-ta chỉ quyết định thành lập và triệu tập, việc thông qua Hiến chương thuộc về Hội nghị Xan Phran-xi-xcô; Ý c) Đúng: Hội Quốc liên thất bại nên Tuyên bố 1942 là cam kết ban đầu lập tổ chức mới; Ý d) Sai: Từ năm 1960 đã có chiến lược phát triển từng thập kỉ, năm 2000 có Mục tiêu Thiên niên kỉ nên 2015 không phải \"khởi đầu\"."
  }
];

  for (let idx = 0; idx < tf2.length; idx++) {
    const q = tf2[idx];
    const createdQ = await dataApi.insert('questions', {
      assignment_id: a1.id,
      type: 'tf',
      prompt: q.prompt,
      options: q.options,
      points: q.points,
      position: 24 + idx + 1,
      explanation: q.explanation,
    });
    await dataApi.upsert(
      'answer_keys',
      { question_id: createdQ.id, correct: q.correct, explanation: q.explanation },
      'question_id',
    );
  }
}
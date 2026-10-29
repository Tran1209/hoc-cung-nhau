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
    icon: '🏛️',
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
    icon: '⚔️',
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
    icon: '🎖️',
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
        const lTitle = c.lessons[lIdx];
        const existingLs = await dataApi.list('lessons', { where: { chapter_id: ch.id, title: lTitle } });
        if (!existingLs?.length) {
          await dataApi.insert('lessons', {
            chapter_id: ch.id,
            title: lTitle,
            content: '',
            position: lIdx + 1,
          });
        }
      }
    }
  }
  return count;
}

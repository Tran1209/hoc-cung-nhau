-- =====================================================================
-- NẠP SẴN CHƯƠNG TRÌNH LỊCH SỬ 10, 11, 12 (BỘ KẾT NỐI TRI THỨC VỚI CUỘC SỐNG)
-- Chạy trong Supabase Dashboard > SQL Editor sau khi đã chạy 0001_init.sql
-- =====================================================================

do $$
declare
  v_sub10 uuid;
  v_sub11 uuid;
  v_sub12 uuid;
  v_ch uuid;
begin

  -- ==========================================
  -- 1. LỊCH SỬ 10
  -- ==========================================
  insert into public.subjects (title, icon, color, description, position)
  values ('Lịch Sử 10', '🏛️', '#3b82f6', 'Bộ Kết nối tri thức — Khái quát Sử học và các nền văn minh thế giới, Đông Nam Á, Việt Nam', 1)
  returning id into v_sub10;

  -- Chủ đề 1
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 1: Lịch sử và Sử học', 'Hiện thực lịch sử và nhận thức lịch sử, tri thức lịch sử và cuộc sống', 1) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 1: Hiện thực lịch sử và nhận thức lịch sử', 1),
    (v_ch, 'Bài 2: Tri thức lịch sử và cuộc sống', 2);

  -- Chủ đề 2
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 2: Vai trò của Sử học', 'Sử học với các lĩnh vực khoa học và ngành nghề hiện đại', 2) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 3: Sử học với các lĩnh vực khoa học', 1),
    (v_ch, 'Bài 4: Sử học với một số lĩnh vực, ngành nghề hiện đại', 2);

  -- Chủ đề 3
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 3: Một số nền văn minh thế giới thời kì cổ – trung đại', 'Văn minh phương Đông và phương Tây thời kì cổ – trung đại', 3) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 5: Khái niệm văn minh. Một số nền văn minh phương Đông thời kì cổ – trung đại', 1),
    (v_ch, 'Bài 6: Một số nền văn minh phương Tây thời kì cổ – trung đại', 2);

  -- Chủ đề 4
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 4: Các cuộc cách mạng công nghiệp trong lịch sử thế giới', 'Cách mạng công nghiệp cận đại và hiện đại', 4) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 7: Các cuộc cách mạng công nghiệp thời kì cận đại', 1),
    (v_ch, 'Bài 8: Các cuộc cách mạng công nghiệp thời kì hiện đại', 2);

  -- Chủ đề 5
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 5: Văn minh Đông Nam Á', 'Cơ sở hình thành, phát triển và thành tựu văn minh Đông Nam Á thời kì cổ – trung đại', 5) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 9: Cơ sở hình thành văn minh Đông Nam Á thời kì cổ – trung đại', 1),
    (v_ch, 'Bài 10: Hành trình phát triển và thành tựu của văn minh Đông Nam Á (thời kì cổ – trung đại)', 2);

  -- Chủ đề 6
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 6: Một số nền văn minh trên đất nước Việt Nam (trước năm 1858)', 'Các nền văn minh cổ và Văn minh Đại Việt', 6) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 11: Một số nền văn minh cổ trên đất nước Việt Nam', 1),
    (v_ch, 'Bài 12: Văn minh Đại Việt', 2);

  -- Chủ đề 7
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub10, 'Chủ đề 7: Cộng đồng các dân tộc Việt Nam', 'Đời sống vật chất, tinh thần và khối đại đoàn kết dân tộc trong lịch sử Việt Nam', 7) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 13: Đời sống vật chất và tinh thần của cộng đồng các dân tộc Việt Nam', 1),
    (v_ch, 'Bài 14: Khối đại đoàn kết dân tộc trong lịch sử Việt Nam', 2);


  -- ==========================================
  -- 2. LỊCH SỬ 11
  -- ==========================================
  insert into public.subjects (title, icon, color, description, position)
  values ('Lịch Sử 11', '⚔️', '#8b5cf6', 'Bộ Kết nối tri thức — Cách mạng tư sản, CNXH, Độc lập ĐNÁ, Chiến tranh bảo vệ Tổ quốc, Cải cách và Biển Đông', 2)
  returning id into v_sub11;

  -- Chủ đề 1
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub11, 'Chủ đề 1: Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản', 'Một số vấn đề chung về cách mạng tư sản, sự xác lập và phát triển của CNTB', 1) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 1: Một số vấn đề chung về cách mạng tư sản', 1),
    (v_ch, 'Bài 2: Sự xác lập và phát triển của chủ nghĩa tư bản', 2);

  -- Chủ đề 2
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub11, 'Chủ đề 2: Chủ nghĩa xã hội từ năm 1917 đến nay', 'Sự hình thành Liên bang Xô Viết và sự phát triển của CNXH sau CTTG II', 2) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 3: Sự hình thành Liên bang Cộng hoà xã hội chủ nghĩa Xô Viết', 1),
    (v_ch, 'Bài 4: Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai đến nay', 2);

  -- Chủ đề 3
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub11, 'Chủ đề 3: Quá trình giành độc lập dân tộc của các quốc gia Đông Nam Á', 'Sự xâm lược của chủ nghĩa thực dân và hành trình độc lập ĐNÁ', 3) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 5: Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á', 1),
    (v_ch, 'Bài 6: Hành trình đi đến độc lập dân tộc ở Đông Nam Á', 2);

  -- Chủ đề 4
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub11, 'Chủ đề 4: Chiến tranh bảo vệ Tổ quốc và giải phóng dân tộc (trước 1945)', 'Khái quát chiến tranh bảo vệ Tổ quốc và một số cuộc khởi nghĩa lớn', 4) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 7: Khái quát về chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam', 1),
    (v_ch, 'Bài 8: Một số cuộc khởi nghĩa và chiến tranh giải phóng trong lịch sử Việt Nam', 2);

  -- Chủ đề 5
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub11, 'Chủ đề 5: Một số cuộc cải cách lớn trong lịch sử Việt Nam (trước 1858)', 'Cải cách của Hồ Quý Ly, Lê Thánh Tông và Minh Mạng', 5) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 9: Cuộc cải cách của Hồ Quý Ly và Triều Hồ (đầu thế kỉ XV)', 1),
    (v_ch, 'Bài 10: Cuộc cải cách của Lê Thánh Tông (thế kỉ XV)', 2),
    (v_ch, 'Bài 11: Cuộc cải cách của Minh Mạng (nửa đầu thế kỉ XIX)', 3);

  -- Chủ đề 6
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub11, 'Chủ đề 6: Lịch sử bảo vệ chủ quyền và lợi ích của Việt Nam ở Biển Đông', 'Vị trí, tầm quan trọng của Biển Đông và chủ quyền Việt Nam', 6) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 12: Vị trí và tầm quan trọng của Biển Đông', 1),
    (v_ch, 'Bài 13: Việt Nam và Biển Đông', 2);


  -- ==========================================
  -- 3. LỊCH SỬ 12
  -- ==========================================
  insert into public.subjects (title, icon, color, description, position)
  values ('Lịch Sử 12', '🎖️', '#ec4899', 'Bộ Kết nối tri thức — Trật tự thế giới, ASEAN, Kháng chiến 1945-nay, Đổi mới 1986, Đối ngoại và Hồ Chí Minh', 3)
  returning id into v_sub12;

  -- Chủ đề 1
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub12, 'Chủ đề 1: Thế giới trong và sau Chiến tranh lạnh', 'Liên hợp quốc, Trật tự thế giới trong và sau Chiến tranh lạnh', 1) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 1: Liên hợp quốc', 1),
    (v_ch, 'Bài 2: Trật tự thế giới trong Chiến tranh lạnh', 2),
    (v_ch, 'Bài 3: Trật tự thế giới sau Chiến tranh lạnh', 3);

  -- Chủ đề 2
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub12, 'Chủ đề 2: ASEAN: Những chặng đường lịch sử', 'Sự ra đời, phát triển của ASEAN và Cộng đồng ASEAN', 2) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 4: Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN)', 1),
    (v_ch, 'Bài 5: Cộng đồng ASEAN: Từ ý tưởng đến hiện thực', 2);

  -- Chủ đề 3
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub12, 'Chủ đề 3: Cách mạng tháng Tám 1945, Kháng chiến giải phóng và bảo vệ Tổ quốc (1945 – nay)', 'Cách mạng tháng Tám, kháng chiến chống Pháp, Mỹ và bảo vệ Tổ quốc', 3) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 6: Cách mạng tháng Tám năm 1945', 1),
    (v_ch, 'Bài 7: Cuộc kháng chiến chống thực dân Pháp (1945 – 1954)', 2),
    (v_ch, 'Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)', 3),
    (v_ch, 'Bài 9: Cuộc đấu tranh bảo vệ Tổ quốc từ sau tháng 4 – 1975 đến nay. Một số bài học lịch sử', 4);

  -- Chủ đề 4
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub12, 'Chủ đề 4: Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay', 'Khái quát, thành tựu cơ bản và bài học của công cuộc Đổi mới', 4) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 10: Khái quát về công cuộc Đổi mới từ năm 1986 đến nay', 1),
    (v_ch, 'Bài 11: Thành tựu cơ bản và bài học của công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay', 2);

  -- Chủ đề 5
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub12, 'Chủ đề 5: Lịch sử đối ngoại của Việt Nam thời cận – hiện đại', 'Hoạt động đối ngoại qua các thời kì lịch sử', 5) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 12: Hoạt động đối ngoại của Việt Nam trong đấu tranh giành độc lập dân tộc (từ đầu thế kỉ XX đến CMT8 1945)', 1),
    (v_ch, 'Bài 13: Hoạt động đối ngoại của Việt Nam trong kháng chiến chống Pháp (1945 – 1954) và chống Mỹ (1954 – 1975)', 2),
    (v_ch, 'Bài 14: Hoạt động đối ngoại của Việt Nam từ năm 1975 đến nay', 3);

  -- Chủ đề 6
  insert into public.chapters (subject_id, title, description, position)
  values (v_sub12, 'Chủ đề 6: Hồ Chí Minh trong lịch sử Việt Nam', 'Cuộc đời sự nghiệp, anh hùng giải phóng dân tộc và dấu ấn của Người', 6) returning id into v_ch;
  insert into public.lessons (chapter_id, title, position) values
    (v_ch, 'Bài 15: Khái quát cuộc đời và sự nghiệp của Hồ Chí Minh', 1),
    (v_ch, 'Bài 16: Hồ Chí Minh – Anh hùng giải phóng dân tộc', 2),
    (v_ch, 'Bài 17: Dấu ấn Hồ Chí Minh trong lòng nhân dân thế giới và Việt Nam', 3);

end $$;

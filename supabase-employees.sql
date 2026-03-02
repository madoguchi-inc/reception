-- 既存のサンプル社員を削除（来客記録がある場合はFK解除）
UPDATE "Visit" SET "employeeId" = NULL WHERE "employeeId" IN ('emp-002', 'emp-003');
DELETE FROM "Employee" WHERE "id" IN ('emp-002', 'emp-003');

-- 安岡さんの所属を更新
UPDATE "Employee" SET "department" = '役員', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'emp-001';

-- 全社員を登録
INSERT INTO "Employee" ("id", "name", "email", "department", "position", "isActive", "sortOrder", "updatedAt") VALUES
  ('emp-004', '福士 雅也', 'fukushi@madoguchi.inc', '役員', NULL, true, 2, CURRENT_TIMESTAMP),
  ('emp-005', '近藤 亜海', 'kondo@madoguchi.inc', '総務', NULL, true, 3, CURRENT_TIMESTAMP),
  ('emp-006', '小原 匡人', 'ohara@madoguchi.inc', '不用品', NULL, true, 4, CURRENT_TIMESTAMP),
  ('emp-007', '紙谷 将央', 'kamiya@madoguchi.inc', '開発', NULL, true, 5, CURRENT_TIMESTAMP),
  ('emp-008', '佐々木 雄太', 'sasaki@madoguchi.inc', '総務', NULL, true, 6, CURRENT_TIMESTAMP),
  ('emp-009', '浮田 南', 'ukita@madoguchi.inc', '総務', NULL, true, 7, CURRENT_TIMESTAMP),
  ('emp-010', '清水 駿佑', 'shimizu@madoguchi.inc', '外壁', NULL, true, 8, CURRENT_TIMESTAMP),
  ('emp-011', '小野 悠祐', 'ono@madoguchi.inc', 'おそうじ', NULL, true, 9, CURRENT_TIMESTAMP),
  ('emp-012', '安積 伸顕', 'azumi@madoguchi.inc', '開発', NULL, true, 10, CURRENT_TIMESTAMP),
  ('emp-013', '恩田 雅史', 'onda@madoguchi.inc', '外壁', NULL, true, 11, CURRENT_TIMESTAMP),
  ('emp-014', '渡邊 りさ', 'watanabe@madoguchi.inc', '人事', NULL, true, 12, CURRENT_TIMESTAMP),
  ('emp-015', '留木 涼花', 'tomeki@madoguchi.inc', '総務', NULL, true, 13, CURRENT_TIMESTAMP),
  ('emp-016', '竹下 謙真', 'takeshita@madoguchi.inc', '不用品', NULL, true, 14, CURRENT_TIMESTAMP),
  ('emp-017', '山田 一輝', 'yamada@madoguchi.inc', 'おそうじ', NULL, true, 15, CURRENT_TIMESTAMP),
  ('emp-018', '佐藤 ひかる', 'sato@madoguchi.inc', 'マーケティング', NULL, true, 16, CURRENT_TIMESTAMP),
  ('emp-019', '今井 遥', 'imai@madoguchi.inc', '外壁', NULL, true, 17, CURRENT_TIMESTAMP),
  ('emp-020', '植杉 達樹', 'uesugi@madoguchi.inc', '不用品', NULL, true, 18, CURRENT_TIMESTAMP),
  ('emp-021', '鈴木 貫正', 'suzuki.k@madoguchi.inc', 'ブランド', NULL, true, 19, CURRENT_TIMESTAMP),
  ('emp-022', '田中 亜美', 'tanaka.a@madoguchi.inc', '開発', NULL, true, 20, CURRENT_TIMESTAMP),
  ('emp-023', '鈴木 翔太', 'suzuki.s@madoguchi.inc', 'ブランド', NULL, true, 21, CURRENT_TIMESTAMP),
  ('emp-024', '有井 宏之輔', 'arii@madoguchi.inc', '不用品', NULL, true, 22, CURRENT_TIMESTAMP),
  ('emp-025', '新家 恭弥', 'shinke@madoguchi.inc', '開発', NULL, true, 23, CURRENT_TIMESTAMP),
  ('emp-026', '西 涼花', 'nishi@madoguchi.inc', 'マーケティング', NULL, true, 24, CURRENT_TIMESTAMP),
  ('emp-027', '岩城 弥来', 'iwaki@madoguchi.inc', 'マーケティング', NULL, true, 25, CURRENT_TIMESTAMP),
  ('emp-028', '藤平 友一', 'fujihira@madoguchi.inc', 'おそうじ', NULL, true, 26, CURRENT_TIMESTAMP),
  ('emp-029', '森田 綾菜', 'morita@madoguchi.inc', '総務', NULL, true, 27, CURRENT_TIMESTAMP),
  ('emp-030', '伊久留 楓香', 'ikuru@madoguchi.inc', 'オヨビー', NULL, true, 28, CURRENT_TIMESTAMP),
  ('emp-031', '飯塚 来己', 'iizuka@madoguchi.inc', 'オヨビー', NULL, true, 29, CURRENT_TIMESTAMP),
  ('emp-032', '田中 弥奈', 'tanaka.m@madoguchi.inc', 'マーケティング', NULL, true, 30, CURRENT_TIMESTAMP),
  ('emp-033', '富田 凜', 'tomita@madoguchi.inc', '不用品', NULL, true, 31, CURRENT_TIMESTAMP),
  ('emp-034', '手光 菜津美', 'temitsu@madoguchi.inc', 'おそうじ', NULL, true, 32, CURRENT_TIMESTAMP),
  ('emp-035', '皆川 進太', 'minagawa@madoguchi.inc', '外壁', NULL, true, 33, CURRENT_TIMESTAMP),
  ('emp-036', '大舘 慈里', 'odate@madoguchi.inc', 'おそうじ', NULL, true, 34, CURRENT_TIMESTAMP),
  ('emp-037', '橋本 佳治', 'hashimoto@madoguchi.inc', '不用品', NULL, true, 35, CURRENT_TIMESTAMP),
  ('emp-038', '前田 優真', 'maeda@madoguchi.inc', '不用品', NULL, true, 36, CURRENT_TIMESTAMP),
  ('emp-039', '鈴木 宏午', 'suzuki.h@madoguchi.inc', '外壁', NULL, true, 37, CURRENT_TIMESTAMP),
  ('emp-040', 'アルウィス 菜々愛', 'alwis@madoguchi.inc', '開発', NULL, true, 38, CURRENT_TIMESTAMP),
  ('emp-041', '棚原 綾音', 'tanahara@madoguchi.inc', '開発', NULL, true, 39, CURRENT_TIMESTAMP),
  ('emp-042', '林崎 凌大', 'hayashizaki@madoguchi.inc', 'ブランド', NULL, true, 40, CURRENT_TIMESTAMP),
  ('emp-043', '辻本 大貴', 'tsujimoto@madoguchi.inc', '外壁', NULL, true, 41, CURRENT_TIMESTAMP),
  ('emp-044', '松本 そよ', 'matsumoto@madoguchi.inc', 'おそうじ', NULL, true, 42, CURRENT_TIMESTAMP),
  ('emp-045', '保母 瑞樹', 'hobo@madoguchi.inc', 'おそうじ', NULL, true, 43, CURRENT_TIMESTAMP),
  ('emp-046', '川井 美月', 'kawai@madoguchi.inc', '開発', NULL, true, 44, CURRENT_TIMESTAMP),
  ('emp-047', '福原 愛望', 'fukuhara@madoguchi.inc', '不用品', NULL, true, 45, CURRENT_TIMESTAMP);

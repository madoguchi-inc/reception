-- MadoReception テーブル作成SQL
-- SupabaseのSQL Editorで実行してください

-- 社員マスタ
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT '',
    "position" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE INDEX "Employee_isActive_idx" ON "Employee"("isActive");
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- 来客記録
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorCompany" TEXT,
    "purpose" TEXT NOT NULL,
    "employeeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CHECKED_IN',
    "notifiedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Visit_status_idx" ON "Visit"("status");
CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt");
CREATE INDEX "Visit_employeeId_idx" ON "Visit"("employeeId");

ALTER TABLE "Visit" ADD CONSTRAINT "Visit_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========== 初期データ投入 ==========
-- まどぐち株式会社のデフォルト組織データ

-- テスト用社員データ（後で管理画面から編集可能）
INSERT INTO "Employee" ("id", "name", "email", "department", "position", "isActive", "sortOrder", "updatedAt") VALUES
  ('emp-001', '安岡 尚和', 'yasuoka@madoguchi.inc', '代表', '代表取締役', true, 1, CURRENT_TIMESTAMP),
  ('emp-002', 'サンプル社員A', 'sample-a@madoguchi.inc', '営業部', 'マネージャー', true, 2, CURRENT_TIMESTAMP),
  ('emp-003', 'サンプル社員B', 'sample-b@madoguchi.inc', '開発部', 'エンジニア', true, 3, CURRENT_TIMESTAMP);

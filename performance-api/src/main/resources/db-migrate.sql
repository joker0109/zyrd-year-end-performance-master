-- ========================================================
-- 数据库补丁脚本（安全执行，字段已存在会忽略）
-- MySQL 8.0+ 支持 ADD COLUMN IF NOT EXISTS
-- ========================================================

-- employees 表补加 is_deleted 字段
ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0否 1是';

-- vote_sessions 表补加 is_calculated 字段
ALTER TABLE vote_sessions
    ADD COLUMN IF NOT EXISTS is_calculated TINYINT DEFAULT 0 COMMENT '是否已计算：0否 1是';

-- vote_submissions 表补加 is_submitted 字段
ALTER TABLE vote_submissions
    ADD COLUMN IF NOT EXISTS is_submitted TINYINT DEFAULT 1 COMMENT '是否已提交：0草稿 1已提交';

-- 确保有一条进行中的投票批次
INSERT IGNORE INTO vote_sessions (year, name, start_time, end_time, status, is_calculated)
VALUES (2026, '2026年度员工绩效评分', '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, 0);

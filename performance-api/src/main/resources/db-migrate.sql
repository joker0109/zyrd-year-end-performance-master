-- ========================================================
-- 数据库补丁脚本（安全执行，字段已存在会忽略）
-- MySQL 8.0+ 支持 ADD COLUMN IF NOT EXISTS
-- ========================================================

-- employees 表补加 is_deleted 字段
ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0否 1是';

-- employees 表补加 phone 字段（手机号登录，唯一）
ALTER TABLE employees
    ADD COLUMN phone VARCHAR(20) UNIQUE COMMENT '手机号（用于登录）';

-- 为现有员工补充样本手机号（已有则不更新）
UPDATE employees SET phone = '13800000001' WHERE employee_id = 'E001' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000002' WHERE employee_id = 'E002' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000003' WHERE employee_id = 'E003' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000004' WHERE employee_id = 'E004' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000005' WHERE employee_id = 'E005' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000006' WHERE employee_id = 'E006' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000007' WHERE employee_id = 'E007' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000008' WHERE employee_id = 'E008' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000009' WHERE employee_id = 'E009' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000010' WHERE employee_id = 'E010' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000011' WHERE employee_id = 'E011' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000012' WHERE employee_id = 'E012' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000013' WHERE employee_id = 'E013' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000014' WHERE employee_id = 'E014' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000015' WHERE employee_id = 'E015' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000016' WHERE employee_id = 'E016' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000017' WHERE employee_id = 'E017' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000018' WHERE employee_id = 'E018' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000019' WHERE employee_id = 'E019' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000020' WHERE employee_id = 'E020' AND (phone IS NULL OR phone = '');
UPDATE employees SET phone = '13800000021' WHERE employee_id = 'E021' AND (phone IS NULL OR phone = '');

-- vote_sessions 表补加 is_calculated 字段
ALTER TABLE vote_sessions
    ADD COLUMN IF NOT EXISTS is_calculated TINYINT DEFAULT 0 COMMENT '是否已计算：0否 1是';

-- vote_submissions 表补加 is_submitted 字段
ALTER TABLE vote_submissions
    ADD COLUMN IF NOT EXISTS is_submitted TINYINT DEFAULT 1 COMMENT '是否已提交：0草稿 1已提交';

-- 删除空的2025年度会话（没有任何投票记录的）
DELETE vs FROM vote_sessions vs
  LEFT JOIN votes v ON vs.id = v.vote_session_id
  WHERE vs.year = 2025 AND v.id IS NULL;

-- 将现有状态=1的旧年度会话改为正确的绩效年份2025（当前年份-1）
UPDATE vote_sessions
  SET year = 2025, name = '2025年度员工绩效评分',
    start_time = '2025-01-01 00:00:00', end_time = '2025-12-31 23:59:59'
  WHERE status = 1 AND year != 2025;

-- 确保有一条进行中的投票批次（绩效年份 = 当前年份-1，即2025）
INSERT IGNORE INTO vote_sessions (year, name, start_time, end_time, status, is_calculated)
VALUES (2025, '2025年度员工绩效评分', '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1, 0);

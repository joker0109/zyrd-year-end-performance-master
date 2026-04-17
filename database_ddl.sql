-- ========================================================
-- 员工年度绩效评分系统 - 数据库DDL脚本
-- 版本: v2.0
-- 创建日期: 2026-04-13
-- ========================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS performance_evaluation 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE performance_evaluation;

-- ========================================================
-- 1. 员工表 (employees)
-- ========================================================
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    employee_id VARCHAR(50) NOT NULL UNIQUE COMMENT '员工编号，如E001',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    department VARCHAR(100) NOT NULL COMMENT '部门',
    level TINYINT NOT NULL COMMENT '层级：1董事长 2经理层 3中层领导 4普通员工',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录用户名',
    password VARCHAR(100) NOT NULL COMMENT '登录密码（建议MD5加密存储）',
    position VARCHAR(100) DEFAULT NULL COMMENT '职位',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态：0离职 1在职',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_level (level),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息表';

-- 插入示例员工数据
INSERT INTO employees (employee_id, name, department, level, username, password, position, status) VALUES
-- 董事长 (层级1)
('E001', '张董事长', '总裁办', 1, 'zhang', 'e10adc3949ba59abbe56e057f20f883e', '董事长', 1),

-- 经理层 (层级2)
('E002', '王经理', '技术部', 2, 'wang', 'e10adc3949ba59abbe56e057f20f883e', '技术部经理', 1),
('E003', '李经理', '产品部', 2, 'li', 'e10adc3949ba59abbe56e057f20f883e', '产品部经理', 1),
('E004', '赵经理', '运营部', 2, 'zhao', 'e10adc3949ba59abbe56e057f20f883e', '运营部经理', 1),

-- 中层领导 (层级3)
('E005', '刘主管', '技术部', 3, 'liu', 'e10adc3949ba59abbe56e057f20f883e', '技术主管', 1),
('E006', '陈主管', '技术部', 3, 'chen', 'e10adc3949ba59abbe56e057f20f883e', '开发主管', 1),
('E007', '杨主管', '产品部', 3, 'yang', 'e10adc3949ba59abbe56e057f20f883e', '产品主管', 1),
('E008', '黄主管', '运营部', 3, 'huang', 'e10adc3949ba59abbe56e057f20f883e', '运营主管', 1),
('E009', '周主管', '市场部', 3, 'zhou', 'e10adc3949ba59abbe56e057f20f883e', '市场主管', 1),
('E010', '吴主管', '人事部', 3, 'wu', 'e10adc3949ba59abbe56e057f20f883e', '人事主管', 1),
('E021', '韩雪', '财务部', 3, 'hanxue', 'e10adc3949ba59abbe56e057f20f883e', '财务主管', 1),

-- 普通员工 (层级4)
('E011', '员工甲', '技术部', 4, 'jia', 'e10adc3949ba59abbe56e057f20f883e', '开发工程师', 1),
('E012', '员工乙', '技术部', 4, 'yi', 'e10adc3949ba59abbe56e057f20f883e', '测试工程师', 1),
('E013', '员工丙', '技术部', 4, 'bing', 'e10adc3949ba59abbe56e057f20f883e', '前端工程师', 1),
('E014', '员工丁', '产品部', 4, 'ding', 'e10adc3949ba59abbe56e057f20f883e', '产品经理', 1),
('E015', '员工戊', '产品部', 4, 'wu2', 'e10adc3949ba59abbe56e057f20f883e', '产品助理', 1),
('E016', '员工己', '运营部', 4, 'ji', 'e10adc3949ba59abbe56e057f20f883e', '运营专员', 1),
('E017', '员工庚', '运营部', 4, 'geng', 'e10adc3949ba59abbe56e057f20f883e', '数据分析师', 1),
('E018', '员工辛', '市场部', 4, 'xin', 'e10adc3949ba59abbe56e057f20f883e', '市场专员', 1),
('E019', '员工壬', '人事部', 4, 'ren', 'e10adc3949ba59abbe56e057f20f883e', 'HR专员', 1),
('E020', '员工癸', '财务部', 4, 'gui', 'e10adc3949ba59abbe56e057f20f883e', '会计', 1);

-- ========================================================
-- 2. 系统管理员配置表 (system_admins)
-- ========================================================
DROP TABLE IF EXISTS system_admins;
CREATE TABLE system_admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    employee_id VARCHAR(50) NOT NULL COMMENT '管理员员工ID',
    role VARCHAR(50) DEFAULT 'admin' COMMENT '角色：admin管理员',
    can_view_result TINYINT DEFAULT 1 COMMENT '是否可查看结果页：0否 1是',
    can_view_stats TINYINT DEFAULT 1 COMMENT '是否可查看统计页：0否 1是',
    can_view_vote_detail TINYINT DEFAULT 0 COMMENT '是否可查看投票详情：0否 1是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_employee_id (employee_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统管理员配置表';

-- 插入管理员配置
INSERT INTO system_admins (employee_id, role, can_view_result, can_view_stats, can_view_vote_detail) VALUES
('E001', 'admin', 0, 0, 0),  -- 董事长：只参与投票，不显示结果和统计页签
('E021', 'admin', 1, 1, 1);  -- 韩雪：完整管理员权限，包含投票详情查看

-- ========================================================
-- 3. 投票批次表 (vote_sessions)
-- ========================================================
DROP TABLE IF EXISTS vote_sessions;
CREATE TABLE vote_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    year INT NOT NULL COMMENT '评分年度',
    name VARCHAR(100) DEFAULT NULL COMMENT '批次名称',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    end_time TIMESTAMP DEFAULT NULL COMMENT '截止时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0未开始 1进行中 2已结束',
    is_calculated TINYINT DEFAULT 0 COMMENT '是否已计算：0否 1是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_year (year),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票批次表';

-- 插入2026年度投票批次
INSERT INTO vote_sessions (year, name, start_time, end_time, status, is_calculated) VALUES
(2026, '2026年度员工绩效评分', '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, 0);

-- ========================================================
-- 4. 投票记录表 (votes)
-- ========================================================
DROP TABLE IF EXISTS votes;
CREATE TABLE votes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    vote_session_id BIGINT NOT NULL COMMENT '投票批次ID',
    voter_id VARCHAR(50) NOT NULL COMMENT '投票人ID',
    voter_level TINYINT NOT NULL COMMENT '投票人层级',
    target_id VARCHAR(50) NOT NULL COMMENT '被评人ID',
    target_level TINYINT NOT NULL COMMENT '被评人层级',
    grade ENUM('A','B','C','D') NOT NULL COMMENT '评分等级：A优秀 B良好 C合格 D不合格',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_vote_session_voter_target (vote_session_id, voter_id, target_id),
    INDEX idx_voter (voter_id),
    INDEX idx_target (target_id),
    INDEX idx_vote_session (vote_session_id),
    FOREIGN KEY (vote_session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票记录表';

-- 插入示例投票数据
INSERT INTO votes (vote_session_id, voter_id, voter_level, target_id, target_level, grade) VALUES
-- 董事长投票
(1, 'E001', 1, 'E002', 2, 'A'), (1, 'E001', 1, 'E003', 2, 'B'), (1, 'E001', 1, 'E004', 2, 'B'),
(1, 'E001', 1, 'E005', 3, 'A'), (1, 'E001', 1, 'E006', 3, 'B'), (1, 'E001', 1, 'E007', 3, 'A'),
(1, 'E001', 1, 'E008', 3, 'B'), (1, 'E001', 1, 'E009', 3, 'B'), (1, 'E001', 1, 'E010', 3, 'C'), (1, 'E001', 1, 'E021', 3, 'B'),
(1, 'E001', 1, 'E011', 4, 'A'), (1, 'E001', 1, 'E012', 4, 'A'), (1, 'E001', 1, 'E013', 4, 'B'), (1, 'E001', 1, 'E014', 4, 'A'),
(1, 'E001', 1, 'E015', 4, 'B'), (1, 'E001', 1, 'E016', 4, 'B'), (1, 'E001', 1, 'E017', 4, 'C'), (1, 'E001', 1, 'E018', 4, 'A'),
(1, 'E001', 1, 'E019', 4, 'B'), (1, 'E001', 1, 'E020', 4, 'B'),

-- 王经理投票
(1, 'E002', 2, 'E003', 2, 'B'), (1, 'E002', 2, 'E004', 2, 'B'),
(1, 'E002', 2, 'E005', 3, 'A'), (1, 'E002', 2, 'E006', 3, 'B'), (1, 'E002', 2, 'E007', 3, 'B'),
(1, 'E002', 2, 'E008', 3, 'B'), (1, 'E002', 2, 'E009', 3, 'C'), (1, 'E002', 2, 'E010', 3, 'B'), (1, 'E002', 2, 'E021', 3, 'A'),
(1, 'E002', 2, 'E011', 4, 'A'), (1, 'E002', 2, 'E012', 4, 'B'), (1, 'E002', 2, 'E013', 4, 'B'), (1, 'E002', 2, 'E014', 4, 'A'),
(1, 'E002', 2, 'E015', 4, 'B'), (1, 'E002', 2, 'E016', 4, 'B'), (1, 'E002', 2, 'E017', 4, 'C'), (1, 'E002', 2, 'E018', 4, 'B'),
(1, 'E002', 2, 'E019', 4, 'B'), (1, 'E002', 2, 'E020', 4, 'C'),

-- 刘主管投票
(1, 'E005', 3, 'E002', 2, 'A'), (1, 'E005', 3, 'E003', 2, 'B'), (1, 'E005', 3, 'E004', 2, 'C'),
(1, 'E005', 3, 'E006', 3, 'B'), (1, 'E005', 3, 'E007', 3, 'B'), (1, 'E005', 3, 'E008', 3, 'C'),
(1, 'E005', 3, 'E009', 3, 'B'), (1, 'E005', 3, 'E010', 3, 'B'), (1, 'E005', 3, 'E021', 3, 'A'),
(1, 'E005', 3, 'E011', 4, 'A'), (1, 'E005', 3, 'E012', 4, 'A'), (1, 'E005', 3, 'E013', 4, 'B'), (1, 'E005', 3, 'E014', 4, 'B'),
(1, 'E005', 3, 'E015', 4, 'C'), (1, 'E005', 3, 'E016', 4, 'B'), (1, 'E005', 3, 'E017', 4, 'B'), (1, 'E005', 3, 'E018', 4, 'A'),
(1, 'E005', 3, 'E019', 4, 'B'), (1, 'E005', 3, 'E020', 4, 'B'),

-- 员工甲投票
(1, 'E011', 4, 'E002', 2, 'A'), (1, 'E011', 4, 'E003', 2, 'B'), (1, 'E011', 4, 'E004', 2, 'B'),
(1, 'E011', 4, 'E005', 3, 'A'), (1, 'E011', 4, 'E006', 3, 'B'), (1, 'E011', 4, 'E007', 3, 'A'),
(1, 'E011', 4, 'E008', 3, 'B'), (1, 'E011', 4, 'E009', 3, 'B'), (1, 'E011', 4, 'E010', 3, 'C'), (1, 'E011', 4, 'E021', 3, 'B'),
(1, 'E011', 4, 'E012', 4, 'B'), (1, 'E011', 4, 'E013', 4, 'A'), (1, 'E011', 4, 'E014', 4, 'B'), (1, 'E011', 4, 'E015', 4, 'B'),
(1, 'E011', 4, 'E016', 4, 'A'), (1, 'E011', 4, 'E017', 4, 'B'), (1, 'E011', 4, 'E018', 4, 'B'), (1, 'E011', 4, 'E019', 4, 'B'),
(1, 'E011', 4, 'E020', 4, 'C');

-- ========================================================
-- 5. 投票提交记录表 (vote_submissions)
-- 用于控制每人只能提交一次投票
-- ========================================================
DROP TABLE IF EXISTS vote_submissions;
CREATE TABLE vote_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    vote_session_id BIGINT NOT NULL COMMENT '投票批次ID',
    voter_id VARCHAR(50) NOT NULL COMMENT '投票人ID',
    submit_time TIMESTAMP NOT NULL COMMENT '提交时间',
    is_submitted TINYINT DEFAULT 1 COMMENT '是否已提交：0草稿 1已提交',
    ip_address VARCHAR(50) DEFAULT NULL COMMENT '提交IP地址',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT '浏览器UA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_session_voter (vote_session_id, voter_id),
    INDEX idx_voter (voter_id),
    FOREIGN KEY (vote_session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票提交记录表（用于控制每人只能提交一次）';

-- 插入示例提交记录
INSERT INTO vote_submissions (vote_session_id, voter_id, submit_time, is_submitted) VALUES
(1, 'E001', '2026-04-10 10:00:00', 1),
(1, 'E002', '2026-04-10 11:30:00', 1),
(1, 'E005', '2026-04-11 09:15:00', 1),
(1, 'E011', '2026-04-12 14:20:00', 1);

-- ========================================================
-- 6. 评分结果表 (scores)
-- ========================================================
DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    vote_session_id BIGINT NOT NULL COMMENT '投票批次ID',
    employee_id VARCHAR(50) NOT NULL COMMENT '员工ID',
    level TINYINT NOT NULL COMMENT '员工层级',
    
    -- 领导评分票数
    leader_a_count INT DEFAULT 0 COMMENT '领导评A票数',
    leader_b_count INT DEFAULT 0 COMMENT '领导评B票数',
    leader_c_count INT DEFAULT 0 COMMENT '领导评C票数',
    leader_d_count INT DEFAULT 0 COMMENT '领导评D票数',
    leader_total_count INT DEFAULT 0 COMMENT '领导评分总票数',
    
    -- 全体员工评分票数
    staff_a_count INT DEFAULT 0 COMMENT '员工评A票数',
    staff_b_count INT DEFAULT 0 COMMENT '员工评B票数',
    staff_c_count INT DEFAULT 0 COMMENT '员工评C票数',
    staff_d_count INT DEFAULT 0 COMMENT '员工评D票数',
    staff_total_count INT DEFAULT 0 COMMENT '员工评分总票数',
    
    -- 各等级得分
    score_a DECIMAL(5,2) DEFAULT 0 COMMENT 'A等级得分',
    score_b DECIMAL(5,2) DEFAULT 0 COMMENT 'B等级得分',
    score_c DECIMAL(5,2) DEFAULT 0 COMMENT 'C等级得分',
    score_d DECIMAL(5,2) DEFAULT 0 COMMENT 'D等级得分',
    
    -- 最终结果
    total_score DECIMAL(5,2) DEFAULT 0 COMMENT '总分',
    final_grade ENUM('A','B','C','D') DEFAULT 'D' COMMENT '最终评级',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_session_employee (vote_session_id, employee_id),
    INDEX idx_employee (employee_id),
    INDEX idx_final_grade (final_grade),
    INDEX idx_total_score (total_score),
    FOREIGN KEY (vote_session_id) REFERENCES vote_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分结果表';

-- 插入示例评分结果
INSERT INTO scores (
    vote_session_id, employee_id, level,
    leader_a_count, leader_b_count, leader_c_count, leader_d_count, leader_total_count,
    staff_a_count, staff_b_count, staff_c_count, staff_d_count, staff_total_count,
    score_a, score_b, score_c, score_d, total_score, final_grade
) VALUES
-- 王经理评分结果
(1, 'E002', 2, 1, 0, 0, 0, 1, 3, 5, 2, 0, 10, 58.0, 30.0, 12.0, 0, 88.0, 'B'),
-- 刘主管评分结果
(1, 'E005', 3, 2, 1, 0, 0, 3, 3, 5, 2, 0, 10, 45.3, 35.0, 14.0, 0, 80.3, 'B'),
-- 员工甲评分结果
(1, 'E011', 4, 2, 1, 0, 0, 3, 3, 4, 3, 0, 10, 45.3, 32.0, 18.0, 0, 77.3, 'B');

-- ========================================================
-- 7. 系统配置表 (system_config)
-- ========================================================
DROP TABLE IF EXISTS system_config;
CREATE TABLE system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置项键',
    config_value VARCHAR(500) DEFAULT NULL COMMENT '配置项值',
    description VARCHAR(200) DEFAULT NULL COMMENT '配置说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('A_LIMIT_MANAGER', '1', '经理层优秀票限制数量'),
('A_LIMIT_MIDDLE', '3', '中层领导优秀票限制数量'),
('A_LIMIT_STAFF', '5', '普通员工优秀票限制数量'),
('GRADE_A_MIN_SCORE', '95', 'A级(优秀)最低分数线'),
('GRADE_B_MIN_SCORE', '70', 'B级(良好)最低分数线'),
('GRADE_C_MIN_SCORE', '50', 'C级(合格)最低分数线'),
('LEADER_WEIGHT', '0.4', '领导评分权重'),
('STAFF_WEIGHT', '0.6', '全体员工评分权重'),
('VOTE_STATUS', '1', '投票状态：0关闭 1开启');

-- ========================================================
-- 8. 操作日志表 (operation_logs)
-- ========================================================
DROP TABLE IF EXISTS operation_logs;
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
    employee_id VARCHAR(50) DEFAULT NULL COMMENT '操作人ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型：LOGIN登录/VOTE投票/QUERY查询等',
    operation_desc VARCHAR(500) DEFAULT NULL COMMENT '操作描述',
    ip_address VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT '浏览器UA',
    request_data TEXT DEFAULT NULL COMMENT '请求数据',
    response_data TEXT DEFAULT NULL COMMENT '响应数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_employee (employee_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ========================================================
-- 常用查询视图
-- ========================================================

-- 视图1：员工评分汇总视图
CREATE OR REPLACE VIEW v_employee_score_summary AS
SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.level,
    CASE e.level
        WHEN 1 THEN '董事长'
        WHEN 2 THEN '经理层'
        WHEN 3 THEN '中层领导'
        WHEN 4 THEN '普通员工'
    END AS level_name,
    s.total_score,
    s.final_grade,
    CASE s.final_grade
        WHEN 'A' THEN '优秀'
        WHEN 'B' THEN '良好'
        WHEN 'C' THEN '合格'
        WHEN 'D' THEN '不合格'
    END AS final_grade_name,
    s.leader_total_count,
    s.staff_total_count,
    vs.submit_time AS voted_at
FROM employees e
LEFT JOIN scores s ON e.employee_id = s.employee_id
LEFT JOIN vote_submissions vs ON e.employee_id = vs.voter_id
WHERE e.level != 1 AND e.status = 1;

-- 视图2：投票统计视图
CREATE OR REPLACE VIEW v_vote_statistics AS
SELECT 
    vs.year,
    COUNT(DISTINCT e.employee_id) AS total_employees,
    COUNT(DISTINCT vsb.voter_id) AS voted_count,
    COUNT(DISTINCT CASE WHEN s.final_grade = 'A' THEN s.employee_id END) AS grade_a_count,
    COUNT(DISTINCT CASE WHEN s.final_grade = 'B' THEN s.employee_id END) AS grade_b_count,
    COUNT(DISTINCT CASE WHEN s.final_grade = 'C' THEN s.employee_id END) AS grade_c_count,
    COUNT(DISTINCT CASE WHEN s.final_grade = 'D' THEN s.employee_id END) AS grade_d_count,
    AVG(s.total_score) AS avg_score,
    MAX(s.total_score) AS max_score,
    MIN(s.total_score) AS min_score
FROM vote_sessions vs
LEFT JOIN employees e ON e.level != 1 AND e.status = 1
LEFT JOIN vote_submissions vsb ON vs.id = vsb.vote_session_id AND vsb.is_submitted = 1
LEFT JOIN scores s ON vs.id = s.vote_session_id AND e.employee_id = s.employee_id
WHERE vs.status = 1
GROUP BY vs.id, vs.year;

-- ========================================================
-- 完成
-- ========================================================
SELECT '数据库DDL脚本执行完成！' AS message;

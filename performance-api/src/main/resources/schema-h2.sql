-- H2 兼容建表脚本（本地测试用）

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    level TINYINT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    email VARCHAR(200),
    status TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin',
    can_view_result TINYINT DEFAULT 1,
    can_view_stats TINYINT DEFAULT 1,
    can_view_vote_detail TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vote_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    `year` INT NOT NULL,
    `name` VARCHAR(200),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    `status` TINYINT DEFAULT 1,
    is_calculated TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vote_session_id BIGINT NOT NULL,
    voter_id VARCHAR(50) NOT NULL,
    voter_level TINYINT,
    target_id VARCHAR(50) NOT NULL,
    target_level TINYINT,
    grade VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vote_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vote_session_id BIGINT NOT NULL,
    voter_id VARCHAR(50) NOT NULL,
    submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_submitted TINYINT DEFAULT 1,
    ip_address VARCHAR(100),
    user_agent VARCHAR(500),
    UNIQUE (vote_session_id, voter_id)
);

CREATE TABLE IF NOT EXISTS scores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vote_session_id BIGINT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    level TINYINT,
    leader_a_count INT DEFAULT 0,
    leader_b_count INT DEFAULT 0,
    leader_c_count INT DEFAULT 0,
    leader_d_count INT DEFAULT 0,
    leader_total_count INT DEFAULT 0,
    staff_a_count INT DEFAULT 0,
    staff_b_count INT DEFAULT 0,
    staff_c_count INT DEFAULT 0,
    staff_d_count INT DEFAULT 0,
    staff_total_count INT DEFAULT 0,
    leader_score DECIMAL(6,2),
    staff_score DECIMAL(6,2),
    total_score DECIMAL(6,2),
    final_grade VARCHAR(10),
    calculated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(500),
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(50),
    operation_type VARCHAR(50),
    operation_desc VARCHAR(500),
    ip_address VARCHAR(100),
    user_agent VARCHAR(500),
    request_data CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化员工数据
INSERT INTO employees (employee_id,name,department,level,username,password,status,is_deleted) VALUES
('E001','张董事长','总裁办',1,'zhang','e10adc3949ba59abbe56e057f20f883e',1,0),
('E002','王经理','技术部',2,'wang','e10adc3949ba59abbe56e057f20f883e',1,0),
('E003','李经理','产品部',2,'li','e10adc3949ba59abbe56e057f20f883e',1,0),
('E004','赵经理','运营部',2,'zhao','e10adc3949ba59abbe56e057f20f883e',1,0),
('E005','刘主管','技术部',3,'liu','e10adc3949ba59abbe56e057f20f883e',1,0),
('E006','陈主管','技术部',3,'chen','e10adc3949ba59abbe56e057f20f883e',1,0),
('E007','杨主管','产品部',3,'yang','e10adc3949ba59abbe56e057f20f883e',1,0),
('E008','黄主管','运营部',3,'huang','e10adc3949ba59abbe56e057f20f883e',1,0),
('E009','周主管','市场部',3,'zhou','e10adc3949ba59abbe56e057f20f883e',1,0),
('E010','吴主管','人事部',3,'wu','e10adc3949ba59abbe56e057f20f883e',1,0),
('E021','韩雪','财务部',3,'hanxue','e10adc3949ba59abbe56e057f20f883e',1,0),
('E011','员工甲','技术部',4,'jia','e10adc3949ba59abbe56e057f20f883e',1,0),
('E012','员工乙','技术部',4,'yi','e10adc3949ba59abbe56e057f20f883e',1,0),
('E013','员工丙','产品部',4,'bing','e10adc3949ba59abbe56e057f20f883e',1,0),
('E014','员工丁','运营部',4,'ding','e10adc3949ba59abbe56e057f20f883e',1,0),
('E015','员工戊','市场部',4,'wu2','e10adc3949ba59abbe56e057f20f883e',1,0);

-- 初始化管理员（董事长：不显示结果，韩雪：显示结果+统计+详情）
INSERT INTO system_admins (employee_id,role,can_view_result,can_view_stats,can_view_vote_detail) VALUES
('E001','admin',0,0,0),
('E021','admin',1,1,1);

-- 初始化当前投票批次
INSERT INTO vote_sessions (`year`,`name`,start_time,end_time,`status`) VALUES
(2026,'2026年度绩效评分','2026-01-01 00:00:00','2026-12-31 23:59:59',1);

-- 初始化系统配置
INSERT INTO system_config (config_key,config_value,description) VALUES
('A_LIMIT_MANAGER','1','经理层优秀票上限'),
('A_LIMIT_MIDDLE','3','中层优秀票上限'),
('A_LIMIT_STAFF','5','普通员工优秀票上限'),
('GRADE_A_MIN_SCORE','95','A级最低分'),
('GRADE_B_MIN_SCORE','70','B级最低分'),
('GRADE_C_MIN_SCORE','50','C级最低分'),
('LEADER_WEIGHT','0.4','领导评分权重'),
('STAFF_WEIGHT','0.6','员工评分权重');

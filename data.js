// 模拟员工数据
const employees = [
    // 董事长 (层级1)
    { id: 'E001', name: '张董事长', department: '总裁办', level: 1, username: 'zhang', password: '123456' },
    
    // 经理层 (层级2)
    { id: 'E002', name: '王经理', department: '技术部', level: 2, username: 'wang', password: '123456' },
    { id: 'E003', name: '李经理', department: '产品部', level: 2, username: 'li', password: '123456' },
    { id: 'E004', name: '赵经理', department: '运营部', level: 2, username: 'zhao', password: '123456' },
    
    // 中层领导 (层级3)
    { id: 'E005', name: '刘主管', department: '技术部', level: 3, username: 'liu', password: '123456' },
    { id: 'E006', name: '陈主管', department: '技术部', level: 3, username: 'chen', password: '123456' },
    { id: 'E007', name: '杨主管', department: '产品部', level: 3, username: 'yang', password: '123456' },
    { id: 'E008', name: '黄主管', department: '运营部', level: 3, username: 'huang', password: '123456' },
    { id: 'E009', name: '周主管', department: '市场部', level: 3, username: 'zhou', password: '123456' },
    { id: 'E010', name: '吴主管', department: '人事部', level: 3, username: 'wu', password: '123456' },
    { id: 'E021', name: '韩雪', department: '财务部', level: 3, username: 'hanxue', password: '123456' },
    
    // 普通员工 (层级4)
    { id: 'E011', name: '员工甲', department: '技术部', level: 4, username: 'jia', password: '123456' },
    { id: 'E012', name: '员工乙', department: '技术部', level: 4, username: 'yi', password: '123456' },
    { id: 'E013', name: '员工丙', department: '技术部', level: 4, username: 'bing', password: '123456' },
    { id: 'E014', name: '员工丁', department: '产品部', level: 4, username: 'ding', password: '123456' },
    { id: 'E015', name: '员工戊', department: '产品部', level: 4, username: 'wu2', password: '123456' },
    { id: 'E016', name: '员工己', department: '运营部', level: 4, username: 'ji', password: '123456' },
    { id: 'E017', name: '员工庚', department: '运营部', level: 4, username: 'geng', password: '123456' },
    { id: 'E018', name: '员工辛', department: '市场部', level: 4, username: 'xin', password: '123456' },
    { id: 'E019', name: '员工壬', department: '人事部', level: 4, username: 'ren', password: '123456' },
    { id: 'E020', name: '员工癸', department: '财务部', level: 4, username: 'gui', password: '123456' },
];

// 系统管理员配置（支持多个管理员）
const SYSTEM_ADMINS = ['E001', 'E021'];  // E001=董事长, E021=韩雪

// A票限制配置
const A_LIMITS = {
    2: 1,  // 经理层最多投1个A
    3: 3,  // 中层最多投3个A
    4: 5   // 普通员工最多投5个A
};

// 层级名称映射
const LEVEL_NAMES = {
    1: '董事长',
    2: '经理层',
    3: '中层领导',
    4: '普通员工'
};

// 评分等级配置
const GRADE_CONFIG = {
    'A': { name: '优秀', color: '#27ae60', bg: '#e8f8f0' },
    'B': { name: '良好', color: '#3498db', bg: '#e8f4fc' },
    'C': { name: '合格', color: '#f39c12', bg: '#fef5e7' },
    'D': { name: '不合格', color: '#e74c3c', bg: '#fdedec' }
};

// 模拟已投票数据（用于演示）
const mockVotes = {
    'E001': { // 董事长投票数据
        'E002': 'A', 'E003': 'B', 'E004': 'B',
        'E005': 'A', 'E006': 'B', 'E007': 'A', 'E008': 'B', 'E009': 'B', 'E010': 'C',
        'E011': 'A', 'E012': 'A', 'E013': 'B', 'E014': 'A', 'E015': 'B', 'E016': 'B', 'E017': 'C', 'E018': 'A', 'E019': 'B', 'E020': 'B'
    },
    'E002': { // 王经理投票数据
        'E003': 'B', 'E004': 'B',
        'E005': 'A', 'E006': 'B', 'E007': 'B', 'E008': 'B', 'E009': 'C', 'E010': 'B',
        'E011': 'A', 'E012': 'B', 'E013': 'B', 'E014': 'A', 'E015': 'B', 'E016': 'B', 'E017': 'C', 'E018': 'B', 'E019': 'B', 'E020': 'C'
    },
    'E005': { // 刘主管投票数据
        'E002': 'A', 'E003': 'B', 'E004': 'C',
        'E006': 'B', 'E007': 'B', 'E008': 'C', 'E009': 'B', 'E010': 'B',
        'E011': 'A', 'E012': 'A', 'E013': 'B', 'E014': 'B', 'E015': 'C', 'E016': 'B', 'E017': 'B', 'E018': 'A', 'E019': 'B', 'E020': 'B'
    },
    'E011': { // 员工甲投票数据
        'E002': 'A', 'E003': 'B', 'E004': 'B',
        'E005': 'A', 'E006': 'B', 'E007': 'A', 'E008': 'B', 'E009': 'B', 'E010': 'C',
        'E012': 'B', 'E013': 'A', 'E014': 'B', 'E015': 'B', 'E016': 'A', 'E017': 'B', 'E018': 'B', 'E019': 'B', 'E020': 'C'
    }
};

// 模拟评分结果数据
const mockResults = {
    'E002': {
        leaderVotes: { A: 1, B: 0, C: 0, D: 0, total: 1 },
        staffVotes: { A: 3, B: 5, C: 2, D: 0, total: 10 },
        gradeScores: { A: 58.0, B: 30.0, C: 12.0, D: 0 },
        totalScore: 88.0,
        finalGrade: 'A'
    },
    'E005': {
        leaderVotes: { A: 2, B: 1, C: 0, D: 0, total: 3 },
        staffVotes: { A: 3, B: 5, C: 2, D: 0, total: 10 },
        gradeScores: { A: 45.3, B: 35.0, C: 14.0, D: 0 },
        totalScore: 80.3,
        finalGrade: 'B'
    },
    'E011': {
        leaderVotes: { A: 2, B: 1, C: 0, D: 0, total: 3 },
        staffVotes: { A: 3, B: 4, C: 3, D: 0, total: 10 },
        gradeScores: { A: 45.3, B: 32.0, C: 18.0, D: 0 },
        totalScore: 77.3,
        finalGrade: 'B'
    }
};

// 获取某员工的投票数据（如果存在）
function getUserVotes(userId) {
    return mockVotes[userId] || {};
}

// 获取某员工的评分结果
function getUserResult(userId) {
    return mockResults[userId] || null;
}

// 获取某员工需要评分的人员列表
function getVoteTargets(voterId, voterLevel) {
    // 董事长不参与被评分
    // 所有人（包括韩雪）都不能给自己投票
    return employees.filter(e => {
        if (e.level === 1) return false; // 董事长不参与评分
        return e.id !== voterId; // 不能给自己投票
    });
}

// 按层级分组获取人员
function getTargetsByLevel(voterId, voterLevel) {
    const targets = getVoteTargets(voterId, voterLevel);
    return {
        managers: targets.filter(e => e.level === 2),
        middle: targets.filter(e => e.level === 3),
        staff: targets.filter(e => e.level === 4)
    };
}

// 计算评分结果（根据PRD规则）
function calculateScore(employeeId, allVotes) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return null;
    
    // 确定领导范围
    let leaderLevels = [];
    if (employee.level === 2) leaderLevels = [1]; // 经理层：董事长
    else if (employee.level === 3) leaderLevels = [1, 2]; // 中层：董事长+经理
    else if (employee.level === 4) leaderLevels = [1, 2, 3]; // 普通员工：董事长+经理+中层
    
    // 统计票数
    const leaderVotes = { A: 0, B: 0, C: 0, D: 0, total: 0 };
    const staffVotes = { A: 0, B: 0, C: 0, D: 0, total: 0 };
    
    for (const [voterId, votes] of Object.entries(allVotes)) {
        const voter = employees.find(e => e.id === voterId);
        if (!voter || !votes[employeeId]) continue;
        
        const grade = votes[employeeId];
        
        if (leaderLevels.includes(voter.level)) {
            leaderVotes[grade]++;
            leaderVotes.total++;
        }
        
        // 全体员工（不含董事长）
        if (voter.level !== 1) {
            staffVotes[grade]++;
            staffVotes.total++;
        }
    }
    
    // 计算各等级得分
    const gradeScores = {};
    for (const grade of ['A', 'B', 'C', 'D']) {
        const leaderScore = leaderVotes.total > 0 ? (leaderVotes[grade] / leaderVotes.total) * 0.4 : 0;
        const staffScore = staffVotes.total > 0 ? (staffVotes[grade] / staffVotes.total) * 0.6 : 0;
        gradeScores[grade] = parseFloat(((leaderScore + staffScore) * 100).toFixed(1));
    }
    
    // 总分 = A得分 + B得分
    const totalScore = parseFloat((gradeScores.A + gradeScores.B).toFixed(1));
    
    // 判定最终评级
    let finalGrade = 'D';
    if (totalScore > 95) finalGrade = 'A';
    else if (totalScore >= 70) finalGrade = 'B';
    else if (totalScore >= 50) finalGrade = 'C';
    
    return {
        employeeId,
        leaderVotes,
        staffVotes,
        gradeScores,
        totalScore,
        finalGrade
    };
}

// 导出数据供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        employees,
        A_LIMITS,
        LEVEL_NAMES,
        GRADE_CONFIG,
        mockVotes,
        mockResults,
        getUserVotes,
        getUserResult,
        getVoteTargets,
        getTargetsByLevel,
        calculateScore
    };
}

// 全局状态
let currentUser = null;
let currentVotes = {};        // 当前编辑的评分
let isSubmitted = false;      // 是否已提交
let isAdmin = false;          // 是否是系统管理员
let voteTargets = [];         // 从 API 获取的投票目标列表
let availableYears = [];      // 可用绩效年份列表（韩雪专属）
let currentStatsYear = null;  // 统计页当前查询年份（null=默认当前绩效年）
let currentDetailYear = null; // 投票详情页当前查询年份（null=默认当前绩效年）

// 初始化
async function init() {
    // 尝试从 localStorage 恢复登录会话
    var savedToken = localStorage.getItem('token');
    if (savedToken) {
        var resp = await apiGetCurrentUser();
        if (resp.code === 200 && resp.data) {
            setupUser(resp.data);
            return;
        } else {
            // Token 已过期，清除
            localStorage.removeItem('token');
        }
    }
}

// 登录
async function login() {
    const phone = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!phone) { showToast('请输入手机号'); return; }
    if (!password) { showToast('请输入密码'); return; }

    // 调用后端登录接口
    const loginBtn = document.querySelector('#page-login .btn-primary');
    if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = '登录中...'; }

    const resp = await apiLogin(phone, password);

    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = '登录'; }

    if (resp.code !== 200) {
        showToast(resp.message || '登录失败');
        return;
    }

    const user = resp.data;
    // 将 Token 存入 localStorage（2小时有效）
    if (user.token) {
        localStorage.setItem('token', user.token);
    }

    setupUser(user);
    showToast(`欢迎，${currentUser.name}${isAdmin ? '（管理员）' : ''}`);
}

/**
 * 设置用户信息并切换到主页（登录和会话恢复共用）
 */
async function setupUser(user) {
    currentUser = {
        id: user.employeeId,
        name: user.name,
        department: user.department,
        level: user.level,
        levelName: user.levelName,
        employeeId: user.employeeId
    };
    isAdmin = user.isAdmin === true;
    isSubmitted = user.isSubmitted === true;

    // 如果已提交，回显投票数据
    if (isSubmitted && user.myVotes) {
        currentVotes = { ...user.myVotes };
    } else {
        currentVotes = {};
    }

    // 从 API 获取投票目标列表
    const targetsResp = await apiGetVoteTargets(currentUser.id);
    if (targetsResp.code === 200) {
        voteTargets = targetsResp.data || [];
    } else {
        voteTargets = [];
    }

    // 更新 UI
    document.getElementById('current-user-name').textContent = currentUser.name;
    document.getElementById('current-user-avatar').textContent = currentUser.name.substring(0, 1);

    // 管理员显示结果页和统计页
    if (user.canViewResult) {
        document.getElementById('nav-result').style.display = 'block';
    }
    if (user.canViewStats) {
        document.getElementById('nav-stats').style.display = 'block';
    }
    // 投票详情（韩雪专属）
    if (user.canViewVoteDetail) {
        document.getElementById('nav-hanxue').style.display = 'block';
    }

    // 切换页面
    document.getElementById('page-login').classList.remove('active');
    document.getElementById('page-main').classList.add('active');

    // 渲染投票列表
    renderVoteList();
    updateProgress();

    // 如果已提交，禁用所有操作
    if (isSubmitted) {
        disableAllGradeSelects();
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.textContent = '✓ 已提交';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.background = '#27ae60';
    }
}

// 退出登录
async function logout() {
    await apiLogout();
    localStorage.removeItem('token');
    // 重置全局状态
    currentUser = null;
    currentVotes = {};
    isSubmitted = false;
    isAdmin = false;
    voteTargets = [];
    availableYears = [];
    currentStatsYear = null;
    currentDetailYear = null;
    // 隐藏权限菜单
    ['nav-result', 'nav-stats', 'nav-hanxue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    // 切换到登录页
    document.getElementById('page-main').classList.remove('active');
    document.getElementById('page-login').classList.add('active');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    showToast('已退出登录');
}

// 渲染投票列表
function renderVoteList() {
    // 使用从 API 获取的 voteTargets，按层级分组
    const managers = voteTargets.filter(e => e.level === 2);
    const middle = voteTargets.filter(e => e.level === 3);
    const staff = voteTargets.filter(e => e.level === 4);

    renderPersonList('list-manager', managers, 2);
    renderPersonList('list-middle', middle, 3);
    renderPersonList('list-staff', staff, 4);
}

// 渲染人员列表
function renderPersonList(containerId, persons, level) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    persons.forEach(person => {
        const card = document.createElement('div');
        card.className = 'person-card';
        
        const currentGrade = currentVotes[person.id] || '';
        const gradeClass = currentGrade ? `grade-${currentGrade.toLowerCase()}` : '';
        
        card.innerHTML = `
            <div class="person-info">
                <h4>${person.name}</h4>
                <span>${person.department}</span>
            </div>
            <select class="grade-select ${gradeClass}" 
                    data-id="${person.id}" 
                    data-level="${level}"
                    onchange="onGradeChange(this)">
                <option value="">选择</option>
                <option value="A" ${currentGrade === 'A' ? 'selected' : ''}>优秀</option>
                <option value="B" ${currentGrade === 'B' ? 'selected' : ''}>良好</option>
                <option value="C" ${currentGrade === 'C' ? 'selected' : ''}>合格</option>
                <option value="D" ${currentGrade === 'D' ? 'selected' : ''}>不合格</option>
            </select>
        `;
        
        container.appendChild(card);
    });
}

// 评分改变
function onGradeChange(select) {
    const targetId = select.dataset.id;
    const level = parseInt(select.dataset.level);
    const grade = select.value;
    
    // 更新样式
    select.className = 'grade-select';
    if (grade) {
        select.classList.add(`grade-${grade.toLowerCase()}`);
    }
    
    // 保存选择
    if (grade) {
        currentVotes[targetId] = grade;
    } else {
        delete currentVotes[targetId];
    }
    
    // 更新A票计数
    updateACount(level);
    updateProgress();
    checkSubmitValid();
}

// 更新A票计数
function updateACount(level) {
    const persons = voteTargets.filter(e => e.level === level);
    let elementId = '';
    if (level === 2) elementId = 'a-count-manager';
    else if (level === 3) elementId = 'a-count-middle';
    else if (level === 4) elementId = 'a-count-staff';

    let aCount = 0;
    persons.forEach(p => {
        if (currentVotes[p.id] === 'A') aCount++;
    });

    const limit = A_LIMITS[level];
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = `优秀票: ${aCount}/${limit}`;
    element.className = 'a-count';
    if (aCount > limit) element.classList.add('warning');
    else if (aCount === limit) element.classList.add('success');
}

// 更新进度
function updateProgress() {
    const total = voteTargets.length;
    const voted = Object.keys(currentVotes).length;

    document.getElementById('voted-count').textContent = voted;
    document.getElementById('total-count').textContent = total;
    document.getElementById('progress-fill').style.width = total > 0 ? `${(voted / total) * 100}%` : '0%';

    updateACount(2);
    updateACount(3);
    updateACount(4);
}

// 检查提交是否有效
function checkSubmitValid() {
    const total = voteTargets.length;
    const voted = Object.keys(currentVotes).length;
    const warningEl = document.getElementById('warning-msg');
    const submitBtn = document.getElementById('submit-btn');

    if (voted < total) {
        warningEl.textContent = `还有 ${total - voted} 人未评分，请完成所有评分`;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        return false;
    }

    for (const level of [2, 3, 4]) {
        const persons = voteTargets.filter(e => e.level === level);
        let aCount = 0;
        persons.forEach(p => { if (currentVotes[p.id] === 'A') aCount++; });
        if (aCount > A_LIMITS[level]) {
            warningEl.textContent = `${LEVEL_NAMES[level]}优秀票超出限制（最多${A_LIMITS[level]}票）`;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            return false;
        }
    }

    warningEl.textContent = '';
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    return true;
}

// 提交投票
async function submitVote() {
    if (!checkSubmitValid()) {
        showToast('请检查评分是否完整');
        return;
    }

    if (isSubmitted) {
        showToast('您已完成投票，无法再次修改');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    const resp = await apiSubmitVotes(currentUser.id, currentVotes);
    if (resp.code !== 200) {
        showToast(resp.message || '提交失败');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交评分';
        return;
    }

    isSubmitted = true;
    disableAllGradeSelects();
    submitBtn.textContent = '✓ 已提交';
    submitBtn.style.opacity = '0.5';
    submitBtn.style.background = '#27ae60';
    showToast('评分提交成功！');
}

// 禁用所有评分选择框
function disableAllGradeSelects() {
    const selects = document.querySelectorAll('.grade-select');
    selects.forEach(select => {
        select.disabled = true;
    });
}

// 切换标签页
function switchTab(tab) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // 隐藏所有内容
    document.getElementById('vote-content').style.display = 'none';
    document.getElementById('result-content').style.display = 'none';
    document.getElementById('stats-content').style.display = 'none';
    document.getElementById('hanxue-vote-detail-content').style.display = 'none';
    document.getElementById('submit-section').style.display = 'none';
    
    // 显示对应内容
    if (tab === 'vote') {
        document.getElementById('vote-content').style.display = 'block';
        document.getElementById('submit-section').style.display = 'block';
    } else if (tab === 'result') {
        document.getElementById('result-content').style.display = 'block';
        renderResult();
    } else if (tab === 'stats') {
        document.getElementById('stats-content').style.display = 'block';
        renderStats();
    } else if (tab === 'hanxue') {
        document.getElementById('hanxue-vote-detail-content').style.display = 'block';
        renderHanxueVoteDetail();
    }
}

// 渲染结果页
async function renderResult() {
    const container = document.getElementById('result-content');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

    const resp = await apiGetResult(currentUser.id);
    if (resp.code !== 200) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📊</div><p>${resp.message || '暂无评分数据'}</p></div>`;
        return;
    }

    const result = resp.data;

    // 若总分为 0 或结果不存在，说明结果尚未生成
    if (!result || !result.totalScore || result.totalScore === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <p style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px;">结果未生成</p>
                <p style="font-size: 13px; color: #999;">评分结果将在所有人完成投票后统一公布</p>
            </div>
        `;
        return;
    }
    const lv = result.leaderVotes;
    const sv = result.staffVotes;
    const gs = result.gradeScores || {};
    const gradeName = GRADE_CONFIG[result.finalGrade] ? GRADE_CONFIG[result.finalGrade].name : result.finalGradeName;

    // 重建结果页完整 HTML
    container.innerHTML = `
        <div class="result-score">
            <div class="score-value">${result.totalScore}</div>
            <div class="score-grade">${gradeName}(${result.finalGrade})</div>
        </div>
        <div class="vote-section">
            <div class="section-header">
                <div class="section-title">评分详情</div>
            </div>
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>评分来源</th>
                        <th>A票数</th>
                        <th>B票数</th>
                        <th>得分</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>领导评分(40%)</td>
                        <td>${lv.A || 0}</td>
                        <td>${lv.B || 0}</td>
                        <td>${((gs.A || 0) * 0.4 + (gs.B || 0) * 0.4).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td>员工互评(60%)</td>
                        <td>${sv.A || 0}</td>
                        <td>${sv.B || 0}</td>
                        <td>${((gs.A || 0) * 0.6 + (gs.B || 0) * 0.6).toFixed(1)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="vote-section">
            <div class="section-header">
                <div class="section-title">各等级得分分布</div>
            </div>
            <div id="grade-distribution"></div>
        </div>
        <div class="vote-section">
            <div class="section-header">
                <div class="section-title">详细票数统计</div>
            </div>
            <div style="font-size: 14px; line-height: 2; color: #666;">
                <p><strong>领导评分：</strong>A=${lv.A || 0}, B=${lv.B || 0}, C=${lv.C || 0}, D=${lv.D || 0}（共${lv.total || 0}票）</p>
                <p><strong>员工评分：</strong>A=${sv.A || 0}, B=${sv.B || 0}, C=${sv.C || 0}, D=${sv.D || 0}（共${sv.total || 0}票）</p>
            </div>
        </div>
    `;

    // 渲染等级分布进度条
    const maxScore = Math.max(...Object.values(gs).map(Number), 0.01);
    document.getElementById('grade-distribution').innerHTML = ['A', 'B', 'C', 'D'].map(grade => {
        const score = gs[grade] || 0;
        const width = (score / maxScore) * 100;
        const name = GRADE_CONFIG[grade] ? GRADE_CONFIG[grade].name : grade;
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px;">
                    <span><span class="badge badge-${grade.toLowerCase()}">${grade}</span> ${name}</span>
                    <span style="font-weight: 600;">${score}分</span>
                </div>
                <div class="progress-bar" style="height: 8px;">
                    <div class="progress-fill" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染统计页（韩雪专属，支持按年份查询）
async function renderStats(year) {
    if (year !== undefined) currentStatsYear = year;

    const statsContent = document.getElementById('stats-content');
    statsContent.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

    // 加载可用年份（只加载一次）
    if (isAdmin && availableYears.length === 0) {
        const yearsResp = await apiGetAvailableYears();
        if (yearsResp.code === 200 && yearsResp.data && yearsResp.data.length > 0) {
            availableYears = yearsResp.data;
            // 默认选中第一个年份
            if (currentStatsYear === null) currentStatsYear = availableYears[0];
        }
    }

    const resp = await apiGetStatistics(currentStatsYear);

    // 年份选择器（仅管理员可见）
    const yearSelectorHtml = isAdmin && availableYears.length > 0 ? `
        <div style="display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;gap:10px;padding:12px 16px;background:#f0f2ff;border-radius:8px;margin-bottom:16px;">
            <span style="font-size:14px;color:#667eea;font-weight:600;white-space:nowrap;">📅 绩效年份</span>
            <select class="grade-select" style="width:auto;padding:6px 14px;font-size:14px;color:#333;"
                onchange="renderStats(parseInt(this.value))">
                ${availableYears.map(y => `<option value="${y}" ${currentStatsYear === y ? 'selected' : ''}>${y}年度绩效</option>`).join('')}
            </select>
            <span style="font-size:13px;color:#999;">${currentStatsYear ? `（${currentStatsYear}年度绩效评分结果）` : ''}</span>
        </div>
    ` : '';

    // 用与其他页面一致的 CSS 类重建统计内容
    statsContent.innerHTML = yearSelectorHtml + `
        <div class="stat-grid">
            <div class="stat-card">
                <div class="number" id="stat-total">-</div>
                <div class="label">参评总人数</div>
            </div>
            <div class="stat-card">
                <div class="number" id="stat-voted">-</div>
                <div class="label">已提交评分</div>
            </div>
            <div class="stat-card">
                <div class="number" id="stat-a" style="color: #27ae60;">-</div>
                <div class="label">优秀(A)</div>
            </div>
            <div class="stat-card">
                <div class="number" id="stat-b" style="color: #3498db;">-</div>
                <div class="label">良好(B)</div>
            </div>
        </div>
        <div class="vote-section">
            <div class="section-header">
                <div class="section-title">全员评级分布</div>
            </div>
            <div id="company-distribution"></div>
        </div>
        <div class="vote-section">
            <div class="section-header">
                <div class="section-title">全员得分排名</div>
            </div>
            <div id="score-ranking" style="overflow-x: auto;"></div>
        </div>
    `;

    if (resp.code !== 200) {
        document.getElementById('score-ranking').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon">📊</div><p>${resp.message || '暂无数据'}</p></div>`;
        return;
    }

    const stats = resp.data;
    document.getElementById('stat-total').textContent = stats.totalCount || 0;
    document.getElementById('stat-voted').textContent = stats.votedCount || 0;
    document.getElementById('stat-a').textContent = stats.aCount || 0;
    document.getElementById('stat-b').textContent = stats.bCount || 0;

    const gradeCountMap = { A: stats.aCount || 0, B: stats.bCount || 0, C: stats.cCount || 0, D: stats.dCount || 0 };
    const totalPeople = stats.totalCount || 1;
    const distributionEl = document.getElementById('company-distribution');
    distributionEl.innerHTML = ['A', 'B', 'C', 'D'].map(grade => {
        const count = gradeCountMap[grade] || 0;
        const width = (count / totalPeople) * 100;
        const name = GRADE_CONFIG[grade] ? GRADE_CONFIG[grade].name : grade;
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px;">
                    <span><span class="badge badge-${grade.toLowerCase()}">${grade}</span> ${name}</span>
                    <span style="font-weight: 600; color: #333;">${count}人 (${(count / totalPeople * 100).toFixed(1)}%)</span>
                </div>
                <div class="progress-bar" style="height: 8px;">
                    <div class="progress-fill" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');

    const scoreList = stats.scoreRanking || [];
    const rankingEl = document.getElementById('score-ranking');
    if (scoreList.length === 0) {
        rankingEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><p>暂无排名数据</p></div>`;
        return;
    }
    rankingEl.innerHTML = `
        <table class="detail-table">
            <thead>
                <tr>
                    <th style="text-align: center; width: 48px;">排名</th>
                    <th>姓名</th>
                    <th>部门</th>
                    <th style="text-align: center;">层级</th>
                    <th style="text-align: center;">得分</th>
                    <th style="text-align: center;">评级</th>
                </tr>
            </thead>
            <tbody>
                ${scoreList.map((item, index) => `
                    <tr>
                        <td style="text-align: center; font-weight: 700; color: ${index < 3 ? '#667eea' : '#333'};">${
                            index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1
                        }</td>
                        <td style="font-weight: 500;">${item.name}</td>
                        <td style="color: #999;">${item.department}</td>
                        <td style="text-align: center; color: #999;">${item.levelName}</td>
                        <td style="text-align: center; font-weight: 700; color: #333;">${(item.score || 0).toFixed(1)}</td>
                        <td style="text-align: center;">
                            <span class="badge badge-${(item.grade || 'd').toLowerCase()}">${item.gradeName || item.grade || '-'}</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 渲染韩雪专属的投票详情页面（支持按年份查询）
async function renderHanxueVoteDetail(year) {
    if (year !== undefined) currentDetailYear = year;

    const detailEl = document.getElementById('all-votes-detail');
    detailEl.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';

    // 加载可用年份（与统计页共用）
    if (isAdmin && availableYears.length === 0) {
        const yearsResp = await apiGetAvailableYears();
        if (yearsResp.code === 200 && yearsResp.data && yearsResp.data.length > 0) {
            availableYears = yearsResp.data;
            if (currentDetailYear === null) currentDetailYear = availableYears[0];
        }
    } else if (currentDetailYear === null && availableYears.length > 0) {
        currentDetailYear = availableYears[0];
    }

    const resp = await apiGetVoteDetail(currentDetailYear);

    // 年份选择器注入到独立容器（在滚动表格之上方）
    const selectorContainer = document.getElementById('year-selector-detail');
    if (selectorContainer && isAdmin && availableYears.length > 0) {
        selectorContainer.innerHTML = `
            <div style="display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;gap:10px;padding:12px 16px;background:#f0f2ff;border-radius:8px;margin-bottom:12px;">
                <span style="font-size:14px;color:#667eea;font-weight:600;white-space:nowrap;">📅 绩效年份</span>
                <select class="grade-select" style="width:auto;padding:6px 14px;font-size:14px;color:#333;"
                    onchange="renderHanxueVoteDetail(parseInt(this.value))">
                    ${availableYears.map(y => `<option value="${y}" ${currentDetailYear === y ? 'selected' : ''}>${y}年度绩效</option>`).join('')}
                </select>
                <span style="font-size:13px;color:#999;">${currentDetailYear ? `（${currentDetailYear}年度投票详情）` : ''}</span>
            </div>
        `;
    } else if (selectorContainer) {
        selectorContainer.innerHTML = '';
    }

    if (resp.code !== 200) {
        detailEl.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">${resp.message || '暂无数据'}</p>`;
        return;
    }

    const detail = resp.data;
    const voters = detail.voters || [];
    const targets = detail.targets || [];
    const votesMatrix = detail.votes || {};
    const results = detail.results || {};

    const GRADE_DISPLAY = { A: { cls: 'badge-a', text: '优秀' }, B: { cls: 'badge-b', text: '良好' }, C: { cls: 'badge-c', text: '合格' }, D: { cls: 'badge-d', text: '不合格' } };

    let html = `<table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
            <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; position: sticky; left: 0; background: #f5f5f5; min-width: 80px;">被投票人</th>
                ${voters.map(v => `<th style="padding: 8px; text-align: center; min-width: 50px;">${v.name.substring(0, 3)}</th>`).join('')}
                <th style="padding: 8px; text-align: center; min-width: 60px;">得分</th>
                <th style="padding: 8px; text-align: center; min-width: 50px;">评级</th>
            </tr>
        </thead>
        <tbody>`;

    for (const target of targets) {
        const res = results[target.id];
        html += `<tr style="border-bottom: 1px solid #eee;">`;
        html += `<td style="padding: 10px; font-weight: 600; position: sticky; left: 0; background: white;">${target.name}<br><span style="font-size: 11px; color: #999;">${target.levelName}</span></td>`;

        for (const voter of voters) {
            const voterVotes = votesMatrix[voter.id] || {};
            const grade = voterVotes[target.id] || '-';
            const gd = GRADE_DISPLAY[grade];
            if (gd) {
                html += `<td style="padding: 8px; text-align: center;"><span class="badge ${gd.cls}" style="font-size: 11px;">${gd.text}</span></td>`;
            } else {
                html += `<td style="padding: 8px; text-align: center; color: #ccc;">-</td>`;
            }
        }

        if (res) {
            html += `<td style="padding: 8px; text-align: center; font-weight: 600;">${(res.score || 0).toFixed(1)}</td>`;
            html += `<td style="padding: 8px; text-align: center;"><span class="badge badge-${(res.grade || 'd').toLowerCase()}">${res.grade || '-'}</span></td>`;
        } else {
            html += `<td style="padding: 8px; text-align: center; color: #ccc;">-</td><td style="padding: 8px; text-align: center; color: #ccc;">-</td>`;
        }
        html += `</tr>`;
    }

    html += `</tbody></table>`;
    detailEl.innerHTML = html;
}

// 显示演示数据
function showDemoData() {
    // 演示数据登录
    document.getElementById('login-username').value = '13800000011';
    document.getElementById('login-password').value = '123456';
    login();
}

// 显示Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// ==================== 修改密码 ====================

// 打开修改密码弹窗
function openChangePwdModal() {
    if (!currentUser) return;
    document.getElementById('pwd-old').value = '';
    document.getElementById('pwd-new').value = '';
    document.getElementById('pwd-confirm').value = '';
    document.getElementById('change-pwd-modal').classList.add('active');
}

// 关闭修改密码弹窗
function closeChangePwdModal() {
    document.getElementById('change-pwd-modal').classList.remove('active');
}

// 提交修改密码
async function submitChangePassword() {
    const oldPwd = document.getElementById('pwd-old').value.trim();
    const newPwd = document.getElementById('pwd-new').value.trim();
    const confirmPwd = document.getElementById('pwd-confirm').value.trim();

    if (!oldPwd) { showToast('请输入旧密码'); return; }
    if (!newPwd) { showToast('请输入新密码'); return; }
    if (newPwd.length < 6 || newPwd.length > 20) { showToast('新密码长度必须在6-20位之间'); return; }
    if (!confirmPwd) { showToast('请确认新密码'); return; }
    if (newPwd !== confirmPwd) { showToast('新密码与确认密码不一致'); return; }
    if (oldPwd === newPwd) { showToast('新密码不能与旧密码相同'); return; }

    const resp = await apiChangePassword(currentUser.employeeId, oldPwd, newPwd, confirmPwd);
    if (resp.code !== 200) {
        showToast(resp.message || '修改失败');
        return;
    }

    closeChangePwdModal();
    showToast('密码修改成功！');
}

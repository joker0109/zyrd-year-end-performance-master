// 全局状态
let currentUser = null;
let currentVotes = {};        // 当前编辑的评分
let isSubmitted = false;      // 是否已提交
let isAdmin = false;          // 是否是系统管理员

// 初始化
function init() {
    // 页面加载时无需初始化下拉框，改为用户名密码登录
}

// 登录
function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!username) {
        showToast('请输入用户名');
        return;
    }
    if (!password) {
        showToast('请输入密码');
        return;
    }
    
    // 验证用户名密码
    currentUser = employees.find(e => e.username === username && e.password === password);
    if (!currentUser) {
        showToast('用户名或密码错误');
        return;
    }
    
    // 检查是否是系统管理员
    isAdmin = SYSTEM_ADMINS.includes(currentUser.id);
    
    // 董事长隐藏结果页签，韩雪显示结果页签
    const showResultTab = isAdmin && currentUser.id !== 'E001';
    
    // 加载该用户的投票数据
    const userVotes = getUserVotes(currentUser.id);
    currentVotes = { ...userVotes };
    isSubmitted = Object.keys(userVotes).length > 0;
    
    // 更新UI
    document.getElementById('current-user-name').textContent = currentUser.name;
    document.getElementById('current-user-avatar').textContent = currentUser.name.substring(0, 1);
    
    // 管理员显示结果页和统计页（董事长除外）
    if (showResultTab) {
        document.getElementById('nav-result').style.display = 'block';
        document.getElementById('nav-stats').style.display = 'block';
    }
    
    // 韩雪显示专属的投票详情页签
    if (currentUser.id === 'E021') {
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
        showToast('您已完成投票，无法再次修改');
    }
    
    showToast(`欢迎，${currentUser.name}${isAdmin ? '（管理员）' : ''}`);
}

// 渲染投票列表
function renderVoteList() {
    const targets = getTargetsByLevel(currentUser.id, currentUser.level);
    
    // 经理层
    renderPersonList('list-manager', targets.managers, 2);
    
    // 中层
    renderPersonList('list-middle', targets.middle, 3);
    
    // 普通员工
    renderPersonList('list-staff', targets.staff, 4);
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
    const targets = getTargetsByLevel(currentUser.id, currentUser.level);
    let persons = [];
    let elementId = '';
    
    if (level === 2) {
        persons = targets.managers;
        elementId = 'a-count-manager';
    } else if (level === 3) {
        persons = targets.middle;
        elementId = 'a-count-middle';
    } else if (level === 4) {
        persons = targets.staff;
        elementId = 'a-count-staff';
    }
    
    let aCount = 0;
    persons.forEach(p => {
        if (currentVotes[p.id] === 'A') aCount++;
    });
    
    const limit = A_LIMITS[level];
    const element = document.getElementById(elementId);
    element.textContent = `优秀票: ${aCount}/${limit}`;
    
    // 更新样式
    element.className = 'a-count';
    if (aCount > limit) {
        element.classList.add('warning');
    } else if (aCount === limit) {
        element.classList.add('success');
    }
}

// 更新进度
function updateProgress() {
    const targets = getVoteTargets(currentUser.id, currentUser.level);
    const total = targets.length;
    const voted = Object.keys(currentVotes).length;
    
    document.getElementById('voted-count').textContent = voted;
    document.getElementById('total-count').textContent = total;
    document.getElementById('progress-fill').style.width = `${(voted / total) * 100}%`;
    
    // 更新所有A票计数
    updateACount(2);
    updateACount(3);
    updateACount(4);
}

// 检查提交是否有效
function checkSubmitValid() {
    const targets = getVoteTargets(currentUser.id, currentUser.level);
    const voted = Object.keys(currentVotes).length;
    const warningEl = document.getElementById('warning-msg');
    const submitBtn = document.getElementById('submit-btn');
    
    // 检查是否全部评分
    if (voted < targets.length) {
        warningEl.textContent = `还有 ${targets.length - voted} 人未评分，请完成所有评分`;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        return false;
    }
    
    // 检查A票是否超限
    const targetsByLevel = getTargetsByLevel(currentUser.id, currentUser.level);
    
    for (const level of [2, 3, 4]) {
        let persons = [];
        if (level === 2) persons = targetsByLevel.managers;
        else if (level === 3) persons = targetsByLevel.middle;
        else if (level === 4) persons = targetsByLevel.staff;
        
        let aCount = 0;
        persons.forEach(p => {
            if (currentVotes[p.id] === 'A') aCount++;
        });
        
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
function submitVote() {
    if (!checkSubmitValid()) {
        showToast('请检查评分是否完整');
        return;
    }
    
    // 检查是否已提交过（每人只能提交一次）
    if (isSubmitted) {
        showToast('您已完成投票，无法再次修改');
        return;
    }
    
    // 模拟提交
    isSubmitted = true;
    
    // 保存到mock数据
    mockVotes[currentUser.id] = { ...currentVotes };
    
    // 禁用所有评分选择框
    disableAllGradeSelects();
    
    // 更新按钮状态
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = '✓ 已提交';
    submitBtn.disabled = true;
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
function renderResult() {
    // 获取当前用户的评分结果
    let result = getUserResult(currentUser.id);
    
    // 如果没有预置结果，模拟计算一个
    if (!result) {
        result = calculateScore(currentUser.id, mockVotes);
    }
    
    if (!result) {
        document.getElementById('result-content').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>暂无评分数据</p>
            </div>
        `;
        return;
    }
    
    // 显示总分和等级
    document.getElementById('result-total').textContent = result.totalScore;
    document.getElementById('result-grade').textContent = `${GRADE_CONFIG[result.finalGrade].name}(${result.finalGrade})`;
    
    // 渲染详情表格
    const detailBody = document.getElementById('result-detail');
    detailBody.innerHTML = `
        <tr>
            <td>领导评分(40%)</td>
            <td>${result.leaderVotes.A}</td>
            <td>${result.leaderVotes.B}</td>
            <td>${(result.gradeScores.A * 0.4 + result.gradeScores.B * 0.4).toFixed(1)}</td>
        </tr>
        <tr>
            <td>员工互评(60%)</td>
            <td>${result.staffVotes.A}</td>
            <td>${result.staffVotes.B}</td>
            <td>${(result.gradeScores.A * 0.6 + result.gradeScores.B * 0.6).toFixed(1)}</td>
        </tr>
    `;
    
    // 渲染等级分布
    const distributionEl = document.getElementById('grade-distribution');
    const maxScore = Math.max(...Object.values(result.gradeScores));
    distributionEl.innerHTML = Object.entries(result.gradeScores).map(([grade, score]) => {
        const width = maxScore > 0 ? (score / maxScore) * 100 : 0;
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px;">
                    <span><span class="badge badge-${grade.toLowerCase()}">${grade}</span> ${GRADE_CONFIG[grade].name}</span>
                    <span style="font-weight: 600;">${score}分</span>
                </div>
                <div class="progress-bar" style="height: 8px;">
                    <div class="progress-fill" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // 渲染详细票数
    document.getElementById('vote-detail-stats').innerHTML = `
        <p><strong>领导评分：</strong>A=${result.leaderVotes.A}, B=${result.leaderVotes.B}, C=${result.leaderVotes.C}, D=${result.leaderVotes.D}（共${result.leaderVotes.total}票）</p>
        <p><strong>员工评分：</strong>A=${result.staffVotes.A}, B=${result.staffVotes.B}, C=${result.staffVotes.C}, D=${result.staffVotes.D}（共${result.staffVotes.total}票）</p>
    `;
}

// 渲染统计页
function renderStats() {
    // 统计参评人数
    const targets = employees.filter(e => e.level !== 1);
    const votedCount = Object.keys(mockVotes).length;
    
    document.getElementById('stat-total').textContent = targets.length;
    document.getElementById('stat-voted').textContent = votedCount;
    
    // 统计各等级人数
    let aCount = 0, bCount = 0, cCount = 0, dCount = 0;
    const scoreList = [];
    
    for (const emp of targets) {
        const result = getUserResult(emp.id) || calculateScore(emp.id, mockVotes);
        if (result) {
            if (result.finalGrade === 'A') aCount++;
            else if (result.finalGrade === 'B') bCount++;
            else if (result.finalGrade === 'C') cCount++;
            else if (result.finalGrade === 'D') dCount++;
            
            scoreList.push({
                id: emp.id,
                name: emp.name,
                department: emp.department,
                level: emp.level,
                levelName: LEVEL_NAMES[emp.level],
                score: result.totalScore,
                grade: result.finalGrade
            });
        }
    }
    
    document.getElementById('stat-a').textContent = aCount;
    document.getElementById('stat-b').textContent = bCount;
    
    // 渲染公司分布
    const distributionEl = document.getElementById('company-distribution');
    const total = targets.length || 1;
    distributionEl.innerHTML = ['A', 'B', 'C', 'D'].map(grade => {
        let count = 0;
        if (grade === 'A') count = aCount;
        else if (grade === 'B') count = bCount;
        else if (grade === 'C') count = cCount;
        else if (grade === 'D') count = dCount;
        const width = (count / total) * 100;
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px;">
                    <span><span class="badge badge-${grade.toLowerCase()}">${grade}</span> ${GRADE_CONFIG[grade].name}</span>
                    <span style="font-weight: 600;">${count}人 (${(count/total*100).toFixed(1)}%)</span>
                </div>
                <div class="progress-bar" style="height: 8px;">
                    <div class="progress-fill" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // 渲染得分排名
    scoreList.sort((a, b) => b.score - a.score);
    const rankingEl = document.getElementById('score-ranking');
    rankingEl.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: center;">排名</th>
                    <th style="padding: 12px; text-align: left;">姓名</th>
                    <th style="padding: 12px; text-align: left;">部门</th>
                    <th style="padding: 12px; text-align: center;">层级</th>
                    <th style="padding: 12px; text-align: center;">得分</th>
                    <th style="padding: 12px; text-align: center;">评级</th>
                </tr>
            </thead>
            <tbody>
                ${scoreList.map((item, index) => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; text-align: center; font-weight: 600;">${index + 1}</td>
                        <td style="padding: 12px;">${item.name}</td>
                        <td style="padding: 12px; color: #666;">${item.department}</td>
                        <td style="padding: 12px; text-align: center;">${item.levelName}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 600;">${item.score.toFixed(1)}</td>
                        <td style="padding: 12px; text-align: center;">
                            <span class="badge badge-${item.grade.toLowerCase()}">${item.grade}</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 渲染韩雪专属的投票详情页面
function renderHanxueVoteDetail() {
    const detailEl = document.getElementById('all-votes-detail');
    const voters = employees.filter(e => e.level !== 1); // 所有参与投票的人
    const targets = employees.filter(e => e.level !== 1); // 所有被投票的人
    
    // 构建表格：行为被投票人，列为投票人
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
        const result = getUserResult(target.id) || calculateScore(target.id, mockVotes);
        html += `<tr style="border-bottom: 1px solid #eee;">`;
        html += `<td style="padding: 10px; font-weight: 600; position: sticky; left: 0; background: white;">${target.name}<br><span style="font-size: 11px; color: #999;">${LEVEL_NAMES[target.level]}</span></td>`;
        
        for (const voter of voters) {
            const votes = mockVotes[voter.id] || {};
            const grade = votes[target.id] || '-';
            let gradeClass = '';
            let displayText = grade;
            if (grade === 'A') { gradeClass = 'badge-a'; displayText = '优秀'; }
            else if (grade === 'B') { gradeClass = 'badge-b'; displayText = '良好'; }
            else if (grade === 'C') { gradeClass = 'badge-c'; displayText = '合格'; }
            else if (grade === 'D') { gradeClass = 'badge-d'; displayText = '不合格'; }
            
            if (grade !== '-') {
                html += `<td style="padding: 8px; text-align: center;"><span class="badge ${gradeClass}" style="font-size: 11px;">${displayText}</span></td>`;
            } else {
                html += `<td style="padding: 8px; text-align: center; color: #ccc;">-</td>`;
            }
        }
        
        if (result) {
            html += `<td style="padding: 8px; text-align: center; font-weight: 600;">${result.totalScore.toFixed(1)}</td>`;
            html += `<td style="padding: 8px; text-align: center;"><span class="badge badge-${result.finalGrade.toLowerCase()}">${result.finalGrade}</span></td>`;
        } else {
            html += `<td style="padding: 8px; text-align: center; color: #ccc;">-</td>`;
            html += `<td style="padding: 8px; text-align: center; color: #ccc;">-</td>`;
        }
        html += `</tr>`;
    }
    
    html += `</tbody></table>`;
    detailEl.innerHTML = html;
}

// 显示演示数据
function showDemoData() {
    // 演示数据登录
    document.getElementById('login-username').value = 'jia';
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
function submitChangePassword() {
    const oldPwd = document.getElementById('pwd-old').value.trim();
    const newPwd = document.getElementById('pwd-new').value.trim();
    const confirmPwd = document.getElementById('pwd-confirm').value.trim();

    if (!oldPwd) { showToast('请输入旧密码'); return; }
    if (!newPwd) { showToast('请输入新密码'); return; }
    if (newPwd.length < 6 || newPwd.length > 20) { showToast('新密码长度必须在6-20位之间'); return; }
    if (!confirmPwd) { showToast('请确认新密码'); return; }
    if (newPwd !== confirmPwd) { showToast('新密码与确认密码不一致'); return; }
    if (oldPwd === newPwd) { showToast('新密码不能与旧密码相同'); return; }

    // 校验旧密码（前端模拟，实际项目中应调用后端接口）
    if (oldPwd !== currentUser.password) {
        showToast('旧密码错误');
        return;
    }

    // 更新内存中的密码（模拟）
    currentUser.password = newPwd;
    const emp = employees.find(e => e.id === currentUser.id);
    if (emp) emp.password = newPwd;

    closeChangePwdModal();
    showToast('密码修改成功！');
}

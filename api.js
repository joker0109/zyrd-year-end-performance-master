/**
 * API 请求工具层
 * 统一封装与后端的 HTTP 通信
 * 支持：Chrome / Safari / 360浏览器（webkit内核模式）
 */

const API_BASE = 'http://192.168.3.71:8080/api';

/**
 * 请求超时封装（兼容所有浏览器）
 */
function fetchWithTimeout(url, options, timeout) {
    if (timeout === void 0) { timeout = 10000; }
    return new Promise(function(resolve, reject) {
        var timer = setTimeout(function() {
            reject(new Error('request timeout'));
        }, timeout);
        fetch(url, options).then(function(res) {
            clearTimeout(timer);
            resolve(res);
        }).catch(function(err) {
            clearTimeout(timer);
            reject(err);
        });
    });
}

/**
 * 基础请求函数
 */
async function request(method, path, data) {
    var url = API_BASE + path;
    var headers = { 'Content-Type': 'application/json' };

    // 自动注入 Token
    var token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    var options = { method: method, headers: headers };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        var resp = await fetchWithTimeout(url, options, 10000);
        var json = await resp.json();
        // Token 失效时自动清除本地存储
        if (json.code === 401) {
            localStorage.removeItem('token');
        }
        return json; // { code, message, data }
    } catch (e) {
        console.error('[API Error]', method, path, e);
        var msg = e.message === 'request timeout'
            ? '请求超时，请检查网络连接'
            : '网络请求失败，请检查后端服务是否启动';
        return { code: 500, message: msg, data: null };
    }
}

// ============ 员工相关接口 ============

/**
 * 登录（手机号 + 密码）
 * @returns {code, message, data: LoginVO}
 */
async function apiLogin(phone, password) {
    return request('POST', '/employee/login', { phone, password });
}

/**
 * 退出登录
 */
async function apiLogout() {
    return request('POST', '/employee/logout');
}

/**
 * 获取当前登录用户信息（页面刷新后会话恢复用）
 * @returns {code, message, data: LoginVO}
 */
async function apiGetCurrentUser() {
    return request('GET', '/employee/me');
}

/**
 * 获取所有参评员工列表
 * @returns {code, message, data: [{id, name, department, level}]}
 */
async function apiGetEmployeeList() {
    return request('GET', '/employee/list');
}

/**
 * 获取某员工的投票目标列表
 * @returns {code, message, data: [{id, name, department, level}]}
 */
async function apiGetVoteTargets(voterId) {
    return request('GET', `/employee/vote-targets?voterId=${voterId}`);
}

/**
 * 修改密码
 * @returns {code, message, data: null}
 */
async function apiChangePassword(employeeId, oldPassword, newPassword, confirmPassword) {
    return request('POST', '/employee/change-password', {
        employeeId, oldPassword, newPassword, confirmPassword
    });
}

// ============ 投票相关接口 ============

/**
 * 提交投票
 * @param {string} voterId - 投票人 ID
 * @param {Object} votes   - { targetId: grade, ... }
 * @returns {code, message, data: null}
 */
async function apiSubmitVotes(voterId, votes) {
    return request('POST', '/vote/submit', { voterId, votes });
}

/**
 * 查询某员工的评分结果（支持按年查询）
 * @param {string} employeeId - 员工ID
 * @param {number|null} year  - 绩效年份（不传则默认当前绩效年）
 * @returns {code, message, data: VoteResultVO}
 */
async function apiGetResult(employeeId, year) {
    var qs = year != null ? '&year=' + year : '';
    return request('GET', `/vote/result?employeeId=${employeeId}${qs}`);
}

/**
 * 获取全公司统计数据（韩雪支持按年查询）
 * @param {number|null} year - 绩效年份（不传则默认当前绩效年）
 * @returns {code, message, data: StatisticsVO}
 */
async function apiGetStatistics(year) {
    var qs = year != null ? '?year=' + year : '';
    return request('GET', '/vote/statistics' + qs);
}

/**
 * 获取投票详情矩阵（韩雪专属，支持按年查询）
 * @param {number|null} year - 绩效年份前不传则默认当前绩效年）
 * @returns {code, message, data: VoteDetailVO}
 */
async function apiGetVoteDetail(year) {
    var qs = year != null ? '?year=' + year : '';
    return request('GET', '/vote/detail' + qs);
}

/**
 * 获取历史绩效年份列表（韩雪专属）
 * @returns {code, message, data: [2025, 2024, ...]}
 */
async function apiGetAvailableYears() {
    return request('GET', '/vote/years');
}

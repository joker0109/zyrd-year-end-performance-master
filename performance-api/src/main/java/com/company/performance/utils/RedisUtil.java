package com.company.performance.utils;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Redis 工具类 - 管理登录 Session
 */
@Component
public class RedisUtil {

    /** Redis key 前缀 */
    private static final String LOGIN_PREFIX = "perf:login:";

    private final StringRedisTemplate redisTemplate;

    public RedisUtil(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 存储登录 Token，设置过期时间
     *
     * @param token         JWT Token
     * @param employeeId    员工ID
     * @param expireSeconds 过期秒数（如 7200 = 2小时）
     */
    public void setLoginSession(String token, String employeeId, long expireSeconds) {
        redisTemplate.opsForValue().set(LOGIN_PREFIX + token, employeeId, expireSeconds, TimeUnit.SECONDS);
    }

    /**
     * 获取 Token 对应的 employeeId，不存在或已过期返回 null
     */
    public String getLoginSession(String token) {
        return redisTemplate.opsForValue().get(LOGIN_PREFIX + token);
    }

    /**
     * 删除 Token（退出登录）
     */
    public void deleteLoginSession(String token) {
        redisTemplate.delete(LOGIN_PREFIX + token);
    }
}

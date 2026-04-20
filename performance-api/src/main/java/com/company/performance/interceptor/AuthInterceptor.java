package com.company.performance.interceptor;

import com.company.performance.utils.JwtUtil;
import com.company.performance.utils.RedisUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * 登录鉴权拦截器
 * 验证 Authorization 请求头中的 Bearer Token，并校验 Redis 中的 Session 是否有效
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final RedisUtil redisUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        // OPTIONS 预检请求直接放行（CORS）
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 登录接口放行（不需要 Token）
        String servletPath = request.getServletPath();
        String requestURI = request.getRequestURI();
        String contextPath = request.getContextPath();
        String actualPath = requestURI.startsWith(contextPath) ? requestURI.substring(contextPath.length()) : requestURI;
        if ("/employee/login".equals(servletPath) || "/employee/login".equals(actualPath)) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeUnauthorized(response, "未登录，请先登录");
            return false;
        }

        String token = authHeader.substring(7);

        // 1. 验证 JWT 签名与有效期
        String employeeId = jwtUtil.getEmployeeId(token);
        if (employeeId == null) {
            writeUnauthorized(response, "Token 无效或已过期");
            return false;
        }

        // 2. 验证 Redis 中的 Session（主动注销时 Redis key 会被删除）
        String cachedId = redisUtil.getLoginSession(token);
        if (cachedId == null) {
            writeUnauthorized(response, "登录已过期，请重新登录");
            return false;
        }

        // 将 employeeId 存入请求属性，供后续 Controller 使用
        request.setAttribute("currentEmployeeId", employeeId);
        return true;
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":401,\"message\":\"" + message + "\",\"data\":null}");
    }
}

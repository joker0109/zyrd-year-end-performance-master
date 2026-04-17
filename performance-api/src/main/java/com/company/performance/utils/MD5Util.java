package com.company.performance.utils;

import cn.hutool.crypto.digest.DigestUtil;

/**
 * MD5加密工具类
 */
public class MD5Util {

    /**
     * MD5加密
     */
    public static String encrypt(String str) {
        if (str == null || str.isEmpty()) {
            return null;
        }
        return DigestUtil.md5Hex(str);
    }

    /**
     * 校验密码
     */
    public static boolean verify(String inputPassword, String storedPassword) {
        if (inputPassword == null || storedPassword == null) {
            return false;
        }
        return encrypt(inputPassword).equals(storedPassword);
    }
}

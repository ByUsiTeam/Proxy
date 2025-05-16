package miao.byusi.hp.server.utils;

public class UserCheckUtil {
    // 增强版邮箱验证正则（排除gmail）
    private static final String EMAIL_REGEX = 
        "^(?!(?:[^@]*@)(?:gmail\\.com|googlemail\\.com)(?:\\b|$))" +  // Gmail域名排除
        "[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" +           // 本地部分
        "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";                    // 域名部分

    // 邮箱格式验证（自动排除Gmail）
    public static boolean checkUsername(String email) {
        return email.matches(EMAIL_REGEX);
    }

    // 域名验证（可选保留）
    public static boolean checkDomain(String str) {
        // 排除gmail相关域名
        String domainRegex = "^(?!.*gmail\\.com$)(?!.*googlemail\\.com$)" + 
                           "[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$";
        return str.matches(domainRegex);
    }
}
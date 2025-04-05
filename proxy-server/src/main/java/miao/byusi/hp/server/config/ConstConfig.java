package miao.byusi.hp.server.config;

import cn.hserver.core.server.util.PropUtil;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class ConstConfig {
    //注册模式：-1免费关闭注册 0 免费注册 >0 每天24小时时间内注册(小时数)
    public static int TIME = 0;
    public static int PROXY_SIZE = Integer.parseInt(PropUtil.getInstance().get("proxy.size", "3"));
    public static String TIPS = "禁止穿透违法程序，免费不易 请大家谅解，ByUsi改编发行";
    public static String REG_TOKEN = UUID.randomUUID().toString();
    /**
     * 通用注册码
     */
    public static String REG_CODE = UUID.randomUUID().toString();
    /**
     * 邮箱验证码
     */
    // 替换原有的EMAIL_CODE缓存
    public static Cache<String, String> VERIFY_TOKENS = 
        Caffeine.newBuilder()
            .maximumSize(10_000)
            .build();
    
    // 新增域名配置
    public static final String DOMAIN = "https://pro.byusi.cn";
    /**
     * 调用者IP5分钟一次
     */
    public static final Cache<String, String> EMAIL_IP = CacheBuilder.newBuilder().expireAfterAccess(5, TimeUnit.MINUTES).build();

}

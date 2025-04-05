package miao.byusi.hp.server.queue;

import cn.hserver.core.ioc.annotation.queue.QueueHandler;
import cn.hserver.core.ioc.annotation.queue.QueueListener;
import miao.byusi.hp.server.config.ConstConfig;
import miao.byusi.hp.server.utils.MailUtils;

import java.util.Random;

@QueueListener(queueName = "EMAIL")
public class MailQueue {
    Random randObj = new Random();

    @QueueHandler
    public void send(String username) {
        String code = generateCode4();
        if (MailUtils.sendMail(username, "ByUsi Proxy", "你的验证码为:" + code)) {
            ConstConfig.EMAIL_CODE.put(username, code);
        }else {
            ConstConfig.EMAIL_IP.invalidate(username);
        }
    }

    @QueueHandler
    public void send(String email) {
        // 生成验证token（示例使用UUID+时间戳）
        String token = UUID.randomUUID().toString() + System.currentTimeMillis();
        String verifyUrl = ConstConfig.DOMAIN + "/verify/email?token=" + token;
        
        if (MailUtils.sendVerifyEmail(email, verifyUrl)) {
            // 存储token与邮箱的对应关系，有效期1小时
            ConstConfig.VERIFY_TOKENS.put(token, email, 3600);
        } else {
            ConstConfig.EMAIL_IP.invalidate(email);
        }
    }

    // 移除不再使用的generateCode4方法
}

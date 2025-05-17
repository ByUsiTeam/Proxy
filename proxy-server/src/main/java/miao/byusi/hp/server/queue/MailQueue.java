package miao.byusi.hp.server.queue;

import cn.hserver.core.ioc.annotation.queue.QueueHandler;
import cn.hserver.core.ioc.annotation.queue.QueueListener;
import miao.byusi.hp.server.config.ConstConfig;
import miao.byusi.hp.server.utils.MailUtils;

import java.util.Random;

@QueueListener(queueName = "EMAIL")
public class MailQueue {
    private final Random randObj = new Random();

    @QueueHandler
    public void sendVerificationCode(String username) {
        String code = generateCode4();
        String htmlContent = MailUtils.buildVerificationEmail(code);
        
        if (MailUtils.sendHtmlMail(username, "ByUsi Proxy 安全验证码", htmlContent)) {
            ConstConfig.EMAIL_CODE.put(username, code);
        } else {
            ConstConfig.EMAIL_IP.invalidate(username);
        }
    }

    private String generateCode4() {
        return String.format("%04d", randObj.nextInt(10000));
    }
}
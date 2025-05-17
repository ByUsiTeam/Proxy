package miao.byusi.hp.server.utils;

import cn.hserver.core.server.util.PropUtil;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.util.stream.Collectors;

public class MailUtils {
    // 缓存邮件配置
    private static final Properties SMTP_PROPS = initSmtpProps();
    private static final Authenticator AUTHENTICATOR = initAuthenticator();
    private static final String FROM_ADDRESS = PropUtil.getInstance().get("mail.username");
    private static final String EMAIL_TEMPLATE_PATH = "templates/email/verification-code.html";

    private static Properties initSmtpProps() {
        Properties props = new Properties();
        props.setProperty("mail.smtp.auth", "true");
        props.setProperty("mail.host", PropUtil.getInstance().get("mail.host"));
        props.setProperty("mail.smtp.port", PropUtil.getInstance().get("mail.port"));
        props.setProperty("mail.transport.protocol", "smtp");
        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.setProperty("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        return props;
    }

    private static Authenticator initAuthenticator() {
        return new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(
                    PropUtil.getInstance().get("mail.username"),
                    PropUtil.getInstance().get("mail.password")
                );
            }
        };
    }

    /**
     * 通用邮件发送方法
     * @param email    收件地址
     * @param subject  邮件主题
     * @param content  邮件内容（支持HTML）
     * @param isHtml   是否为HTML内容
     */
    public static boolean sendMail(String email, String subject, String content, boolean isHtml) {
        try {
            Session session = Session.getInstance(SMTP_PROPS, AUTHENTICATOR);
            MimeMessage message = new MimeMessage(session);
            
            // 设置发件人格式："显示名称 <实际邮箱>"
            message.setFrom(new InternetAddress(
                String.format("ByUsi Proxy Service <%s>", FROM_ADDRESS)
            ));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
            message.setSubject(subject);
            
            // 设置内容类型
            message.setContent(content, 
                isHtml ? "text/html; charset=utf-8" : "text/plain; charset=utf-8");
            
            Transport.send(message);
            return true;
        } catch (Exception e) {
            handleMailException(e);
            return false;
        }
    }

    /**
     * 专用HTML邮件发送（兼容旧代码）
     */
    public static boolean sendHtmlMail(String email, String subject, String htmlContent) {
        return sendMail(email, subject, htmlContent, true);
    }

    /**
     * 加载邮件模板并替换变量
     */
    public static String buildVerificationEmail(String verificationCode) {
        try (InputStream is = MailUtils.class.getClassLoader()
                .getResourceAsStream(EMAIL_TEMPLATE_PATH);
             BufferedReader reader = new BufferedReader(
                new InputStreamReader(is, StandardCharsets.UTF_8))) {
            
            String template = reader.lines().collect(Collectors.joining("\n"));
            return template.replace("{{CODE}}", verificationCode);
            
        } catch (IOException | NullPointerException e) {
            throw new RuntimeException("加载邮件模板失败: " + e.getMessage(), e);
        }
    }

    private static void handleMailException(Exception e) {
        System.err.println("邮件发送失败: " + e.getMessage());
        if (e instanceof AuthenticationFailedException) {
            System.err.println("认证失败，请检查：\n1. 用户名/密码是否正确\n2. 是否开启SMTP服务\n3. 是否使用授权码");
        } else if (e.getMessage().contains("Could not connect to SMTP host")) {
            System.err.println("连接失败，请检查：\n1. 网络状态\n2. SMTP主机/端口配置\n3. 防火墙设置");
        }
    }

    // 保留原始方法保持兼容性
    public static boolean sendMail(String email, String subject, String emailMsg) {
        return sendMail(email, subject, emailMsg, true);
    }
}
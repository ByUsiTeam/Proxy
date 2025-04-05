package miao.byusi.hp.server.utils;

import cn.hserver.core.server.util.PropUtil;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

public class MailUtils {
    // 新增邮件模板生成方法
    private static String buildVerifyEmailContent(String verifyUrl) {
        return "<!DOCTYPE html>" +
                "<html style='font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 20px auto; background: #f8f9fa; border-radius: 8px;'>" +
                "  <div style='padding: 40px 30px; text-align: center;'>" +
                "    <h2 style='color: #2c3e50; margin-bottom: 30px;'>邮箱验证通知</h2>" +
                "    <p style='color: #6c757d; line-height: 1.6;'>请点击下方按钮完成邮箱验证：</p>" +
                "    <a href='" + verifyUrl + "' style='" +
                "      display: inline-block;" +
                "      padding: 12px 30px;" +
                "      background: #4a90e2;" +
                "      color: white;" +
                "      text-decoration: none;" +
                "      border-radius: 25px;" +
                "      margin: 25px 0;" +
                "      transition: all 0.3s;" +
                "      box-shadow: 0 2px 5px rgba(74,144,226,0.3);" +
                "    '>立即验证</a>" +
                "    <div style='color: #868e96; font-size: 0.9em; margin-top: 30px;'>" +
                "      <p>该链接24小时内有效</p>" +
                "      <p>若未请求验证，请忽略本邮件</p>" +
                "    </div>" +
                "  </div>" +
                "</div>" +
                "</html>";
    }

    // 修改原有发送方法
    public static boolean sendVerifyEmail(String email, String verifyUrl) {
        String subject = "【ByUsi Proxy】邮箱验证请求";
        String emailContent = buildVerifyEmailContent(verifyUrl);
        return sendMail(email, subject, emailContent);
    }
    /**
     *
     * @param email     接收者邮箱
     * @param subject   邮件主题
     * @param emailMsg  邮件内容
     * @throws AddressException
     * @throws MessagingException
     */
    public static boolean sendMail(String email, String subject,String emailMsg) {
        try {
            //创建配置文件
            final Properties props = new Properties();
            // 发送服务器需要身份验证
            props.setProperty("mail.smtp.auth", "true");
            // 设置邮件服务器主机名
            props.setProperty("mail.host", PropUtil.getInstance().get("mail.host"));
            props.setProperty("mail.smtp.port", PropUtil.getInstance().get("mail.port"));
            props.setProperty("mail.transport.protocol", "smtp");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            // 服务端口号
            props.setProperty("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            Authenticator auth = new Authenticator() {
                public PasswordAuthentication getPasswordAuthentication() {
                    //return new PasswordAuthentication("用户名", "密码");
                    //注意qq邮箱需要去qq邮箱的设置中获取授权码，并将授权码作为密码来填写
                    return new PasswordAuthentication(PropUtil.getInstance().get("mail.username"), PropUtil.getInstance().get("mail.password"));
                }
            };
            //创建session域
            Session session = Session.getInstance(props, auth);
            Message message = new MimeMessage(session);
            //设置邮件发送者,与PasswordAuthentication中的邮箱一致即可
            message.setFrom(new InternetAddress("ByUsi Proxy<"+PropUtil.getInstance().get("mail.username")+">"));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
            //设置邮件主题
            message.setSubject(subject);
            //设置邮件内容
            message.setContent(emailMsg, "text/html;charset=utf-8");
            //发送邮件
            Transport.send(message);
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }

    public static void main(String[] args) {
        sendMail("1417262058@qq.com","a","b");
    }
}

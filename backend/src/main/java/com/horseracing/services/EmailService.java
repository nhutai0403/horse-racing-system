package com.horseracing.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String activationLink, String token) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String htmlMsg = "<h3>Chào " + fullName + ",</h3>"
                    + "<p>Cảm ơn bạn đã đăng ký tài khoản tại Hệ thống quản lý đua ngựa.</p>"
                    + "<p>Để kích hoạt tài khoản của bạn, vui lòng nhập mã OTP bên dưới trên trang xác thực hoặc nhấp vào liên kết sau:</p>"
                    + "<h2 style='color: #0f5132; background: #e2f0d9; display: inline-block; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;'>" + token + "</h2>"
                    + "<p style='margin-top: 20px;'><a href='" + activationLink + "?token=" + token + "' style='display:inline-block; background-color:#198754; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;'>Kích hoạt tài khoản</a></p>"
                    + "<p style='color: #6c757d; font-size: 0.9em; margin-top: 15px;'>Mã xác nhận và liên kết này sẽ hết hạn trong vòng 15 phút.</p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Hệ thống quản lý đua ngựa.</p>";

            helper.setTo(toEmail);
            helper.setSubject("Kích hoạt tài khoản của bạn - Horse Racing Management");
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Email kích hoạt đã được gửi thành công đến {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email kích hoạt đến {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String htmlMsg = "<h3>Chào " + fullName + ",</h3>"
                    + "<p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại Hệ thống quản lý đua ngựa.</p>"
                    + "<p>Vui lòng nhập mã OTP dưới đây để tiến hành thiết lập lại mật khẩu của bạn:</p>"
                    + "<h2 style='color: #856404; background: #fff3cd; display: inline-block; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;'>" + token + "</h2>"
                    + "<p style='color: #6c757d; font-size: 0.9em; margin-top: 15px;'>Mã xác nhận này sẽ hết hạn trong vòng 10 phút.</p>"
                    + "<p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi để được trợ giúp bảo mật tài khoản.</p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Hệ thống quản lý đua ngựa.</p>";

            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu khôi phục mật khẩu - Horse Racing Management");
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
            log.info("Email khôi phục mật khẩu đã được gửi thành công đến {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email khôi phục mật khẩu đến {}: {}", toEmail, e.getMessage());
        }
    }
}

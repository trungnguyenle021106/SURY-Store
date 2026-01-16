using Identity.Application.Common.Interfaces;
using Identity.Infrastructure.Common;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options; // Cần thêm thư viện này
using MimeKit;

namespace Identity.Infrastructure.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly MailSettings _mailSettings;

        // Inject MailSettings thông qua Constructor
        public EmailSender(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();

            // 1. Thiết lập người gửi (Lấy từ _mailSettings)
            email.From.Add(new MailboxAddress(_mailSettings.DisplayName, _mailSettings.Mail));

            // 2. Thiết lập người nhận
            email.To.Add(new MailboxAddress("", toEmail));

            // 3. Tiêu đề
            email.Subject = subject;

            // 4. Nội dung (HTML)
            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = body;
            email.Body = bodyBuilder.ToMessageBody();

            using (var smtp = new SmtpClient())
            {
                try
                {
                    // 5. Kết nối tới Server (Lấy Host và Port từ config)
                    await smtp.ConnectAsync(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);

                    // 6. Xác thực (Lấy Mail và Password từ config)
                    await smtp.AuthenticateAsync(_mailSettings.Mail, _mailSettings.Password);

                    // 7. Gửi
                    await smtp.SendAsync(email);
                }
                catch (Exception ex)
                {
                    // Ghi log lỗi tại đây nếu cần thiết
                    // File.AppendAllText("mail_log.txt", ex.Message);
                    throw; // Ném lỗi ra để Controller biết
                }
                finally
                {
                    // 8. Ngắt kết nối sạch sẽ
                    await smtp.DisconnectAsync(true);
                    smtp.Dispose();
                }
            }
        }
    }
}
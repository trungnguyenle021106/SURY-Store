using BuildingBlocks.Core.Exceptions;
using FluentValidation;
using Identity.Application.Common.Interfaces;
using Identity.Application.Common.Models;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text;
using System.Text.Encodings.Web;


namespace Identity.Infrastructure.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly ITokenProvider _tokenProvider;
        private readonly IIdentityDbContext _dbContext;
        private readonly IEmailSender _emailSender;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDistributedCache _cache;

        public IdentityService(
            UserManager<ApplicationUser> userManager,
            ITokenProvider tokenProvider,
            IIdentityDbContext dbContext,
            RoleManager<IdentityRole<Guid>> roleManager,
            IDistributedCache cache,
            IEmailSender emailSender,
            IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _tokenProvider = tokenProvider;
            _dbContext = dbContext;
            _roleManager = roleManager;
            _cache = cache;
            _emailSender = emailSender;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> RegisterUserAsync(string fullName, string email, string password, string role)
        {
            string cacheKey = $"spam_block:{email.ToLower()}";
            string? isBlocked = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(isBlocked))
            {
                throw new DomainException(
                     $"Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư (bao gồm Spam) hoặc quay lại sau 24 giờ.");
            }

            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser != null && !existingUser.EmailConfirmed)
            {
                await SendTokenVerifyEmail(existingUser, email, cacheKey);
                throw new DomainException(
                    $"Email {email} đã được đăng ký nhưng chưa xác nhận. " +
                    $"Vui lòng kiểm tra email để kích hoạt tài khoản.");
            }

            if (existingUser != null)
                throw new DomainException($"Email {email} đã được sử dụng.");

            var user = new ApplicationUser(fullName, email);
            var result = await _userManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new DomainException($"Đăng ký thất bại: {errors}");
            }

            if (await _roleManager.RoleExistsAsync(role))
            {
                await _userManager.AddToRoleAsync(user, role);
            }
            else
            {
                throw new DomainException($"Lỗi hệ thống: Role '{role}' chưa được khởi tạo.");
            }
            await SendTokenVerifyEmail(user, email, cacheKey);
            return user.Id;
        }

        private async Task SendTokenVerifyEmail(ApplicationUser user, string email, string cacheKey)
        {
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            var baseUrl = $"https://sury.store/api";

            var callbackUrl = $"{baseUrl}/auth/verify-email?userId={user.Id}&code={code}";

            await _emailSender.SendEmailAsync(email, "Xác nhận tài khoản",
                $"Vui lòng <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>bấm vào đây</a> để kích hoạt tài khoản.");
            await SetSpamBlockAsync(cacheKey);
        }

        private async Task SetSpamBlockAsync(string key)
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            };
            await _cache.SetStringAsync(key, "1", options);
        }

        public async Task ConfirmEmailAsync(string userId, string code)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new ValidationException("User không tồn tại.");

            // Decode token lại thành dạng gốc
            var decodedCode = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));

            var result = await _userManager.ConfirmEmailAsync(user, decodedCode);
            if (!result.Succeeded)
            {
                throw new ValidationException("Xác thực email thất bại hoặc token đã hết hạn.");
            }
        }

        public async Task<AuthenticationResult> LoginAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, password))
            {
                throw new ValidationException("Thông tin đăng nhập không chính xác.");
            }

            if (!user.EmailConfirmed)
            {
                string cacheKey = $"spam_block:{email.ToLower()}";
                string? isBlocked = await _cache.GetStringAsync(cacheKey);

                if (!string.IsNullOrEmpty(isBlocked))
                {
                    throw new DomainException($"Email {email} đã đăng ký quá nhiều lần. Vui lòng quay lại sau 24 giờ.");
                }

                await SendTokenVerifyEmail(user, email, cacheKey);

                throw new DomainException(
                    $"Email {email} đã được đăng ký nhưng chưa xác nhận. " +
                    $"Hệ thống vừa gửi lại email kích hoạt mới. Vui lòng kiểm tra.");
            }

            var accessToken = await _tokenProvider.GenerateAccessToken(user);
            var refreshTokenString = _tokenProvider.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken(
                userId: user.Id,
                token: refreshTokenString,
                expiryDate: DateTime.UtcNow.AddDays(7)
            );

            await _dbContext.RefreshTokens.AddAsync(refreshTokenEntity);

            return new AuthenticationResult(accessToken, refreshTokenString);
        }

        public async Task<AuthenticationResult> RefreshTokenAsync(string token)
        {
            var existingToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == token);

            if (existingToken == null)
            {
                throw new ("Refresh Token không tồn tại.");
            }

            if (existingToken.IsRevoked)
            {
                throw new UnauthorizedAccessException("Token đã bị thu hồi và không thể sử dụng.");
            }

            if (existingToken.ExpiryDate < DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }

            var user = await _userManager.FindByIdAsync(existingToken.UserId.ToString());
            if (user == null)
            {
                throw new DomainException("Người dùng không tồn tại.");
            }

            existingToken.Revoke();
            _dbContext.RefreshTokens.Update(existingToken);

            var newAccessToken = await _tokenProvider.GenerateAccessToken(user);
            var newRefreshTokenString = _tokenProvider.GenerateRefreshToken();

            var newRefreshTokenEntity = new RefreshToken(
                userId: user.Id,
                token: newRefreshTokenString,
                expiryDate: DateTime.UtcNow.AddDays(7)
            );

            await _dbContext.RefreshTokens.AddAsync(newRefreshTokenEntity);

            return new AuthenticationResult(newAccessToken, newRefreshTokenString);
        }

        public async Task RevokeTokenAsync(string token)
        {
            var refreshToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == token);

            if (refreshToken == null)
            {
                throw new ValidationException("Refresh Token không tồn tại.");
            }

            refreshToken.Revoke();

            _dbContext.RefreshTokens.Update(refreshToken);
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                throw new DomainException("Email không tồn tại trong hệ thống.");
            }

            if (!user.EmailConfirmed)
            {
                string cacheVerifyKey = $"spam_block:{email.ToLower()}";
                string? isBlocked = await _cache.GetStringAsync(cacheVerifyKey);

                if (!string.IsNullOrEmpty(isBlocked))
                {
                    throw new DomainException($"Email {email} đã đăng ký quá nhiều lần. Vui lòng quay lại sau 24 giờ.");
                }

                await SendTokenVerifyEmail(user, email, cacheVerifyKey);

                throw new DomainException(
                    $"Email {email} đã được đăng ký nhưng chưa xác nhận. " +
                    $"Hệ thống vừa gửi lại email kích hoạt mới. Vui lòng kiểm tra.");
            }

            string cacheKey = $"forgot_pass_cooldown:{email.ToLower()}";
            string? isCooldown = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(isCooldown))
            {
                throw new DomainException("Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra email hoặc thử lại sau 24 giờ.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            // Coi lại đoạn này
            string frontendUrl = "https://sury.store";
            string resetLink = $"{frontendUrl}/auth/reset-password?email={email}&token={encodedToken}";

            await _emailSender.SendEmailAsync(email, "Đặt lại mật khẩu",
                $"Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng <a href='{HtmlEncoder.Default.Encode(resetLink)}'>bấm vào đây</a> để đặt mật khẩu mới.<br/>Link chỉ có hiệu lực trong 5 phút.");

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            };
            await _cache.SetStringAsync(cacheKey, "1", options);
        }

        public async Task ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                throw new DomainException("Email không tồn tại.");
            }

            try
            {
                var decodedBytes = WebEncoders.Base64UrlDecode(token);
                var decodedToken = Encoding.UTF8.GetString(decodedBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, newPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new DomainException($"Đặt lại mật khẩu thất bại: {errors}");
                }
            }
            catch (FormatException)
            {
                throw new DomainException("Token xác thực bị lỗi hoặc không đúng định dạng.");
            }
        }
    }
}
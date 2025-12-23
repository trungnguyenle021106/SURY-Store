using FluentValidation;
using Identity.Application.Common.Interfaces;
using Identity.Application.Common.Models;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;


namespace Identity.Infrastructure.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly ITokenProvider _tokenProvider; 
        private readonly IIdentityDbContext _dbContext; 

        public IdentityService(
            UserManager<ApplicationUser> userManager,
            ITokenProvider tokenProvider,
            IIdentityDbContext dbContext,
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            _userManager = userManager;
            _tokenProvider = tokenProvider;
            _dbContext = dbContext;
            _roleManager = roleManager;
        }

        public async Task<Guid> RegisterUserAsync(string fullName, string email, string password, string role)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                throw new ValidationException($"Email {email} đã được sử dụng.");

            var user = new ApplicationUser(fullName, email);
            var result = await _userManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ValidationException($"Đăng ký thất bại: {errors}");
            }

            if (await _roleManager.RoleExistsAsync(role))
            {
                await _userManager.AddToRoleAsync(user, role);
            }
            else
            {
                throw new ValidationException($"Lỗi hệ thống: Role '{role}' chưa được khởi tạo.");
            }

            return user.Id;
        }

        public async Task<AuthenticationResult> LoginAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, password))
            {
                throw new ValidationException("Thông tin đăng nhập không chính xác.");
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
                throw new ValidationException("Refresh Token không tồn tại.");
            }

            if (existingToken.IsRevoked)
            {
                throw new ValidationException("Token đã bị thu hồi và không thể sử dụng.");
            }

            if (existingToken.ExpiryDate < DateTime.UtcNow)
            {
                throw new ValidationException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }

            var user = await _userManager.FindByIdAsync(existingToken.UserId.ToString());
            if (user == null)
            {
                throw new ValidationException("Người dùng không tồn tại.");
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

        public async Task<string> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                throw new ValidationException("Email không tồn tại trong hệ thống.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            return token;
        }

        public async Task ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                throw new ValidationException("Email không tồn tại.");
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new ValidationException($"Đặt lại mật khẩu thất bại: {errors}");
            }
        }

    }
}
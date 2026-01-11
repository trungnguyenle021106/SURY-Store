using Identity.Application.Common.Models;

namespace Identity.Application.Common.Interfaces
{
    public interface IIdentityService
    {
        Task<Guid> RegisterUserAsync(string fullName, string email, string password, string role);
        Task<AuthenticationResult> LoginAsync(string email, string password);

        Task<AuthenticationResult> RefreshTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string email, string token, string newPassword);
        Task ConfirmEmailAsync(string userId, string code);
    }
}
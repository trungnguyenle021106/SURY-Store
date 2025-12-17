using Identity.Application.Common.Models;

namespace Identity.Application.Common.Interfaces
{
    public interface IIdentityService
    {
        Task<Guid> RegisterUserAsync(string fullName, string email, string password);

        Task<AuthenticationResult> LoginAsync(string email, string password);

        Task<AuthenticationResult> RefreshTokenAsync(string token);
    }
}
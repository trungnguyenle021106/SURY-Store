using Identity.Domain.Entities;

namespace Identity.Application.Common.Interfaces
{
    public interface ITokenProvider
    {
        Task<string> GenerateAccessToken(ApplicationUser user);

        string GenerateRefreshToken();
    }
}
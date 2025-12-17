using Identity.Domain.Entities;

namespace Identity.Application.Common.Interfaces
{
    public interface ITokenProvider
    {
        string GenerateAccessToken(ApplicationUser user);

        string GenerateRefreshToken();
    }
}
using BuildingBlocks.Core.Infrastructure.Data;
using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Identity.Application.Common.Interfaces
{
    public interface IIdentityDbContext : IApplicationDbContext
    {
        DbSet<ApplicationUser> ApplicationUsers { get; }
        DbSet<UserAddress> UserAddresses { get; }
        DbSet<RefreshToken> RefreshTokens { get; }
    }
}

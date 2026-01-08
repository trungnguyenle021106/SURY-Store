using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace BuildingBlocks.Infrastructure.Extensions
{
    public static class AuthorizationExtensions
    {
        public static IServiceCollection AddCustomAuthorization(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy =>
                    policy.RequireRole("Admin"));

                options.AddPolicy("CustomerOnly", policy =>
                    policy.RequireRole("Customer"));

                options.AddPolicy("AdminOrCustomer", policy =>
                    policy.RequireRole("Admin", "Customer"));
            });

            return services;
        }
    }
}
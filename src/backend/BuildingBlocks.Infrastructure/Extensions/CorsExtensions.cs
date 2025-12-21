using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.Infrastructure.Extensions
{
    public static class CorsExtensions
    {
        public const string AllowAllPolicy = "AllowAll";

        public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(AllowAllPolicy, policy =>
                {
                    var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();

                    if (allowedOrigins is not null && allowedOrigins.Length > 0)
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials(); 
                    }
                    else
                    {
                        policy.SetIsOriginAllowed(origin => true)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                });
            });

            return services;
        }
    }
}

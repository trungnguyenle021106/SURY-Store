using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;


namespace BuildingBlocks.Core.Extensions
{
    public static class SwaggerExtensions
    {
        public static IServiceCollection AddCustomSwagger(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                var serviceName = configuration["Swagger:Title"] ?? "My Microservice API";
                var version = configuration["Swagger:Version"] ?? "v1";

                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = serviceName,
                    Version = version,
                    Description = $"API Documentation for {serviceName}"
                });
            });

            return services;
        }

        public static IApplicationBuilder UseCustomSwagger(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            return app;
        }
    }
}

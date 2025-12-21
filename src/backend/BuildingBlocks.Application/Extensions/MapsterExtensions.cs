using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace BuildingBlocks.Core.Extensions
{
    public static class MapsterExtensions
    {
        public static IServiceCollection AddCustomMapster(this IServiceCollection services, Assembly assemblyToScan)
        {
            var config = TypeAdapterConfig.GlobalSettings;

            config.Scan(assemblyToScan);

            services.AddSingleton(config);
            services.AddScoped<IMapper, ServiceMapper>();

            return services;
        }
    }
}

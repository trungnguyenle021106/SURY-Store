using BuildingBlocks.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.Core.Extensions
{
    public static class DatabaseExtensions
    {
        public static IServiceCollection AddCustomDbContext<TContext, TContextInterface>(
            this IServiceCollection services,
            Action<DbContextOptionsBuilder> optionsAction)
            where TContext : DbContext, TContextInterface, IApplicationDbContext
            where TContextInterface : class, IApplicationDbContext
        {
            services.AddDbContext<TContext>(optionsAction);

            services.AddScoped<TContextInterface>(provider =>
                provider.GetRequiredService<TContext>());

            services.AddScoped<IApplicationDbContext>(provider =>
                provider.GetRequiredService<TContext>());

            return services;
        }
    }
}

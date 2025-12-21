using BuildingBlocks.Application.MediatR.Behaviours;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;


namespace BuildingBlocks.Application.Extensions
{
    public static class MediatRExtensions
    {
        public static IServiceCollection AddCustomMediatR(this IServiceCollection services, Assembly assembly)
        {

            services.AddValidatorsFromAssembly(assembly);
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(assembly);

                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
                cfg.AddOpenBehavior(typeof(TransactionBehavior<,>)); 
            });
            return services;
        }
    }
}

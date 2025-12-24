using BuildingBlocks.Application.MediatR.Behaviours;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;


namespace BuildingBlocks.Application.Extensions
{
    public static class MediatRExtensions
    {
        public static IServiceCollection AddCustomMediatR(
            this IServiceCollection services,
            Assembly assembly,
            Action<MediatRServiceConfiguration>? configuration = null)
        {
            services.AddValidatorsFromAssembly(assembly);

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(assembly);
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));


                if (configuration != null)
                {
                    configuration(cfg);
                }
            });

            return services;
        }
    }
}

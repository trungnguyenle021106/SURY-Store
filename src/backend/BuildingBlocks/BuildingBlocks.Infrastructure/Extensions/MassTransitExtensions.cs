using System.Reflection;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.Application.Extensions;

public static class MassTransitExtensions
{
    public static IServiceCollection AddCustomMassTransitWithRabbitMq(
        this IServiceCollection services,
        IConfiguration configuration,
        Assembly? assembly = null)
    {
        services.AddMassTransit(configure =>
        {  
            configure.SetKebabCaseEndpointNameFormatter();

            if (assembly != null)
            {
                configure.AddConsumers(assembly);
            }

            configure.UsingRabbitMq((context, cfg) =>
            {
                var host = configuration["MessageBroker:Host"] ?? "localhost";
                var user = configuration["MessageBroker:Username"] ?? "guest";
                var pass = configuration["MessageBroker:Password"] ?? "guest";

                cfg.Host(host, "/", h =>
                {
                    h.Username(user);
                    h.Password(pass);
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
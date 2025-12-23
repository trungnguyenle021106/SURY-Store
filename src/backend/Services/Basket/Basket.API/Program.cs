using Basket.Application.Common.Interfaces;
using Basket.Infrastructure.Repositories;
using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Infrastructure.Extensions;
using Carter;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});
builder.Services.AddScoped<IBasketRepository, BasketRepository>();
builder.Services.AddCustomMediatR(typeof(Basket.Application.AssemblyReference).Assembly);
builder.Services.AddCustomMapster(typeof(Basket.Application.AssemblyReference).Assembly);
builder.Services.AddCustomSwagger(builder.Configuration);
builder.Services.AddCustomExceptionHandler();
builder.Services.AddCustomJwtAuthentication(builder.Configuration);
builder.Services.AddCustomMassTransitWithRabbitMq(builder.Configuration);
builder.Services.AddAuthorization(options =>
{
});

builder.Services.AddCarter();

var app = builder.Build();

app.UseCustomExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseCustomSwagger();
}

app.UseCors(CorsExtensions.AllowAllPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapCarter();

app.Run();
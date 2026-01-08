using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.Behaviours;
using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Catalog.Application.Common.Interfaces;
using Catalog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCustomDbContext<CatalogDbContext, ICatalogDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Database"));
});
builder.Services.AddCustomMediatR(
    typeof(Catalog.Application.AssemblyReference).Assembly,
    cfg =>
    {
        cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
    }
);
builder.Services.AddCustomMassTransitWithRabbitMq(builder.Configuration, typeof(Catalog.Application.AssemblyReference).Assembly);
builder.Services.AddCustomMapster(typeof(Catalog.Application.AssemblyReference).Assembly);
builder.Services.AddCustomSwagger(builder.Configuration);
builder.Services.AddCustomExceptionHandler();
builder.Services.AddCustomCors(builder.Configuration);

builder.Services.AddCarter();

builder.Services.AddCustomJwtAuthentication(builder.Configuration);
builder.Services.AddCustomAuthorization();

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
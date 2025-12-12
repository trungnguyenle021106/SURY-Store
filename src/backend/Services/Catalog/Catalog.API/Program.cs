using BuildingBlocks.Core.Extensions;
using Carter;
using Catalog.Application;
using Catalog.Infrastructure.Data.EFCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCarter();

builder.Services.AddDbContext<CatalogDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Database"));
});

builder.Services.AddCustomMediatR(typeof(Catalog.Application.AssemblyReference).Assembly);
builder.Services.AddApplication();

var app = builder.Build();

app.MapCarter();

app.Run();
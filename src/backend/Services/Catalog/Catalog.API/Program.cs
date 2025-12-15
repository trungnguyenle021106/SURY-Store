using BuildingBlocks.Core.Extensions;
using Carter;
using Catalog.Application.Common.Interfaces;
using Catalog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCustomDbContext<CatalogDbContext, ICatalogDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Database"));
});
builder.Services.AddCustomMediatR(typeof(Catalog.Application.AssemblyReference).Assembly);
builder.Services.AddCustomMapster(typeof(Catalog.Application.AssemblyReference).Assembly);
builder.Services.AddCustomSwagger(builder.Configuration);
builder.Services.AddCustomExceptionHandler();

builder.Services.AddCarter();
var app = builder.Build();

app.UseCustomExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.UseCustomSwagger();
}
app.MapCarter();

app.Run();
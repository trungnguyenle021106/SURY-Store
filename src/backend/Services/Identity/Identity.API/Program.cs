using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.Behaviours;
using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCustomDbContext<IdentityDbContext, IIdentityDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Database"));
});
builder.Services.AddCustomExceptionHandler();
builder.Services.AddCustomMapster(typeof(Identity.Application.AssemblyReference).Assembly);
builder.Services.AddCustomMediatR(
    typeof(Identity.Application.AssemblyReference).Assembly,
    cfg =>
    {
        cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
    }
);
builder.Services.AddCustomSwagger(builder.Configuration);
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<ITokenProvider, TokenProvider>();

builder.Services.AddCarter();


builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<IdentityDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddCustomJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization(options =>
{
});

builder.Services.AddCustomCors(builder.Configuration);

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
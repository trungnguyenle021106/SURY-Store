using BuildingBlocks.Application.Extensions;
using BuildingBlocks.Application.MediatR.Behaviours;
using BuildingBlocks.Infrastructure.Extensions;
using Carter;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Common.Interfaces;
using Ordering.Infrastructure.Data;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCustomDbContext<OrderingDbContext, IOrderingDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Database"));
});
builder.Services.AddCustomExceptionHandler();
builder.Services.AddCustomMapster(typeof(Ordering.Application.AssemblyReference).Assembly);
builder.Services.AddCustomMassTransitWithRabbitMq(
    builder.Configuration,
    typeof(Ordering.Application.AssemblyReference).Assembly 
);
builder.Services.AddCustomMediatR(
    typeof(Ordering.Application.AssemblyReference).Assembly,
    cfg =>
    {
        cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
    }
);
builder.Services.AddCustomSwagger(builder.Configuration);
builder.Services.AddCustomJwtAuthentication(builder.Configuration);
builder.Services.AddCustomAuthorization();
//builder.Services.AddCustomCors(builder.Configuration); // Khi nào nhiều domain thì loại bỏ CORS này

builder.Services.AddCarter();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<OrderingDbContext>();

        if (context.Database.GetPendingMigrations().Any())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Lỗi xảy ra khi đang migrate database!");
    }
}
app.UseCustomExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseCustomSwagger();
}

//app.UseCors(CorsExtensions.AllowAllPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapCarter();

app.Run();
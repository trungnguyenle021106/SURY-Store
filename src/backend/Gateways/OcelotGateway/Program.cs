
using BuildingBlocks.Infrastructure.Extensions;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddCustomCors(builder.Configuration);

builder.Services.AddOcelot();
builder.Services.AddCustomJwtAuthentication(builder.Configuration);
var app = builder.Build();


app.UseCors(CorsExtensions.AllowAllPolicy);
app.UseAuthentication();
app.UseAuthorization();
await app.UseOcelot();

app.Run();
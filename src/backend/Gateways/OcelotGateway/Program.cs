using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", b =>
    {
        b.WithOrigins("http://localhost:4200") 
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials(); 
    });
});

builder.Services.AddOcelot();

var app = builder.Build();

app.UseCors("CorsPolicy");

await app.UseOcelot();

app.Run();
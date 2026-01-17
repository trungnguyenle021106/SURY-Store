using BuildingBlocks.Infrastructure.Extensions;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using DotNetEnv; // Thư viện đọc file .env

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 1. LOAD BIẾN MÔI TRƯỜNG
// =========================================================================
// Load file .env (Lùi ra 3 cấp thư mục như code của bạn: src/backend/Gateways/Ocelot -> src)
Env.Load("../../../.env");

string GetEnv(string key, string defaultValue = "") =>
    Environment.GetEnvironmentVariable(key) ?? defaultValue;

string appMode = GetEnv("APP_MODE", "LOCAL").ToUpper();
Console.WriteLine($"🚀 SYSTEM RUNNING IN MODE: {appMode}");

// =========================================================================
// 2. ĐỊNH NGHĨA CONFIG MAP
// =========================================================================
var configMap = new Dictionary<string, Dictionary<string, string>>
{
    // --- LOCAL ---
    { "LOCAL", new Dictionary<string, string> {
        { "OCELOT_BASE_URL", GetEnv("LOCAL_BASE_URL", "http://localhost:5000") },
        { "OCELOT_PORT",     GetEnv("LOCAL_PORT", "5000") },

        { "IDENTITY_HOST", "localhost" }, { "IDENTITY_PORT", "5003" },
        { "CATALOG_HOST",  "localhost" }, { "CATALOG_PORT", "5002" },
        { "BASKET_HOST",   "localhost" }, { "BASKET_PORT", "5001" },
        { "ORDERING_HOST", "localhost" }, { "ORDERING_PORT", "5004" }
    }},

    // --- DOCKER ---
    { "DOCKER", new Dictionary<string, string> {
        { "OCELOT_BASE_URL", "http://localhost:5000" },
        { "OCELOT_PORT", "80" },

        { "IDENTITY_HOST", "identity-api" }, { "IDENTITY_PORT", "80" },
        { "CATALOG_HOST",  "catalog-api" },  { "CATALOG_PORT", "80" },
        { "BASKET_HOST",   "basket-api" },   { "BASKET_PORT", "80" },
        { "ORDERING_HOST", "ordering-api" }, { "ORDERING_PORT", "80" }
    }},

    // --- CLOUD ---
    { "CLOUD", new Dictionary<string, string> {
        { "OCELOT_BASE_URL", GetEnv("CLOUD_BASE_URL") },
        { "OCELOT_PORT",     GetEnv("CLOUD_PORT") },

        { "IDENTITY_HOST", "identity-api" }, { "IDENTITY_PORT", GetEnv("CLOUD_PORT") },
        { "CATALOG_HOST",  "catalog-api" },  { "CATALOG_PORT", GetEnv("CLOUD_PORT") },
        { "BASKET_HOST",   "basket-api" },   { "BASKET_PORT", GetEnv("CLOUD_PORT") },
        { "ORDERING_HOST", "ordering-api" }, { "ORDERING_PORT", GetEnv("CLOUD_PORT") }
    }}
};

var currentConfig = configMap.ContainsKey(appMode) ? configMap[appMode] : configMap["LOCAL"];

// =========================================================================
// 3. GEN OCELOT.JSON TỪ TEMPLATE (ĐOẠN NÀY QUAN TRỌNG - BẠN ĐANG THIẾU)
// =========================================================================
var templatePath = "ocelot.template.json";
var outputPath = "ocelot.json";

if (File.Exists(templatePath))
{
    Console.WriteLine("🔄 Generating ocelot.json from template...");
    var content = File.ReadAllText(templatePath);

    foreach (var item in currentConfig)
    {
        // Replace {{KEY}} bằng Value thật
        content = content.Replace("{{" + item.Key + "}}", item.Value);
    }

    // Ghi đè file ocelot.json mới
    File.WriteAllText(outputPath, content);
    Console.WriteLine("✅ ocelot.json generated successfully.");
}
else
{
    Console.WriteLine("⚠️ ERROR: ocelot.template.json not found!");
}

// =========================================================================
// 4. SETUP APP
// =========================================================================

// Config Port
var port = currentConfig["OCELOT_PORT"];
builder.WebHost.UseUrls($"http://*:{port}");

// Nạp file ocelot.json (Lúc này file đã được tạo mới ở bước 3 nên sẽ không lỗi nữa)
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddCustomCors(builder.Configuration);

// Pass Configuration vào Ocelot
builder.Services.AddOcelot(builder.Configuration);
builder.Services.AddCustomJwtAuthentication(builder.Configuration);

var app = builder.Build();

app.UseCors(CorsExtensions.AllowAllPolicy);
app.UseAuthentication();
app.UseAuthorization();

await app.UseOcelot();

app.Run();
using Identity.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Identity.Infrastructure.Services;

public class TokenCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TokenCleanupService> _logger;

    public TokenCleanupService(IServiceProvider serviceProvider, ILogger<TokenCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Token Cleanup Service đã sẵn sàng và chờ đến 12 giờ đêm");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var nextRunTime = now.Date.AddDays(1);
            var delay = nextRunTime - now;

            _logger.LogInformation("Sẽ chạy dọn dẹp sau {DelayHours} giờ {DelayMinutes} phút nữa.",
                (int)delay.TotalHours, delay.Minutes);

            await Task.Delay(delay, stoppingToken);

            try
            {
                _logger.LogInformation("Đang bắt đầu dọn dẹp định kỳ lúc 12h đêm");

                using (var scope = _serviceProvider.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<IIdentityDbContext>();

                    var cutoff = DateTime.UtcNow;

                    int deletedCount = await dbContext.RefreshTokens
                        .Where(t => t.ExpiryDate < cutoff || t.IsRevoked)
                        .ExecuteDeleteAsync(stoppingToken);

                    _logger.LogInformation("Đã dọn dẹp thành công {Count} token rác.", deletedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Có lỗi xảy ra khi dọn dẹp Token lúc nửa đêm.");
            }

            // Sau khi chạy xong, vòng lặp sẽ quay lại bước 1 để tính thời gian cho 12h đêm ngày mai
        }
    }
}
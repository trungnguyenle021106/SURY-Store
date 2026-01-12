using BuildingBlocks.Application.Messaging;
using BuildingBlocks.Core.Messaging;
using Catalog.Application.Common.Interfaces;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed; // Thêm namespace Cache

namespace Catalog.Application.EventHandlers
{
    public class UpdateProductStockConsumer : IConsumer<BasketCheckoutEvent>
    {
        private readonly ICatalogDbContext _dbContext;
        private readonly IDistributedCache _cache; // Inject Cache
        private const string ProductMasterKey = "product-master-key"; // Phải khớp với các Handler khác

        public UpdateProductStockConsumer(ICatalogDbContext dbContext, IDistributedCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
        {
            var message = context.Message;
            try
            {
                var products = await _dbContext.Products
                    .Where(p => message.Items.Select(i => i.ProductId).Contains(p.Id))
                    .ToListAsync();

                foreach (var item in message.Items)
                {
                    var product = products.Find(p => p.Id == item.ProductId);
                    product?.RemoveStock(item.Quantity);
                }

                // 1. Lưu thay đổi vào Database
                await _dbContext.SaveChangesAsync(context.CancellationToken);

                // 2. XÓA CACHE MASTER KEY
                // Sau khi trừ kho xong, phải xóa ngay để trang danh sách cập nhật tồn kho mới
                await _cache.RemoveAsync(ProductMasterKey, context.CancellationToken);

                Console.WriteLine($"[Catalog] Stock updated and Cache invalidated for OrderId: {message.OrderId}");
            }
            catch (Exception ex)
            {
                await context.Publish(new OrderStockRejectedEvent(message.OrderId));
                Console.WriteLine($"[Catalog] Error updating stock for OrderId: {message.OrderId}, Error: {ex.Message}");
            }
        }
    }
}
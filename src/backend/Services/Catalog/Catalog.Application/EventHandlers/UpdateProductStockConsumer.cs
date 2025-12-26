using BuildingBlocks.Application.Messaging;
using BuildingBlocks.Core.Messaging; 
using Catalog.Application.Common.Interfaces;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Application.EventHandlers
{
    public class UpdateProductStockConsumer : IConsumer<BasketCheckoutEvent>
    {
        private readonly ICatalogDbContext _dbContext;

        public UpdateProductStockConsumer(ICatalogDbContext dbContext)
        {
            _dbContext = dbContext;
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

                await _dbContext.SaveChangesAsync(context.CancellationToken);
            }
            catch (Exception ex)
            {
                await context.Publish(new OrderStockRejectedEvent(message.OrderId));
                Console.WriteLine($"[Catalog] Error updating stock for OrderId: {message.OrderId}, Error: {ex.Message}");
            }
        }
    }
}
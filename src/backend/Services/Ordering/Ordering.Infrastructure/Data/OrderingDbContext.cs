using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Ordering.Application.Common.Interfaces;
using Ordering.Domain.Entities;
using Ordering.Domain.Enums;

namespace Ordering.Infrastructure.Data
{
    public class OrderingDbContext : DbContext, IOrderingDbContext
    {
        public OrderingDbContext(DbContextOptions<OrderingDbContext> options) : base(options)
        {
        }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Order>(builder =>
            {
                builder.Property(o => o.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50);

                builder.OwnsOne(o => o.ShippingAddress, addressBuilder =>
                {
                    addressBuilder.Property(a => a.ReceiverName)
                        .IsRequired();

                    addressBuilder.Property(a => a.PhoneNumber)
                        .IsRequired();

                    addressBuilder.Property(a => a.Street)
                        .IsRequired();

                    addressBuilder.Property(a => a.City)
                        .IsRequired();

                    addressBuilder.Property(a => a.Ward)
                        .HasConversion<string>()
                        .IsRequired();

                    addressBuilder.Property(a => a.Note)
                        .IsRequired(false);
                });

                builder.HasMany(o => o.OrderItems)
                    .WithOne()
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                builder.Metadata.FindNavigation(nameof(Order.OrderItems))!
                    .SetPropertyAccessMode(PropertyAccessMode.Field);
            });
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await Database.BeginTransactionAsync();
        }
    }
}

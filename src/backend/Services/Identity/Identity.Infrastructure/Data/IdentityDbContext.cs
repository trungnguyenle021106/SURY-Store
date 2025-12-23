using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Identity.Infrastructure.Data
{
    public class IdentityDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IIdentityDbContext
    {
        public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options)
        {
        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await Database.BeginTransactionAsync();
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable("ApplicationUsers");

                entity.Property(u => u.FullName)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(u => u.AvatarUrl)
                      .IsRequired(false);
            });



            builder.Entity<UserAddress>(entity =>
            {
                entity.ToTable("UserAddresses");

                entity.HasKey(a => a.Id);

                entity.Property(a => a.ReceiverName).IsRequired().HasMaxLength(100);
                entity.Property(a => a.PhoneNumber).IsRequired().HasMaxLength(10);
                entity.Property(a => a.Street).IsRequired().HasMaxLength(200);
                entity.Property(a => a.City).IsRequired().HasMaxLength(100);

                entity.Property(a => a.Ward)
                      .HasConversion<string>()
                      .HasMaxLength(50);

                entity.Ignore(a => a.FullAddress);

                entity.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey(a => a.UserId)
                      .IsRequired()
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("RefreshTokens");

                entity.HasKey(t => t.Id);

                entity.Property(t => t.Token).IsRequired();

                entity.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey(t => t.UserId)
                      .IsRequired()
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<IdentityRole<Guid>>().HasData(
                new IdentityRole<Guid>
                {
                    Id = Guid.Parse("c7b013f0-5201-4317-abd8-c211f91b7330"), 
                    Name = "Admin",
                    NormalizedName = "ADMIN" 
                },
                new IdentityRole<Guid>
                {
                    Id = Guid.Parse("bd58619d-7281-4345-b04f-706d337f7179"),
                    Name = "Customer",
                    NormalizedName = "CUSTOMER"
                }
            );
        }
    }
}
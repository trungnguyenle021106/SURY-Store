using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Data
{
    public class IdentityDbContext : DbContext, IIdentityDbContext
    {
        public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options)
        {
        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>(entity =>
            {
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
        }
    }
}
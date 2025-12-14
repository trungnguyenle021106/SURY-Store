using BuildingBlocks.Core.Entities;
using Catalog.Domain.Enums;
using BuildingBlocks.Core.Exceptions;

namespace Catalog.Domain.Entities
{
    public class Product : BaseEntity<Guid>
    {
        public string Name { get; private set; } = default!;
        public decimal Price { get; private set; }
        public string Description { get; private set; } = default!;
        public string ImageUrl { get; private set; } = default!;
        public ProductStatus Status { get; private set; }
        public int Quantity { get; private set; }

        public Guid CategoryId { get; private set; }

        private Product() { }

        public Product(string name, decimal price, string description, string imageUrl, Guid categoryId)
        {
            Id = Guid.NewGuid();
            Status = ProductStatus.Draft; 
            Quantity = 0;
            CategoryId = categoryId;

            UpdateDetails(name, price, description, imageUrl, categoryId);
        }

        public void UpdateDetails(string name, decimal price, string description, string imageUrl, Guid categoryId)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Product name cannot be empty.");
            if (price < 0) throw new DomainException("Price cannot be negative.");
            if (string.IsNullOrWhiteSpace(imageUrl)) throw new DomainException("Product image URL cannot be empty.");
            if (categoryId == Guid.Empty) throw new DomainException("Category is required.");

            Name = name;
            Price = price;
            Description = description;
            ImageUrl = imageUrl;
            CategoryId = categoryId;
        }

        public void AddStock(int quantity)
        {
            if (quantity <= 0) throw new DomainException("Quantity to add must be greater than 0.");

            Quantity += quantity;

            if (Quantity > 0 && Status == ProductStatus.OutOfStock)
            {
                Status = ProductStatus.Active;
            }
        }

        public void RemoveStock(int quantity)
        {
            if (quantity <= 0) throw new DomainException("Quantity to remove must be greater than 0.");

            if (Quantity < quantity)
                throw new DomainException($"Not enough stock. Available: {Quantity}, Requested: {quantity}");

            Quantity -= quantity;

            if (Quantity == 0)
            {
                Status = ProductStatus.OutOfStock;
            }
        }

        public void Activate() => Status = ProductStatus.Active;
        public void Discontinue() => Status = ProductStatus.Discontinued;
    }
}
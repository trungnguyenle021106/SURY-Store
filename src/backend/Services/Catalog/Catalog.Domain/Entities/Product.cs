using BuildingBlocks.Core.Entities;

namespace Catalog.Domain.Entities
{
    public class Product : BaseEntity<Guid>
    {
        public string Name { get; private set; } = default!;
        public decimal Price { get; private set; }
        public string Description { get; private set; } = default!;
        public string ImageUrl { get; private set; } = default!;
        public string Status { get; private set; } = "Active";
        public int Quantity { get; private set; }

        public Product(string name, decimal price, string description, string imagerUrl)
        {
            this.Id = Guid.NewGuid();
            this.Quantity = 0;
            UpdateDetails(name, price, description, imagerUrl); 
        }

        // Nghiệp vụ Update
        public void UpdateDetails(string name, decimal price, string description, string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new Exception("Product name cannot be empty."); 

            if (price < 0)
                throw new Exception("Price cannot be negative.");

            if (string.IsNullOrWhiteSpace(imageUrl))
                throw new Exception("Product image URL cannot be empty.");

            this.Name = name;
            this.Price = price;
            this.Description = description;
            this.ImageUrl = imageUrl;
        }

        // Nghiệp vụ nhập kho
        public void AddStock(int quantity)
        {
            if (quantity <= 0)
            {
                throw new Exception("Quantity to add must be greater than 0.");
            }

            this.Quantity += quantity;

            if (this.Quantity > 0 && this.Status == "OutOfStock")
            {
                this.Status = "Active";
            }
        }

        // Nghiệp vụ lấy hàng khỏi kho
        public void RemoveStock(int quantity)
        {
            if (quantity <= 0)
            {
                throw new Exception("Quantity to remove must be greater than 0.");
            }

            if (this.Quantity < quantity)
            {
                throw new Exception($"Not enough stock. Available: {this.Quantity}, Requested: {quantity}");
            }

            this.Quantity -= quantity;

            if (this.Quantity == 0)
            {
                this.Status = "OutOfStock";
            }
        }
    }
}

namespace BuildingBlocks.Core.Messaging
{
    public record BasketCheckoutEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = default!;
        public decimal TotalPrice { get; set; }
         
        public string ReceiverName { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;
        public string Street { get; set; } = default!;
        public int Ward { get; set; } 
        public string City { get; set; } = "TP.Hồ Chí Minh";

        public string? Note { get; set; } 
        public int PaymentMethod { get; set; } 
    }
}

namespace Identity.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; private set; }

        public string UserId { get; private set; } = default!;

        public string Token { get; private set; } = default!;
        public DateTime ExpiryDate { get; private set; }
        public bool IsRevoked { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private RefreshToken() { }

        public RefreshToken(string userId, string token, DateTime expiryDate)
        {
            Id = Guid.NewGuid();
            UserId = userId; 
            Token = token;
            ExpiryDate = expiryDate;
            IsRevoked = false;
            CreatedAt = DateTime.UtcNow;
        }

        public void Revoke() => IsRevoked = true;
    }
}

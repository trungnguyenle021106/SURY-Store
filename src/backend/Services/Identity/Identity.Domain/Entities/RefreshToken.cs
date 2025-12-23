using BuildingBlocks.Core.Entities;

namespace Identity.Domain.Entities
{
    public class RefreshToken : BaseEntity<Guid>
    {
        public Guid UserId { get; private set; } = default!;

        public string Token { get; private set; } = default!;
        public DateTime ExpiryDate { get; private set; }
        public bool IsRevoked { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private RefreshToken() { }

        public RefreshToken(Guid userId, string token, DateTime expiryDate)
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

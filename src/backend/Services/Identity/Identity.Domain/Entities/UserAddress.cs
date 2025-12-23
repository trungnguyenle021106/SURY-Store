using BuildingBlocks.Core.Entities;
using BuildingBlocks.Core.Extensions;
using BuildingBlocks.Core.Enums;

namespace Identity.Domain.Entities
{
    public class UserAddress : BaseEntity<Guid>
    {
        public Guid UserId { get; private set; } = default!;

        public string ReceiverName { get; private set; } = default!;
        public string PhoneNumber { get; private set; } = default!;

        public string Street { get; private set; } = default!; 
        public Wards Ward { get; private set; } 

        public string City { get; private set; } = "TP.Hồ Chí Minh";

        public bool IsDefault { get; private set; }

        public string FullAddress => $"{Street}, {Ward.GetDescription()}, {City}";

        private UserAddress() { }

        public UserAddress(Guid userId, string receiverName, string phoneNumber, string street, Wards ward, bool isDefault = false)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Update(receiverName, phoneNumber, street, ward, isDefault);
        }

        public void Update(string receiverName, string phoneNumber, string street, Wards ward, bool isDefault)
        {
            ReceiverName = receiverName;
            PhoneNumber = phoneNumber;
            Street = street;
            Ward = ward; 
            IsDefault = isDefault;
        }

        public void SetDefault() => IsDefault = true;
        public void RemoveDefault() => IsDefault = false;
    }
}

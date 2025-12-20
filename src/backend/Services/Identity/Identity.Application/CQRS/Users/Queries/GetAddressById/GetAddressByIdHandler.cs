using BuildingBlocks.Core.Extensions;
using BuildingBlocks.Core.Exceptions; 
using Identity.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Queries.GetAddressById
{
    public class GetAddressByIdHandler : IRequestHandler<GetAddressByIdQuery, GetAddressByIdResult>
    {
        private readonly IIdentityDbContext _dbContext;

        public GetAddressByIdHandler(IIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<GetAddressByIdResult> Handle(GetAddressByIdQuery query, CancellationToken cancellationToken)
        {
            var address = await _dbContext.UserAddresses
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == query.AddressId, cancellationToken);

            if (address == null)
            {
                throw new KeyNotFoundException($"Địa chỉ với Id {query.AddressId} không tồn tại.");
            }

            if (address.UserId != query.UserId.ToString())
            {
                throw new ForbiddenAccessException("Bạn không có quyền truy cập vào địa chỉ này.");
            }

            var addressDto = new UserAddressDto(
                address.Id,
                address.ReceiverName,
                address.PhoneNumber,
                address.Street,
                address.Ward,
                address.Ward.GetDescription(),
                address.City,
                address.FullAddress,
                address.IsDefault
            );

            return new GetAddressByIdResult(addressDto);
        }
    }
}
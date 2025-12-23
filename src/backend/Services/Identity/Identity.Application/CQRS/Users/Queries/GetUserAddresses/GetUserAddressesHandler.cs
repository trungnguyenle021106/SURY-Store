using BuildingBlocks.Core.Extensions;
using Identity.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Queries.GetUserAddresses
{
    public class GetUserAddressesHandler : IRequestHandler<GetUserAddressesQuery, GetUserAddressesResult>
    {
        private readonly IIdentityDbContext _dbContext;

        public GetUserAddressesHandler(IIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<GetUserAddressesResult> Handle(GetUserAddressesQuery query, CancellationToken cancellationToken)
        {
            var addresses = await _dbContext.UserAddresses
                .AsNoTracking() 
                .Where(a => a.UserId == query.UserId)
                .OrderByDescending(a => a.IsDefault) 
                .ToListAsync(cancellationToken);

            var addressDtos = addresses.Select(a => new UserAddressDto(
                a.Id,
                a.ReceiverName,
                a.PhoneNumber,
                a.Street,
                a.Ward,
                a.Ward.GetDescription(), 
                a.City,
                a.FullAddress,
                a.IsDefault
            ));

            return new GetUserAddressesResult(addressDtos);
        }
    }
}
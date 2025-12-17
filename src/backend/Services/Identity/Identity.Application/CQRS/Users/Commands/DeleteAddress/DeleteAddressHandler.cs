using BuildingBlocks.Core.Exceptions;
using Identity.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Commands.DeleteAddress
{
    public class DeleteAddressHandler : IRequestHandler<DeleteAddressCommand, DeleteAddressResult>
    {
        private readonly IIdentityDbContext _dbContext;

        public DeleteAddressHandler(IIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DeleteAddressResult> Handle(DeleteAddressCommand command, CancellationToken cancellationToken)
        {
            var address = await _dbContext.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == command.AddressId, cancellationToken);

            if (address == null)
            {
                throw new KeyNotFoundException($"Địa chỉ với Id {command.AddressId} không tồn tại.");
            }

            if (address.UserId != command.UserId.ToString())
            {
                throw new ForbiddenAccessException("Bạn không có quyền xóa địa chỉ này.");
            }

            _dbContext.UserAddresses.Remove(address);
            return new DeleteAddressResult(true);
        }
    }
}
using BuildingBlocks.Core.Exceptions;
using Identity.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Commands.SetDefaultAddress
{
    public class SetDefaultAddressHandler : IRequestHandler<SetDefaultAddressCommand, SetDefaultAddressResult>
    {
        private readonly IIdentityDbContext _dbContext;

        public SetDefaultAddressHandler(IIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<SetDefaultAddressResult> Handle(SetDefaultAddressCommand command, CancellationToken cancellationToken)
        {
            var targetAddress = await _dbContext.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == command.AddressId, cancellationToken);

            if (targetAddress == null)
            {
                throw new KeyNotFoundException($"Địa chỉ với Id {command.AddressId} không tồn tại.");
            }

            if (targetAddress.UserId != command.UserId.ToString())
            {
                throw new ForbiddenAccessException("Bạn không có quyền chỉnh sửa địa chỉ này.");
            }

            if (targetAddress.IsDefault)
            {
                return new SetDefaultAddressResult(true);
            }

            var currentDefault = await _dbContext.UserAddresses
                .FirstOrDefaultAsync(a => a.UserId == command.UserId.ToString() && a.IsDefault, cancellationToken);

            if (currentDefault != null)
            {
                currentDefault.RemoveDefault();
                _dbContext.UserAddresses.Update(currentDefault);
            }

            targetAddress.SetDefault();
            _dbContext.UserAddresses.Update(targetAddress);

            return new SetDefaultAddressResult(true);
        }
    }
}
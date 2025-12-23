using BuildingBlocks.Core.Exceptions;
using Identity.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Commands.UpdateAddress
{
    public class UpdateAddressHandler : IRequestHandler<UpdateAddressCommand, UpdateAddressResult>
    {
        private readonly IIdentityDbContext _dbContext;

        public UpdateAddressHandler(IIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UpdateAddressResult> Handle(UpdateAddressCommand command, CancellationToken cancellationToken)
        {
            var address = await _dbContext.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == command.AddressId, cancellationToken);

            if (address == null)
            {
                throw new KeyNotFoundException($"Địa chỉ với Id {command.AddressId} không tồn tại.");
            }

            if (address.UserId != command.UserId)
            {
                throw new ForbiddenAccessException("Bạn không có quyền chỉnh sửa địa chỉ này.");
            }

            if (command.IsDefault && !address.IsDefault)
            {
                var existingDefault = await _dbContext.UserAddresses
                    .FirstOrDefaultAsync(a => a.UserId == command.UserId && a.IsDefault && a.Id != command.AddressId, cancellationToken);

                if (existingDefault != null)
                {
                    existingDefault.RemoveDefault();
                    _dbContext.UserAddresses.Update(existingDefault);
                }
            }

            address.Update(
                command.ReceiverName,
                command.PhoneNumber,
                command.Street,
                command.Ward,
                command.IsDefault
            );

            _dbContext.UserAddresses.Update(address);
            return new UpdateAddressResult(true);
        }
    }
}
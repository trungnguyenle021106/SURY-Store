using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Commands.CreateAddress
{
    public class CreateAddressHandler : IRequestHandler<CreateAddressCommand, CreateAddressResult>
    {
        private readonly IIdentityDbContext _dbContext;

        public CreateAddressHandler(IIdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CreateAddressResult> Handle(CreateAddressCommand command, CancellationToken cancellationToken)
        {
            if (command.IsDefault)
            {
                var existingDefault = await _dbContext.UserAddresses
                    .FirstOrDefaultAsync(a => a.UserId == command.UserId && a.IsDefault, cancellationToken);

                if (existingDefault != null)
                {
                    existingDefault.RemoveDefault();
                    _dbContext.UserAddresses.Update(existingDefault);
                }
            }
            var newAddress = new UserAddress(
                  command.UserId,
                  command.ReceiverName,
                  command.PhoneNumber,
                  command.Street,
                  command.Ward,
                  command.IsDefault
              );
            await _dbContext.UserAddresses.AddAsync(newAddress, cancellationToken);

            return new CreateAddressResult(newAddress.Id);
        }
    }
}
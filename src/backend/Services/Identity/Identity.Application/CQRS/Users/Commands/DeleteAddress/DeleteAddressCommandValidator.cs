using FluentValidation;

namespace Identity.Application.CQRS.Users.Commands.DeleteAddress
{
    public class DeleteAddressCommandValidator : AbstractValidator<DeleteAddressCommand>
    {
        public DeleteAddressCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được để trống.");
            RuleFor(x => x.AddressId).NotEmpty().WithMessage("AddressId không được để trống.");
        }
    }
}
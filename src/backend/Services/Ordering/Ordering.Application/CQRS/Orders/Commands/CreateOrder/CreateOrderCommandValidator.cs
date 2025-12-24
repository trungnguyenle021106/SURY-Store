using FluentValidation;

namespace Ordering.Application.CQRS.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId không được bỏ trống");
            RuleFor(x => x.TotalPrice).GreaterThan(0).WithMessage("Tổng giá trị phải lớn hơn 0");
            RuleFor(x => x.OrderItems).NotEmpty().WithMessage("Đơn hàng phải có ít nhất một sản phẩm.");

            RuleFor(x => x.ShippingAddress).ChildRules(address => {
                address.RuleFor(a => a.ReceiverName).NotEmpty().WithMessage("Tên người nhận không được bỏ trống");
                address.RuleFor(a => a.PhoneNumber).NotEmpty().
                Matches(@"^\d{10,11}$").WithMessage("Số điện thoại không hợp lệ");
                address.RuleFor(a => a.Street).NotEmpty().WithMessage("Tên đường không được bỏ trống");
            });
        }
    }
}
using FluentValidation;

namespace Catalog.Application.CQRS.Products.Commands.CreateBatchProducts
{
    public class CreateBatchProductsCommandValidator : AbstractValidator<CreateBatchProductsCommand>
    {
        public CreateBatchProductsCommandValidator()
        {
            RuleFor(x => x.Products)
                .NotEmpty().WithMessage("Danh sách sản phẩm không được để trống.");

            RuleForEach(x => x.Products).ChildRules(product =>
            {
                product.RuleFor(x => x.Name)
                    .NotEmpty().WithMessage("Tên sản phẩm không được để trống.");

                product.RuleFor(x => x.Price)
                    .GreaterThan(0).WithMessage("Giá sản phẩm phải lớn hơn 0.");

                product.RuleFor(x => x.ImageUrl)
                    .NotEmpty().WithMessage("Hình ảnh sản phẩm không được để trống.");

                product.RuleFor(x => x.CategoryId)
                    .NotEmpty().WithMessage("Danh mục không được để trống.");
            });
        }
    }
}
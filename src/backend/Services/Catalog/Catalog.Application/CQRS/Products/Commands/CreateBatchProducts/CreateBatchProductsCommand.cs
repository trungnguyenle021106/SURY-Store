using BuildingBlocks.Application.MediatR.CQRS;
using Catalog.Application.CQRS.Products.Commands.CreateProduct;

namespace Catalog.Application.CQRS.Products.Commands.CreateBatchProducts
{
    public record CreateBatchProductsResult(
        List<CreateProductResult> Products
    );

    public record CreateBatchProductDto(
        string Name,
        decimal Price,
        string Description,
        string ImageUrl,
        Guid CategoryId
    );

    public record CreateBatchProductsCommand(
        List<CreateBatchProductDto> Products
    ) : ICommand<CreateBatchProductsResult>;
}
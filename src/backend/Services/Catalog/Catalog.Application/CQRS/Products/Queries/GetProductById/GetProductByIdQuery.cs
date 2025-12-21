using BuildingBlocks.Application.MediatR.CQRS;
using Catalog.Domain.Entities;

namespace Catalog.Application.CQRS.Products.Queries.GetProductById
{
    public record GetProductByIdResult(Product Product);

    public record GetProductByIdQuery(Guid Id) : IQuery<GetProductByIdResult>;
}
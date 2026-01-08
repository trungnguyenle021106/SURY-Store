using Carter;
using Catalog.Application.CQRS.Products.Commands.DiscontinueProduct;
using Mapster;
using MediatR;

namespace Catalog.API.Endpoints.Products
{
    public record DiscontinueProductResponse(bool IsSuccess);

    public class DiscontinueProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/products/{id}/discontinue", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = new DiscontinueProductCommand(id);

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<DiscontinueProductResponse>();

                return Results.Ok(response);
            })
            .WithName("DiscontinueProduct")
            .WithSummary("Discontinue a product")
            .WithDescription("Change product status to Discontinued")
            .RequireAuthorization("AdminOnly");
        }
    }
}
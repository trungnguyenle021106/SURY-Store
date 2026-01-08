using Carter;
using Catalog.Application.CQRS.Products.Commands.ActivateProduct;
using Mapster;
using MediatR;

namespace Catalog.API.Endpoints.Products
{
    public record ActivateProductResponse(bool IsSuccess);

    public class ActivateProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/products/{id}/activate", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
            {
                var command = new ActivateProductCommand(id);

                var result = await sender.Send(command, cancellationToken);

                var response = result.Adapt<ActivateProductResponse>();

                return Results.Ok(response);
            })
            .WithName("ActivateProduct")
            .WithSummary("Activate a product")
            .WithDescription("Change product status to Active")
            .RequireAuthorization("AdminOnly");
        }
    }
}
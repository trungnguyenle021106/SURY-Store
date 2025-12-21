using MediatR;
namespace BuildingBlocks.Application.MediatR.CQRS
{
    public interface IQuery<out TResponse> : IRequest<TResponse>
    {
    }
}

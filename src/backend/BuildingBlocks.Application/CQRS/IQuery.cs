using MediatR;
namespace BuildingBlocks.Core.CQRS
{
    public interface IQuery<out TResponse> : IRequest<TResponse>
    {
    }
}

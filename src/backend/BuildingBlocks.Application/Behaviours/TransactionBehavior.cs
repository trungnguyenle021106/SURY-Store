using BuildingBlocks.Core.CQRS;
using BuildingBlocks.Core.Infrastructure.Data;
using MediatR;

namespace Catalog.Application.CQRS.Behaviours
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICommand<TResponse>
    {
        private readonly IApplicationDbContext _dbContext;

        public TransactionBehavior(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            using var transaction = await _dbContext.BeginTransactionAsync();

            try
            {
                var response = await next();

                await _dbContext.SaveChangesAsync(cancellationToken);


                await transaction.CommitAsync(cancellationToken);

                return response;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
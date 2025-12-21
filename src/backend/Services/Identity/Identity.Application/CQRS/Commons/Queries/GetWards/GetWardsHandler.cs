using BuildingBlocks.Core.Enums;
using BuildingBlocks.Core.Extensions; 

using MediatR;

namespace Identity.Application.CQRS.Commons.Queries.GetWards
{
    public class GetWardsHandler : IRequestHandler<GetWardsQuery, GetWardsResult>
    {
        public Task<GetWardsResult> Handle(GetWardsQuery query, CancellationToken cancellationToken)
        {
            var values = Enum.GetValues<Wards>();

            var wardsList = values.Select(w => new WardDto(
                Key: w.ToString(),           
                Name: w.GetDescription()     
            ));

            return Task.FromResult(new GetWardsResult(wardsList));
        }
    }
}
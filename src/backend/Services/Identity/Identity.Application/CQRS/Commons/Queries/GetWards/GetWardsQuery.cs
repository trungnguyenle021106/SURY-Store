using BuildingBlocks.Application.MediatR.CQRS;

namespace Identity.Application.CQRS.Commons.Queries.GetWards
{
    public record WardDto(string Key, string Name);

    public record GetWardsResult(IEnumerable<WardDto> Wards);

    public record GetWardsQuery() : IQuery<GetWardsResult>;
}
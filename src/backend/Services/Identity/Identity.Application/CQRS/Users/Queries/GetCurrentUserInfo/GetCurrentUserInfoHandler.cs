using Identity.Application.Common.Interfaces;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.CQRS.Users.Queries.GetCurrentUserInfo;

public class GetCurrentUserInfoHandler : IRequestHandler<GetCurrentUserInfoQuery, GetCurrentUserInfoResult>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IIdentityDbContext _dbContext;

    public GetCurrentUserInfoHandler(UserManager<ApplicationUser> userManager, IIdentityDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    public async Task<GetCurrentUserInfoResult> Handle(GetCurrentUserInfoQuery query, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(query.UserId.ToString());
        if (user == null)
            throw new KeyNotFoundException("User not found");

        var addresses = await _dbContext.UserAddresses
            .AsNoTracking()
            .Where(a => a.UserId == query.UserId)
            .ToListAsync(cancellationToken);

        var userInfo = new UserInfoDto(
            Id: user.Id,
            FullName: user.FullName,
            Email: user.Email!,
            AvatarUrl: user.AvatarUrl,
            Addresses: addresses.Select(a => new UserAddressDto(
                a.Id,
                a.ReceiverName,
                a.PhoneNumber,
                a.Street,
                a.FullAddress,
                a.IsDefault
            )).ToList()
        );

        return new GetCurrentUserInfoResult(userInfo);
    }
}
using BuildingBlocks.Core.Exceptions;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Identity.Application.CQRS.Users.Commands.UpdateProfile
{
    public class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand, UpdateProfileResult>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UpdateProfileHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UpdateProfileResult> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(command.UserId.ToString());

            if (user == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy người dùng với Id: {command.UserId}");
            }

            if(user.Id != command.UserId)
            {
                throw new ForbiddenAccessException("Bạn không có quyền cập nhật hồ sơ của người dùng này.");
            }

            user.UpdateProfile(command.FullName, command.AvatarUrl ?? user.AvatarUrl!);

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Cập nhật thất bại: {errors}");
            }

            return new UpdateProfileResult(true);
        }
    }
}
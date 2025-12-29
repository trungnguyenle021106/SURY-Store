using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using BuildingBlocks.Core.Exceptions;
using System.ComponentModel.DataAnnotations; // Giả sử bạn có custom exception này

namespace Identity.Application.CQRS.Users.Commands.ChangePassword
{
    public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, ChangePasswordResult>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ChangePasswordHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ChangePasswordResult> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(command.UserId.ToString());
            if (user == null)
            {
                throw new KeyNotFoundException("Người dùng không tồn tại.");
            }

            var result = await _userManager.ChangePasswordAsync(user, command.CurrentPassword, command.NewPassword);

            if (!result.Succeeded)
            {
                var error = result.Errors.FirstOrDefault();
                var vietnameseMessage = MapIdentityErrorToVietnamese(error?.Code, error?.Description);

                throw new ValidationException(vietnameseMessage);
            }

            return new ChangePasswordResult(true, "Đổi mật khẩu thành công.");
        }

        private string MapIdentityErrorToVietnamese(string? errorCode, string? defaultDescription)
        {
            return errorCode switch
            {
                "PasswordMismatch" => "Mật khẩu hiện tại không chính xác.",
                _ => defaultDescription ?? "Đã có lỗi xảy ra trong quá trình đổi mật khẩu."
            };
        }
    }
}
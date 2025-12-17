namespace Identity.Application.Common.Models
{
    public record AuthenticationResult(string AccessToken, string RefreshToken);
}
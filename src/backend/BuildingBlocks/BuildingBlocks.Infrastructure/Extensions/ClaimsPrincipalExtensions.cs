using System.Security.Claims;

namespace BuildingBlocks.Infrastructure.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal principal)
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var parsedId) ? parsedId : Guid.Empty;
        }

        public static string GetEmail(this ClaimsPrincipal principal)
        {
            return principal.FindFirstValue(ClaimTypes.Email) ?? "";
        }

        public static string GetName(this ClaimsPrincipal principal)
        {
            return principal.FindFirstValue(ClaimTypes.Name) ?? "";
        }

        public static List<string> GetRoles(this ClaimsPrincipal principal)
        {
            return principal.FindAll(ClaimTypes.Role)
                            .Select(c => c.Value)
                            .ToList();
        }
    }
}
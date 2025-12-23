using Microsoft.AspNetCore.Identity;

namespace Identity.Domain.Entities
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; private set; } = default!;
        public string? AvatarUrl { get; private set; }

        private ApplicationUser() { }

        public ApplicationUser(string fullName, string email)
        {
            Id = Guid.NewGuid();
            FullName = fullName;
            UserName = email; 
            Email = email;
        }

        public void UpdateProfile(string fullName, string avatarUrl)
        {
            FullName = fullName;
            AvatarUrl = avatarUrl;
        }
    }
}

namespace SGN_Backend.DTOs

{
    public class ChangePasswordDto
    {
        public string? OldPassword { get; set; }
        public string NewPassword { get; set; } = null!;
        public string? CurrentPassword { get; set; }

        public string? ResolveOldPassword()
        {
            return string.IsNullOrWhiteSpace(OldPassword) ? CurrentPassword : OldPassword;
        }
    }
}
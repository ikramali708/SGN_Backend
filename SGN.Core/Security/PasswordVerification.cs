namespace SGN.Core.Security;

/// <summary>
/// Centralized password verification so BCrypt.Verify is not invoked for non-BCrypt values,
/// and malformed BCrypt strings do not crash the request pipeline.
/// </summary>
public static class PasswordVerification
{
    public static bool SafeVerify(string input, string stored)
    {
        if (!string.IsNullOrEmpty(stored) && LooksLikeBcryptHash(stored))
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(input ?? string.Empty, stored);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }

        return string.Equals(input, stored, StringComparison.Ordinal);
    }

    private static bool LooksLikeBcryptHash(string stored)
    {
        // Typical bcrypt output length is 60 (e.g. $2a$10$...).
        if (stored.Length < 59)
            return false;

        return stored.StartsWith("$2a$", StringComparison.Ordinal)
            || stored.StartsWith("$2b$", StringComparison.Ordinal)
            || stored.StartsWith("$2y$", StringComparison.Ordinal);
    }
}

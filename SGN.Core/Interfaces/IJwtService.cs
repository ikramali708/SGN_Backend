using SGN.Domain.Entities;

namespace SGN.Core.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}

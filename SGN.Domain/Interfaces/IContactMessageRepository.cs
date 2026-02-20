using SGN.Domain.Entities;

namespace SGN.Domain.Interfaces
{
    public interface IContactMessageRepository
    {
        Task<IEnumerable<ContactMessage>> GetAllAsync();
        Task<ContactMessage?> GetByIdAsync(int id);
        Task<IEnumerable<ContactMessage>> GetByUserIdAsync(int userId);
        Task<ContactMessage> AddAsync(ContactMessage message);
        Task UpdateAsync(ContactMessage message);
        Task DeleteAsync(int id);
    }
}
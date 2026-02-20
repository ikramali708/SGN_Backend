using SGN.Domain.Entities;

namespace SGN.Domain.Interfaces
{
    public interface INurseryRepository
    {
        Task<IEnumerable<Nursery>> GetAllAsync();
        Task<Nursery?> GetByIdAsync(int id);
        Task<Nursery?> GetByEmailAsync(string email);
        Task<Nursery> AddAsync(Nursery nursery);
        Task UpdateAsync(Nursery nursery);
        Task DeleteAsync(int id);
    }
}
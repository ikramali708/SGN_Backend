using SGN.Domain.Entities;

namespace SGN.Domain.Interfaces
{
    public interface IPlantRepository
    {
        Task<IEnumerable<Plant>> GetAllAsync();
        Task<Plant?> GetByIdAsync(int id);
        Task<IEnumerable<Plant>> GetByCategoryAsync(int categoryId);
        Task<Plant> AddAsync(Plant plant);
        Task UpdateAsync(Plant plant);
        Task DeleteAsync(int id);
    }
}
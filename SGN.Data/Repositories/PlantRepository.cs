using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN.Data.Repositories
{
    public class PlantRepository : IPlantRepository
    {
        private readonly NurseryDbContext _context;

        public PlantRepository(NurseryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Plant>> GetAllAsync() => await _context.Plants.ToListAsync();

        public async Task<Plant?> GetByIdAsync(int id) => await _context.Plants.FindAsync(id);

        public async Task<IEnumerable<Plant>> GetByCategoryAsync(int categoryId) =>
            await _context.Plants.Where(p => p.CategoryId == categoryId).ToListAsync();

        public async Task<Plant> AddAsync(Plant plant)
        {
            await _context.Plants.AddAsync(plant);
            await _context.SaveChangesAsync();
            return plant;
        }

        public async Task UpdateAsync(Plant plant)
        {
            _context.Plants.Update(plant);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.Plants.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
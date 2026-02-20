
using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN.Data.Repositories
{
    public class NurseryRepository : INurseryRepository
    {
        private readonly NurseryDbContext _context;

        public NurseryRepository(NurseryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Nursery>> GetAllAsync() => await _context.Nurseries.ToListAsync();

        public async Task<Nursery?> GetByIdAsync(int id) => await _context.Nurseries.FindAsync(id);

        public async Task<Nursery?> GetByEmailAsync(string email) =>
            await _context.Nurseries.FirstOrDefaultAsync(n => n.Email == email);

        public async Task<Nursery> AddAsync(Nursery nursery)
        {
            await _context.Nurseries.AddAsync(nursery);
            await _context.SaveChangesAsync();
            return nursery;
        }

        public async Task UpdateAsync(Nursery nursery)
        {
            _context.Nurseries.Update(nursery);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.Nurseries.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
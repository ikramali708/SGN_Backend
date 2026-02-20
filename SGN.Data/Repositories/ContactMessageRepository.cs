using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN.Data.Repositories
{
    public class ContactMessageRepository : IContactMessageRepository
    {
        private readonly NurseryDbContext _context;

        public ContactMessageRepository(NurseryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ContactMessage>> GetAllAsync() => await _context.ContactMessages.ToListAsync();

        public async Task<ContactMessage?> GetByIdAsync(int id) =>
            await _context.ContactMessages.FindAsync(id);

        public async Task<IEnumerable<ContactMessage>> GetByUserIdAsync(int userId) =>
            await _context.ContactMessages.Where(c => c.UserId == userId).ToListAsync();

        public async Task<ContactMessage> AddAsync(ContactMessage message)
        {
            await _context.ContactMessages.AddAsync(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task UpdateAsync(ContactMessage message)
        {
            _context.ContactMessages.Update(message);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.ContactMessages.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
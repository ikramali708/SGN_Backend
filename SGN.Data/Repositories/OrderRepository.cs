using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN.Data.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly NurseryDbContext _context;

        public OrderRepository(NurseryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Order>> GetAllAsync() => await _context.Orders.ToListAsync();

        public async Task<Order?> GetByIdAsync(int id) => await _context.Orders.FindAsync(id);

        public async Task<IEnumerable<Order>> GetByUserIdAsync(int userId) =>
            await _context.Orders.Where(o => o.CustomerId == userId).ToListAsync();

        public async Task<Order> AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.Orders.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
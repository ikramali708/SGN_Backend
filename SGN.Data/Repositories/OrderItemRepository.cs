using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN.Data.Repositories
{
    public class OrderItemRepository : IOrderItemRepository
    {
        private readonly NurseryDbContext _context;

        public OrderItemRepository(NurseryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OrderItem>> GetAllAsync() => await _context.OrderItems.ToListAsync();

        public async Task<OrderItem?> GetByIdAsync(int id) => await _context.OrderItems.FindAsync(id);

        public async Task<IEnumerable<OrderItem>> GetByOrderIdAsync(int orderId) =>
            await _context.OrderItems.Where(oi => oi.OrderId == orderId).ToListAsync();

        public async Task<OrderItem> AddAsync(OrderItem item)
        {
            await _context.OrderItems.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task UpdateAsync(OrderItem item)
        {
            _context.OrderItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.OrderItems.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
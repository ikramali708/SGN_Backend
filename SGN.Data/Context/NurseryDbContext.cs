using SGN.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SGN.Data.Context;

public class NurseryDbContext : DbContext
{
    public NurseryDbContext(DbContextOptions<NurseryDbContext> options) : base(options)
    {
    }

    // DbSets for all entities
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Nursery> Nurseries { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Plant> Plants { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<ContactMessage> ContactMessages { get; set; } = null!;
    public DbSet<SupportTicket> SupportTickets { get; set; } = null!;
    public DbSet<SupportReply> SupportReplies { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Optional: Configure relationships and table names if needed
        modelBuilder.Entity<User>()
            .HasMany(u => u.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.ContactMessages)
            .WithOne(c => c.User)
            .HasForeignKey(c => c.UserId);

        modelBuilder.Entity<Nursery>()
            .HasMany(n => n.Plants)
            .WithOne(p => p.Nursery)
            .HasForeignKey(p => p.NurseryId);

        modelBuilder.Entity<Category>()
            .HasMany(c => c.Plants)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId);

        modelBuilder.Entity<Plant>()
            .HasMany(p => p.OrderItems)
            .WithOne(oi => oi.Plant)
            .HasForeignKey(oi => oi.PlantId);

        modelBuilder.Entity<SupportTicket>(e =>
        {
            e.ToTable("SupportTickets");
            e.HasOne(t => t.User)
                .WithMany(u => u.SupportTickets)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.Order)
                .WithMany()
                .HasForeignKey(t => t.OrderId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SupportReply>(e =>
        {
            e.ToTable("SupportReplies");
            e.HasOne(r => r.Ticket)
                .WithMany(t => t.Replies)
                .HasForeignKey(r => r.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
using Microsoft.EntityFrameworkCore;
using SGN.Core.Interfaces;
using SGN.Core.Models;
using SGN.Core.Security;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN.Data.Services;

public class CustomerService : ICustomerService
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;
    private readonly IOrderRepository _orderRepo;
    private readonly IPlantRepository _plantRepo;
    private readonly NurseryDbContext _dbContext;

    public CustomerService(
        IUserRepository userRepo,
        IJwtService jwtService,
        IOrderRepository orderRepo,
        IPlantRepository plantRepo,
        NurseryDbContext dbContext)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
        _orderRepo = orderRepo;
        _plantRepo = plantRepo;
        _dbContext = dbContext;
    }

    public async Task<(bool Success, int StatusCode, object Response)> RegisterAsync(CustomerRegisterDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.Role) &&
            !string.Equals(dto.Role, "Customer", StringComparison.OrdinalIgnoreCase))
            return (false, 400, new { message = "Invalid registration." });

        var existing = await _userRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            return (false, 400, new { message = "Email already exists." });

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = "Customer",
            Status = "Active",
            CreatedAt = DateTime.Now
        };
        await _userRepo.AddAsync(user);
        return (true, 200, new { message = "Customer registered successfully." });
    }

    public async Task<(bool Success, int StatusCode, object Response)> LoginAsync(CustomerLoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null || !PasswordVerification.SafeVerify(dto.Password, user.Password))
            return (false, 401, new { message = "Invalid email or password." });
        if (!string.Equals(user.Role, "Customer", StringComparison.OrdinalIgnoreCase))
            return (false, 401, new { message = "This account is not authorized for customer login." });

        var token = _jwtService.GenerateToken(user);
        return (true, 200, new CustomerLoginResponseDto
        {
            Token = token,
            UserId = user.UserId,
            Role = user.Role ?? "Customer"
        });
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetProfileAsync(int userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null)
            return (false, 404, new { message = "User not found." });
        return (true, 200, new CustomerProfileDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Status = user.Status,
            Role = user.Role
        });
    }

    public async Task<(bool Success, int StatusCode, object Response)> UpdateProfileAsync(int userId, CustomerProfileUpdateDto dto)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null)
            return (false, 404, new { message = "User not found." });
        user.Name = dto.Name;
        user.Phone = dto.Phone;
        await _userRepo.UpdateAsync(user);
        return (true, 200, new { message = "Profile updated successfully." });
    }

    public async Task<(bool Success, int StatusCode, object Response)> ChangePasswordAsync(int userId, CustomerChangePasswordDto dto)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null)
            return (false, 404, new { message = "User not found." });
        if (!PasswordVerification.SafeVerify(dto.OldPassword, user.Password))
            return (false, 400, new { message = "Old password is incorrect." });
        user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _userRepo.UpdateAsync(user);
        return (true, 200, new { message = "Password changed successfully." });
    }

    public async Task<(bool Success, int StatusCode, object Response)> PlaceOrderAsync(int userId, CustomerOrderCreateDto dto)
    {
        if (dto.OrderItems == null || dto.OrderItems.Count == 0)
            return (false, 400, new { message = "Order must contain at least one item." });
        if (dto.OrderItems.Any(i => i.Quantity <= 0))
            return (false, 400, new { message = "Quantity must be greater than zero for all items." });

        var plantsInOrder = new List<Plant>();
        foreach (var item in dto.OrderItems)
        {
            var plant = await _plantRepo.GetByIdAsync(item.PlantId);
            if (plant == null)
                return (false, 400, new { message = $"Plant with ID {item.PlantId} was not found." });
            if (plant.StockQuantity < item.Quantity)
                return (false, 400, new { message = $"Insufficient stock for plant '{plant.PlantName}'." });
            plantsInOrder.Add(plant);
        }

        var order = new Order
        {
            CustomerId = userId,
            ShippingAddress = dto.ShippingAddress,
            Country = NullIfWhiteSpace(dto.Country),
            Province = NullIfWhiteSpace(dto.Province),
            City = NullIfWhiteSpace(dto.City),
            FullAddress = NullIfWhiteSpace(dto.FullAddress),
            PhoneNumber = NullIfWhiteSpace(dto.PhoneNumber),
            Comment = NullIfWhiteSpace(dto.Comment),
            OrderDate = DateTime.Now,
            OrderStatus = "Pending",
            PaymentStatus = "COD",
            OrderItems = new List<OrderItem>()
        };

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            decimal totalAmount = 0;
            foreach (var item in dto.OrderItems)
            {
                var plant = plantsInOrder.First(p => p.PlantId == item.PlantId);
                totalAmount += plant.Price * item.Quantity;
                plant.StockQuantity -= item.Quantity;
                await _plantRepo.UpdateAsync(plant);
                order.OrderItems.Add(new OrderItem
                {
                    PlantId = plant.PlantId,
                    Quantity = item.Quantity,
                    PriceAtTime = plant.Price
                });
            }
            order.TotalAmount = totalAmount;
            await _orderRepo.AddAsync(order);
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return (true, 200, new CustomerOrderResponseDto
        {
            OrderId = order.OrderId,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus,
            PaymentStatus = order.PaymentStatus,
            ShippingAddress = order.ShippingAddress,
            Country = order.Country,
            Province = order.Province,
            City = order.City,
            FullAddress = order.FullAddress,
            PhoneNumber = order.PhoneNumber,
            Comment = order.Comment,
            OrderDate = order.OrderDate,
            OrderItems = order.OrderItems.Select(i => new CustomerOrderItemResponseDto
            {
                PlantId = i.PlantId,
                Quantity = i.Quantity,
                PriceAtTime = i.PriceAtTime
            }).ToList()
        });
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetOrdersAsync(int userId)
    {
        var orders = await _orderRepo.GetByUserIdAsync(userId);
        var list = orders.Select(MapOrderToDto).OrderByDescending(o => o.OrderDate).ToList();
        return (true, 200, list);
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetOrderByIdAsync(int userId, int orderId)
    {
        var order = await _orderRepo.GetByIdWithItemsAsync(orderId);
        if (order == null)
            return (false, 404, new { message = "Order not found." });
        if (order.CustomerId != userId)
            return (false, 401, new { message = "You can only view your own orders." });
        return (true, 200, MapOrderToDto(order));
    }

    private static CustomerOrderResponseDto MapOrderToDto(Order order)
    {
        return new CustomerOrderResponseDto
        {
            OrderId = order.OrderId,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus,
            PaymentStatus = order.PaymentStatus,
            ShippingAddress = order.ShippingAddress,
            Country = order.Country,
            Province = order.Province,
            City = order.City,
            FullAddress = order.FullAddress,
            PhoneNumber = order.PhoneNumber,
            Comment = order.Comment,
            OrderDate = order.OrderDate,
            OrderItems = (order.OrderItems ?? Enumerable.Empty<OrderItem>())
                .Select(i => new CustomerOrderItemResponseDto
                {
                    PlantId = i.PlantId,
                    Quantity = i.Quantity,
                    PriceAtTime = i.PriceAtTime
                }).ToList()
        };
    }

    private static string? NullIfWhiteSpace(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public async Task<(bool Success, int StatusCode, object Response)> CancelOrderAsync(int userId, int orderId)
    {
        var order = await _orderRepo.GetByIdWithItemsAsync(orderId);
        if (order == null)
            return (false, 404, new { message = "Order not found." });
        if (order.CustomerId != userId)
            return (false, 401, new { message = "You can only cancel your own orders." });
        if (!string.Equals(order.OrderStatus, "Pending", StringComparison.OrdinalIgnoreCase))
            return (false, 400, new { message = "Only pending orders can be cancelled." });

        if (order.OrderItems != null)
        {
            foreach (var item in order.OrderItems)
            {
                var plant = await _plantRepo.GetByIdAsync(item.PlantId);
                if (plant != null)
                {
                    plant.StockQuantity += item.Quantity;
                    await _plantRepo.UpdateAsync(plant);
                }
            }
        }

        order.OrderStatus = "Cancelled";
        await _orderRepo.UpdateAsync(order);
        return (true, 200, new { message = "Order cancelled successfully." });
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetPlantsAsync()
    {
        var plants = await _dbContext.Plants
            .Include(p => p.Nursery)
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new CustomerPlantListItemDto
            {
                PlantId = p.PlantId,
                PlantName = p.PlantName,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                NurseryName = p.Nursery != null ? p.Nursery.NurseryName : null,
                CategoryName = p.Category != null ? p.Category.CategoryName : null
            })
            .ToListAsync();
        return (true, 200, plants);
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetPlantByIdAsync(int plantId)
    {
        var plant = await _dbContext.Plants
            .Include(p => p.Nursery)
            .Include(p => p.Category)
            .Where(p => p.PlantId == plantId)
            .Select(p => new CustomerPlantDetailDto
            {
                PlantId = p.PlantId,
                PlantName = p.PlantName,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                ImageUrl = p.ImageUrl,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                NurseryName = p.Nursery != null ? p.Nursery.NurseryName : null,
                CategoryName = p.Category != null ? p.Category.CategoryName : null
            })
            .FirstOrDefaultAsync();
        if (plant == null)
            return (false, 404, new { message = "Plant not found." });
        return (true, 200, plant);
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetPlantsByCategoryAsync(int categoryId)
    {
        var plants = await _dbContext.Plants
            .Include(p => p.Nursery)
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new CustomerPlantListItemDto
            {
                PlantId = p.PlantId,
                PlantName = p.PlantName,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                NurseryName = p.Nursery != null ? p.Nursery.NurseryName : null,
                CategoryName = p.Category != null ? p.Category.CategoryName : null
            })
            .ToListAsync();
        return (true, 200, plants);
    }
}

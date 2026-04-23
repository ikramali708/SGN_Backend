using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/nursery/orders")]
[ApiController]
[Authorize(Roles = "NurseryOwner")]
[ApiExplorerSettings(GroupName = "NURSERY")]
[Tags("Nursery Orders")]
public class NurseryOrderController : ControllerBase
{
    private static readonly string[] AllowedStatuses = ["Pending", "Completed", "Cancelled"];

    private readonly IOrderRepository _orderRepo;
    private readonly IUserRepository _userRepo;
    private readonly ILogger<NurseryOrderController> _logger;

    public NurseryOrderController(IOrderRepository orderRepo, IUserRepository userRepo, ILogger<NurseryOrderController> logger)
    {
        _orderRepo = orderRepo;
        _userRepo = userRepo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var orders = await _orderRepo.GetByNurseryIdAsync(nurseryId);
        var orderList = orders.ToList();
        var customerIds = orderList.Select(o => o.CustomerId).Distinct().ToList();

        var customerMap = new Dictionary<int, object?>();
        foreach (var customerId in customerIds)
        {
            var customer = await _userRepo.GetByIdAsync(customerId);
            customerMap[customerId] = customer == null
                ? null
                : new
                {
                    customer.UserId,
                    customer.Name,
                    customer.Email,
                    customer.Phone
                };
        }

        var response = orderList.Select(o => new
        {
            o.OrderId,
            o.CustomerId,
            o.OrderDate,
            o.TotalAmount,
            o.OrderStatus,
            o.PaymentStatus,
            o.ShippingAddress,
            o.Country,
            o.Province,
            o.City,
            o.FullAddress,
            o.PhoneNumber,
            o.Comment,
            Customer = customerMap[o.CustomerId],
            OrderItems = o.OrderItems?
                .Where(oi => oi.Plant != null && oi.Plant.NurseryId == nurseryId)
                .Select(oi => new
                {
                    oi.OrderItemId,
                    oi.PlantId,
                    oi.Quantity,
                    oi.PriceAtTime,
                    Plant = oi.Plant == null
                        ? null
                        : new
                        {
                            oi.Plant.PlantId,
                            oi.Plant.PlantName,
                            oi.Plant.Price,
                            oi.Plant.StockQuantity,
                            oi.Plant.CategoryId
                        }
                })
        });

        return Ok(response);
    }

    [HttpPut("{orderId:int}/status")]
    public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] NurseryOrderStatusUpdateDto dto)
    {
        try
        {
            if (!TryGetNurseryId(out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            var order = await _orderRepo.GetByIdWithItemsAsync(orderId);
            if (order == null)
                return NotFound("Order not found.");

            var belongsToNursery = order.OrderItems != null &&
                                   order.OrderItems.Any(oi => oi.Plant != null && oi.Plant.NurseryId == nurseryId);
            if (!belongsToNursery)
                return Unauthorized("You can only update your own nursery orders.");

            var normalizedStatus = AllowedStatuses.FirstOrDefault(s => s.Equals(dto.Status, StringComparison.OrdinalIgnoreCase));
            if (normalizedStatus == null)
                return BadRequest("Invalid status. Allowed values: Pending, Completed, Cancelled.");

            order.OrderStatus = normalizedStatus;
            await _orderRepo.UpdateAsync(order);

            return Ok(new
            {
                message = "Order status updated successfully.",
                orderId = order.OrderId,
                orderStatus = order.OrderStatus
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update status for order id {OrderId}.", orderId);
            return StatusCode(500, new { message = "Failed to update order status." });
        }
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }
}

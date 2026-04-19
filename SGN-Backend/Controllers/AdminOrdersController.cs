using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using SGN_Backend.Helpers;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin order overview.
/// </summary>
[Route("api/admin/orders")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderRepository _orderRepo;

    public AdminOrdersController(IOrderRepository orderRepo)
    {
        _orderRepo = orderRepo;
    }

    /// <summary>
    /// List all orders with optional status filter, search, and pagination
    /// </summary>
    /// <param name="search">Matches order id, customer id, shipping address, payment or order status</param>
    /// <param name="status">Filter by order status (e.g. Pending, Successful, Cancelled)</param>
    /// <param name="page">1-based page index</param>
    /// <param name="pageSize">Items per page (max 100)</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<Order>), 200)]
    public async Task<ActionResult<PagedResultDto<Order>>> GetOrders(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var all = (await _orderRepo.GetAllAsync()).ToList();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim();
            all = all.Where(o =>
                    o.OrderStatus.Equals(st, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            all = all.Where(o =>
                    o.OrderId.ToString().Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    o.CustomerId.ToString().Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    o.ShippingAddress.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrEmpty(o.Province) && o.Province.Contains(s, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(o.City) && o.City.Contains(s, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(o.FullAddress) && o.FullAddress.Contains(s, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(o.PhoneNumber) && o.PhoneNumber.Contains(s, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(o.Comment) && o.Comment.Contains(s, StringComparison.OrdinalIgnoreCase)) ||
                    o.OrderStatus.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    o.PaymentStatus.Contains(s, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var total = all.Count;
        var (p, ps) = AdminListHelper.NormalizePage(page, pageSize);
        var items = all
            .OrderByDescending(o => o.OrderDate)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToList();

        return Ok(AdminListHelper.ToPagedResult(items, p, ps, total));
    }

    /// <summary>
    /// Get order by id (includes line items when loaded by repository)
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Order), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _orderRepo.GetByIdWithItemsAsync(id);
        if (order == null)
            return NotFound("Order not found");
        return Ok(order);
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/nursery/dashboard")]
[ApiController]
[Authorize(Roles = "NurseryOwner")]
[ApiExplorerSettings(GroupName = "NURSERY")]
[Tags("Nursery Dashboard")]
public class NurseryDashboardController : ControllerBase
{
    private readonly IPlantRepository _plantRepo;
    private readonly IOrderRepository _orderRepo;

    public NurseryDashboardController(IPlantRepository plantRepo, IOrderRepository orderRepo)
    {
        _plantRepo = plantRepo;
        _orderRepo = orderRepo;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var plants = await _plantRepo.GetAllAsync();
        var nurseryPlantsCount = plants.Count(p => p.NurseryId == nurseryId);

        var orders = await _orderRepo.GetByNurseryIdAsync(nurseryId);
        var orderList = orders.ToList();
        var completedOrders = orderList.Where(o =>
            string.Equals(o.OrderStatus, "Completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(o.OrderStatus, "Successful", StringComparison.OrdinalIgnoreCase))
            .ToList();

        var dto = new NurseryDashboardResponseDto(
            TotalPlants: nurseryPlantsCount,
            TotalOrders: orderList.Count,
            CompletedOrders: completedOrders.Count,
            CancelledOrders: orderList.Count(o => string.Equals(o.OrderStatus, "Cancelled", StringComparison.OrdinalIgnoreCase)),
            PendingOrders: orderList.Count(o => string.Equals(o.OrderStatus, "Pending", StringComparison.OrdinalIgnoreCase)),
            TotalSales: completedOrders.Sum(o => o.TotalAmount)
        );

        return Ok(dto);
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }
}

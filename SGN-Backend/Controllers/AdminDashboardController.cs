using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin dashboard aggregates and statistics.
/// </summary>
[Route("api/admin/dashboard")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly NurseryDbContext _dbContext;

    public AdminDashboardController(NurseryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Get overall admin dashboard stats
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _dbContext.Users.CountAsync();
        var totalNurseries = await _dbContext.Nurseries.CountAsync();
        var totalOrders = await _dbContext.Orders.CountAsync();
        var totalPlants = await _dbContext.Plants.CountAsync();
        var successfulOrders = await _dbContext.Orders.CountAsync(o =>
            o.OrderStatus != null &&
            o.OrderStatus.Trim().ToLower() == "completed");
        var cancelledOrders = await _dbContext.Orders.CountAsync(o => o.OrderStatus == "Cancelled");
        var pendingOrders = await _dbContext.Orders.CountAsync(o => o.OrderStatus == "Pending");

        return Ok(new
        {
            totalUsers,
            totalNurseries,
            totalOrders,
            totalPlants,
            successfulOrders,
            cancelledOrders,
            pendingOrders
        });
    }
}

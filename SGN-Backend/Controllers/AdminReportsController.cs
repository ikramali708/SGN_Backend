using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin reporting aggregates.
/// </summary>
[Route("api/admin/reports")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Reports")]
public class AdminReportsController : ControllerBase
{
    private readonly NurseryDbContext _dbContext;

    public AdminReportsController(NurseryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Basic aggregated metrics for admin reporting
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReports()
    {
        var totalUsers = await _dbContext.Users.CountAsync();
        var totalOrders = await _dbContext.Orders.CountAsync();
        var totalPlants = await _dbContext.Plants.CountAsync();
        var totalRevenue = await _dbContext.Orders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        return Ok(new
        {
            totalUsers,
            totalOrders,
            totalRevenue,
            totalPlants
        });
    }
}

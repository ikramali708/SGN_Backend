using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
using System.Security.Claims;

namespace SGN_Backend.Controllers
{
    [Route("api/nursery/dashboard")]
    [ApiController]
    [Authorize(Roles = "NurseryOwner")]
    public class NurseryDashboardController : ControllerBase
    {
        private readonly NurseryDbContext _dbContext;

        public NurseryDashboardController(NurseryDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Get nursery dashboard statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var ownerEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(ownerEmail))
                return Unauthorized("Email claim is missing in token.");

            var nursery = await _dbContext.Nurseries.FirstOrDefaultAsync(n => n.Email == ownerEmail);
            if (nursery == null)
                return NotFound("No nursery found for this owner.");

            var nurseryId = nursery.NurseryId;

            var totalPlants = await _dbContext.Plants.CountAsync(p => p.NurseryId == nurseryId);

            var nurseryOrdersQuery = _dbContext.Orders.Where(o =>
                o.OrderItems!.Any(oi => oi.Plant != null && oi.Plant.NurseryId == nurseryId));

            var totalOrders = await nurseryOrdersQuery.CountAsync();
            var completedOrders = await nurseryOrdersQuery.CountAsync(o => o.OrderStatus == "Successful");
            var cancelledOrders = await nurseryOrdersQuery.CountAsync(o => o.OrderStatus == "Cancelled");
            var pendingOrders = await nurseryOrdersQuery.CountAsync(o => o.OrderStatus == "Pending");

            return Ok(new
            {
                nurseryId,
                totalPlants,
                totalOrders,
                completedOrders,
                cancelledOrders,
                pendingOrders
            });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using System.Security.Claims;

namespace SGN_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IPlantRepository _plantRepo;
        private readonly INurseryRepository _nurseryRepo;
        private readonly NurseryDbContext _dbContext;

        public OrderController(
            IOrderRepository orderRepo,
            IPlantRepository plantRepo,
            INurseryRepository nurseryRepo,
            NurseryDbContext dbContext)
        {
            _orderRepo = orderRepo;
            _plantRepo = plantRepo;
            _nurseryRepo = nurseryRepo;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Place order with multiple plants
        /// </summary>
        /// <param name="dto">Order request</param>
        /// <returns>Created order</returns>
        [Authorize(Roles = "Customer")]
        [HttpPost]
        [ProducesResponseType(typeof(Order), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> PlaceOrder(PlaceOrderDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("Order must contain at least one plant item.");

            if (dto.Items.Any(i => i.Quantity <= 0))
                return BadRequest("Quantity must be greater than zero for all items.");

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid user token.");

            var plantsInOrder = new List<Plant>();
            foreach (var item in dto.Items)
            {
                var plant = await _plantRepo.GetByIdAsync(item.PlantId);
                if (plant == null)
                    return BadRequest($"Plant with ID {item.PlantId} was not found.");

                if (plant.StockQuantity < item.Quantity)
                    return BadRequest($"Insufficient stock for plant '{plant.PlantName}'. Available: {plant.StockQuantity}, requested: {item.Quantity}.");

                plantsInOrder.Add(plant);
            }

            var distinctNurseryIds = plantsInOrder.Select(p => p.NurseryId).Distinct().ToList();
            if (distinctNurseryIds.Count != 1)
                return BadRequest("All plants in one order must belong to the same nursery.");

            var nurseryId = distinctNurseryIds[0];

            var order = new Order
            {
                CustomerId = userId,
                ShippingAddress = dto.ShippingAddress,
                OrderDate = DateTime.Now,
                OrderStatus = "Pending",
                PaymentStatus = "COD",
                OrderItems = new List<OrderItem>()
            };

            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                decimal totalAmount = 0;
                foreach (var item in dto.Items)
                {
                    var plant = plantsInOrder.First(p => p.PlantId == item.PlantId);
                    var lineTotal = plant.Price * item.Quantity;
                    totalAmount += lineTotal;

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

            return Ok(new
            {
                order.OrderId,
                order.CustomerId,
                NurseryId = nurseryId,
                order.TotalAmount,
                order.OrderStatus,
                order.PaymentStatus,
                order.ShippingAddress,
                order.OrderDate,
                Items = order.OrderItems.Select(i => new { i.PlantId, i.Quantity, i.PriceAtTime })
            });
        }

        /// <summary>
        /// Cancel customer order by id
        /// </summary>
        /// <param name="id">Order ID</param>
        /// <returns>Cancelled order</returns>
        [Authorize(Roles = "Customer")]
        [HttpPut("{id}/cancel")]
        [ProducesResponseType(typeof(Order), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _orderRepo.GetByIdWithItemsAsync(id);
            if (order == null) return NotFound("Order not found");

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid user token.");

            if (order.CustomerId != userId)
                return Unauthorized("You can only cancel your own orders");

            if (string.Equals(order.OrderStatus, "Cancelled", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Order is already cancelled.");

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

            return Ok(order);
        }

        /// <summary>
        /// Get logged in customer orders
        /// </summary>
        /// <returns>List of user orders</returns>
        [Authorize(Roles = "Customer")]
        [HttpGet("my")]
        [ProducesResponseType(typeof(IEnumerable<Order>), 200)]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid user token.");

            var orders = await _orderRepo.GetByUserIdAsync(userId);
            return Ok(orders);
        }

        /// <summary>
        /// Get orders for owner nursery
        /// </summary>
        [Authorize(Roles = "NurseryOwner")]
        [HttpGet("nursery")]
        [ProducesResponseType(typeof(IEnumerable<Order>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetOrdersForMyNursery()
        {
            var ownerEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(ownerEmail))
                return Unauthorized("Email claim is missing in token.");

            var nursery = await _nurseryRepo.GetByEmailAsync(ownerEmail);
            if (nursery == null)
                return NotFound("No nursery found for this owner.");

            var orders = await _orderRepo.GetByNurseryIdAsync(nursery.NurseryId);
            return Ok(orders);
        }

        /// <summary>
        /// Update nursery order status
        /// </summary>
        [Authorize(Roles = "NurseryOwner")]
        [HttpPut("{id}/status")]
        [ProducesResponseType(typeof(Order), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest("Status is required.");

            var ownerEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(ownerEmail))
                return Unauthorized("Email claim is missing in token.");

            var nursery = await _nurseryRepo.GetByEmailAsync(ownerEmail);
            if (nursery == null)
                return NotFound("No nursery found for this owner.");

            var order = await _orderRepo.GetByIdWithItemsAsync(id);
            if (order == null)
                return NotFound("Order not found");

            var isOrderForNursery = order.OrderItems != null &&
                                    order.OrderItems.Any(oi => oi.Plant != null && oi.Plant.NurseryId == nursery.NurseryId);
            if (!isOrderForNursery)
                return Unauthorized("You can only update orders of your own nursery.");

            var allowedStatuses = new[] { "Pending", "Successful", "Cancelled" };
            var normalizedStatus = allowedStatuses.FirstOrDefault(s => s.Equals(dto.Status, StringComparison.OrdinalIgnoreCase));
            if (normalizedStatus == null)
                return BadRequest("Invalid status. Allowed values: Pending, Successful, Cancelled.");

            order.OrderStatus = normalizedStatus;
            await _orderRepo.UpdateAsync(order);

            return Ok(order);
        }
    }
}
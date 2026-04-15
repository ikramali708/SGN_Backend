using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Models;

namespace SGN_Backend.Controllers;

[Route("api/plants")]
[ApiController]
[ApiExplorerSettings(GroupName = "CUSTOMER")]
[Tags("Customer")]
public class PlantsController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public PlantsController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    /// <summary>
    /// Get all plants for customer browsing.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CustomerPlantListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _customerService.GetPlantsAsync();
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Get plant details by id for customer browsing.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CustomerPlantDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _customerService.GetPlantByIdAsync(id);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Get plants filtered by category id.
    /// </summary>
    [HttpGet("category/{categoryId:int}")]
    [ProducesResponseType(typeof(IEnumerable<CustomerPlantListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCategory(int categoryId)
    {
        var result = await _customerService.GetPlantsByCategoryAsync(categoryId);
        return StatusCode(result.StatusCode, result.Response);
    }
}

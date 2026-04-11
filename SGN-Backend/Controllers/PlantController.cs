using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "EndUser")]
    public class PlantController : ControllerBase
    {
        private readonly IPlantRepository _plantRepo;

        public PlantController(IPlantRepository plantRepo)
        {
            _plantRepo = plantRepo;
        }

        //[HttpGet]
        //[ProducesResponseType(typeof(IEnumerable<Plant>), 200)]
        //public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
        //{
        //    var plants = categoryId.HasValue
        //        ? await _plantRepo.GetByCategoryIdAsync(categoryId.Value)
        //        : await _plantRepo.GetAllAsync();

        //    return Ok(plants);
        //}

        /// <summary>
        /// Get plant details by id
        /// </summary>
        /// <param name="id">Plant ID</param>
        /// <returns>Plant details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Plant), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var plant = await _plantRepo.GetByIdAsync(id);
            if (plant == null) return NotFound("Plant not found");
            return Ok(plant);
        }
    }
}
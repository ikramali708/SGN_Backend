using SGN.Core.Models;

namespace SGN.Core.Interfaces;

public interface ICustomerService
{
    Task<(bool Success, int StatusCode, object Response)> RegisterAsync(CustomerRegisterDto dto);
    Task<(bool Success, int StatusCode, object Response)> LoginAsync(CustomerLoginDto dto);

    Task<(bool Success, int StatusCode, object Response)> GetProfileAsync(int userId);
    Task<(bool Success, int StatusCode, object Response)> UpdateProfileAsync(int userId, CustomerProfileUpdateDto dto);
    Task<(bool Success, int StatusCode, object Response)> ChangePasswordAsync(int userId, CustomerChangePasswordDto dto);

    Task<(bool Success, int StatusCode, object Response)> PlaceOrderAsync(int userId, CustomerOrderCreateDto dto);
    Task<(bool Success, int StatusCode, object Response)> GetOrdersAsync(int userId);
    Task<(bool Success, int StatusCode, object Response)> GetOrderByIdAsync(int userId, int orderId);
    Task<(bool Success, int StatusCode, object Response)> CancelOrderAsync(int userId, int orderId);

    Task<(bool Success, int StatusCode, object Response)> GetPlantsAsync();
    Task<(bool Success, int StatusCode, object Response)> GetPlantByIdAsync(int plantId);
    Task<(bool Success, int StatusCode, object Response)> GetPlantsByCategoryAsync(int categoryId);
}

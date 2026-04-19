
using Microsoft.Extensions.DependencyInjection;
using SGN.Core.Interfaces;
using SGN.Data.Repositories;
using SGN.Data.Services;
using SGN.Domain.Interfaces;

namespace SGN.IOC
{
    public static class ServiceRegistration
    {
        public static void AddRepositories(this IServiceCollection services)
        {
            // Yahan sab repositories ko add karo
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<INurseryRepository, NurseryRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IPlantRepository, PlantRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IOrderItemRepository, OrderItemRepository>();
            services.AddScoped<IContactMessageRepository, ContactMessageRepository>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<ICustomerService, CustomerService>();
            services.AddScoped<ISupportService, SupportService>();
        }
    }
}
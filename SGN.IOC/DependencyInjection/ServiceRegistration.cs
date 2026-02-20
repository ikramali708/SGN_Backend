
using Microsoft.Extensions.DependencyInjection;
using SGN.Data.Repositories;
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
        }
    }
}
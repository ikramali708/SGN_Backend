using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SGN.Data.Context
{
    public class NurseryDbContextFactory : IDesignTimeDbContextFactory<NurseryDbContext>
    {
        public NurseryDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<NurseryDbContext>();

            optionsBuilder.UseSqlServer(
                "Server=.;Database=SGN_DB;Trusted_Connection=True;TrustServerCertificate=True;");

            return new NurseryDbContext(optionsBuilder.Options);
        }
    }
}
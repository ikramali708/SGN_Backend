using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SGN_Backend.Swagger;

/// <summary>
/// Ensures the ADMIN OpenAPI document lists tag groups in a stable, intentional order in Swagger UI.
/// </summary>
public sealed class AdminTagOrderDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        if (!string.Equals(context.DocumentName, "ADMIN", StringComparison.OrdinalIgnoreCase))
            return;

        string[] ordered =
        [
            "Admin Auth",
            "Admin Dashboard",
            "Admin Users",
            "Admin Nurseries",
            "Admin Plants",
            "Admin Orders",
            "Admin Categories",
            "Admin Reports"
        ];

        swaggerDoc.Tags = new HashSet<OpenApiTag>(
            ordered.Select(name => new OpenApiTag { Name = name }));
    }
}

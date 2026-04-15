using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SGN_Backend.Swagger;

/// <summary>
/// Ensures the NURSERY OpenAPI document lists tag groups in a stable order.
/// </summary>
public sealed class NurseryTagOrderDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        if (!string.Equals(context.DocumentName, "NURSERY", StringComparison.OrdinalIgnoreCase))
            return;

        string[] ordered =
        [
            "Nursery Auth",
            "Nursery Dashboard",
            "Nursery Plants",
            "Nursery Inventory",
            "Nursery Orders",
            "Nursery Profile"
        ];

        swaggerDoc.Tags = new HashSet<OpenApiTag>(
            ordered.Select(name => new OpenApiTag { Name = name }));
    }
}

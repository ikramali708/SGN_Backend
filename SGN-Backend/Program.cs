
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SGN.Data.Context;
using Microsoft.EntityFrameworkCore;
using SGN.IOC;
using SGN_Backend.Swagger;
using System.Text;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<NurseryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add controllers
builder.Services.AddControllers();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "SGN API", Version = "v1" });
    options.SwaggerDoc("ADMIN", new OpenApiInfo { Title = "SGN API — Admin", Version = "v1" });

    options.DocInclusionPredicate((documentName, apiDescription) =>
    {
        var group = apiDescription.GroupName;
        if (string.Equals(documentName, "ADMIN", StringComparison.OrdinalIgnoreCase))
            return string.Equals(group, "ADMIN", StringComparison.OrdinalIgnoreCase);
        if (string.Equals(documentName, "v1", StringComparison.OrdinalIgnoreCase))
            return string.IsNullOrEmpty(group) || string.Equals(group, "v1", StringComparison.OrdinalIgnoreCase);
        return false;
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
    options.DocumentFilter<AdminTagOrderDocumentFilter>();
});
builder.Services.AddRepositories();

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Public API");
        c.SwaggerEndpoint("/swagger/ADMIN/swagger.json", "ADMIN");
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

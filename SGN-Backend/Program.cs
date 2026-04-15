
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SGN.Data.Context;
using Microsoft.EntityFrameworkCore;
using SGN.IOC;
using SGN_Backend.Swagger;
using System.Text;
using System.Reflection;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<NurseryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add controllers
builder.Services.AddControllers();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.");
var jwtIssuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing in configuration.");
var jwtAudience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience is missing in configuration.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.UseSecurityTokenValidators = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "SGN API", Version = "v1" });
    options.SwaggerDoc("ADMIN", new OpenApiInfo { Title = "SGN API — Admin", Version = "v1" });
    options.SwaggerDoc("NURSERY", new OpenApiInfo { Title = "SGN API — Nursery", Version = "v1" });
    options.SwaggerDoc("CUSTOMER", new OpenApiInfo { Title = "SGN API — Customer", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token like: Bearer {your token}"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });

    options.DocInclusionPredicate((documentName, apiDescription) =>
    {
        var group = apiDescription.GroupName;
        if (string.Equals(documentName, "ADMIN", StringComparison.OrdinalIgnoreCase))
            return string.Equals(group, "ADMIN", StringComparison.OrdinalIgnoreCase);
        if (string.Equals(documentName, "NURSERY", StringComparison.OrdinalIgnoreCase))
            return string.Equals(group, "NURSERY", StringComparison.OrdinalIgnoreCase);
        if (string.Equals(documentName, "CUSTOMER", StringComparison.OrdinalIgnoreCase))
            return string.Equals(group, "CUSTOMER", StringComparison.OrdinalIgnoreCase);
        if (string.Equals(documentName, "v1", StringComparison.OrdinalIgnoreCase))
            return string.IsNullOrEmpty(group) || string.Equals(group, "v1", StringComparison.OrdinalIgnoreCase);
        return false;
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
    options.DocumentFilter<AdminTagOrderDocumentFilter>();
    options.DocumentFilter<NurseryTagOrderDocumentFilter>();
});
builder.Services.AddRepositories();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminUi", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
            (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
             uri.Host.Equals("127.0.0.1")) &&
            (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Public API");
        c.SwaggerEndpoint("/swagger/ADMIN/swagger.json", "ADMIN");
        c.SwaggerEndpoint("/swagger/NURSERY/swagger.json", "NURSERY");
        c.SwaggerEndpoint("/swagger/CUSTOMER/swagger.json", "CUSTOMER");
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseCors("AdminUi");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

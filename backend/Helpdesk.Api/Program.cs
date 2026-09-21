using System.Reflection;
using System.Text.Json.Serialization;
using Helpdesk.Api.Data;
using Helpdesk.Api.Middleware;
using Helpdesk.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<ITicketService, TicketService>();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: false)));

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Helpdesk API",
        Version = "v1",
        Description = "API для учёта заявок в IT-поддержку"
    });
    var xmlFile = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xmlFile)) c.IncludeXmlComments(xmlFile);
});

builder.Services.AddHealthChecks();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.InitializeAsync(db);
}

app.UseExceptionHandler();
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Helpdesk API v1"));
app.UseCors("Frontend");
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

using Helpdesk.Api.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Not Found", exception.Message),
            BadHttpRequestException => (StatusCodes.Status400BadRequest, "Bad Request", exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Internal Server Error",
                  "An unexpected error occurred. Please try again later.")
        };

        if (status >= 500)
            logger.LogError(exception, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            logger.LogWarning("Request failed with {Status}: {Message}", status, exception.Message);

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(problem, options: null, contentType: "application/problem+json", cancellationToken);
        return true;
    }
}

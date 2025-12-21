using BuildingBlocks.Core.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using FluentValidation;


namespace BuildingBlocks.Infrastructure.Middlewares
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
                HttpContext httpContext,
                Exception exception,
                CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Exception occurred: {Message}", exception.Message);

            var problemDetails = new ProblemDetails
            {
                Instance = httpContext.Request.Path
            };

            switch (exception)
            {
                case ValidationException validationEx:
                    HandleValidationException(validationEx, problemDetails);
                    break;

                case DomainException domainEx:
                    HandleDomainException(domainEx, problemDetails);
                    break;

                case KeyNotFoundException notFoundException:
                    HandleNotFoundException(notFoundException, problemDetails);
                    break;

                case DbUpdateException dbUpdateEx:
                    HandleDatabaseException(dbUpdateEx, problemDetails);
                    break;

                case UnauthorizedAccessException unauthorizedEx:
                    HandleUnauthorizedException(unauthorizedEx, problemDetails);
                    break;

                case ForbiddenAccessException forbiddenEx:
                    HandleForbiddenException(forbiddenEx, problemDetails);
                    break;

                default:
                    HandleUnknownException(exception, problemDetails);
                    break;
            }

            httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;

            await httpContext.Response
                .WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }

        private void HandleValidationException(ValidationException exception, ProblemDetails problemDetails)
        {
            problemDetails.Title = "Validation Error";
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Detail = "One or more validation errors occurred.";
            problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";

            var errors = exception.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            problemDetails.Extensions.Add("errors", errors);
        }

        private void HandleDomainException(DomainException exception, ProblemDetails problemDetails)
        {
            problemDetails.Title = "Business Rule Violation";
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Detail = exception.Message;
            problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
        }

        private void HandleNotFoundException(KeyNotFoundException exception, ProblemDetails problemDetails)
        {
            problemDetails.Title = "Resource Not Found";
            problemDetails.Status = StatusCodes.Status404NotFound;
            problemDetails.Detail = exception.Message;
            problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
        }

        private void HandleDatabaseException(DbUpdateException exception, ProblemDetails problemDetails)
        {
            problemDetails.Status = StatusCodes.Status500InternalServerError;
            problemDetails.Title = "Database Error";
            problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1";
            problemDetails.Detail = "An error occurred while saving data.";

            var innerMessage = exception.InnerException?.Message ?? "";

            if (innerMessage.Contains("duplicate", StringComparison.OrdinalIgnoreCase) ||
                innerMessage.Contains("unique", StringComparison.OrdinalIgnoreCase) ||
                innerMessage.Contains("IX_", StringComparison.OrdinalIgnoreCase))
            {
                problemDetails.Status = StatusCodes.Status409Conflict;
                problemDetails.Title = "Data Conflict";
                problemDetails.Detail = "Record already exists or violates unique constraint.";
                problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8";
            }
            else if (innerMessage.Contains("FOREIGN KEY", StringComparison.OrdinalIgnoreCase) ||
                     innerMessage.Contains("REFERENCE constraint", StringComparison.OrdinalIgnoreCase))
            {
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Invalid Reference";
                problemDetails.Detail = "The referenced entity does not exist (Foreign Key Violation).";
                problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
            }
        }

        private void HandleUnknownException(Exception exception, ProblemDetails problemDetails)
        {
            problemDetails.Title = "Internal Server Error";
            problemDetails.Status = StatusCodes.Status500InternalServerError;
            problemDetails.Detail = "An unexpected error occurred. Please contact support.";
            problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1";
        }

        private void HandleUnauthorizedException(UnauthorizedAccessException exception, ProblemDetails problemDetails)
        {
            problemDetails.Status = StatusCodes.Status401Unauthorized;
            problemDetails.Title = "Unauthorized";
            problemDetails.Type = "https://tools.ietf.org/html/rfc7235#section-3.1";
            problemDetails.Detail = "You are not authorized to access this resource. Please log in.";
        }

        private void HandleForbiddenException(ForbiddenAccessException exception, ProblemDetails problemDetails)
        {
            problemDetails.Status = StatusCodes.Status403Forbidden;
            problemDetails.Title = "Forbidden";
            problemDetails.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3";
            problemDetails.Detail = exception.Message; // "User does not have permission..."
        }
    }
}
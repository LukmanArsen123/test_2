using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;

namespace Helpdesk.Api.Services;

public static class TicketMapper
{
    public static TicketDto ToDto(this Ticket t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        UserEmail = t.UserEmail,
        Category = t.Category,
        Status = t.Status,
        Priority = t.Priority,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}

using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;

namespace Helpdesk.Api.Mappers;

public static class TicketMapper
{
    public static TicketDto ToDto(this Ticket ticket) => new()
    {
        Id = ticket.Id,
        Title = ticket.Title,
        Description = ticket.Description,
        UserEmail = ticket.UserEmail,
        Category = ticket.Category,
        Status = ticket.Status,
        Priority = ticket.Priority,
        CreatedAt = ticket.CreatedAt,
        UpdatedAt = ticket.UpdatedAt
    };

    public static Ticket ToEntity(this SaveTicketDto dto) => dto.ApplyTo(new Ticket());

    public static Ticket ApplyTo(this SaveTicketDto dto, Ticket ticket)
    {
        ticket.Title = dto.Title.Trim();
        ticket.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        ticket.UserEmail = dto.UserEmail.Trim();
        ticket.Category = dto.Category;
        ticket.Priority = dto.Priority;
        return ticket;
    }
}

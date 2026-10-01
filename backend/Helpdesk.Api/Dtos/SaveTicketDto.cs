using Helpdesk.Api.Domain;

namespace Helpdesk.Api.Dtos;

public class SaveTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public TicketCategory Category { get; set; } = TicketCategory.Other;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
}

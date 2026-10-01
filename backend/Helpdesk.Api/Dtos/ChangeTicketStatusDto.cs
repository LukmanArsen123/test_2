using Helpdesk.Api.Domain;

namespace Helpdesk.Api.Dtos;

public class ChangeTicketStatusDto
{
    public TicketStatus Status { get; set; }
}

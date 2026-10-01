namespace Helpdesk.Api.Dtos;

public class TicketMetaDto
{
    public IReadOnlyList<TicketOptionDto> Statuses { get; set; } = [];
    public IReadOnlyList<TicketOptionDto> Priorities { get; set; } = [];
    public IReadOnlyList<TicketOptionDto> Categories { get; set; } = [];
}

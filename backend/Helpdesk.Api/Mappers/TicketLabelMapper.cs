using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;

namespace Helpdesk.Api.Mappers;

public static class TicketLabelMapper
{
    public static TicketMetaDto ToMetaDto(this IEnumerable<TicketLabel> labels)
    {
        var ordered = labels.OrderBy(l => l.SortOrder).ToList();

        List<TicketOptionDto> Options(TicketLabelGroup group) => ordered
            .Where(l => l.Group == group)
            .Select(l => new TicketOptionDto { Value = l.Value, Label = l.Label })
            .ToList();

        return new TicketMetaDto
        {
            Statuses = Options(TicketLabelGroup.Status),
            Priorities = Options(TicketLabelGroup.Priority),
            Categories = Options(TicketLabelGroup.Category)
        };
    }
}

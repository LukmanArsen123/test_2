using System.ComponentModel.DataAnnotations;
using Helpdesk.Api.Domain;

namespace Helpdesk.Api.Dtos;

public class ChangeTicketStatusDto
{
    [EnumDataType(typeof(TicketStatus))]
    public TicketStatus Status { get; set; }
}

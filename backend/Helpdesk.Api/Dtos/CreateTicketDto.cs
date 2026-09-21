using System.ComponentModel.DataAnnotations;
using Helpdesk.Api.Domain;

namespace Helpdesk.Api.Dtos;

public class CreateTicketDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "RequesterEmail is required.")]
    [EmailAddress(ErrorMessage = "RequesterEmail must be a valid email address.")]
    [StringLength(254)]
    public string RequesterEmail { get; set; } = string.Empty;

    [EnumDataType(typeof(TicketCategory))]
    public TicketCategory Category { get; set; } = TicketCategory.Other;

    [EnumDataType(typeof(TicketPriority))]
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
}

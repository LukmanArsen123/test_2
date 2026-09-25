namespace Helpdesk.Api.Domain;

public enum TicketCategory { Hardware, Software, Network, Access, Other }

public enum TicketStatus { New, InProgress, Resolved, Closed }

public enum TicketPriority { Low, Medium, High, Critical }

public class Ticket
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public TicketCategory Category { get; set; }
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

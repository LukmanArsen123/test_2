namespace Helpdesk.Api.Domain;

public enum TicketLabelGroup { Status, Priority, Category }

public class TicketLabel
{
    public TicketLabelGroup Group { get; set; }
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

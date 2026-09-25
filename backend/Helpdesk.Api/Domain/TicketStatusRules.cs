namespace Helpdesk.Api.Domain;

public static class TicketStatusRules
{
    private static readonly Dictionary<TicketStatus, TicketStatus[]> AllowedTransitions = new()
    {
        [TicketStatus.New] = [TicketStatus.InProgress, TicketStatus.Closed],
        [TicketStatus.InProgress] = [TicketStatus.Resolved, TicketStatus.Closed, TicketStatus.New],
        [TicketStatus.Resolved] = [TicketStatus.Closed, TicketStatus.InProgress],
        [TicketStatus.Closed] = [TicketStatus.InProgress],
    };

    public static bool CanTransition(TicketStatus from, TicketStatus to) =>
        from == to || (AllowedTransitions.TryGetValue(from, out var allowed) && allowed.Contains(to));
}

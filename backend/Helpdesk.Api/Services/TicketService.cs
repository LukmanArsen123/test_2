using Helpdesk.Api.Data;
using Helpdesk.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Services;

public interface ITicketService
{
    Task<IReadOnlyList<Ticket>> GetAllAsync(string? search, TicketStatus? status, TicketPriority? priority);
    Task<Ticket> GetByIdAsync(Guid id);
    Task<Ticket> AddAsync(Ticket ticket);
    Task<Ticket> UpdateAsync(Ticket ticket);
    Task DeleteAsync(Guid id);
}

public class TicketService(AppDbContext db) : BaseService<Ticket>(db), ITicketService
{
    public async Task<IReadOnlyList<Ticket>> GetAllAsync(string? search, TicketStatus? status, TicketPriority? priority)
    {
        IQueryable<Ticket> query = Set.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{EscapeLike(search.Trim())}%";
            query = query.Where(t =>
                EF.Functions.ILike(t.Title, pattern) ||
                (t.Description != null && EF.Functions.ILike(t.Description, pattern)));
        }

        if (status.HasValue) query = query.Where(t => t.Status == status.Value);
        if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ThenBy(t => t.Id)
            .ToListAsync();
    }

    public override Task<Ticket> AddAsync(Ticket ticket)
    {
        ticket.Id = Guid.NewGuid();
        ticket.Status = TicketStatus.New;
        ticket.CreatedAt = ticket.UpdatedAt = DateTime.UtcNow;
        return base.AddAsync(ticket);
    }

    public override Task<Ticket> UpdateAsync(Ticket ticket)
    {
        ticket.UpdatedAt = DateTime.UtcNow;
        return base.UpdateAsync(ticket);
    }

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}

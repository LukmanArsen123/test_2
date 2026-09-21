using Helpdesk.Api.Data;
using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;
using Helpdesk.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Services;

public class TicketService(AppDbContext db) : ITicketService
{
    public async Task<IReadOnlyList<TicketDto>> GetAllAsync(
        string? search, TicketStatus? status, TicketPriority? priority, CancellationToken ct)
    {
        IQueryable<Ticket> query = db.Tickets.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{EscapeLike(search.Trim())}%";
            query = query.Where(t =>
                EF.Functions.ILike(t.Title, pattern) ||
                (t.Description != null && EF.Functions.ILike(t.Description, pattern)));
        }

        if (status.HasValue) query = query.Where(t => t.Status == status.Value);
        if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);

        var tickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);
        return tickets.Select(ToDto).ToList();
    }

    public async Task<TicketDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var ticket = await db.Tickets.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, ct)
                     ?? throw NotFound(id);
        return ToDto(ticket);
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto dto, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            RequesterEmail = dto.RequesterEmail.Trim(),
            Category = dto.Category,
            Priority = dto.Priority,
            Status = TicketStatus.New,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Tickets.Add(ticket);
        await db.SaveChangesAsync(ct);
        return ToDto(ticket);
    }

    public async Task<TicketDto> UpdateAsync(Guid id, UpdateTicketDto dto, CancellationToken ct)
    {
        var ticket = await db.Tickets.FirstOrDefaultAsync(t => t.Id == id, ct)
                     ?? throw NotFound(id);

        ticket.Title = dto.Title.Trim();
        ticket.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        ticket.RequesterEmail = dto.RequesterEmail.Trim();
        ticket.Category = dto.Category;
        ticket.Priority = dto.Priority;
        ticket.Status = dto.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return ToDto(ticket);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var ticket = await db.Tickets.FirstOrDefaultAsync(t => t.Id == id, ct)
                     ?? throw NotFound(id);

        db.Tickets.Remove(ticket);
        await db.SaveChangesAsync(ct);
    }

    private static NotFoundException NotFound(Guid id) => new($"Ticket with id '{id}' was not found.");

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");

    private static TicketDto ToDto(Ticket t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        RequesterEmail = t.RequesterEmail,
        Category = t.Category,
        Status = t.Status,
        Priority = t.Priority,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}

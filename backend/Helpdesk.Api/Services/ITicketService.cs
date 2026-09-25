using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;

namespace Helpdesk.Api.Services;

public interface ITicketService
{
    Task<IReadOnlyList<TicketDto>> GetAllAsync(string? search, TicketStatus? status, TicketPriority? priority, CancellationToken ct);
    Task<TicketDto> GetByIdAsync(Guid id, CancellationToken ct);
    Task<TicketDto> CreateAsync(CreateTicketDto dto, CancellationToken ct);
    Task<TicketDto> UpdateAsync(Guid id, UpdateTicketDto dto, CancellationToken ct);
    Task<TicketDto> ChangeStatusAsync(Guid id, TicketStatus status, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

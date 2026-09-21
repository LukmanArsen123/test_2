using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;
using Helpdesk.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TicketsController(ITicketService service) : ControllerBase
{
    /// <summary>Список заявок с поиском и фильтрами.</summary>
    /// <param name="search">Подстрока для поиска по Title и Description (без учёта регистра).</param>
    /// <param name="status">Фильтр по статусу.</param>
    /// <param name="priority">Фильтр по приоритету.</param>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TicketDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] TicketStatus? status,
        [FromQuery] TicketPriority? priority,
        CancellationToken ct)
        => Ok(await service.GetAllAsync(search, status, priority, ct));

    /// <summary>Получить заявку по идентификатору.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> GetById(Guid id, CancellationToken ct)
        => Ok(await service.GetByIdAsync(id, ct));

    /// <summary>Создать заявку. Статус устанавливается сервером (New).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TicketDto>> Create(CreateTicketDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Обновить заявку целиком.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> Update(Guid id, UpdateTicketDto dto, CancellationToken ct)
        => Ok(await service.UpdateAsync(id, dto, ct));

    /// <summary>Удалить заявку.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}

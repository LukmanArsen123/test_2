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
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TicketDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] TicketStatus? status,
        [FromQuery] TicketPriority? priority,
        CancellationToken ct)
        => Ok(await service.GetAllAsync(search, status, priority, ct));

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> GetById(Guid id, CancellationToken ct)
        => Ok(await service.GetByIdAsync(id, ct));

    [HttpPost]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TicketDto>> Create(CreateTicketDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> Update(Guid id, UpdateTicketDto dto, CancellationToken ct)
        => Ok(await service.UpdateAsync(id, dto, ct));

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}

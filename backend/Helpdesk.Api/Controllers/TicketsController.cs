using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;
using Helpdesk.Api.Mappers;
using Helpdesk.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController(ITicketService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] TicketStatus? status,
        [FromQuery] TicketPriority? priority)
        => Ok((await service.GetAllAsync(search, status, priority)).Select(t => t.ToDto()));

    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDto>> GetById(Guid id)
        => Ok((await service.GetByIdAsync(id)).ToDto());

    [HttpPost]
    public async Task<ActionResult<TicketDto>> Create(SaveTicketDto dto)
    {
        var created = await service.AddAsync(dto.ToEntity());
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TicketDto>> Update(Guid id, SaveTicketDto dto)
    {
        var ticket = dto.ApplyTo(await service.GetByIdAsync(id));
        return Ok((await service.UpdateAsync(ticket)).ToDto());
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<TicketDto>> ChangeStatus(Guid id, ChangeTicketStatusDto dto)
    {
        var ticket = await service.GetByIdAsync(id);
        ticket.Status = dto.Status;
        return Ok((await service.UpdateAsync(ticket)).ToDto());
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}

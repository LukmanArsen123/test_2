using Helpdesk.Api.Domain;
using Helpdesk.Api.Dtos;
using Helpdesk.Api.Mappers;
using Helpdesk.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route("api/ticket-meta")]
public class TicketMetaController(BaseService<TicketLabel> service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<TicketMetaDto>> Get()
        => Ok((await service.GetAllAsync()).ToMetaDto());
}

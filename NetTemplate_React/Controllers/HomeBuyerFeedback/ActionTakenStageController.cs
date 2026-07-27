using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NetTemplate_React.Services;
using System.Threading.Tasks;

namespace NetTemplate_React.Controllers.HomeBuyerFeedback
{
    [Route("api/HomeBuyerFeedback/[controller]")]
    [ApiController]
    [Authorize]
    public class ActionTakenStageController : ControllerBase
    {
        private readonly IMiscService _service;

        public ActionTakenStageController(IMiscService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await _service.GetAccountStageStatus();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }
    }
}

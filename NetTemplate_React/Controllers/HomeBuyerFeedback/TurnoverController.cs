using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NetTemplate_React.Models;
using NetTemplate_React.Services;
using System.Threading.Tasks;

namespace NetTemplate_React.Controllers.HomeBuyerFeedback
{
    [Route("api/HomeBuyerFeedback/[controller]")]
    [ApiController]
    [Authorize]
    public class TurnoverController : ControllerBase
    {
        private readonly ITurnoverService _service;

        public TurnoverController(ITurnoverService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await _service.GetResponses();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] FeedbackFormRequest req)
        {
            var response = await _service.AddResponse(req);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestion()
        {
            var response = await _service.GetQuestions();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

    }
}

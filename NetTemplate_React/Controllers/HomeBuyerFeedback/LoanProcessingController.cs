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
    public class LoanProcessingController : ControllerBase
    {
        private readonly ILoanService _service;

        public LoanProcessingController(ILoanService service)
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
        public async Task<IActionResult> Post([FromBody] FeedbackFormRequest body)
        {
            body.CreatedBy = User.Identity.Name;
            var response = await _service.AddResponse(body);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions()
        {
            var response = await _service.GetQuestions();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }
    }
}

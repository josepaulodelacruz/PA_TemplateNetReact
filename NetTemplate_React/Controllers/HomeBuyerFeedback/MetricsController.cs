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
    public class MetricsController : ControllerBase
    {
        private readonly IMetricsServices _service;

        public MetricsController(IMetricsServices service)
        {
            _service = service;
        }

        [HttpGet("questions/percentage")]
        public async Task<IActionResult> GetQuestionPercentage()
        {
            Response response = await _service.GetQuestionPercentage();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpGet("answered-surveys")]
        public async Task<IActionResult> GetAnsweredSurveys()
        {
            var response = await _service.GetAnsweredSurveys();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpGet("hiplus-answers")]
        public async Task<IActionResult> GetMetricsHiPlusDownload()
        {
            var response = await _service.GetMetricsHiPlusDownload();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpGet("loan-overall-satisfactory")]
        public async Task<IActionResult> GetOverallSatisfactionLoanProcess()
        {
            var response = await _service.GetOverallSatisfactionLoanProcess();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }
    }

}

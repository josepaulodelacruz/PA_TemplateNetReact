using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NetTemplate_React.Models.Setup;
using NetTemplate_React.Services.Setup;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NetTemplate_React.Controllers.Setup
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class DocumentSetupController : ControllerBase
    {
        private readonly IDocumentSetupService _service;

        public DocumentSetupController(IDocumentSetupService service)
        {
            _service = service;
        }

        /// <summary>
        /// The signed in USERS.ID, taken from the token rather than the request body so
        /// the caller cannot claim to be somebody else.
        /// </summary>
        private long? CurrentUserId
        {
            get
            {
                string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                return long.TryParse(userId, out long parsed) ? parsed : (long?)null;
            }
        }

        // GET api/DocumentSetup?page=1&pageSize=10&search=
        [HttpGet]
        public async Task<IActionResult> Get(int page = 1, int pageSize = 10, string search = "")
        {
            var response = await _service.GetCategories(page, pageSize, search);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/DocumentSetup/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _service.GetCategoryById(id);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/DocumentSetup/5/sub-categories
        [HttpGet("{id}/sub-categories")]
        public async Task<IActionResult> GetSubCategories(int id)
        {
            var response = await _service.GetSubCategories(id);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/DocumentSetup/options?mainId=1&subId=2
        [HttpGet("options")]
        public async Task<IActionResult> GetOptions(int? mainId = null, int? subId = null)
        {
            var response = await _service.GetOptions(mainId, subId);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // POST api/DocumentSetup
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DocumentCategory category)
        {
            var response = await _service.CreateCategory(category, CurrentUserId);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // PUT api/DocumentSetup/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] DocumentCategory category)
        {
            var response = await _service.UpdateCategory(id, category, CurrentUserId);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // POST api/DocumentSetup/5/sub-categories
        [HttpPost("{id}/sub-categories")]
        public async Task<IActionResult> PostSubCategory(int id, [FromBody] DocumentSubCategory subCategory)
        {
            var response = await _service.CreateSubCategory(id, subCategory, CurrentUserId);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // POST api/DocumentSetup/options
        [HttpPost("options")]
        public async Task<IActionResult> PostOption([FromBody] DocumentOption option)
        {
            var response = await _service.CreateOption(option);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // DELETE api/DocumentSetup/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _service.DeleteCategory(id);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // DELETE api/DocumentSetup/sub-categories/5
        [HttpDelete("sub-categories/{subId}")]
        public async Task<IActionResult> DeleteSubCategory(int subId)
        {
            var response = await _service.DeleteSubCategory(subId);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // DELETE api/DocumentSetup/options/5
        [HttpDelete("options/{optionId}")]
        public async Task<IActionResult> DeleteOption(int optionId)
        {
            var response = await _service.DeleteOption(optionId);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }
    }
}

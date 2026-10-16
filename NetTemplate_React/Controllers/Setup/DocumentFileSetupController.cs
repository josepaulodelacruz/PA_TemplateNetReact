using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NetTemplate_React.Models.Setup;
using NetTemplate_React.Services.Setup;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NetTemplate_React.Controllers.Setup
{
    [Route("api/Setup/[controller]")]
    [Authorize]
    [ApiController]
    public class DocumentFileSetupController : ControllerBase
    {
        private readonly IFileSetupService _service;

        public DocumentFileSetupController(IFileSetupService service)
        {
            _service = service;
        }

        /// <summary>
        /// The signed in USERNAME, taken from the token rather than the request body so
        /// the caller cannot claim to be somebody else. [DOC].[FilesDocumentHDR] stores
        /// the name, so the USERS.ID of the token is only the fallback.
        /// </summary>
        private string CurrentUserName
        {
            get
            {
                return User.FindFirst(ClaimTypes.Name)?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }
        }

        [HttpGet("labels")]
        public async Task<IActionResult> GetLabels()
        {
            var response = await _service.GetLabels();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/Setup/DocumentFileSetup/documents
        [HttpGet("documents")]
        public async Task<IActionResult> GetDocuments()
        {
            var response = await _service.GetDocuments();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // POST api/Setup/DocumentFileSetup/documents
        [HttpPost("documents")]
        public async Task<IActionResult> PostDocument([FromBody] DocumentFile document)
        {
            /*THE PROC INSERTS ON @FILE_ID = 0, SO A POST NEVER CARRIES ONE*/
            if (document != null) document.Id = 0;

            var response = await _service.SaveDocument(document, CurrentUserName);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // PUT api/Setup/DocumentFileSetup/documents/5
        [HttpPut("documents/{id}")]
        public async Task<IActionResult> PutDocument(int id, [FromBody] DocumentFile document)
        {
            if (document != null) document.Id = id;

            var response = await _service.SaveDocument(document, CurrentUserName);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/Setup/DocumentFileSetup/schemes
        [HttpGet("schemes")]
        public async Task<IActionResult> GetSchemes()
        {
            var response = await _service.GetSchemes();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/Setup/DocumentFileSetup/matrix/lookups
        [HttpGet("matrix/lookups")]
        public async Task<IActionResult> GetMatrixLookups()
        {
            var response = await _service.GetMatrixLookups();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        /// <summary>
        /// One tab of the matrix. The scheme travels in the route rather than the query
        /// so the client can cache a tab per URL.
        /// </summary>
        // GET api/Setup/DocumentFileSetup/matrix/BANK
        [HttpGet("matrix/{financingScheme}")]
        public async Task<IActionResult> GetMatrix(string financingScheme)
        {
            var response = await _service.GetMatrix(financingScheme);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/Setup/DocumentFileSetup/matrix/BANK/unmapped
        [HttpGet("matrix/{financingScheme}/unmapped")]
        public async Task<IActionResult> GetUnmappedDocuments(string financingScheme)
        {
            var response = await _service.GetUnmappedDocuments(financingScheme);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // POST api/Setup/DocumentFileSetup/matrix/BANK/rows
        [HttpPost("matrix/{financingScheme}/rows")]
        public async Task<IActionResult> PostMatrixRow(string financingScheme, [FromBody] MatrixChecklistRow row)
        {
            /*THE PROC INSERTS ON @HDR_ID = 0, SO A POST NEVER CARRIES ONE*/
            if (row != null) row.Id = 0;

            var response = await _service.SaveMatrixRow(financingScheme, row, CurrentUserName);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // PUT api/Setup/DocumentFileSetup/matrix/BANK/rows/5
        [HttpPut("matrix/{financingScheme}/rows/{id}")]
        public async Task<IActionResult> PutMatrixRow(string financingScheme, int id, [FromBody] MatrixChecklistRow row)
        {
            if (row != null) row.Id = id;

            var response = await _service.SaveMatrixRow(financingScheme, row, CurrentUserName);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // DELETE api/Setup/DocumentFileSetup/matrix/rows/5
        [HttpDelete("matrix/rows/{id}")]
        public async Task<IActionResult> DeleteMatrixRow(int id)
        {
            var response = await _service.DeleteMatrixRow(id, CurrentUserName);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }
    }
}

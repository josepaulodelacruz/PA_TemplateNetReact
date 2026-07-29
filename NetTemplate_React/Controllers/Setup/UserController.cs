using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NetTemplate_React.Models;
using NetTemplate_React.Services.Setup;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NetTemplate_React.Controllers.Setup
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService service, ILogger<UserController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUser([FromQuery] string search)
        {
            var response = await _service.SearchUser(search);

            if (!response.Success && response.IsCrash) return StatusCode(500, response);
            else if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET: api/<UserController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await _service.GetUsers();

            if (!response.Success && response.IsCrash)
                return StatusCode(500, response);
            else if (!response.Success)
                return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        // GET api/<UserController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id = null)
        {
            if (id.Contains("null")) return BadRequest("id must not be null");
            _logger.LogInformation("ATTEMPTING TO SEARCH BY USER");

            var response = await _service.GetUsers(id);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);

        }

        //PUT api/<UserController/5
        [HttpPut("change-status/{id}")]
        public async Task<IActionResult> ChangeUserStatus(int id, [FromQuery] bool is_active)
        {
            var response = await _service.ChangeUserStatus(id, is_active);

            if (!response.Success) new BadRequestObjectResult(response);

            return Ok(response);
        }

        // PUT api/<UserController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var response = await _service.GetEmployees();

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

        [HttpPost("employees")]
        public async Task<IActionResult> AddEmployeeAccess([FromQuery] string username)
        {
            var response = await _service.AddEmployee(username);

            if (!response.Success) return new BadRequestObjectResult(response);

            return new OkObjectResult(response);
        }

    }

}


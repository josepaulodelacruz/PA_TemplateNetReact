using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Structures.General
{
    public class Response
    {
        [Required]
        public string ErrorMessage { get; set; }

        [Required]
        public bool Status { get; set; }

        [Required]
        public Object Data { get; set; }
    }
}

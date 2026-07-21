using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Structures.Connection
{
    public class Connection
    {
        [Required]
        public string ConnectionString { get; set; }

        [Required]
        public int ConnectionTimeout { get; set; }

        [Required]
        public bool IsLive { get; set; }
    }
}

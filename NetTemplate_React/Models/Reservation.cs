using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace NetTemplate_React.Models
{

    public class Reservation
    {
    }


    public class FeedbackFormRequest 
    {
        [JsonProperty("response_id")]
        [Required]
        public string ResponseId { get; set; }

        [JsonProperty("concern")]
        public string Concern { get; set; }

        [JsonProperty("action_taken")]
        public string ActionTaken { get; set; }

        [JsonProperty("status")]
        [Required]
        public bool Status { get; set; }

        [JsonProperty("created_by")]
        public string CreatedBy { get; set; }
    }
}

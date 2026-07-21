using Structures.General;
using System;
using System.Threading.Tasks;

namespace Authenticate
{
    public class LDAP
    {
        public Response ValidateLogin(string inUsername, string inPassword)
        {
            try
            {
                bool isSuccessful = false;

                PAWebService.ValidateLoginSoapClient validateLoginSoapClient = new PAWebService.ValidateLoginSoapClient(PAWebService.ValidateLoginSoapClient.EndpointConfiguration.ValidateLoginSoap);
                Task<PAWebService.ValidateLoginLDAPResponse> response = validateLoginSoapClient.ValidateLoginLDAPAsync(inUsername, inPassword);

                isSuccessful = response.Result.Body.ValidateLoginLDAPResult;

                if (!isSuccessful) throw new Exception("Incorrect Username or Password");

                return new Response
                {
                    Status = true,
                    Data = isSuccessful
                };
            }
            catch (Exception ex)
            {
                return new Response
                {
                    ErrorMessage = ex.Message,
                    Status = false,
                    Data = false
                };
            }
        }
    }
}

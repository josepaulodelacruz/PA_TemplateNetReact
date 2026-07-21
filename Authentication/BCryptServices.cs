using System;
using System.Collections.Generic;
using System.Text;

namespace Authenticate
{
    public class BCryptServices
    {
        public string HashPassword(string inPassword)
        {
            return BCrypt.Net.BCrypt.HashPassword(inPassword);
        }

        public bool CheckHashPassword(string inPassword, string inHashPassword)
        {
            return BCrypt.Net.BCrypt.Verify(inPassword, inHashPassword);
        }
    }
}

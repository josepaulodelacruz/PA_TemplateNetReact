using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace Authenticate
{
    public class PasswordServices
    {
        public string HashPassword(string inPassword)
        {
            string outHashPassword = "";

            using (SHA512 sha512 = new SHA512Managed())
            {
                byte[] byteArray = Encoding.ASCII.GetBytes(inPassword);

                outHashPassword = sha512.ComputeHash(byteArray).ToString();
            }

            return outHashPassword;
        }

        public bool CheckHashPassword(string inPassword, string inHashPassword)
        {
            bool isValid = false;

            using (SHA512 sha512 = new SHA512Managed())
            {
                byte[] byteArray = Encoding.ASCII.GetBytes(inPassword);

                isValid = sha512.ComputeHash(byteArray).ToString() == inHashPassword;
            }

            return isValid;
        }
    }
}

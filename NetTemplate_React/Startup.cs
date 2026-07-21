using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Microsoft.IO;
using NetTemplate_React.Middleware;
using NetTemplate_React.Services;
using NetTemplate_React.Services.Reports;
using NetTemplate_React.Services.Setup;

namespace NetTemplate_React
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            // Other service registrations
            services.AddJwtTokenValidation(Configuration);
            services.AddMvc();

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
                
            });

            services.AddCors(options =>
            {
                string[] allowedOrigins = new[]
                {
                    "http://localhost:5173",
                    "http://localhost:4173",
                };

                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder.WithOrigins(allowedOrigins) //add front end url if deployed
                    .AllowAnyHeader()
                    .AllowAnyMethod());
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            bool IsLive = bool.Parse(Configuration.GetConnectionString("ISLive"));
            var conString = !IsLive ? Configuration.GetConnectionString("DEV") : Configuration.GetConnectionString("PROD");

            //injected services
            services.AddScoped<IAuthService, AuthService>(options => new AuthService(conString: conString, configuration: Configuration));

            //Dashboard services
            services.AddScoped<IMetricsServices, MetricsServices>(options => new MetricsServices(conString: conString));

            //setups
            services.AddScoped<IModuleItemService, ModuleItemService>(options => new ModuleItemService(conString: conString, configuration: Configuration));
            services.AddScoped<IUserService, UserService>(options => new UserService(conString: conString, configuration: Configuration));
            services.AddScoped<IUserPermissionService, UserPermissionService>(options => new UserPermissionService(conString: conString, config: Configuration));
            services.AddScoped<IUserHistoryService, UserHistoryService>(options => new UserHistoryService(conString: conString, logger: new LoggerFactory()));

            //reports
            services.AddScoped<ICrashReportService, CrashReportService>(options => new CrashReportService(conString: conString, logger: new LoggerFactory()));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            // Path to React build folder
            ///important build the front-end first before publishing the .net project
            //var clientAppDist = Path.Combine(Directory.GetCurrentDirectory(), "ClientApp/FrontEnd", "dist"); 

            //// Serve static files (CSS, JS, images) from React build
            //app.UseStaticFiles(new StaticFileOptions
            //{
            //    FileProvider = new PhysicalFileProvider(clientAppDist),
            //    RequestPath = ""
            //});

            // Serve index.html for any unmatched routes (React Router will handle frontend routing)
            //app.Use(async (context, next) =>
            //{
            //    await next();

            //    if (context.Response.StatusCode == 404 &&
            //        !Path.HasExtension(context.Request.Path.Value) &&
            //        !context.Request.Path.Value.StartsWith("/api"))
            //    {
            //        context.Response.StatusCode = 200;
            //        await context.Response.SendFileAsync(Path.Combine(clientAppDist, "index.html"));
            //    }
            //});

            app.UseAuthentication();

            // Optional: Custom token validation middleware
            app.UseMiddleware<TokenValidationMiddleware>();


            // Use MVC for API controllers
            app.UseCookiePolicy();

            //app.UseAPILogger();
            app.UseLoggerMIddleware();


            app.UseCors("AllowSpecificOrigin");

            app.UseMvc();
        }
    }
}

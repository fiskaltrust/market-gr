var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.fiskaltrust_Api_Government_GR>("fiskaltrust-api-government-gr");

builder.Build().Run();

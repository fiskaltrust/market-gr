using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using System;
using System.Threading.Tasks;

namespace KeyVaultConsole
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Azure Key Vault Secret Manager");
            Console.WriteLine("------------------------------");

            // Get Key Vault parameters from command line arguments or prompt for them
            string keyVaultUrl = GetRequiredParam(args, 0, "Enter Key Vault URL (e.g. https://myvault.vault.azure.net/):");
            string clientId = GetRequiredParam(args, 1, "Enter Client ID:");
            string clientSecret = GetRequiredParam(args, 2, "Enter Client Secret:");

            try
            {
                // Create a client to authenticate to Azure
                var credential = new ClientSecretCredential(
                    tenantId: GetRequiredParam(args, 3, "Enter Tenant ID:"),
                    clientId: clientId,
                    clientSecret: clientSecret);

                // Create a client to access Key Vault
                var client = new SecretClient(new Uri(keyVaultUrl), credential);

                Console.WriteLine("\nConnecting to Key Vault...");
                
                // List all secrets
                Console.WriteLine("\nRetrieving all secrets from Key Vault:");
                Console.WriteLine("----------------------------------------");
                
                // Create a dictionary to store the secrets
                var secrets = new Dictionary<string, string>();

                // Fetch and display all secret names
                int secretCount = 0;
                await foreach (var secretProperties in client.GetPropertiesOfSecretsAsync())
                {
                    secretCount++;
                    Console.WriteLine($"{secretCount}. {secretProperties.Name}");

                    // Download the actual secret value
                    KeyVaultSecret secret = await client.GetSecretAsync(secretProperties.Name);
                    secrets.Add(secret.Name, secret.Value);
                }

                if (secretCount == 0)
                {
                    Console.WriteLine("No secrets found in the Key Vault.");
                    return;
                }

                Console.WriteLine($"\nSuccessfully retrieved {secretCount} secrets from Key Vault.");

                // Option to display secret values
                Console.Write("\nDo you want to display the secret values? (y/n): ");
                var displayChoice = Console.ReadLine()?.ToLower();

                if (displayChoice == "y")
                {
                    Console.WriteLine("\nSecret Values:");
                    Console.WriteLine("--------------");
                    foreach (var secret in secrets)
                    {
                        Console.WriteLine($"{secret.Key}: {secret.Value}");
                    }
                }

                // Option to save secrets to a file
                Console.Write("\nDo you want to save the secrets to a file? (y/n): ");
                var saveChoice = Console.ReadLine()?.ToLower();

                if (saveChoice == "y")
                {
                    Console.Write("Enter file path to save secrets: ");
                    string filePath = Console.ReadLine() ?? "secrets.txt";

                    await File.WriteAllLinesAsync(filePath, 
                        secrets.Select(s => $"{s.Key}={s.Value}"));
                    
                    Console.WriteLine($"Secrets saved to {Path.GetFullPath(filePath)}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
            }

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }

        private static string GetRequiredParam(string[] args, int index, string prompt)
        {
            if (args.Length > index && !string.IsNullOrEmpty(args[index]))
            {
                return args[index];
            }
            
            Console.Write(prompt + " ");
            string? input = Console.ReadLine();
            
            while (string.IsNullOrEmpty(input))
            {
                Console.Write("Value cannot be empty. " + prompt + " ");
                input = Console.ReadLine();
            }
            
            return input;
        }
    }
}

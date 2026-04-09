namespace fiskaltrust.Api.Government.GR.Services;

public class Credentials
{
    public Guid AccountId { get; set; }
    public string? AccessToken { get; set; }
    public CredentialType CredentialType { get; set; }
}

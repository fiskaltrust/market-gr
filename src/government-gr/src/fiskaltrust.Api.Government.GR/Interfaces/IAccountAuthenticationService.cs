namespace fiskaltrust.Api.Government.GR.Interfaces;

public interface IAccountAuthenticationService
{
    Task<bool> IsValidAccountAccessTokenAsync(Guid accountId, string headerAccessToken);
}

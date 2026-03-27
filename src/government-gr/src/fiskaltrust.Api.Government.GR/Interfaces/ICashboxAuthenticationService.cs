using fiskaltrust.Api.Government.GR.Services;

namespace fiskaltrust.Api.Government.GR.Interfaces;

public interface ICashboxAuthenticationService
{
    Task<(bool isValid, Credentials credentials)> IsValidAccountAccessTokenAsync(Guid cashboxId, string headerAccessToken);
}

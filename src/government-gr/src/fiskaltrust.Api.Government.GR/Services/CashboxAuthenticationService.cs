using fiskaltrust.Api.Government.GR.Interfaces;

namespace fiskaltrust.Api.Government.GR.Services;

public class CashboxAuthenticationService(ICommonContextRepository commonContextRepository) : ICashboxAuthenticationService
{
    private readonly ICommonContextRepository _commonContextRepository = commonContextRepository;

    public async Task<(bool isValid, Credentials credentials)> IsValidAccountAccessTokenAsync(Guid cashboxId, string headerAccessToken)
    {
        var credentials = await _commonContextRepository.GetCredentialsByCashBoxIdAsync(cashboxId);
        if (credentials == null)
        {
            return (false, null);
        }
        if (credentials.AccessToken != headerAccessToken)
        {
            return (false, credentials);
        }
        return (true, credentials);
    }
}

using fiskaltrust.Api.Government.GR.Interfaces;

namespace fiskaltrust.Api.Government.GR.Services;

public class AccountAuthenticationService(ICommonContextRepository commonContextRepository) : IAccountAuthenticationService
{
    private readonly ICommonContextRepository _commonContextRepository = commonContextRepository;

    public async Task<bool> IsValidAccountAccessTokenAsync(Guid accountId, string headerAccessToken)
    {
        var credentials = await _commonContextRepository.GetCredentialsByAccountIdAsync(accountId);
        if (credentials == null)
        {
            return false;
        }
        if (credentials.AccessToken != headerAccessToken)
        {
            return false;
        }
        return true;
    }
}

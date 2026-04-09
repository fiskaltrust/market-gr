namespace fiskaltrust.Api.Government.GR.Services;

public interface ICommonContextRepository
{
    Task<bool> IsHealthyAsync();
    Task<Credentials?> GetCredentialsByCashBoxIdAsync(Guid id);
    Task<Credentials?> GetCredentialsByAccountIdAsync(Guid id);
}

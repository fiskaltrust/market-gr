using Dapper;
using Microsoft.Data.SqlClient;

namespace fiskaltrust.Api.Government.GR.Services;

public class CommonContextRepository : ICommonContextRepository
{
    private readonly string _connectionString;

    public CommonContextRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    public async Task<bool> IsHealthyAsync()
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            await connection.ExecuteScalarAsync<int>("SELECT 1");
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<Credentials?> GetCredentialsByCashBoxIdAsync(Guid id)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "SELECT PosOperatorId AS AccountId, AccessToken FROM CashBox WHERE ftCashBoxId = @Id";
        var result = await connection.QuerySingleOrDefaultAsync<Credentials>(query, new { Id = id });

        if (result == null)
            return null;

        result.CredentialType = CredentialType.CashBox;
        return result;
    }

    public async Task<Credentials?> GetCredentialsByAccountIdAsync(Guid id)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = "SELECT AccountId, AccessToken FROM Account WHERE AccountId = @Id";
        var result = await connection.QuerySingleOrDefaultAsync<Credentials>(query, new { Id = id });

        if (result == null)
            return null;

        result.CredentialType = CredentialType.Account;
        return result;
    }
}

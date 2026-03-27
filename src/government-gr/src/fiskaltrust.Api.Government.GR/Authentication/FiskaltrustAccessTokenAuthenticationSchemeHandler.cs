using System.Security.Claims;
using System.Security.Principal;
using System.Text.Encodings.Web;
using fiskaltrust.Api.Government.GR.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace fiskaltrust.Api.Government.GR.Authentication;

public class FiskaltrustAuthenticationSchemeOptions : AuthenticationSchemeOptions { }

public class FiskaltrustAccessTokenAuthenticationSchemeHandler : AuthenticationHandler<FiskaltrustAuthenticationSchemeOptions>
{
    private readonly ICashboxAuthenticationService _cashboxAuthenticationService;
    private readonly IAccountAuthenticationService _accountAuthenticationService;
    private readonly ILogger<FiskaltrustAccessTokenAuthenticationSchemeHandler> _logger;

    public FiskaltrustAccessTokenAuthenticationSchemeHandler(
        IOptionsMonitor<FiskaltrustAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        ICashboxAuthenticationService cashboxAuthenticationService,
        IAccountAuthenticationService accountAuthenticationService,
        UrlEncoder encoder) : base(options, logger, encoder)
    {
        _cashboxAuthenticationService = cashboxAuthenticationService;
        _accountAuthenticationService = accountAuthenticationService;
        _logger = logger.CreateLogger<FiskaltrustAccessTokenAuthenticationSchemeHandler>();
    }

    public static Guid? GetAccountId(ClaimsPrincipal? principal)
    {
        var accountIdClaim = principal?.FindFirst("account-id")?.Value;
        if (accountIdClaim != null && Guid.TryParse(accountIdClaim, out var accountId))
        {
            return accountId;
        }
        return null;
    }

    protected async override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!string.IsNullOrEmpty(Request.Headers["x-cashbox-id"]))
        {
            return await HandleCashboxAuthenticationAsync();
        }

        if (!string.IsNullOrEmpty(Request.Headers["x-account-id"]))
        {
            return await HandleAccountAuthenticationAsync();
        }

        return AuthenticateResult.Fail("Neither x-cashbox-id nor x-account-id provided");
    }

    private async Task<AuthenticateResult> HandleCashboxAuthenticationAsync()
    {
        Guid cashboxId;
        string accesstoken;

        try
        {
            cashboxId = Guid.Parse(Request.Headers["x-cashbox-id"]!);
        }
        catch (Exception)
        {
            return AuthenticateResult.Fail("x-cashbox-id is no guid");
        }

        if (!string.IsNullOrEmpty(Request.Headers["x-cashbox-accesstoken"]))
        {
            accesstoken = Request.Headers["x-cashbox-accesstoken"]!;
        }
        else
        {
            return AuthenticateResult.Fail("x-cashbox-accesstoken not provided");
        }

        try
        {
            (var isValid, var credentials) = await _cashboxAuthenticationService.IsValidAccountAccessTokenAsync(cashboxId, accesstoken);
            if (!isValid)
            {
                return AuthenticateResult.Fail("Unauthorized");
            }

            var identity = new GenericIdentity(cashboxId.ToString());
            identity.AddClaim(new Claim("auth-type", "cashbox"));
            identity.AddClaim(new Claim("cashbox-id", cashboxId.ToString()));
            identity.AddClaim(new Claim("account-id", credentials.AccountId.ToString()));
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Authentication failed for cashbox {cashboxId}: {message}", cashboxId, ex.Message);
            return AuthenticateResult.Fail("Unauthorized");
        }
    }

    private async Task<AuthenticateResult> HandleAccountAuthenticationAsync()
    {
        Guid accountId;
        string accesstoken;

        try
        {
            accountId = Guid.Parse(Request.Headers["x-account-id"]!);
        }
        catch (Exception)
        {
            return AuthenticateResult.Fail("x-account-id is no guid");
        }

        if (!string.IsNullOrEmpty(Request.Headers["x-account-accesstoken"]))
        {
            accesstoken = Request.Headers["x-account-accesstoken"]!;
        }
        else
        {
            return AuthenticateResult.Fail("x-account-accesstoken not provided");
        }

        try
        {
            if (!await _accountAuthenticationService.IsValidAccountAccessTokenAsync(accountId, accesstoken))
            {
                return AuthenticateResult.Fail("Unauthorized");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Account authentication failed for account {accountId}: {message}", accountId, ex.Message);
            return AuthenticateResult.Fail("Unauthorized");
        }

        var identity = new GenericIdentity(accountId.ToString());
        identity.AddClaim(new Claim("auth-type", "account"));
        identity.AddClaim(new Claim("account-id", accountId.ToString()));
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return AuthenticateResult.Success(ticket);
    }
}

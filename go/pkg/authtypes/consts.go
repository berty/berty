package authtypes

type ContextAuthValue uint32

const (
	AuthResponseType        = "code"
	AuthGrantType           = "authorization_code"
	AuthRedirect            = "berty://services-auth/"
	AuthClientID            = "berty"
	AuthCodeChallengeMethod = "S256"

	ServiceReplicationID = "rpl"
	ServicePushID        = "psh"

	ContextTokenHashField ContextAuthValue = iota
	ContextTokenIssuerField

	AuthHTTPPathTokenExchange = "/oauth/token" // nolint:gosec
	AuthHTTPPathAuthorize     = "/authorize"
)

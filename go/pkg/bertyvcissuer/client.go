package bertyvcissuer

import (
	"context"
	"crypto"
	crand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	"github.com/piprate/json-gold/ld"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/verifiablecredstypes"
)

const DefaultRedirectURI = "berty://vc"

type Client struct {
	serverRoot  string
	redirectURI string
	httpClient  *http.Client
	state       string
	bertyURL    string
}

func NewClient(serverRoot string) *Client {
	return &Client{
		serverRoot:  serverRoot,
		redirectURI: DefaultRedirectURI,
		httpClient:  http.DefaultClient,
	}
}

func (c *Client) Init(ctx context.Context, bertyURL string, accountPriv crypto.Signer) (string, error) {
	c.state = base64.RawURLEncoding.EncodeToString([]byte(time.Now().String()))
	c.bertyURL = bertyURL

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/%s?%s=%s&%s=%s&%s=%s", c.serverRoot, PathChallenge, ParamBertyID, url.QueryEscape(bertyURL), ParamRedirectURI, url.QueryEscape(c.redirectURI), ParamState, url.QueryEscape(c.state)), nil)
	if err != nil {
		return "", errcode.ErrInternal.Wrap(err)
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return "", errcode.ErrStreamRead.Wrap(err)
	}

	resBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", errcode.ErrStreamRead.Wrap(err)
	}

	_ = res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", errcode.ErrInternal.Wrap(fmt.Errorf(string(resBytes)))
	}

	challengeStruct := &verifiablecredstypes.AccountCryptoChallenge{}
	err = json.Unmarshal(resBytes, challengeStruct)
	if err != nil {
		return "", errcode.ErrDeserialization.Wrap(err)
	}

	challenge, err := base64.URLEncoding.DecodeString(challengeStruct.Challenge)
	if err != nil {
		return "", errcode.ErrDeserialization.Wrap(err)
	}

	challengeSig, err := accountPriv.Sign(crand.Reader, challenge, crypto.Hash(0))
	if err != nil {
		return "", errcode.ErrCryptoSignature.Wrap(err)
	}

	return fmt.Sprintf("%s/%s?&%s=%s&%s=%s", c.serverRoot, PathAuthenticate, ParamChallenge, challengeStruct.Challenge, ParamChallengeSig, base64.URLEncoding.EncodeToString(challengeSig)), nil
}

func (c *Client) Complete(uri string) (string, string, error) {
	parsedURI, err := url.Parse(uri)
	if err != nil {
		return "", "", errcode.ErrInvalidInput.Wrap(err)
	}

	if parsedURI.Query().Get(ParamState) != c.state {
		return "", "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("unexpected state value"))
	}

	credentialsStr := parsedURI.Query().Get(ParamCredentials)
	if len(credentialsStr) == 0 {
		return "", "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing credentials value"))
	}

	credentials, err := base64.StdEncoding.DecodeString(credentialsStr)
	if err != nil {
		return "", "", errcode.ErrDeserialization.Wrap(err)
	}

	parsedCredential, err := verifiable.ParseCredential(
		credentials,
		verifiable.WithPublicKeyFetcher(EmbeddedPublicKeyFetcher),
		verifiable.WithJSONLDDocumentLoader(ld.NewDefaultDocumentLoader(http.DefaultClient)),
	)
	if err != nil {
		return "", "", errcode.ErrDeserialization.Wrap(err)
	}

	if c.bertyURL != parsedCredential.ID {
		return "", "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("credential is not delivered for the current berty url (%s != %s)", c.bertyURL, parsedCredential.ID))
	}

	identifier, err := extractSubjectFromVC(parsedCredential)
	if err != nil {
		return "", "", errcode.ErrInvalidInput.Wrap(err)
	}

	return string(credentials), identifier, nil
}

func extractSubjectFromVC(credential *verifiable.Credential) (string, error) {
	if credential.Subject == nil {
		return "", errcode.ErrNotFound
	}

	if subjectList, ok := credential.Subject.([]verifiable.Subject); ok {
		if len(subjectList) == 0 {
			return "", errcode.ErrNotFound
		}

		return subjectList[0].ID, nil
	}

	return "", errcode.ErrNotFound
}

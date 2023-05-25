package bertyauth

import (
	_ "embed"
	"html/template"
)

//go:embed templates/redirect.html.tmpl
var templateAuthTokenServerRedirectStr string

//go:embed templates/authorize.html.tmpl
var templateAuthTokenServerAuthorizeButton string

var templateAuthTokenServerRedirect = template.Must(template.New("redirect").Parse(templateAuthTokenServerRedirectStr))

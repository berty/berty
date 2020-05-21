package discordlog

import (
	"os"
	"testing"
)

func TestShareQRLink(t *testing.T) {
	if os.Getenv("BERTY_TEST_DISCORD") != "1" {
		t.Skip()
	}
	err := ShareQRLink("go test -v", QRCodeRoom, "Lorem Ipsum", "https://berty.tech", "https://berty.tech")
	if err != nil {
		t.Fatal(err)
	}
}

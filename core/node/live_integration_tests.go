package node

import (
	"runtime"
	"testing"

	"berty.tech/core/crypto/enclave"
	"berty.tech/core/crypto/sigchain"
	c "github.com/smartystreets/goconvey/convey"
)

func allIntegrationTests(t *testing.T) {
	allTests := listIntegrationTests()

	for key, test := range allTests {
		if key == "all" {
			continue
		}

		t.Run(key, test)
	}
}

func keychainTests(t *testing.T) {
	c.Convey("Test enclave library", t, func() {
		c.Convey("Generated keypairs satisfy keypair.Interface and return valid pubkeys", func() {
			c.Convey("RSA Hardware keypair", func() {
				kp, err := enclave.NewRSAHardwareEnclave(2048)
				switch {
				case runtime.GOOS == "darwin":
					c.So(err, c.ShouldNotBeNil)
					return
				}

				// the keypair should satisfy keypair.Interface and return a valid pubkey
				sc := sigchain.SigChain{}
				c.So(sc.Init(kp, []byte("Test1")), c.ShouldBeNil)
				pub, err := kp.GetPubKey()
				c.So(err, c.ShouldBeNil)
				c.So(pub, c.ShouldNotBeNil)
			})
		})
	})
}

func alwaysTrueTests(t *testing.T) {
	c.Convey("Test will be valid", t, func() {
		c.So(nil, c.ShouldBeNil)
	})
}

func alwaysFalseTests(t *testing.T) {
	c.Convey("Test will be invalid", t, func() {
		c.So(nil, c.ShouldNotBeNil)
	})
}

func panickingTests(t *testing.T) {
	c.Convey("Test will be invalid", t, func() {
		panic("panic")
	})
}

func listIntegrationTests() map[string]func(*testing.T) {
	return map[string]func(*testing.T){
		"keychain":     keychainTests,
		"always-true":  alwaysTrueTests,
		"always-false": alwaysFalseTests,
		"panicking":    panickingTests,
		"all":          allIntegrationTests,
	}
}

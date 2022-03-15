package bertylinks_test

import (
	"bytes"
	"fmt"
	"math/rand"
	"os"
	"testing"

	"github.com/mdp/qrterminal"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"moul.io/srand"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestMarshalLink(t *testing.T) {
	cases := []struct {
		name                string
		input               *messengertypes.BertyLink
		expectErr           bool
		expectedWebURL      string
		expectedInternalURL string
	}{
		{
			"simple-contact",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_ContactInviteV1Kind,
				BertyID: &messengertypes.BertyID{
					DisplayName:          "Hello World!",
					PublicRendezvousSeed: []byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
					AccountPK:            []byte{2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2},
				},
			},
			false,
			"https://berty.tech/id#contact/3geQXHmsW9rxRfQFJdu8CEuPtWkfTWgJH13NzAoGatcnh4brusu3/name=Hello+World%21",
			"BERTY://PB/CAS8232WNWU-1HTSMNYD.USC3T4F.P.J.AFKOXTKI:-N4P9IJTERR3CTFD.:N$*$3RQZLIFMT3-$IN..",
		}, {
			"simple-group",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_GroupV1Kind,
				BertyGroup: &messengertypes.BertyGroup{
					DisplayName: "The Group Name!",
					Group: &protocoltypes.Group{
						PublicKey: []byte{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
						Secret:    []byte{4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4},
						SecretSig: []byte{5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5},
						GroupType: protocoltypes.GroupTypeMultiMember,
						SignPub:   []byte{6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6},
					},
				},
			},
			false,
			"https://berty.tech/id#group/rUwVHzzEiMxGhM7iY4wW5yZFH3ZcjiWAhxva6tXUcfniDsoT3rmF3WdshR8955KAgeCTvirdfppTAMehPqmBV1YYjAiXYUQm98J992TuPT/name=The+Group+Name%21",
			"BERTY://PB/.H:8XWGCG68:21MATDM7JR8Y6JMNJEVPISAXL274Y3VVDOPPUGK0LUYZ9X$FPFN*T93E08Y3$RYFIQFHJ3FY*79I75LU.5SJAKCS1PRLRYVLO.4-502DA4KL*E8WCGKEE1WGET$-0G7O1S7",
		}, {
			"contact-with-unicode",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_ContactInviteV1Kind,
				BertyID: &messengertypes.BertyID{
					DisplayName:          `!@#$%^&*()_+ ://` + string(rune(0x1F600)),
					PublicRendezvousSeed: []byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
					AccountPK:            []byte{2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2},
				},
			},
			false,
			"https://berty.tech/id#contact/3geQXHmsW9rxRfQFJdu8CEuPtWkfTWgJH13NzAoGatcnh4brusu3/name=%21%40%23%24%25%5E%26%2A%28%29_%2B+%3A%2F%2F%F0%9F%98%80",
			"BERTY://PB/BJ3W5ETGJU6$15FIE8U4:R300KUENPKC0J8YS6V02MXW9LDGPD6SVS/LU2TWQ8PGWF39R.ELP:-K:-4E30/.JNDU25WI",
		}, {
			"group-with-unicode",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_GroupV1Kind,
				BertyGroup: &messengertypes.BertyGroup{
					DisplayName: `!@#$%^&*()_=+ ://` + string(rune(0x1F600)),
					Group: &protocoltypes.Group{
						PublicKey: []byte{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
						Secret:    []byte{4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4},
						SecretSig: []byte{5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5},
						GroupType: protocoltypes.GroupTypeMultiMember,
						SignPub:   []byte{6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6},
					},
				},
			},
			false,
			"https://berty.tech/id#group/rUwVHzzEiMxGhM7iY4wW5yZFH3ZcjiWAhxva6tXUcfniDsoT3rmF3WdshR8955KAgeCTvirdfppTAMehPqmBV1YYjAiXYUQm98J992TuPT/name=%21%40%23%24%25%5E%26%2A%28%29_%3D%2B+%3A%2F%2F%F0%9F%98%80",
			"BERTY://PB/1FKTFXAW7RN$NCK6*$DSJREWJGK9IBQPJE:FZA4ZVM9DMH55U85P7IMU7OCQ.QE:9/98RB45ENQ61/X23FSZXH/U-XZJ.$E$4JNKK9L7-9F/8Z8DP78US/-6BZXX.$BJ6$NELVC$UREEQ8E8T//0NFE2",
		},
		// FIXME: invalid kind
		// FIXME: incomplete link
		// FIXME: encrypted contact
		// FIXME: encrypted group
		// FIXME: various empty args
		// FIXME: too longd
		// FIXME: without metadata (no url.Values)
		// FIXME: deprecated version
		// FIXME: with sensitive fields (skipped by the marshaler)
		// FIXME: with unused fields (skipped by the marshaler)
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			internal, web, err := bertylinks.MarshalLink(tc.input)
			if tc.expectErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)

			assert.Equal(t, tc.expectedWebURL, web)
			assert.Equal(t, tc.expectedInternalURL, internal)

			// internal QR code should always be more tiny or with an equivalent size than the web one
			assert.LessOrEqual(t,
				len(qrString(internal)),
				len(qrString(web)),
			)

			// unmarshal and compare with original input
			webLink, err := bertylinks.UnmarshalLink(web, nil)
			require.NoError(t, err)
			assert.Equal(t, tc.input, webLink)

			internalLink, err := bertylinks.UnmarshalLink(internal, nil)
			require.NoError(t, err)
			assert.Equal(t, tc.input, internalLink)
		})
	}
}

func TestUnmarshalLink(t *testing.T) {
	cases := []struct {
		name               string
		input              string
		expectedErrcode    error
		expectValidContact bool
		expectValidGroup   bool
		expectedName       string
	}{
		{"empty", "", errcode.ErrMissingInput, false, false, ""},
		{"invalid", "invalid", errcode.ErrInvalidInput, false, false, ""},
		{"invalid2", "berty://id/#key=blah&name=blih", errcode.ErrInvalidInput, false, false, ""},
		{"invalid3", "https://berty.tech/id#key=blah&name=blih", errcode.ErrInvalidInput, false, false, ""},
		{"invalid4", "berty://id/#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA&name=Alice", errcode.ErrInvalidInput, false, false, ""},           // previous format
		{"invalid5", "https://berty.tech/id#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA&name=Alice", errcode.ErrInvalidInput, false, false, ""}, // previous format
		{"invalid6", "berty://id/#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA", errcode.ErrInvalidInput, false, false, ""},                      // previous format
		{"invalid7", "https://berty.tech/id#key=CiDXcXUOl1rpm2FcbOf3TFtn-FYkl_sOwA5run1LGXHOPRIg4xCLGP-BWzgIWRH0Vz9D8aGAq1kyno5Oqv6ysAljZmA", errcode.ErrInvalidInput, false, false, ""},            // previous format
		{"invalid8", "https://berty.tech/id#contact/foobar/name=Alice", errcode.ErrInvalidInput, false, false, ""},
		{"invalid9", "https://berty.tech/id#group/foobar/name=Alice", errcode.ErrInvalidInput, false, false, ""},
		{"invalid10", "https://berty.tech/id#foobar/foobar/name=Alice", errcode.ErrInvalidInput, false, false, ""},
		{"invalid11", "https://berty.tech/id#foobar", errcode.ErrInvalidInput, false, false, ""},
		{"invalid12", "https://berty.tech/id#", errcode.ErrInvalidInput, false, false, ""},
		{"invalid13", "https://berty.tech/id", errcode.ErrInvalidInput, false, false, ""},
		{"invalid14", "https://berty.tech/", errcode.ErrInvalidInput, false, false, ""},
		{"invalid15", "https://invalid.domain/id#contact/" + validContactBlob + "/name=Alice", errcode.ErrInvalidInput, false, false, ""},
		{"valid-web-contact-v1-with-name", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice", nil, true, false, "Alice"},
		{"valid-internal-contact-v1", "BERTY://PB/" + validContactInternalBlob, nil, true, false, "moul (cli)"},
		{"valid-internal-contact-v1-alternative-scheme", "berty://pb/" + validContactInternalBlob, nil, true, false, "moul (cli)"},
		{"valid-web-contact-v1-without-name", "https://berty.tech/id#contact/" + validContactBlob, nil, true, false, ""},
		{"valid-web-contact-v1-with-unnecessary-fields", "https://berty.tech/id#contact/" + validContactBlob + "/foo=bar", nil, true, false, ""},
		{"valid-web-contact-v1-with-unnecessary-fields-and-name-1", "https://berty.tech/id#contact/" + validContactBlob + "/foo=bar&name=Alice", nil, true, false, "Alice"},
		{"valid-web-contact-v1-with-unnecessary-fields-and-name-2", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice&foo=bar", nil, true, false, "Alice"},
		{"valid-web-contact-v1-with-unnecessary-fields-and-name-3", "https://berty.tech/id#contact/" + validContactBlob + "/bar=foo&name=Alice&foo=bar", nil, true, false, "Alice"},
		{"valid-web-group-v1", "https://berty.tech/id#group/" + validGroupBlob + "/name=random-group-34191", nil, false, true, "random-group-34191"},
		{"valid-internal-group-v1", "BERTY://PB/" + validGroupInternalBlob, nil, false, true, "random-group-34191"},
		{"valid-escaped-name-1", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice%20Foobar", nil, true, false, "Alice Foobar"},
		{"valid-escaped-name-2", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice+Foobar", nil, true, false, "Alice Foobar"},
		{"valid-escaped-name-3", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice Foobar", nil, true, false, "Alice Foobar"},
		{"valid-escaped-name-4", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice/Foobar", nil, true, false, "Alice/Foobar"},
		{"valid-escaped-name-5", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice%2FFoobar", nil, true, false, "Alice/Foobar"},
		{"valid-escaped-name-6", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice%2fFoobar", nil, true, false, "Alice/Foobar"},
		{"valid-escaped-name-7", "https://berty.tech/id#contact/" + validContactBlob + "/name=Alice%26Bob", nil, true, false, "Alice&Bob"},
		{"valid-escaped-name-8", "https://berty.tech/id#contact/" + validContactBlob + "/foo=bar&name=Alice%26Bob&bar=foo", nil, true, false, "Alice&Bob"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			link, err := bertylinks.UnmarshalLink(tc.input, nil)
			if tc.expectedErrcode == nil {
				tc.expectedErrcode = errcode.ErrCode(-1)
			}
			assert.Equal(t, tc.expectedErrcode.Error(), errcode.Code(err).Error())
			if tc.expectValidContact {
				assert.True(t, link.IsContact())
				assert.Equal(t, tc.expectedName, link.BertyID.DisplayName)
			}
			if tc.expectValidGroup {
				assert.True(t, link.IsGroup())
				assert.Equal(t, tc.expectedName, link.BertyGroup.DisplayName)
			}
		})
	}
}

func TestMarshalLinkFuzzing(t *testing.T) {
	rand.Seed(srand.Fast())
	for i := 0; i < 100; i++ {
		link := &messengertypes.BertyLink{
			Kind:    messengertypes.BertyLink_ContactInviteV1Kind,
			BertyID: &messengertypes.BertyID{},
		}
		name := []rune{}
		for i := rand.Intn(64); i > 0; i-- {
			name = append(name, rune(rand.Intn(65535)))
		}
		link.BertyID.DisplayName = string(name)
		for i := 0; i < 32; i++ {
			link.BertyID.PublicRendezvousSeed = append(link.BertyID.PublicRendezvousSeed, byte(rand.Intn(255)))
			link.BertyID.AccountPK = append(link.BertyID.AccountPK, byte(rand.Intn(255)))
		}
		internal, web, err := bertylinks.MarshalLink(link)
		require.NoError(t, err)

		if os.Getenv("PRINT_FUZZ_RESULTS") == "1" {
			fmt.Print("\n\n\n\n\n\n\n")
			fmt.Println(web, len(web))
			fmt.Println(internal, len(internal))
			qrterminal.GenerateHalfBlock(web, qrterminal.M, os.Stdout)
			qrterminal.GenerateHalfBlock(internal, qrterminal.M, os.Stdout)
		}

		// internal QR code should always be more tiny or with an equivalent size than the web one
		assert.LessOrEqual(t,
			len(qrString(internal)),
			len(qrString(web)),
		)

		// unmarshal and compare with original input
		webLink, err := bertylinks.UnmarshalLink(web, nil)
		require.NoError(t, err)
		assert.Equal(t, link, webLink)

		internalLink, err := bertylinks.UnmarshalLink(internal, nil)
		require.NoError(t, err)
		assert.Equal(t, link, internalLink)
	}
}

func TestEncryptLink(t *testing.T) {
	cases := []struct {
		name                string
		link                *messengertypes.BertyLink
		passphrase          []byte
		expectedErrcode     error
		expectedDisplayName string
	}{
		{
			"simple-contact",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_ContactInviteV1Kind,
				BertyID: &messengertypes.BertyID{
					PublicRendezvousSeed: []byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
					AccountPK:            []byte{2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2},
				},
			},
			[]byte("s3cur3"),
			nil,
			"",
		}, {
			"simple-group",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_GroupV1Kind,
				BertyGroup: &messengertypes.BertyGroup{
					Group: &protocoltypes.Group{
						PublicKey:  []byte{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
						Secret:     []byte{4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4},
						SecretSig:  []byte{5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5},
						GroupType:  protocoltypes.GroupTypeMultiMember,
						SignPub:    []byte{6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6},
						LinkKeySig: []byte{7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7},
					},
				},
			},
			[]byte("s3cur3"),
			nil,
			"",
		}, {
			"simple-contact-clear-name",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_ContactInviteV1Kind,
				BertyID: &messengertypes.BertyID{
					DisplayName:          "Hello World!",
					PublicRendezvousSeed: []byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
					AccountPK:            []byte{2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2},
				},
			},
			[]byte("s3cur3"),
			nil,
			"Hello World!",
		}, {
			"simple-group-clear-name",
			&messengertypes.BertyLink{
				Kind: messengertypes.BertyLink_GroupV1Kind,
				BertyGroup: &messengertypes.BertyGroup{
					DisplayName: "The Group Name!",
					Group: &protocoltypes.Group{
						PublicKey:  []byte{3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3},
						Secret:     []byte{4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4},
						SecretSig:  []byte{5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5},
						GroupType:  protocoltypes.GroupTypeMultiMember,
						SignPub:    []byte{6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6},
						LinkKeySig: []byte{7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7},
					},
				},
			},
			[]byte("s3cur3"),
			nil,
			"The Group Name!",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			encrypted, err := bertylinks.EncryptLink(tc.link, tc.passphrase)
			if tc.expectedErrcode == nil {
				tc.expectedErrcode = errcode.ErrCode(-1)
			}
			assert.Equal(t, tc.expectedErrcode.Error(), errcode.Code(err).Error())

			internalURL, httpURL, err := bertylinks.MarshalLink(encrypted)
			require.NoError(t, err)

			tc.link.Encrypted = nil // hide this before making the comparison

			// decrypt with empty passphrase, and get a passphrase required error
			for _, u := range []string{internalURL, httpURL} {
				link, err := bertylinks.UnmarshalLink(u, nil)
				require.NoError(t, err)
				require.NotEqual(t, tc.link, link)
				require.Equal(t, link.Kind, messengertypes.BertyLink_EncryptedV1Kind)
			}

			// decrypt with invalid passphrase, and raise an error (invalid checksum).
			// since it may have false-positive, we give 10 tries and hope to have at least one that triggers an error.
			hasFailed := false
			for i := 0; i < 10; i++ {
				for _, u := range []string{internalURL, httpURL} {
					passphrase := fmt.Sprintf("invalid-%d", i)
					link, err := bertylinks.UnmarshalLink(u, []byte(passphrase))
					if err == nil {
						continue
					}
					hasFailed = true
					require.Error(t, err)
					assert.Equal(t, errcode.ErrMessengerDeepLinkInvalidPassphrase.Error(), err.Error())
					require.NotEqual(t, tc.link, link)
					break
				}
			}
			require.True(t, hasFailed)

			// here, it would be nice to add tests against conflicting invalid passphrases.
			// we already check this in TestDecryptLink, so it's just a bonus.

			// decrypt with good passphrase, and compare both links
			for _, u := range []string{internalURL, httpURL} {
				link, err := bertylinks.UnmarshalLink(u, tc.passphrase)
				require.NoError(t, err)
				require.Equal(t, tc.link, link)

				switch link.Kind {
				case messengertypes.BertyLink_ContactInviteV1Kind:
					require.Equal(t, tc.expectedDisplayName, link.BertyID.DisplayName)
				case messengertypes.BertyLink_GroupV1Kind:
					require.Equal(t, tc.expectedDisplayName, link.BertyGroup.DisplayName)
				}
			}
		})
	}
}

func qrString(url string) string {
	qrOut := new(bytes.Buffer)
	qrterminal.GenerateHalfBlock(url, qrterminal.L, qrOut)
	return qrOut.String()
}

const (
	// validContactBlob and validContactInternalBlob were generated thanks to `$ berty share-id`
	validContactBlob         = "oZBLF7M4A2Ff639sNSZB1qhygbEH89T1b9YcNBs81u8KQLMHTQp3Avx1dm9D2eW4omWQYN8D2kwcX8SWAoD3D7Eo8teNzjf"
	validContactInternalBlob = "NRRA6DJQB9USRIK1:IUUML2-IFBSG7CN6V7XM.UJD70:OI9S/1ZOT67.I443FR8TNRBODZSDLI4N5GSZNN5:V$R$JYYB-J9E854Y.H95CZQ/DVUTPDUJK9M0ARA*"

	// validGroupBlob and validGroupInternalBlob were generated thanks to `$ berty groupinit`
	validGroupBlob         = "8ejngpAxnMP44v7zSfzhJwCF3kfwFf1Yy7X9PoWNhnEFpPirg6jUKBYcoZP83tJ22y41P5uT5QBMTHkqc4UGTTVpinuBrEg45VB8sHbPePnKLy2XEUZ9ynxqVoSVWw3m3LFJHfs87q5MDmMsqX9i85MkKDDWY7mnCKNttJGcHrHnYxKyWdUKAqV2T3VbE2wG1PtnQUrSmbgAv5T7QnWV646qYJTqKydMtGTJUiWEdBPKkWDx7jkkovRh4LRXfKEpcwXHgRw3yFfC29pxP7mZK8xsz3t5"
	validGroupInternalBlob = "EHJBK/TI1ETK.QPUU.E0ONINK9ZDPW2:.NB4DH/7C.HSXI..XUIS82*J7M1GJVWX/:O7X1C36NC5YAHW-D-M7A8NBAW3NPQP-Z8H.VPJOFVH1*0*FN202136-91H/UTNJXSNVFY7E$NV$A/O1BYIR:*H.N3JELJJE5V*U5Y319YNA9S1R.3TNO4-*0HW4W9*W/T3LOD3LW2JA/0:LZ31LH.4VKNWGN*LF-:89MXMYEN*R7*LSYR"
)

func TestDecryptLink(t *testing.T) {
	buildLink := func(checksum []byte) *messengertypes.BertyLink {
		return &messengertypes.BertyLink{
			Kind: messengertypes.BertyLink_EncryptedV1Kind,
			Encrypted: &messengertypes.BertyLink_Encrypted{
				Kind:                        messengertypes.BertyLink_ContactInviteV1Kind,
				Nonce:                       b64decode(t, "rERlYwJHU96gpJKH6ky8WA=="),
				DisplayName:                 "Hello World!",
				ContactPublicRendezvousSeed: b64decode(t, "LAxeSZ19aHwzuK4ngqke4w=="),
				ContactAccountPK:            b64decode(t, "Bg26HLi8I6Gutd7aXEhlUQ=="),
				Checksum:                    checksum,
			},
		}
	}

	type testcase struct {
		name                 string
		link                 *messengertypes.BertyLink
		passphrase           []byte
		expectDecryptSucceed bool
		expectedErrcode      error
	}
	cases := []testcase{
		{"no-pass", buildLink(nil), nil, false, nil},
		{"no-cs-valid-pass", buildLink(nil), []byte("s3cur3"), true, nil},
		{"empty-cs-valid-pass", buildLink([]byte{}), []byte("s3cur3"), true, nil},
		{"valid-1c-cs-valid-pass", buildLink([]byte{44}), []byte("s3cur3"), true, nil},
		{"valid-2c-cs-valid-pass", buildLink([]byte{44, 11}), []byte("s3cur3"), true, nil},
		{"valid-10c-cs-valid-pass", buildLink([]byte{44, 11, 87, 233, 219, 36, 109, 59, 109, 244}), []byte("s3cur3"), true, nil},
		{"invalid-1c-cs-valid-pass", buildLink([]byte{42}), []byte("s3cur3"), false, errcode.ErrMessengerDeepLinkInvalidPassphrase},
		{"valid-1c-cs-invalid-pass", buildLink([]byte{44}), []byte("invalid"), false, errcode.ErrMessengerDeepLinkInvalidPassphrase},
		{"valid-1c-cs-invalid-pass-conflict", buildLink([]byte{44}), []byte("s3cur3-conflict-127"), false, nil},
		{"no-cs-invalid-pass", buildLink(nil), []byte("invalid"), false, nil},
		{"empty-cs-invalid-pass", buildLink([]byte{}), []byte("invalid"), false, nil},
	}

	// quick tool used to bruteforce and generate a valid conflict (uncomment to use it, run `go test -v`, and wait for a raise)
	// for i := 0; i < 5000; i++ {
	// 	cases = append(cases, testcase{fmt.Sprintf("tmp-%d", i), buildLink([]byte{44}), []byte(fmt.Sprintf("s3cur3-conflict-%d", i)), false, errcode.ErrMessengerDeepLinkInvalidPassphrase})
	// }

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			linkStr, _, err := bertylinks.MarshalLink(tc.link)
			require.NoError(t, err)
			ret, err := bertylinks.UnmarshalLink(linkStr, tc.passphrase)
			if tc.expectedErrcode == nil {
				tc.expectedErrcode = errcode.ErrCode(-1)
			}
			assert.Equal(t, tc.expectedErrcode.Error(), errcode.Code(err).Error())
			if tc.expectDecryptSucceed {
				require.NotNil(t, ret.BertyID)
				assert.Equal(t, ret.BertyID.PublicRendezvousSeed, []byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1})
			} else {
				assert.True(t, ret == nil || ret.BertyID == nil || !bytes.Equal(ret.BertyID.PublicRendezvousSeed, []byte{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}))
			}
		})
	}
}

func b64decode(t *testing.T, input string) []byte {
	t.Helper()
	b, err := u.B64Decode(input)
	require.NoError(t, err)
	return b
}

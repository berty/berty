package protocoldb

import (
	"testing"

	"berty.tech/go/internal/testutil"
)

func TestUsage(t *testing.T) {
	db := TestingSqliteDB(t, testutil.Logger(t)).
		Set("gorm:association_autoupdate", true).
		Set("gorm:association_autocreate", true)

	contactA := &Contact{
		AccountPubKey: []byte("pubkeyContactA"),
		BinderPubKey:  []byte("binderPubkeyContactA"),
		TrustLevel:    Contact_Accepted,
		OneToOneGroup: nil,
	}

	contactB := &Contact{
		AccountPubKey: []byte("pubkeyContactB"),
		BinderPubKey:  []byte("binderPubkeyContactA"),
		TrustLevel:    Contact_Accepted,
		OneToOneGroup: nil,
	}

	memberA := &GroupMember{
		GroupMemberPubKey:          []byte("groupMemberA"),
		ContactAccountBindingProof: []byte("groupMemberABindingProof"),
		Devices: []*GroupMemberDevice{
			&GroupMemberDevice{
				GroupMemberDevicePubKey: []byte("groupMemberDeviceA1"),
				DerivationState:         []byte("groupMemberDeviceA1Derivation"),
				DerivationCounter:       110,
				DerivationNextHotp:      []byte("groupMemberDeviceA1NextHOTP"),
			},
			&GroupMemberDevice{
				GroupMemberDevicePubKey: []byte("groupMemberDeviceA2"),
				DerivationState:         []byte("groupMemberDeviceA2Derivation"),
				DerivationCounter:       120,
				DerivationNextHotp:      []byte("groupMemberDeviceA2NextHOTP"),
			},
		},
		Contact: contactA,
	}

	memberB := &GroupMember{
		GroupMemberPubKey:          []byte("groupMemberB"),
		ContactAccountBindingProof: []byte("groupMemberBBindingProof"),
		Metadata:                   nil,
		Devices: []*GroupMemberDevice{
			&GroupMemberDevice{
				GroupMemberDevicePubKey: []byte("groupMemberDeviceB1"),
				DerivationState:         []byte("groupMemberDeviceB1Derivation"),
				DerivationCounter:       210,
				DerivationNextHotp:      []byte("groupMemberDeviceB1NextHOTP"),
			},
			&GroupMemberDevice{
				GroupMemberDevicePubKey: []byte("groupMemberDeviceB2"),
				DerivationState:         []byte("groupMemberDeviceB2Derivation"),
				DerivationCounter:       220,
				DerivationNextHotp:      []byte("groupMemberDeviceB2NextHOTP"),
			},
		},
		Inviter: memberA,
		Contact: contactB,
	}
	groupAB := &GroupInfo{
		GroupPubKey:              []byte("groupAB"),
		SharedSecret:             []byte("groupABSharedSecret"),
		Metadata:                 []byte("groupABMetadata"),
		Audience:                 GroupInfo_OneToOne,
		Version:                  42,
		SelfPrivKeyAccount:       []byte("groupABSelfPrivKey"),
		SelfPrivKeyDevice:        []byte("groupABSelfPrivKeyDevice"),
		SelfInviterPubKey:        []byte("pubkeyContactB"),
		OrbitDBCurrentCIDMessage: []byte("groupABCIDLog1"),
		OrbitDBCurrentCIDSecret:  []byte("groupABCIDLog2"),
		OrbitDBCurrentCIDSetting: []byte("groupABCIDLog3"),
		OrbitDBCurrentCIDMember:  []byte("groupABCIDLog4"),
		Members: []*GroupMember{
			memberA,
			memberB,
		},
		Inviter: contactA,
	}

	if err := db.Create(groupAB).Error; err != nil {
		t.Fatalf("unable to create data for group, err: %v", err)
	}

	account := &MyselfAccount{
		AccountPubKey:                []byte("accountA"),
		AccountBindingPrivKey:        []byte("accountABindingPrivKey"),
		SharedSecret:                 []byte("accountASharedSecret"),
		PublicRendezvousPointSeed:    []byte("accountARendezvousSeed"),
		PublicRendezvousPointEnabled: true,
		SigChain:                     []byte("accountASigChain"),
		Devices: []*MyselfDevice{
			&MyselfDevice{
				DevicePubKey:  []byte("accountADevice1PubKey"),
				DevicePrivKey: []byte("accountADevice1PrivateKey"),
			},
			&MyselfDevice{
				DevicePubKey: []byte("accountADevice2PubKey"),
			},
		},
	}

	if err := db.Create(account).Error; err != nil {
		t.Fatalf("unable to create data for account, err: %v", err)
	}

	for _, q := range []struct {
		query         string
		params        []interface{}
		expectedCount int
	}{
		{
			query:         "SELECT COUNT(*) AS c FROM group_info WHERE inviter_contact_pub_key = ?",
			params:        []interface{}{contactA.AccountPubKey},
			expectedCount: 1,
		},
		{
			query:         "SELECT COUNT(*) AS c FROM group_member WHERE inviter_pub_key = ? AND contact_account_pub_key = ? AND group_pub_key = ?",
			params:        []interface{}{memberB.GroupMemberPubKey, contactA.AccountPubKey, groupAB.GroupPubKey},
			expectedCount: 1,
		},
		{
			query:         "SELECT COUNT(*) AS c FROM group_member_device WHERE group_member_pub_key = ?",
			params:        []interface{}{memberA.GroupMemberPubKey},
			expectedCount: 2,
		},
		{
			query:         "SELECT COUNT(*) AS c FROM myself_device WHERE account_pub_key = ?",
			params:        []interface{}{account.AccountPubKey},
			expectedCount: 2,
		},
		{
			query:         "SELECT COUNT(*) AS c FROM myself_device WHERE account_pub_key = ? AND device_priv_key = ?",
			params:        []interface{}{account.AccountPubKey, []byte("accountADevice1PrivateKey")},
			expectedCount: 1,
		},
	} {
		result := &struct {
			C int
		}{}

		if err := db.LogMode(true).Raw(q.query, q.params...).Scan(&result).Error; err != nil {
			t.Fatalf("unable to perform query: err %v", err)
		}

		if result.C != q.expectedCount {
			t.Fatalf("invalid result count for query: %s, expected %d, got %d", q.query, q.expectedCount, result.C)
		}
	}
}

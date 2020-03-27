package bertyprotocol

import (
	"testing"

	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/stretchr/testify/assert"
)

func Test_New_AccountPrivKey_AccountProofPrivKey(t *testing.T) {
	ks := keystore.NewMemKeystore()
	acc := NewDeviceKeystore(ks)
	assert.NotNil(t, acc)

	sk1, err := acc.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk1)

	sk2, err := acc.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk2)

	assert.True(t, sk1.Equals(sk2))

	skProof1, err := acc.AccountProofPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, skProof1)

	skProof2, err := acc.AccountProofPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, skProof2)

	assert.True(t, skProof1.Equals(skProof2))
	assert.False(t, sk1.Equals(skProof1))
	assert.False(t, sk1.Equals(skProof2))
	assert.False(t, sk2.Equals(skProof1))
	assert.False(t, sk2.Equals(skProof2))

}

func Test_NewWithExistingKeys_AccountPrivKey_AccountProofPrivKey(t *testing.T) {
	ks1 := keystore.NewMemKeystore()
	acc1 := NewDeviceKeystore(ks1)

	sk1, err := acc1.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk1)

	skProof1, err := acc1.AccountProofPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, skProof1)

	ks2 := keystore.NewMemKeystore()
	acc2, err := NewWithExistingKeys(ks2, sk1, skProof1)
	assert.NoError(t, err)
	assert.NotNil(t, acc2)

	sk2, err := acc2.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk2)

	assert.True(t, sk1.Equals(sk2))

	skProof2, err := acc2.AccountProofPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, skProof2)

	assert.True(t, skProof1.Equals(skProof2))
	assert.False(t, sk1.Equals(skProof1))
	assert.False(t, sk1.Equals(skProof2))
	assert.False(t, sk2.Equals(skProof1))
	assert.False(t, sk2.Equals(skProof2))
}

func Test_DevicePrivKey(t *testing.T) {
	ks1 := keystore.NewMemKeystore()
	acc1 := NewDeviceKeystore(ks1)

	sk1, err := acc1.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk1)

	skProof1, err := acc1.AccountProofPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, skProof1)

	ks2 := keystore.NewMemKeystore()
	acc2, err := NewWithExistingKeys(ks2, sk1, skProof1)
	assert.NoError(t, err)
	assert.NotNil(t, acc2)

	dev1, err := acc1.DevicePrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, dev1)

	dev2, err := acc2.DevicePrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, dev2)

	assert.False(t, dev1.Equals(dev2))
}

func Test_ContactGroupPrivKey(t *testing.T) {
	ks1 := keystore.NewMemKeystore()
	acc1 := NewDeviceKeystore(ks1)

	sk1, err := acc1.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk1)

	ks2 := keystore.NewMemKeystore()
	acc2 := NewDeviceKeystore(ks2)

	sk2, err := acc2.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk2)

	skGrp1, err := acc1.ContactGroupPrivKey(sk2.GetPublic())
	assert.NoError(t, err)

	skGrp2, err := acc2.ContactGroupPrivKey(sk1.GetPublic())
	assert.NoError(t, err)

	assert.True(t, skGrp1.Equals(skGrp2))
}

func Test_MemberDeviceForGroup_account(t *testing.T) {
}

func Test_MemberDeviceForGroup_contact(t *testing.T) {
}

func Test_MemberDeviceForGroup_multimember(t *testing.T) {
	ks1 := keystore.NewMemKeystore()
	acc1 := NewDeviceKeystore(ks1)

	sk1, err := acc1.AccountPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, sk1)

	skProof1, err := acc1.AccountProofPrivKey()
	assert.NoError(t, err)
	assert.NotNil(t, skProof1)

	ks2 := keystore.NewMemKeystore()
	acc2, err := NewWithExistingKeys(ks2, sk1, skProof1)
	assert.NoError(t, err)
	assert.NotNil(t, acc2)

	g, _, err := NewGroupMultiMember()
	assert.NoError(t, err)

	omd1, err := acc1.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	omd2, err := acc2.MemberDeviceForGroup(g)
	assert.NoError(t, err)

	omd1MB, err := omd1.member.Raw()
	assert.NoError(t, err)

	omd2MB, err := omd2.member.Raw()
	assert.NoError(t, err)

	omd1DB, err := omd1.device.Raw()
	assert.NoError(t, err)

	omd2DB, err := omd2.device.Raw()
	assert.NoError(t, err)

	assert.Equal(t, omd1MB, omd2MB)
	assert.NotEqual(t, omd1DB, omd2DB)
}

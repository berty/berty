package entity

import (
	"crypto/rand"
	"encoding/base64"

	"berty.tech/core/pkg/errorcodes"

	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

// AliasLength as of now alias length is short by design, we want to
// receive dummy data to improve message deniability
// (3 bytes = 16777216 possibilities)
// TODO: check if we might be prone to an attack on this
const AliasLength = 3

func generateRandomAlias() (string, error) {
	data := make([]byte, AliasLength)

	_, err := rand.Read(data)

	if err != nil {
		return "", errorcodes.ErrRandomGeneratorFailed.Wrap(err)
	}

	return base64.StdEncoding.EncodeToString(data), nil
}

func SenderAliasGenerateRandom(originContactID string, contactID string, conversationID string) (*SenderAlias, error) {
	if contactID == "" && conversationID == "" {
		return nil, errorcodes.ErrValidationInput.New()
	}

	alias, err := generateRandomAlias()

	if err != nil {
		return nil, errorcodes.ErrSenderAliasGen.Wrap(err)
	}

	ID, err := uuid.NewV4()

	if err != nil {
		return nil, errorcodes.ErrUUIDGeneratorFailed.Wrap(err)
	}

	return &SenderAlias{
		ID:              ID.String(),
		Status:          SenderAlias_SENT,
		AliasIdentifier: alias,
		OriginDeviceID:  originContactID,
		ContactID:       contactID,
		ConversationID:  conversationID,
	}, nil
}

func SenderAliasGetCandidates(db *gorm.DB, alias string) ([]*Device, error) {
	out := []*Device{}
	aliases := []*SenderAlias{}
	deviceIDs := []string{}

	err := db.
		Find(&aliases, &SenderAlias{
			AliasIdentifier: alias,
			Status:          SenderAlias_RECEIVED,
		}).
		Error

	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)

	} else if len(aliases) != 0 {
		for _, alias := range aliases {
			deviceIDs = append(deviceIDs, alias.OriginDeviceID)
		}

		err = db.
			Where("id IN (?)", deviceIDs).
			Find(&out).
			Error

	} else {
		err = db.Where(&Device{ID: alias}).
			Or("contact_id = ?", alias).
			Find(&out).
			Error
	}

	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return out, nil
}

// GetAliasForContact get an alias when sending a message for a contact
func GetAliasForContact(db *gorm.DB, contact string) (string, error) {
	return getAlias(db, &SenderAlias{
		ContactID: contact,
		Status:    SenderAlias_SENT_AND_ACKED,
	})
}

// GetAliasForConversation get an alias when sending a message for a conversation
func GetAliasForConversation(db *gorm.DB, conversation string) (string, error) {
	return getAlias(db, &SenderAlias{
		ConversationID: conversation,
		Status:         SenderAlias_SENT_AND_ACKED,
	})
}

func getAlias(db *gorm.DB, query *SenderAlias) (string, error) {
	var out []*SenderAlias

	err := db.Where(query).Order("created_at desc", true).Limit(1).Find(&out).Error

	if err != nil {
		return "", errorcodes.ErrDb.Wrap(err)

	}

	if len(out) == 0 {
		return "", errorcodes.ErrSenderAliasNoCandidates.New()
	}

	senderAlias := out[0]

	if senderAlias.Used == false {
		senderAlias.Used = true

		if err := db.Save(senderAlias).Error; err != nil {
			return "", errorcodes.ErrSenderAliasUpdateFailed.Wrap(err)
		}
	}

	return senderAlias.AliasIdentifier, nil
}

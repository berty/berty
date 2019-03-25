package node

import "berty.tech/core/entity"

func (i *ContactRequestInput) ToContact() *entity.Contact {
	return &entity.Contact{
		ID:                  i.ContactID,
		OverrideDisplayName: i.ContactOverrideDisplayName,
		Devices: []*entity.Device{
			&entity.Device{
				ID:        i.ContactID,
				ContactID: i.ContactID,
			},
		},
	}
}

func (i *ContactAcceptRequestInput) ToContact() *entity.Contact {
	return &entity.Contact{
		ID: i.ContactID,
	}
}

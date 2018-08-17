package entity

func (c Contact) Validate() error {
	if c.ID == "" {
		return ErrInvalidEntity
	}
	return nil
}

func (c Contact) Filtered() *Contact {
	return &Contact{
		ID:            c.ID,
		DisplayName:   c.DisplayName,
		DisplayStatus: c.DisplayStatus,
		// FIXME: share sigchain
	}
}

func (c Contact) PeerID() string {
	return c.ID // FIXME: use sigchain
}

package entity

import (
	"fmt"
	"testing"
	"time"

	"berty.tech/core/test/mock"
)

func TestSenderAliasGenerateRandom(t *testing.T) {
	alias, err := SenderAliasGenerateRandom("self", "", "")

	if err == nil || err.Error() != "a contactID or a conversationID must be defined" {
		t.Error("invalid error message")
	}

	if alias != nil {
		t.Error("alias should not be defined")
	}

	alias, err = SenderAliasGenerateRandom("self", "", "bloh")

	if err != nil {
		t.Error("an error message should not be defined")
	}

	if alias == nil {
		t.Error("an alias should be defined")
	}

	if alias.AliasIdentifier == "" {
		t.Error("alias.AliasIdentifier be defined")
	}

	alias, err = SenderAliasGenerateRandom("self", "blah", "")

	if err != nil {
		t.Error("an error message should not be defined")
	}

	if alias == nil {
		t.Error("an alias should be defined")
	}

	if alias.Status != SenderAlias_SENT {
		t.Error("alias.Direction should be SenderAlias_SENT")
	}

	if alias.ContactID != "blah" {
		t.Error("alias.ContactID should be blah")
	}

	if alias.ConversationID != "" {
		t.Error("alias.ContactID should not be defined")
	}

	firstAlias := alias.AliasIdentifier

	if alias.AliasIdentifier == "" {
		t.Error("alias.AliasIdentifier be defined")
	}

	alias, err = SenderAliasGenerateRandom("self", "blah", "bloh")

	secondAlias := alias.AliasIdentifier

	if firstAlias == secondAlias {
		t.Error("alias.AliasIdentifier be reused")
	}
}

func TestSenderAliasGetCandidates(t *testing.T) {
	filename, db, _ := mock.GetMockedDb(SenderAlias{}, Device{}, Contact{}, Conversation{}, ConversationMember{})
	defer mock.RemoveDb(filename, db)

	db.Save(&Contact{ID: "ContactA"})
	db.Save(&Contact{ID: "ContactB"})
	db.Save(&Contact{ID: "ContactC"})

	db.Save(&Device{ID: "DeviceA1", ContactID: "ContactA"})
	db.Save(&Device{ID: "DeviceA2", ContactID: "ContactA"})
	db.Save(&Device{ID: "DeviceA3", ContactID: "ContactA"})
	db.Save(&Device{ID: "DeviceA4", ContactID: "ContactA"})

	db.Save(&Device{ID: "DeviceB1", ContactID: "ContactB"})
	db.Save(&Device{ID: "DeviceB2", ContactID: "ContactB"})
	db.Save(&Device{ID: "DeviceB3", ContactID: "ContactB"})
	db.Save(&Device{ID: "DeviceB4", ContactID: "ContactB"})

	db.Save(&Device{ID: "DeviceC1", ContactID: "ContactC"})
	db.Save(&Device{ID: "DeviceC2", ContactID: "ContactC"})
	db.Save(&Device{ID: "DeviceC3", ContactID: "ContactC"})
	db.Save(&Device{ID: "DeviceC4", ContactID: "ContactC"})

	db.Save(&Conversation{ID: "ConversationA"})
	db.Save(&Conversation{ID: "ConversationAB"})
	db.Save(&Conversation{ID: "ConversationABC"})

	db.Save(&ConversationMember{ID: "ConversationMemberA-A", ContactID: "ContactA"})

	db.Save(&ConversationMember{ID: "ConversationMemberAB-A", ContactID: "ContactA"})
	db.Save(&ConversationMember{ID: "ConversationMemberAB-B", ContactID: "ContactB"})

	db.Save(&ConversationMember{ID: "ConversationMemberABC-A", ContactID: "ContactA"})
	db.Save(&ConversationMember{ID: "ConversationMemberABC-B", ContactID: "ContactB"})
	db.Save(&ConversationMember{ID: "ConversationMemberABC-C", ContactID: "ContactC"})

	for i := 0; i < 10; i++ {
		for j := 1; j < 5; j++ {
			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceA%d", j), ConversationID: "", AliasIdentifier: fmt.Sprintf("AliasA%d", i), Status: SenderAlias_RECEIVED})
			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceB%d", j), ConversationID: "", AliasIdentifier: fmt.Sprintf("AliasB%d", i), Status: SenderAlias_RECEIVED})
			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceC%d", j), ConversationID: "", AliasIdentifier: fmt.Sprintf("AliasC%d", i), Status: SenderAlias_RECEIVED})

			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceA%d", j), ConversationID: "ConversationA", AliasIdentifier: fmt.Sprintf("AliasConversationA%d", i), Status: SenderAlias_RECEIVED})
			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceA%d", j), ConversationID: "ConversationAB", AliasIdentifier: fmt.Sprintf("AliasConversationAB%d", i), Status: SenderAlias_RECEIVED})
			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceA%d", j), ConversationID: "ConversationABC", AliasIdentifier: fmt.Sprintf("AliasConversationABC%d", i), Status: SenderAlias_RECEIVED})

			time.Sleep(time.Millisecond)
			db.Save(&SenderAlias{CreatedAt: time.Now(), ContactID: "ContactA", ConversationID: "", AliasIdentifier: fmt.Sprintf("SentAliasA%d", i), Status: SenderAlias_SENT})
		}

	}

	for j := 1; j < 5; j++ {
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceA%d", j), ConversationID: "", AliasIdentifier: "duplicatedAlias", Status: SenderAlias_RECEIVED})
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), OriginDeviceID: fmt.Sprintf("DeviceC%d", j), ConversationID: "ConversationABC", AliasIdentifier: "duplicatedAlias", Status: SenderAlias_RECEIVED})
	}

	results, err := SenderAliasGetCandidates(db, "AliasA1")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 4 {
		t.Error(fmt.Sprintf("%d elements found, 4 expected", len(results)))
	}

	results, err = SenderAliasGetCandidates(db, "SentAliasA1")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 0 {
		t.Error(fmt.Sprintf("%d elements found, 0 expected", len(results)))
	}

	results, err = SenderAliasGetCandidates(db, "BogusAlias")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 0 {
		t.Error(fmt.Sprintf("%d elements found, 0 expected", len(results)))
	}

	results, err = SenderAliasGetCandidates(db, "duplicatedAlias")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 8 {
		t.Error(fmt.Sprintf("%d elements found, 8 expected", len(results)))
	}

	results, err = SenderAliasGetCandidates(db, "AliasConversationABC1")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 4 {
		t.Error(fmt.Sprintf("%d elements found, 4 expected", len(results)))
	}

	results, err = SenderAliasGetCandidates(db, "ContactA")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 4 {
		t.Error(fmt.Sprintf("%d elements found, 4 expected", len(results)))
	}

	results, err = SenderAliasGetCandidates(db, "DeviceA4")

	if err != nil {
		t.Error(fmt.Sprintf("no error expected %s", err))
	}

	if len(results) != 1 {
		t.Error(fmt.Sprintf("%d elements found, 1 expected", len(results)))
	}
}

func TestGetAliasForContact(t *testing.T) {
	filename, db, _ := mock.GetMockedDb(SenderAlias{})
	defer mock.RemoveDb(filename, db)

	alias, err := GetAliasForContact(db, "ContactA")

	if err == nil {
		t.Error(fmt.Sprintf("no alias expected: an error was expected, alias is %s", alias))
	} else if err.Error() != "unable to get an alias" {
		t.Error(fmt.Sprintf("no alias expected: wrong error %s", err))
	}

	for i := 0; i < 3; i++ {
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), ContactID: "ContactA", ConversationID: "", AliasIdentifier: fmt.Sprintf("Alias-A%d", i), Status: SenderAlias_SENT})
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), ContactID: "ContactA", ConversationID: "", AliasIdentifier: fmt.Sprintf("AliasA%d", i), Status: SenderAlias_SENT_AND_ACKED})
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), ContactID: "ContactB", ConversationID: "", AliasIdentifier: fmt.Sprintf("Alias-B%d", i), Status: SenderAlias_SENT})
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), ContactID: "ContactB", ConversationID: "", AliasIdentifier: fmt.Sprintf("AliasB%d", i), Status: SenderAlias_SENT_AND_ACKED})
	}

	alias, err = GetAliasForContact(db, "ContactB")

	if err != nil {
		t.Error(err)
	}

	if alias != "AliasB2" {
		t.Error(fmt.Sprintf("expected alias was AliasB2, got %s", alias))
	}
}

func TestGetAliasForConversation(t *testing.T) {
	filename, db, _ := mock.GetMockedDb(SenderAlias{})
	defer mock.RemoveDb(filename, db)

	alias, err := GetAliasForConversation(db, "ConversationAB")

	if err == nil {
		t.Error("no alias expected: an error was expected")
	} else if err.Error() != "unable to get an alias" {
		t.Error(fmt.Sprintf("no alias expected: wrong error %s", err))
	}
	for i := 0; i < 3; i++ {
		time.Sleep(time.Millisecond)
		db.Save(&SenderAlias{CreatedAt: time.Now(), ContactID: "", ConversationID: "ConversationAB", AliasIdentifier: fmt.Sprintf("ConversationAB%d", i), Status: SenderAlias_SENT_AND_ACKED})
	}

	alias, err = GetAliasForConversation(db, "ConversationAB")

	if err != nil {
		t.Error(err)
	}

	if alias != "ConversationAB2" {
		t.Error(fmt.Sprintf("expected alias was ConversationAB2, got %s", alias))
	}
}

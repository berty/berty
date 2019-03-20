package node

import (
	"context"

	"berty.tech/core/entity"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func (n *Node) SenderAliasesRenew(ctx context.Context) error {
	var aliases []*entity.SenderAlias

	sql := n.sql(ctx)
	if err := sql.Where("used = 1 AND status = ?", entity.SenderAlias_SENT_AND_ACKED).Find(&aliases).Error; err != nil {
		return errors.Wrap(err, "unable to fetch used aliases")
	}

	for _, alias := range aliases {
		replacement, err := entity.SenderAliasGenerateRandom(n.b64pubkey, alias.ContactID, alias.ConversationID)

		if err != nil {
			logger().Error("node.SenderAliasesRenew", zap.Error(errors.Wrap(err, "unable to generate a replacement for sender alias")))
			continue
		}

		if err := n.senderAliasSave(ctx, replacement, alias); err != nil {
			logger().Error("node.SenderAliasesRenew", zap.Error(err))
			continue
		}

		event := n.NewEvent(ctx).
			SetSenderAliasUpdateAttrs(&entity.SenderAliasUpdateAttrs{Aliases: []*entity.SenderAlias{replacement}})

		switch {
		case alias.ConversationID != "" && alias.ContactID == "":
			event.SetToConversationID(alias.ConversationID)
		case alias.ConversationID == "" && alias.ContactID != "":
			event.SetToContactID(alias.ContactID)
		default:
			return errors.New("unhandled alias type")
		}

		if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
			logger().Error("node.SenderAliasesRenew", zap.Error(err))
			return errors.Wrap(err, "unable to emit event")
		}
	}

	return nil
}

func (n *Node) GenerateAliasForContact(ctx context.Context, contactID string) (*entity.SenderAlias, error) {
	alias, err := entity.SenderAliasGenerateRandom(n.b64pubkey, contactID, "")

	if err != nil {
		return nil, errors.Wrap(err, "unable to generate sender alias for contact")
	}

	err = n.senderAliasSave(ctx, alias, nil)

	if err != nil {
		return nil, errors.Wrap(err, "unable to generate sender alias for contact")
	}

	return alias, n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).
			SetToContactID(contactID).
			SetSenderAliasUpdateAttrs(&entity.SenderAliasUpdateAttrs{Aliases: []*entity.SenderAlias{alias}}))
}

func (n *Node) senderAliasSave(ctx context.Context, senderAlias *entity.SenderAlias, previous *entity.SenderAlias) error {
	sql := n.sql(ctx)
	tx := sql.Begin()

	if err := tx.Save(senderAlias).Error; err != nil {
		err := errors.Wrap(err, "unable to save sender alias")
		zap.Error(err)
		tx.Rollback()

		return err
	}

	if previous != nil {
		if err := tx.Delete(previous).Error; err != nil {
			err := errors.Wrap(err, "unable to delete a previous version of sender alias")
			zap.Error(err)
			tx.Rollback()

			return err
		}
	}

	tx.Commit()

	return nil
}

func (n *Node) aliasEnvelopeForContact(ctx context.Context, envelope *entity.Envelope, event *entity.Event) string {
	sql := n.sql(ctx)
	alias, err := entity.GetAliasForContact(sql, event.ToContactID())

	if err == nil && alias != "" {
		return alias
	} else if err != nil {
		zap.Error(errors.Wrap(err, "unable to use alias"))
	}

	return n.b64pubkey
}

func (n *Node) aliasEnvelopeForConversation(ctx context.Context, envelope *entity.Envelope, event *entity.Event) string {
	sql := n.sql(ctx)
	alias, err := entity.GetAliasForConversation(sql, event.ToConversationID())

	if err == nil && alias != "" {
		return alias
	} else if err != nil {
		zap.Error(errors.Wrap(err, "unable to use alias"))
	}

	return n.b64pubkey
}

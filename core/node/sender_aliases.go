package node

import (
	"context"

	"berty.tech/core/entity"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func (node *Node) SenderAliasesRenew(ctx context.Context) error {
	var aliases []*entity.SenderAlias

	sql := node.sql(ctx)
	if err := sql.Where("used = 1 AND status = ?", entity.SenderAlias_SENT_AND_ACKED).Find(&aliases).Error; err != nil {
		return errors.Wrap(err, "unable to fetch used aliases")
	}

	for _, alias := range aliases {
		replacement, err := entity.SenderAliasGenerateRandom(node.b64pubkey, alias.ContactID, alias.ConversationID)

		if err != nil {
			logger().Error("node.SenderAliasesRenew", zap.Error(errors.Wrap(err, "unable to generate a replacement for sender alias")))
			continue
		}

		if err := node.senderAliasSave(ctx, replacement, alias); err != nil {
			logger().Error("node.SenderAliasesRenew", zap.Error(err))
			continue
		}

		destination := alias.ContactID
		if destination == "" {
			destination = alias.ConversationID
		}

		evt, err := node.NewSenderAliasEvent(ctx, destination, []*entity.SenderAlias{replacement})

		if err != nil {
			return errors.Wrap(err, "unable to create event")
		}

		if err := node.EnqueueOutgoingEvent(ctx, evt, &OutgoingEventOptions{}); err != nil {
			logger().Error("node.SenderAliasesRenew", zap.Error(err))
			return errors.Wrap(err, "unable to emit event")
		}
	}

	return nil
}

func (node *Node) GenerateAliasForContact(ctx context.Context, contactID string) (*entity.SenderAlias, error) {
	alias, err := entity.SenderAliasGenerateRandom(node.b64pubkey, contactID, "")

	if err != nil {
		return nil, errors.Wrap(err, "unable to generate sender alias for contact")
	}

	err = node.senderAliasSave(ctx, alias, nil)

	if err != nil {
		return nil, errors.Wrap(err, "unable to generate sender alias for contact")
	}

	evt, err := node.NewSenderAliasEvent(ctx, contactID, []*entity.SenderAlias{alias})

	if err != nil {
		return nil, errors.Wrap(err, "unable to generate sender alias for contact")
	}

	if err := node.EnqueueOutgoingEvent(ctx, evt, &OutgoingEventOptions{}); err != nil {
		return nil, errors.Wrap(err, "unable to generate sender alias for contact")
	}

	return alias, nil
}

func (node *Node) senderAliasSave(ctx context.Context, senderAlias *entity.SenderAlias, previous *entity.SenderAlias) error {
	sql := node.sql(ctx)
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

func (node *Node) aliasEnvelopeForContact(ctx context.Context, envelope *entity.Envelope, event *entity.Event) string {
	sql := node.sql(ctx)
	alias, err := entity.GetAliasForContact(sql, event.DestinationDeviceID)

	if err == nil && alias != "" {
		return alias
	} else if err != nil {
		zap.Error(errors.Wrap(err, "unable to use alias"))
	}

	return node.b64pubkey
}

func (node *Node) aliasEnvelopeForConversation(ctx context.Context, envelope *entity.Envelope, event *entity.Event) string {
	sql := node.sql(ctx)
	alias, err := entity.GetAliasForConversation(sql, event.ConversationID)

	if err == nil && alias != "" {
		return alias
	} else if err != nil {
		zap.Error(errors.Wrap(err, "unable to use alias"))
	}

	return node.b64pubkey
}

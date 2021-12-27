import { buildAccount } from '../account';
import { TransferSingle, TransferBatch } from '../generated/entities/templates/ERC1155/ERC1155';
import { buildNFT, gensHandleTransfer } from '../nft';
import { CreateRewardERC1155, MelandTier, OpenTier } from '../generated/entities/Tier/MelandTier';
import { MelandTierReward } from '../generated/entities/schema';
import { buildReward } from '../reward';
import { ERC1155Reward, OpenMelandTierReward } from '../generated/entities/schema';
import { NFTProtocol_erc1155 } from '../enums';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleTransferSingle(event: TransferSingle): void {
    let nft = buildNFT(
        event.address,
        event.params.id,
        event.block.timestamp,
        NFTProtocol_erc1155
    );
    nft.owner = buildAccount(event.params.to).id;
    nft.save();

    gensHandleTransfer(
        event.transaction.hash.toHex(),
        event.block.timestamp,
        event.params.from,
        event.params.to,
        nft
    );
}

export function handleTransferBatch(event: TransferBatch): void {
    for (let i = 0; i < event.params.ids.length; i++) {
        let id = event.params.ids[i];
        let nft = buildNFT(
            event.address,
            id,
            event.block.timestamp,
            NFTProtocol_erc1155
        );
        nft.owner = buildAccount(event.params.to).id;
        nft.save();

        gensHandleTransfer(
            event.transaction.hash.toHex(),
            event.block.timestamp,
            event.params.from,
            event.params.to,
            nft
        );
    }
}

export function handleOpenTier(event: OpenTier): void {
    let rewardIds = event.params.rewardIds;
    for (let i = 0; i < rewardIds.length; i++) {
        if (rewardIds[i].gt(BigInt.zero())) {
            let omtr = new OpenMelandTierReward(event.transaction.hash.toHex());
            omtr.txHash = event.transaction.hash;
            omtr.reward = rewardIds[i].toString();
            omtr.save();
        }
    }
}

// create reward.
export function handleCreateRewardERC1155(event: CreateRewardERC1155): void {
    let reward = buildReward(event.params.rewardId);
    for (let i = 0; i < event.params.erc1155reward.tokenIds.length; i++) {
        let erc1155RewardTokenId = event.params.erc1155reward.tokenIds[i];
        let erc1155Rewward = new ERC1155Reward(event.params.erc1155RewardId.toString());
        erc1155Rewward.reward = reward.id;
        erc1155Rewward.nft = buildNFT(
            event.params.erc1155reward.erc1155,
            erc1155RewardTokenId,
            event.block.timestamp,
            NFTProtocol_erc1155
        ).id;
        erc1155Rewward.save();
    }
}
import { buildAccount } from '../account';
import { NFTProtocol_erc1155 } from '../enums';
import { TransferSingle, TransferBatch } from '../generated/entities/templates/ERC1155/ERC1155';
import { MelandTier } from '../generated/entities/Land/MelandTier';
import { buildNFT, gensHandleTransfer } from '../nft';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { isMeLandAI } from '../selfhost';

function isSFT(address: Address, tokenId: BigInt): boolean {
    let erc1155 = MelandTier.bind(address);
    let trytotalSupply = erc1155.try_totalSupply(tokenId);

    let isSFT = false;

    if (!trytotalSupply.reverted) {
        isSFT = trytotalSupply.value.gt(BigInt.fromI32(1));
    }

    return isSFT;
}

export function handleTransferSingle(event: TransferSingle): void {
    return;

    let tokenId = event.params.id;

    if (isMeLandAI(event.address)) {
        return;
    }

    if (isSFT(event.address, tokenId)) {
        return;
    }

	let nft = buildNFT(
		event.address, 
		event.params.id,
		event.block.timestamp,
		NFTProtocol_erc1155,
	);

	nft.owner = buildAccount(event.params.to).id;

	nft.save();
}

export function handleTransferBatch(event: TransferBatch): void {
    return;
    
    if (isMeLandAI(event.address)) {
        return;
    }

    for (let i = 0; i < event.params.ids.length; i ++) {
        let id = event.params.ids[i];
        if (isSFT(event.address, id)) {
            continue;
        }
        let nft = buildNFT(
            event.address,
            id,
            event.block.timestamp,
            NFTProtocol_erc1155,
        );
        nft.owner = buildAccount(event.params.to).id;
        nft.save();
    }
}
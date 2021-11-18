import { buildAccount } from '../account';
import { OrderStatus_cancelled, OrderStatus_open } from '../enums';
import { Order } from '../generated/entities/schema';
import { Transfer, RoleGranted } from '../generated/entities/templates/NFTWithRarity/NFTWithRarity';
import { buildNFT, gensHandleTransfer } from '../nft';

export function handleTransfer(event: Transfer): void {
	let nft = buildNFT(event.block, event.address, event.params.tokenId);
	nft.owner = buildAccount(event.params.to).id;
	nft.save();

    gensHandleTransfer(event, nft);
}

export function handleRoleGranted(event: RoleGranted): void {}

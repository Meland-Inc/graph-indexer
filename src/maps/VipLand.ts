import { Address, log } from '@graphprotocol/graph-ts';
import { buildAccount } from '../account';
import { OrderStatus_cancelled, OrderStatus_open } from '../enums';
import { Order, SupplyQuantity } from '../generated/entities/schema';
import { Transfer } from '../generated/entities/templates/NFTWithRarity/NFTWithRarity';
import { RoleGranted } from '../generated/entities/VipLand/VipLand';
import { buildNFT, buildSupplyQuantity, gensHandleTransfer } from '../nft';

export function handleTransfer(event: Transfer): void {
    let nft = buildNFT(event.block, event.address, event.params.tokenId);
    nft.owner = buildAccount(event.params.to).id;
    nft.save();

    gensHandleTransfer(event, nft);
}

export function handleRoleGranted(event: RoleGranted): void {

}
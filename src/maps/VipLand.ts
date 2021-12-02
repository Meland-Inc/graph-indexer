import { buildAccount } from '../account';
import { Transfer } from '../generated/entities/templates/NFTWithRarity/NFTWithRarity';
import { RoleGranted } from '../generated/entities/VipLand/VipLand';
import { buildNFT, gensHandleTransfer } from '../nft';

export function handleTransfer(event: Transfer): void {
    let nft = buildNFT(event.block, event.address, event.params.tokenId);
    nft.owner = buildAccount(event.params.to).id;
    nft.save();

    gensHandleTransfer(event, nft);
}

export function handleRoleGranted(event: RoleGranted): void {

}
import { buildAccount } from '../account';
import { OrderStatus_cancelled } from '../enums';
import { Order } from '../generated/entities/schema';
import { Transfer, RoleGranted } from '../generated/entities/VipLand/VipLand';
import { buildNFT } from '../nft';

export function handleTransfer(event: Transfer): void {
    let nft = buildNFT(event.block, event.address, event.params.tokenId);
    nft.owner = buildAccount(event.params.to).id;
    nft.save();

    // 如果nft被转移，并且activeOrder不为null
    // 并且from跟order的creator不是一个人
    // 则将order cancel
    const order = Order.load(nft.activeOrder);
    order.status = OrderStatus_cancelled;
    order.save();
}

export function handleRoleGranted(event: RoleGranted): void {

}
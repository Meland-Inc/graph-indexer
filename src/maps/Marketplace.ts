import {
	OrderCancelled,
	OrderCreated,
	OrderSuccessful,
	ChangedPublicationFee,
	ChangedOwnerCutPerMillion
} from '../generated/entities/Marketplace/Marketplace';
import { Order } from '../generated/entities/schema';
import { addNFTProperty, buildSupplyQuantity, buildNFT } from '../nft';
import { OrderStatus_cancelled, OrderStatus_open, OrderStatus_sold } from '../enums';
import { buildAccount } from '../account';

export function handleOrderCreated(event: OrderCreated): void {
	let orderId = event.params.id.toString();
	let nftAddress = event.params.nftAddress;
	let nftTokenId = event.params.assetId;
	let order = new Order(orderId);
	order.blockNumber = event.block.number;
	order.createdAt = event.block.timestamp;
	order.description = '测试description';
	order.expiresAt = event.params.expiresAt;
	order.nftAddress = nftAddress;
	order = addNFTProperty(order, nftAddress);
	let nft = buildNFT(event.block, nftAddress, nftTokenId);
	nft.activeOrder = order.id;
	nft.save()
	order.nft = nft.id;
	order.owner = buildAccount(event.params.seller).id;
	order.price = event.params.priceInWei;
	order.status = OrderStatus_open;
	order.supplyQuantity = buildSupplyQuantity(nftAddress).id;
	order.tokenId = event.params.assetId;
	order.updatedAt = event.block.timestamp;
	order.save();
}

export function handleOrderSuccessful(event: OrderSuccessful): void {
	let orderId = event.params.id.toString();
	let order = Order.load(orderId);
	order.status = OrderStatus_sold;
	order.buyer = event.params.buyer;
	order.save();
}

export function handleOrderCancelled(event: OrderCancelled): void {
	let orderId = event.params.id.toString();
	let order = Order.load(orderId);
	order.status = OrderStatus_cancelled;
	order.save();
}

export function handleChangedPublicationFee(event: ChangedPublicationFee): void {}

export function handleChangedOwnerCutPerMillion(event: ChangedOwnerCutPerMillion): void {}
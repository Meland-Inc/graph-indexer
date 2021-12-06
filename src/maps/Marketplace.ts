import {
	OrderCancelled,
	OrderCreated,
	OrderSuccessful,
	ChangedPublicationFee,
	ChangedOwnerCutPerMillion,
	OrderUpdated
} from '../generated/entities/Marketplace/Marketplace';
import { NFT, Order } from '../generated/entities/schema';
import { addNFTProperty, buildSupplyQuantity, buildNFT } from '../nft';
import { OrderStatus_cancelled, OrderStatus_open, OrderStatus_sold } from '../enums';
import { buildAccount } from '../account';
import { buildMetadata } from '../metadata';
import { boughtLog, cancelorderLog, createorderLog, updateorderLog } from '../log';

export function handleOrderCreated(event: OrderCreated): void {
	let orderId = event.params.id.toHex();
	let nftAddress = event.params.nftAddress;
	let nftTokenId = event.params.assetId;
	let order = new Order(orderId);
	order.blockNumber = event.block.number;
	order.createdAt = event.block.timestamp;
	order.expiresAt = event.params.expiresAt;
	order.nftAddress = nftAddress;
	order = addNFTProperty(order, nftAddress);
	let nft = buildNFT(event.block, nftAddress, nftTokenId);
	nft.activeOrder = order.id;
	nft.save();
	order.nft = nft.id;
	order.txHash = event.block.hash;
	order.metadata = buildMetadata(nftAddress, nftTokenId).id;
	order.owner = buildAccount(event.params.seller).id;
	order.price = event.params.priceInWei;
	order.status = OrderStatus_open;
	order.supplyQuantity = buildSupplyQuantity(nftAddress).id;
	order.tokenId = event.params.assetId;
	order.updatedAt = event.block.timestamp;
	order.save();

	createorderLog(event, order!);
}

export function handleOrderSuccessful(event: OrderSuccessful): void {
	let orderId = event.params.id.toHex();
	let order = Order.load(orderId)!;

	// remove activie order
	let nft = NFT.load(order.nft!);
	if (nft !== null) {
		nft.activeOrder = null;
		nft.save();
	}

	order.status = OrderStatus_sold;
	order.buyer = event.params.buyer;
	order.save();

	boughtLog(event, nft!, order.price);
}

export function handleOrderCancelled(event: OrderCancelled): void {
	let orderId = event.params.id.toHex();
	let order = Order.load(orderId)!;

	// remove activie order
	let nft = NFT.load(order.nft!);
	if (nft !== null) {
		nft.activeOrder = null;
		nft.save();
	}

	order.status = OrderStatus_cancelled;
	order.save();

	cancelorderLog(event, order!);
}

export function handleOrderUpdated(event: OrderUpdated): void {
	let orderId = event.params.id.toHex();
	let order = Order.load(orderId)!;
	let oldOrder = Order.load(orderId)!;

	order.expiresAt = event.params.expiresAt;
	order.price = event.params.priceInWei;
	order.save();

	updateorderLog(event, order!, oldOrder!);
}

export function handleChangedPublicationFee(event: ChangedPublicationFee): void {}

export function handleChangedOwnerCutPerMillion(event: ChangedOwnerCutPerMillion): void {}

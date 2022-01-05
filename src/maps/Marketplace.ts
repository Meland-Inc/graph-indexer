import {
	OrderCancelled,
	OrderCreated,
	OrderSuccessful,
	ChangedPublicationFee,
	ChangedOwnerCutPerMillion,
	OrderUpdated
} from '../generated/entities/Marketplace/Marketplace';
import { NFT, Order, Web3Config } from '../generated/entities/schema';
import { buildNFT } from '../nft';
import { NFTProtocol_erc1155, NFTProtocol_erc721, OrderStatus_cancelled, OrderStatus_open, OrderStatus_sold } from '../enums';
import { buildAccount } from '../account';
import { boughtLog, cancelorderLog, createorderLog, updateorderLog } from '../log';
import { Address } from '@graphprotocol/graph-ts';
import { buildAcceptedToken } from '../token';
import * as configs from '../config';

export function handleOrderCreated(event: OrderCreated): void {
	let orderId = event.params.id.toHex();
	let nft = event.params.nft;
	let nftTokenId = event.params.assetId;
	let nftProtocol = "";
	let nftAddress = Address.zero();

	if (nft.erc1155 != Address.zero()) {
		nftAddress = nft.erc1155;
		nftProtocol = NFTProtocol_erc1155;
	} else {
		nftAddress = nft.erc721
		nftProtocol = NFTProtocol_erc721;
	}
	let order = new Order(orderId);
	order.blockNumber = event.block.number;
	order.createdAt = event.block.timestamp;
	order.expiresAt = event.params.expiresAt;
	order.nftAddress = nftAddress;
	let nftEn = buildNFT(nftAddress, nftTokenId, event.block.timestamp, nftProtocol);
	nftEn.activeOrder = order.id;
	nftEn.save();
	order.symbol = nftEn.symbol;
	order.rarity = nftEn.rarity;
	order.name = nftEn.name;
	order.nft = nftEn.id;
	order.txHash = event.block.hash;
	order.metadata = nftEn.metadata;
	order.owner = buildAccount(event.params.seller).id;
	order.price = event.params.priceInWei;
	order.status = OrderStatus_open;
	order.supplyQuantity = nftEn.supplyQuantity;
	order.tokenId = event.params.assetId;
	order.updatedAt = event.block.timestamp;
	order.save();

	createorderLog(event, order);
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

	let erc20 = buildAcceptedToken(Address.fromString(configs.MELD_address));

	boughtLog(event, nft!, order.price, erc20);
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

	cancelorderLog(event, order);
}

export function handleOrderUpdated(event: OrderUpdated): void {
	let orderId = event.params.id.toHex();
	let order = Order.load(orderId)!;
	order.expiresAt = event.params.expiresAt;
	order.price = event.params.priceInWei;
	order.save();

	updateorderLog(event, order);
}

export function handleChangedPublicationFee(event: ChangedPublicationFee): void { }

function buildConfig(k: string, v: string): Web3Config {
	let c = Web3Config.load(k);
	if (c == null) {
		c = new Web3Config(k);
		c.value = v;
		c.save();
	}
	return c;
}

export function handleChangedOwnerCutPerMillion(event: ChangedOwnerCutPerMillion): void { 
	let allConfig = configs.getAll();
	let keys = configs.getAllKeys();
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let value = allConfig.has(k) ? allConfig.get(k) : null;
		if (value) {
			buildConfig(k, value);
		}
	}
}

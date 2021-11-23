import { NFTBuyed, NFTCreated, NFTDelete, NFTIdPoolUpdate, NFTItemUpdate, NFTStore } from '../generated/entities/NFTStore/NFTStore';
import { ethereum, JSONValue, TypedMap, Entity, Bytes, Address, BigInt, log } from '@graphprotocol/graph-ts';
import { NFTStoreItem, Metadata, SupplyQuantity } from '../generated/entities/schema';
import { buildMetadata } from '../metadata';
import { addNFTProperty, buildSupplyQuantity } from '../nft';
import { NFTStoreStatus_open, NFTStoreStatus_sold } from '../enums';
import { NFTWithRarity as ERC721 } from '../generated/entities/templates/NFTWithRarity/NFTWithRarity';
import { NFTWithRarity as ERC721Template } from '../generated/entities/templates';
import { buildAccount } from '../account';

export function handleNFTBuyed(event: NFTBuyed): void {
	let erc721 = ERC721.bind(event.params.nftAddress);
	let supplyQuantity = buildSupplyQuantity(event.params.nftAddress);

	let totalSupply = supplyQuantity.soldCount.plus(BigInt.fromI32(1));
	let tryTotalSupply = erc721.try_totalSupply();
	if (!tryTotalSupply.reverted) {
		totalSupply = tryTotalSupply.value;
	}
	let nftStoreItem = NFTStoreItem.load(event.params.id.toString());
	supplyQuantity.soldCount = totalSupply;
	supplyQuantity.save();

	// 每当有人购买
	// 供应数量减1
	nftStoreItem.currentStockQuantity = nftStoreItem.currentStockQuantity.minus(BigInt.fromI32(1));

	log.debug('nft buyed {} {}', [ supplyQuantity.id, supplyQuantity.soldCount.toString() ]);

	if (supplyQuantity.soldCount.equals(supplyQuantity.maxSupply)) {
		nftStoreItem.status = NFTStoreStatus_sold;
	}
	nftStoreItem.save();
}

// 上架索引
export function handleNFTCreated(event: NFTCreated): void {
	ERC721Template.create(event.params.nftAddress);
	let storeItemOfNFT = new NFTStoreItem(event.params.id.toString());
	let nftStore = NFTStore.bind(event.address);
	let nftAddress = event.params.nftAddress;
	let itemFromBlockchain = nftStore.itemByNFT(event.params.nftAddress);
	let currentStockQuantity = BigInt.fromI32(0);
	let erc721 = ERC721.bind(nftAddress);

	// 如果未开启nft供应池.
	// 则当前供应量为mintMax.
	// 否则默认供应数量为0.
	// 当监听到handleNFTIdPoolUpdate时改变供应数量.
	if (!itemFromBlockchain.value2) {
		let tryrv = erc721.try_getMintMax();
		if (!tryrv.reverted) {
			currentStockQuantity = tryrv.value;
		}
	}

	storeItemOfNFT.supplyQuantity = buildSupplyQuantity(nftAddress).id;
	storeItemOfNFT.description = itemFromBlockchain.value6;
	storeItemOfNFT.createdAt = event.block.timestamp;
	storeItemOfNFT.blockNumber = event.block.number;
	storeItemOfNFT.limit = itemFromBlockchain.value5;
	storeItemOfNFT.txHash = event.transaction.hash;
	storeItemOfNFT.nftAddress = event.params.nftAddress;
	storeItemOfNFT.currentStockQuantity = currentStockQuantity;
	storeItemOfNFT.metadata = buildMetadata(nftAddress, BigInt.fromI32(0)).id;
	storeItemOfNFT.owner = buildAccount(itemFromBlockchain.value1).id;
	storeItemOfNFT.price = itemFromBlockchain.value3;
	storeItemOfNFT = addNFTProperty(storeItemOfNFT, event.params.nftAddress);
	storeItemOfNFT.updatedAt = event.block.timestamp;
	storeItemOfNFT.status = NFTStoreStatus_open;
	storeItemOfNFT.save();
}

export function handleNFTDelete(event: NFTDelete): void {}

// 当供应池变化时
// 更新当前供应量
export function handleNFTIdPoolUpdate(event: NFTIdPoolUpdate): void {
	let nftStoreItem = NFTStoreItem.load(event.params.id.toString());
	nftStoreItem.currentStockQuantity = event.params.length;
	nftStoreItem.save();
}

export function handleNFTItemUpdate(event: NFTItemUpdate): void {
	let storeItemOfNFT = NFTStoreItem.load(event.params.id.toString());
	let nftStore = NFTStore.bind(event.address);
	let nftAddress = event.params.nftAddress;
	let itemFromBlockchain = nftStore.itemByNFT(nftAddress);

	storeItemOfNFT.description = itemFromBlockchain.value6;
	storeItemOfNFT.limit = itemFromBlockchain.value5;
	storeItemOfNFT.price = itemFromBlockchain.value3;
	storeItemOfNFT.save();
}
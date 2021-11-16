import { NFTBuyed, NFTCreated, NFTDelete, NFTIdPoolUpdate, NFTStore } from '../generated/entities/NFTStore/NFTStore';
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

	let totalSupply = supplyQuantity.soldCount;
	let tryTotalSupply = erc721.try_totalSupply();
	if (!tryTotalSupply.reverted) {
		totalSupply = tryTotalSupply.value;
	}
	let nftStoreItem = NFTStoreItem.load(event.params.id.toString());
	supplyQuantity.soldCount = totalSupply.plus(BigInt.fromI32(1));
	supplyQuantity.save();

	if (supplyQuantity.soldCount.equals(supplyQuantity.maxSupply)) {
		nftStoreItem.status = NFTStoreStatus_sold;
		nftStoreItem.save();
	}
}

// 上架索引
export function handleNFTCreated(event: NFTCreated): void {
	let storeItemOfNFT = new NFTStoreItem(event.params.id.toString());
	let nftStore = NFTStore.bind(event.address);
	let nftAddress = event.params.nftAddress;
	let itemFromBlockchain = nftStore.itemByNFT(event.params.nftAddress);
	storeItemOfNFT.supplyQuantity = buildSupplyQuantity(nftAddress).id;
	storeItemOfNFT.description = itemFromBlockchain.value6;
	storeItemOfNFT.createdAt = event.block.timestamp;
	storeItemOfNFT.blockNumber = event.block.number;
	storeItemOfNFT.limit = itemFromBlockchain.value5;
  storeItemOfNFT.txHash = event.transaction.hash;
	storeItemOfNFT.nftAddress = event.params.nftAddress;
	storeItemOfNFT.metadata = buildMetadata(nftAddress, BigInt.fromI32(0)).id;
	storeItemOfNFT.owner = buildAccount(itemFromBlockchain.value1).id;
	storeItemOfNFT.price = itemFromBlockchain.value3;
	storeItemOfNFT = addNFTProperty(storeItemOfNFT, event.params.nftAddress);
	storeItemOfNFT.updatedAt = event.block.timestamp;
	storeItemOfNFT.status = NFTStoreStatus_open;
	storeItemOfNFT.save();
}

// TODO
// 暂时不做下架
export function handleNFTDelete(event: NFTDelete): void {}

export function handleNFTIdPoolUpdate(event: NFTIdPoolUpdate): void {}

import { NFTBuyed, NFTCreated, NFTDelete, NFTItemUpdate, NFTStore } from '../generated/entities/NFTStore/NFTStore';
import { BigInt, Bytes, log, http, store, Address } from '@graphprotocol/graph-ts';
import { NFT, NFTStoreItem, SupplyQuantity } from '../generated/entities/schema';
import { buildMetadata } from '../metadata';
import { buildNFT, buildNFTId, buildNFTSymbolWithURI, buildSupplyQuantity, getMintMaxByURI, getNFTNameByURI, getNFTRarityByURI } from '../nft';
import { NFTStoreStatus_open, NFTStoreStatus_cancelled, NFTProtocol_erc1155 } from '../enums';
import { IMelandStoreItems } from '../generated/entities/NFTStore/IMelandStoreItems';
import { buildAccount } from '../account';
import { format } from '../helper';
import { buildAcceptedToken } from '../token';
import { boughtLog } from '../log';

export function handleNFTBuyed(event: NFTBuyed): void {
	let nftAddress = event.params.nftAddress;
	let symbolBuyCall = event.params.symbol;
	let tokenId = event.params.tokenId;

	let stroeItemId = format("{}#{}", [nftAddress.toHex(), symbolBuyCall]);
	let storeItemOfNFT = NFTStoreItem.load(stroeItemId)!;

	let supplyQuantity = SupplyQuantity.load(storeItemOfNFT.supplyQuantity)!;
	supplyQuantity.soldCount = supplyQuantity.soldCount.plus(BigInt.fromI32(1));
	supplyQuantity.save();
	storeItemOfNFT.currentStockQuantity = storeItemOfNFT.currentStockQuantity.minus(BigInt.fromI32(1));
	storeItemOfNFT.save();

	let nftId = buildNFTId(nftAddress, tokenId);
	let nft = NFT.load(nftId)!;

	boughtLog(event, nft, event.params.priceInWei);
}

// 上架索引
export function handleNFTCreated(event: NFTCreated): void {
	buildStoreItem(event.params.nftAddress, event.block.number, event.transaction.hash, event.block.timestamp);
}

function buildStoreItem(
	nftAddress: Address,
	blockNumber: BigInt,
	txHash: Bytes,
	timestamp: BigInt
): void {
	let item = IMelandStoreItems.bind(nftAddress);

	let try_items = item.try_melandStoreItems();
	if (try_items.reverted) {
		log.error("try_melandStoreItems reverted {}", [nftAddress.toHex()]);
		return;
	}

	let items = try_items.value;
	let symbols = items.value0;
	let prices = items.value1;

	for (let i = 0; i < items.value0.length; i++) {
		let price = prices[i];
		let symbol = symbols[i];

		let limit = BigInt.fromI32(0);
		let try_limit = item.try_melandStoreItemsRestrictedPurchase(symbols[i]);
		if (!try_limit.reverted) {
			limit = try_limit.value.value1;
		}

		let receipt = item.melandStoreReceipt(symbol);

		let tokenURI = format("https://token-metadata-release.melandworld.com/wearable/cid/{}", [symbol]);
		let try_tokenURI = item.try_melandStoreItemURI(symbol);
		if (!try_tokenURI.reverted) {
			tokenURI = try_tokenURI.value;
		}

		let stroeItemId = format("{}#{}", [nftAddress.toHex(), symbol]);
		let storeItemOfNFT = NFTStoreItem.load(stroeItemId);
		if (storeItemOfNFT == null) {
			storeItemOfNFT = new NFTStoreItem(stroeItemId);
			storeItemOfNFT.currentStockQuantity = getMintMaxByURI(tokenURI);
		}

		let status = NFTStoreStatus_cancelled;

		let erc20Address = Address.zero();
		let tryToken = item.try_acceptedToken(symbol);

		if (!tryToken.reverted) {
			erc20Address = tryToken.value;
		}

		if (erc20Address == Address.zero()) {
			return;
		}

		let try_status = item.try_melandStoreSellStatus(symbol);
		if (!try_status.reverted) {
			status = try_status.value ? NFTStoreStatus_open : NFTStoreStatus_cancelled;
		}

		storeItemOfNFT.acceptedToken = buildAcceptedToken(erc20Address).id;
		storeItemOfNFT.symbol = buildNFTSymbolWithURI(nftAddress, tokenURI);
		storeItemOfNFT.buyCallbackState = symbol;
		storeItemOfNFT.name = getNFTNameByURI(tokenURI);
		storeItemOfNFT.rarity = getNFTRarityByURI(tokenURI);
		storeItemOfNFT.tokenURI = tokenURI;
		storeItemOfNFT.supplyQuantity = buildSupplyQuantity(nftAddress, tokenURI).id;
		storeItemOfNFT.createdAt = timestamp;
		storeItemOfNFT.blockNumber = blockNumber;
		storeItemOfNFT.limit = limit;
		storeItemOfNFT.txHash = txHash;
		storeItemOfNFT.nftAddress = nftAddress;
		storeItemOfNFT.metadata = buildMetadata(nftAddress, BigInt.fromI32(0), NFTProtocol_erc1155, tokenURI).id;
		storeItemOfNFT.owner = buildAccount(receipt).id;
		storeItemOfNFT.price = price;
		storeItemOfNFT.updatedAt = timestamp;
		storeItemOfNFT.status = status;

		if (erc20Address == Address.zero()) {
			storeItemOfNFT.status = NFTStoreStatus_cancelled;
		}

		storeItemOfNFT.save();
	}
}

export function handleNFTDelete(event: NFTDelete): void { }


export function handleNFTItemUpdate(event: NFTItemUpdate): void {
	buildStoreItem(event.params.nftAddress, event.block.number, event.transaction.hash, event.block.timestamp);
}
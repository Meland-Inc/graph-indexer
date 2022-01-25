import { Address, BigInt, log, http, Bytes, json, JSONValue, TypedMap, store, ipfs, crypto } from '@graphprotocol/graph-ts';
import { ERC721 } from './generated/entities/templates/ERC721/ERC721';
import { ERC1155 } from './generated/entities/templates/ERC1155/ERC1155';
import { SupplyQuantity, NFT as NFTSchema, Order, NFTMetadataOrigin, NFTUnknowMetadata } from './generated/entities/schema';
import { buildMetadata } from './metadata';
import { buildAccount } from './account';
import { format } from './helper';
import { Land } from './generated/entities/Land/Land';
import { MelandWearable } from './generated/entities/Wearable/MelandWearable';
import { ItemType_futures, ItemType_placeable, ItemType_thirdparty, ItemType_tier, ItemType_viplandfutures, ItemType_wearable, NFTProtocol, NFTProtocol_erc721, OrderStatus_cancelled, OrderStatus_open, VUnknow } from './enums';
import { transferLog } from './log';
import * as configs from './config';
import * as md5 from '../node_modules/as-crypto/lib/md5'
import * as base64 from '../node_modules/as-crypto/lib/base64'
import { getNFTTokenURI, buildNFTSymbolByURI, getNFTRarityByURI, getNFTNameByURI, getMintMaxByURI } from './tokenuri';
import { isMeLandAI } from './selfhost';

export function buildNFTId(addressOfNFT: Address, tokenId: BigInt): string {
	return format("{}#{}", [addressOfNFT.toHex(), tokenId.toString()]);
}

export function buildNFTUnknowMetadata(): NFTUnknowMetadata {
	let m = NFTUnknowMetadata.load("NFTUnknowMetadata");
	if (!m) {
		m = new NFTUnknowMetadata("NFTUnknowMetadata");
	}
	return m;
}

export function buildNFT(
	addressOfNFT: Address,
	tokenId: BigInt,
	timestamp: BigInt,
	nftProtocol: NFTProtocol,
): NFTSchema {
	let nftId = buildNFTId(addressOfNFT, tokenId);
	// let mm = buildNFTUnknowMetadata();
	let nft = NFTSchema.load(nftId);
	let reloadMetadata = false;
	if (nft === null) {
		nft = new NFTSchema(nftId);
		reloadMetadata = true;
	}

	if (nft.name == ""
		&& isMeLandAI(addressOfNFT)
	) {
		reloadMetadata = true;
	}

	if (reloadMetadata) {
		let tokenURI = getNFTTokenURI(addressOfNFT, tokenId, nftProtocol);
		let rarity = getNFTRarityByURI(tokenURI, nftProtocol, addressOfNFT, tokenId);
		nft.tokenId = tokenId;
		nft.tokenURI = tokenURI;
		nft.rarity = rarity;
		nft.supplyQuantity = buildSupplyQuantity(tokenURI, nftProtocol,addressOfNFT, tokenId, BigInt.zero(), ).id;
		nft.symbol = buildNFTSymbolByURI(tokenURI, nftProtocol, addressOfNFT, tokenId);
		nft.isMeLandAI = isMeLandAI(addressOfNFT);
		nft.name = getNFTNameByURI(tokenURI, nftProtocol, addressOfNFT, tokenId);
		nft.soldAt = timestamp;
		nft.createdAt = timestamp;
		nft.updatedAt = timestamp;
		nft.contractAddress = addressOfNFT;
		nft.metadata = buildMetadata(addressOfNFT, tokenId, nftProtocol, tokenURI).id;
		nft.owner = buildAccount(Address.zero()).id;
		nft.save();
	}

	nft.updatedAt = timestamp;
	nft.save();

	return nft;
}

export function buildSupplyQuantity(
	uri: string,
	nftProtocol: NFTProtocol,
	addressOfNFT: Address,
	tokenId: BigInt,
	max: BigInt,
): SupplyQuantity {
	let supplyQuantityId = format("{}-{}", [
		addressOfNFT.toHex(),
		tokenId.toHex(),
		md5.hex32(Bytes.fromUTF8(uri))
	]);
	let supplyQuantity = SupplyQuantity.load(supplyQuantityId);
	let save = false;
	if (supplyQuantity === null) {
		supplyQuantity = new SupplyQuantity(supplyQuantityId);
		supplyQuantity.soldCount = BigInt.fromI32(0);
		save = true;
	}
	if (max.le(BigInt.zero())) {
		supplyQuantity.maxSupply = getMintMaxByURI(uri, nftProtocol, addressOfNFT, tokenId);
		save = true;
	} else if (supplyQuantity.maxSupply.notEqual(max)) {
		supplyQuantity.maxSupply = max;
		save = true;
	}

	if (save) {
		supplyQuantity.save();
	}

	return supplyQuantity;
}

// 通用处理nft
// 这里会处理所有nft的转账
export function gensHandleTransfer(
	hash: string,
	timestamp: BigInt,
	from: Address,
	to: Address,
	nft: NFTSchema
): void {
	if (from.equals(Address.zero())) {

	}

	// 如果nft被转移，并且activeOrder不为null
	// 并且from跟order的creator不是一个人
	// 则将order cancel
	if (nft.activeOrder !== null) {
		let order = Order.load(nft.activeOrder!);
		if (order !== null
			&& order.status == OrderStatus_open
		) {
			order.status = OrderStatus_cancelled;
			order.save();
		}
	}

	transferLog(hash, timestamp, from, to, nft);
}
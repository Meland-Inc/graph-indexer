import { ethereum, Address, BigInt, log, http, Bytes, json, JSONValue, TypedMap, store } from '@graphprotocol/graph-ts';
import { ERC721 } from './generated/entities/templates/ERC721/ERC721';
import { ERC1155 } from './generated/entities/templates/ERC1155/ERC1155';
import { SupplyQuantity, NFT as NFTSchema, Order, NFTMetadataOrigin } from './generated/entities/schema';
import { buildMetadata } from './metadata';
import { buildAccount } from './account';
import { format } from './helper';
import { Land } from './generated/entities/Land/Land';
import { MelandWearable } from './generated/entities/Wearable/MelandWearable';
import { ItemType_futures, ItemType_placeable, ItemType_thirdparty, ItemType_tier, ItemType_viplandfutures, ItemType_wearable, NFTProtocol_erc721, OrderStatus_cancelled, OrderStatus_open, VUnknow } from './enums';
import { transferLog } from './log';
import * as configs from './config';

export function buildNFTId(addressOfNFT: Address, tokenId: BigInt): string {
	return format("{}#{}", [addressOfNFT.toHex(), tokenId.toString()]);
}

export function fetchMetadata(uri: string): TypedMap<string, JSONValue> {
	if (uri == "unknow") {
		return json.fromBytes(Bytes.fromUTF8("{}")).toObject();
	}

	if (uri.includes("ticketland")) {
		uri = "https://token-metadata-release.melandworld.com/land/ticketland/";
	}

	if (uri.includes("viplandfuture")) {
		let xs = uri.split("/");
		let s = 'vipland4x4';
		if (xs[xs.length - 2]) {
			s = xs[xs.length - 2];
		}
		uri = format("https://token-metadata-release.melandworld.com/viplandfuture/{}", [ s ]);
	}

	let storeId = Bytes.fromUTF8(uri).toHex();
	let metadataValueEn = NFTMetadataOrigin.load(storeId);

	log.info("start metadata: {}", [ uri ]);

	if (metadataValueEn) {
		log.info("fetch nft metadata: {}, use cache {}", [uri, storeId]);
		return json.fromBytes(metadataValueEn.value).toObject();
	}

	let bytes = http.get(uri);
	if (bytes === null) {
		bytes = Bytes.fromUTF8("{}");
	}

	let rv = json.try_fromBytes(bytes);

	if (rv.isOk) {
		let metadataValueEn = new NFTMetadataOrigin(storeId);
		metadataValueEn.value = bytes;
		metadataValueEn.save();
		log.info("fetch nft metadata: {} {}", [uri, bytes.toString()]);
		return rv.value.toObject();
	} else {
		log.error("error parser json fetch nft metadata: {} {}", [uri, bytes.toString()]);
	}

	return json.fromBytes(Bytes.fromUTF8("{}")).toObject();
}

export function getNFTName(addressOfNFT: Address, tokenId: BigInt): string {
	let erc721 = ERC721.bind(addressOfNFT);
	let erc1155 = ERC1155.bind(addressOfNFT);
	// default as unknow nft.
	let name = "unknow";
	let tryname721 = erc721.try_name();
	if (!tryname721.reverted) {
		name = tryname721.value;
	} else {
		let tryuri = erc1155.try_uri(tokenId);
		if (!tryuri.reverted) {
			let metadata = fetchMetadata(tryuri.value);
			let nameFromMetadata = metadata.get('name');
			if (nameFromMetadata) {
				name = nameFromMetadata.toString();
			}
		}
	}
	return name;
}

export function getNFTNameByURI(uri: string): string {
	let metadata = fetchMetadata(uri);
	let name = "unknow";
	let nameFromMetadata = metadata.get('name');
	if (nameFromMetadata) {
		name = nameFromMetadata.toString();
	}
	return name;
}

export function getNFTImageURIByURI(uri: string): string {
	let metadata = fetchMetadata(uri);
	let img = "";
	let xFromMetadata = metadata.get('image');
	if (xFromMetadata) {
		img = xFromMetadata.toString();
	}
	return img;
}

export function getNFTDescByURI(uri: string): string {
	let metadata = fetchMetadata(uri);
	let description = "";
	let xFromMetadata = metadata.get('description');
	if (xFromMetadata) {
		description = xFromMetadata.toString();
	}
	return description;
}

export function getMintMaxByURI(uri: string): BigInt {
	let rarity = getNFTRarityByURI(uri);
	if (rarity == "unique") {
		return BigInt.fromI32(1);
	} else if (rarity == "mythic") {
		return BigInt.fromI32(10);
	} else if (rarity == "epic") {
		return BigInt.fromI32(100);
	} else if (rarity == "rare") {
		return BigInt.fromI32(1000);
	} else if (rarity == "common") {
		return BigInt.fromI32(10000);
	}
	return BigInt.fromI32(200);
}

export function getNFTRarityByURI(uri: string): string {
	let metadata = fetchMetadata(uri);
	let attributes = metadata.get('attributes');
	let rarity = VUnknow;
	if (attributes != null) {
		let attriarr = attributes.toArray();
		for (let i = 0; i < attriarr.length; i++) {
			let att = attriarr[i];
			let obj = att.toObject();
			let type = obj.get("trait_type");
			let val = obj.get("value");
			if (type && val) {
				if (type.toString() == "Rarity") {
					rarity = val.toString();
				}
			}
		}
	}
	return rarity;
}

export function buildNFTSymbolWithURI(addressOfNFT: Address, uri: string): string {
	if (addressOfNFT.toHex() == configs.MelandTier_address) {
		return format("MELD-{}", [ItemType_tier]);
	} else if (addressOfNFT.toHex() == configs.Land_address) {
		let metadata = fetchMetadata(uri);
		let name = metadata.get('name');
		if (!name) {
			return format("MELD-{}", ["unknow-land"]);
		}
		return format("MELD-{}", [name.toString()]);
	} else if (addressOfNFT.toHex() == configs.Meland1155Wearable_address) {
		let metadata = fetchMetadata(uri);
		let attributes = metadata.get('attributes');
		let wearingPosition = 'unknown';
		if (attributes != null) {
			let attriarr = attributes.toArray();
			for (let i = 0; i < attriarr.length; i++) {
				let att = attriarr[i];
				let obj = att.toObject();
				let type = obj.get("trait_type");
				let val = obj.get("value");
				if (type && val) {
					if (type.toString() == "Wearing position") {
						wearingPosition = val.toString();
					}
				}
			}
		}
		return format("MELD-{}-{}", [ItemType_wearable, wearingPosition.split(" ").join("").toLowerCase()]);
	} else if (addressOfNFT.toHex() == configs.Meland1155Placeable_address) {
		return format("MELD-{}", [ItemType_placeable]);
	} else if (addressOfNFT.toHex() == configs.Meland1155LandFuture_address) {
		return format("MELD-{}", [ItemType_viplandfutures]);
	} else if (addressOfNFT.toHex() == configs.Meland1155MELDFuture_address) {
		return format("MELD-{}", [ItemType_futures]);
	}

	return ItemType_thirdparty;
}

export function buildNFTSymbol(addressOfNFT: Address, tokenId: BigInt): string {
	if (addressOfNFT.toHex() == configs.MelandTier_address) {
		return format("MELD-{}", [ItemType_tier]);
	} else if (addressOfNFT.toHex() == configs.Land_address) {
		let land = Land.bind(addressOfNFT);
		let landtype = land.landtypeById(tokenId);
		return format("MELD-{}", [landtype]);
	} else if (addressOfNFT.toHex() == configs.Meland1155Wearable_address) {
		let wearble = MelandWearable.bind(addressOfNFT);
		let uri = wearble.uri(tokenId);
		return buildNFTSymbolWithURI(addressOfNFT, uri);
	} else if (addressOfNFT.toHex() == configs.Meland1155Placeable_address) {
		return format("MELD-{}", [ItemType_placeable]);
	} else if (addressOfNFT.toHex() == configs.Meland1155LandFuture_address) {
		return format("MELD-{}", [ItemType_viplandfutures]);
	} else if (addressOfNFT.toHex() == configs.Meland1155MELDFuture_address) {
		return format("MELD-{}", [ItemType_futures]);
	}

	return ItemType_thirdparty;
}

export function getNFTTokenURI(addressOfNFT: Address, tokenId: BigInt, protocol: string): string {
	let erc721 = ERC721.bind(addressOfNFT);
	let erc1155 = ERC1155.bind(addressOfNFT);

	let uri = "unknow";

	if (protocol == NFTProtocol_erc721) {
		let tryname721 = erc721.try_tokenURI(tokenId);
		if (!tryname721.reverted) {
			uri = tryname721.value;
		}
	} else {
		let tryuri = erc1155.try_uri(tokenId);
		if (!tryuri.reverted) {
			uri = tryuri.value;
		}
	}
	return uri;
}

function isMeLandAI(address: Address): boolean {
	let hex = address.toHex().toLowerCase();
	let melandAiAddress: string[] = [
	];
	let allConfig = configs.getAll();
	let keys = configs.getAllKeys();
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let value = allConfig.has(k) ? allConfig.get(k) : null;
		if (value) {
			melandAiAddress.push(value);
		}
	}
	if (melandAiAddress.includes(hex)) {
		return true;
	}
	return false;
}

export function buildNFT(
	addressOfNFT: Address,
	tokenId: BigInt,
	timestamp: BigInt,
	protocol: string,
): NFTSchema {
	let nftId = buildNFTId(addressOfNFT, tokenId);
	let nft = NFTSchema.load(nftId);
	if (nft === null) {
		let tokenURI = getNFTTokenURI(addressOfNFT, tokenId, protocol);
		let rarity = getNFTRarityByURI(tokenURI);
		nft = new NFTSchema(nftId);
		nft.tokenId = tokenId;
		nft.tokenURI = tokenURI;
		nft.rarity = rarity;
		nft.supplyQuantity = buildSupplyQuantity(addressOfNFT, tokenURI, BigInt.zero()).id;
		nft.symbol = buildNFTSymbol(addressOfNFT, tokenId);
		nft.isMeLandAI = isMeLandAI(addressOfNFT);
		nft.name = getNFTNameByURI(tokenURI);
		nft.soldAt = timestamp;
		nft.createdAt = timestamp;
		nft.updatedAt = timestamp;
		nft.contractAddress = addressOfNFT;
		nft.metadata = buildMetadata(addressOfNFT, tokenId, protocol, tokenURI).id;
		nft.owner = buildAccount(Address.zero()).id;
		nft.save();
	}

	nft.updatedAt = timestamp;
	nft.save();

	return nft;
}

export function buildSupplyQuantity(addressOfNFT: Address, uri: string, max: BigInt): SupplyQuantity {
	let supplyQuantityId = format("{}-{}", [
		addressOfNFT.toHex(),
		uri
	]);
	let supplyQuantity = SupplyQuantity.load(supplyQuantityId);
	let save = false;
	if (supplyQuantity === null) {
		supplyQuantity = new SupplyQuantity(supplyQuantityId);
		supplyQuantity.soldCount = BigInt.fromI32(0);
		save = true;
	}

	if (max.le(BigInt.zero())) {
		supplyQuantity.maxSupply = getMintMaxByURI(uri);
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

export function isPlaceable(nftAddress: Address): boolean {
	return configs.Meland1155Placeable_address == nftAddress.toHex();
}

export function isWearable(nftAddress: Address): boolean {
	return configs.Meland1155Wearable_address == nftAddress.toHex();
}

export function isTier(nftAddress: Address): boolean {
	return configs.MelandTier_address == nftAddress.toHex();
}

export function isViplandFuture(nftAddress: Address): boolean {
	return configs.Meland1155LandFuture_address == nftAddress.toHex();
}

export function isMELDFuture(nftAddress: Address): boolean {
	return configs.Meland1155MELDFuture_address == nftAddress.toHex();
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
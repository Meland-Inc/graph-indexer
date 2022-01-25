import { http, json, JSONValue, TypedMap, Entity, Bytes, Address, BigInt, log } from '@graphprotocol/graph-ts';
import { ERC721 } from './generated/entities/templates/ERC721/ERC721';
import {
	Future,
	Metadata,
	Placeable as PlaceableSchema,
	Thirdparty,
	Tier,
	Tikcetland as TikcetLandSchema,
	Vipland as ViplandSchema,
	Viplandfuture,
	Wearable,
	NFTMetadataOrigin
} from './generated/entities/schema';
import { isMeLandAI, isMELDFuture, isPlaceable, isTier, isViplandFuture, isWearable } from './selfhost';
import { buildRcCoordinates, isTicketLand, isVipLand } from './land';
import { ItemType_futures, ItemType_placeable, ItemType_thirdparty, ItemType_ticketland, ItemType_tier, ItemType_undefined, ItemType_vipland, ItemType_viplandfutures, ItemType_wearable, NFTProtocol, NFTProtocol_erc1155 } from './enums';
import { format } from './helper';
import { MelandWearable } from './generated/entities/NFTStore/MelandWearable';
import { Meland1155MELDFuture } from './generated/entities/MELDFuture/Meland1155MELDFuture';
import * as md5 from '../node_modules/as-crypto/lib/md5';
import * as base64 from '../node_modules/as-crypto/lib/base64';
import { getNFTImageByURI, getNFTDescByURI } from './tokenuri';
import { Meland1155Placeable } from './generated/entities/Placeable/Meland1155Placeable';
// import { } from './generated/entities'

// TODO
export function buildPlaceable(nftAddress: Address, tokenId: BigInt, uri: string): PlaceableSchema {
	let pId = md5.hex32(Bytes.fromUTF8(format("{}-{}-{}", [nftAddress.toHex(), tokenId.toHex(), uri])));
	let pi = Meland1155Placeable.bind(nftAddress);
	let cid = pi.getCidByTokenId(tokenId);
	let placeable = PlaceableSchema.load(pId);
	if (placeable === null) {
		placeable = new PlaceableSchema(pId);
		placeable.cid = cid.toString();
		placeable.placeableLands = "VIP";
		placeable.coreSkillId = "";
		placeable.skillLevel = "";
		placeable.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		placeable.save();
	}
	return placeable;
}

export function buildTicketLand(nftAddress: Address, tokenId: BigInt, uri: string): TikcetLandSchema {
	let ticketLandId = tokenId.toString();
	let ticketLand = TikcetLandSchema.load(ticketLandId);
	if (ticketLand === null) {
		ticketLand = new TikcetLandSchema(ticketLandId);
		ticketLand.rcCoordinates = buildRcCoordinates(tokenId).id;
		ticketLand.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		ticketLand.save();
	}
	return ticketLand;
}

export function buildVipLand(nftAddress: Address, tokenId: BigInt, uri: string): ViplandSchema {
	let ticketLandId = tokenId.toString();
	let ticketLand = ViplandSchema.load(ticketLandId);
	if (ticketLand === null) {
		ticketLand = new ViplandSchema(ticketLandId);
		ticketLand.rcCoordinates = buildRcCoordinates(tokenId).id;
		ticketLand.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		ticketLand.save();
	}
	return ticketLand;
}

export function buildThirdParty(uri: string, nftProtocol: NFTProtocol, nftAddress: Address, tokenId: BigInt): Thirdparty {
	let id = format("{}-{}", [nftAddress.toHex(), tokenId.toString()]);
	let thirdparty = Thirdparty.load(id);
	if (thirdparty === null) {
		thirdparty = new Thirdparty(id);
		thirdparty.imageURL = getNFTImageByURI(uri, nftProtocol, nftAddress, tokenId);
		thirdparty.save();
	}
	return thirdparty;
}

export function buildWearable(nftAddress: Address, tokenId: BigInt, uri: string): Wearable {
	let wId = md5.hex32(Bytes.fromUTF8(format("{}-{}-{}", [nftAddress.toHex(), tokenId.toHex(), uri])));
	let w = Wearable.load(wId);
	let wi = MelandWearable.bind(nftAddress);
	let cid = wi.getCidByTokenId(tokenId);
	if (w === null) {
		w = new Wearable(wId);
		w.cid = cid.toString();
		w.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		w.save();
	}
	return w;
}

export function buildTier(nftAddress: Address, tokenId: BigInt, uri: string): Tier {
	let wId = md5.hex32(Bytes.fromUTF8(format("{}-{}-{}", [nftAddress.toHex(), tokenId.toHex(), uri])));
	let w = Tier.load(wId);
	if (w === null) {
		w = new Tier(wId);
		w.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		w.save();
	}
	return w;
}

export function buildViplandfuture(nftAddress: Address, tokenId: BigInt, uri: string): Viplandfuture {
	let wId = md5.hex32(Bytes.fromUTF8(format("{}-{}-{}", [nftAddress.toHex(), tokenId.toHex(), uri])));
	let w = Viplandfuture.load(wId);
	if (w === null) {
		w = new Viplandfuture(wId);
		w.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		w.save();
	}
	return w;
}

export function buildMELDFuture(nftAddress: Address, tokenId: BigInt, uri: string): Future {
	let wId = md5.hex32(Bytes.fromUTF8(format("{}-{}-{}", [nftAddress.toHex(), tokenId.toHex(), uri])));
	let w = Future.load(wId);
	let faEntity = Meland1155MELDFuture.bind(nftAddress);
	if (w === null) {
		w = new Future(wId);
		w.imageURL = getNFTImageByURI(uri, NFTProtocol_erc1155, nftAddress, tokenId);
		let tryFutureInfo = faEntity.try_futureById(tokenId);
		w.amount = BigInt.fromI32(0);
		w.unlockAt = BigInt.fromI32(0);
		if (!tryFutureInfo.reverted) {
			w.amount = tryFutureInfo.value.value2;
			w.unlockAt = tryFutureInfo.value.value1;
		}
		w.save();
	}
	return w;
}

export function buildMetadata(
	nftAddress: Address,
	tokenId: BigInt,
	nftProtocol: NFTProtocol,
	uri: string
): Metadata {
	let metadataId: string = md5.hex32(Bytes.fromUTF8(format('{}-{}-{}', [nftAddress.toHex(), tokenId.toString(), uri])));
	log.info('metadataId: {}', [metadataId]);
	let metadata = Metadata.load(metadataId);
	if (metadata === null) {
		metadata = new Metadata(metadataId);
		metadata.description = getNFTDescByURI(uri, nftProtocol, nftAddress, tokenId);
		if (isPlaceable(nftAddress)) {
			metadata.itemType = ItemType_placeable;
			metadata.placeable = buildPlaceable(nftAddress, tokenId, uri).id;
		} else if (isTicketLand(nftAddress, tokenId, uri)) {
			metadata.itemType = ItemType_ticketland;
			metadata.ticketland = buildTicketLand(nftAddress, tokenId, uri).id;
		} else if (isVipLand(nftAddress, tokenId, uri)) {
			metadata.itemType = ItemType_vipland;
			metadata.vipland = buildVipLand(nftAddress, tokenId, uri).id;
		} else if (isWearable(nftAddress)) {
			metadata.itemType = ItemType_wearable;
			metadata.wearable = buildWearable(nftAddress, tokenId, uri).id;
		} else if (isTier(nftAddress)) {
			metadata.itemType = ItemType_tier;
			metadata.tier = buildTier(nftAddress, tokenId, uri).id;
		} else if (isViplandFuture(nftAddress)) {
			metadata.itemType = ItemType_viplandfutures;
			metadata.viplandfutures = buildViplandfuture(nftAddress, tokenId, uri).id;
		} else if (isMELDFuture(nftAddress)) {
			metadata.itemType = ItemType_futures;
			metadata.futures = buildMELDFuture(nftAddress, tokenId, uri).id;
		} else {
			metadata.itemType = ItemType_thirdparty;
			metadata.thirdparty = buildThirdParty(uri,nftProtocol, nftAddress, tokenId).id;
		}
		metadata.nftProtocol = nftProtocol;
		metadata.save();
	}

	return metadata;
}

export function fetchMetadata(uri: string, nftProtocol: NFTProtocol, address: Address, tokenId: BigInt): TypedMap<string, JSONValue> {
	if (uri == "unknow") {
		return json.fromBytes(Bytes.fromUTF8("{}")).toObject();
	}

	/// Third-party sources are not stable enough to prevent slowing down the synchronization efficiency and not pulling. 
	/// Let the client pull directly
	if (!isMeLandAI(address)) {
		return json.fromBytes(Bytes.fromUTF8("{}")).toObject();
	}

	if (uri.includes("data:application/json;base64,")) {
		let s = uri.replace("data:application/json;base64,", "");
		let b = base64.decode(s);
		return json.fromBytes(Bytes.fromUint8Array(b)).toObject();
	}

	// replaceURIWithERC1155(uri, tokenId);

	if (uri.includes("ticketland")) {
		uri = "https://token-metadata-release.melandworld.com/land/ticketland/";
	}

	if (uri.includes("viplandfuture")) {
		let xs = uri.split("/");
		let s = 'vipland4x4';
		if (xs[xs.length - 2]) {
			s = xs[xs.length - 2];
		}
		uri = format("https://token-metadata-release.melandworld.com/viplandfuture/{}", [s]);
	}

	let storeId = md5.hex32(Bytes.fromUTF8(uri));
	let metadataValueEn = NFTMetadataOrigin.load(storeId);

	if (metadataValueEn) {
		log.info("fetch nft metadata: {}, use cache {}", [uri, storeId]);
		return json.fromBytes(metadataValueEn.value).toObject();
	}

	if (uri.includes("https")
		|| uri.includes("http")
	) {

	} else if (uri.includes("ipfs")) {
		// use meland ipfs gateway
		uri = format("https://gateway-ipfs.melandworld.com/ipfs/{}", [uri.replace("ipfs://", "")]);
	} else {
		uri = format("https://gateway-ipfs.melandworld.com/ipfs/{}", [uri]);
	}

	log.info("start metadata: {}", [uri]);

	let bytes: Bytes | null = null;

	bytes = http.get(uri);

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
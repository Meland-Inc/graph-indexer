import { ethereum, JSONValue, TypedMap, Entity, Bytes, Address, BigInt, log } from '@graphprotocol/graph-ts';
import { ERC721 } from './generated/entities/templates/ERC721/ERC721';
import {
	Metadata,
	Placeable as PlaceableSchema,
	Thirdparty,
	Tier,
	Tikcetland as TikcetLandSchema,
	Vipland as ViplandSchema,
	Viplandfuture,
	Wearable
} from './generated/entities/schema';
import { getNFTDescByURI, getNFTImageURIByURI, isPlaceable, isTier, isViplandFuture, isWearable } from './nft';
import { buildRcCoordinates, isTicketLand, isVipLand } from './land';
import { ItemType_placeable, ItemType_thirdparty, ItemType_ticketland, ItemType_tier, ItemType_undefined, ItemType_vipland, ItemType_viplandfutures, ItemType_wearable } from './enums';
import { format } from './helper';
import { MelandWearable } from './generated/entities/NFTStore/MelandWearable';

// TODO
export function buildPlaceable(nftAddress: Address): PlaceableSchema {
	let rarity = '';
	let cid = '0';
	let placeable = PlaceableSchema.load(cid);
	if (placeable === null) {
		placeable = new PlaceableSchema(cid);
		placeable.rarity = rarity;
		placeable.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ItemType_placeable, cid]);
		placeable.save();
	}
	return placeable;
}

export function buildTicketLand(nftAddress: Address, tokenId: BigInt): TikcetLandSchema {
	let ticketLandId = tokenId.toString();
	let ticketLand = TikcetLandSchema.load(ticketLandId);
	if (ticketLand === null) {
		ticketLand = new TikcetLandSchema(ticketLandId);
		ticketLand.rcCoordinates = buildRcCoordinates(tokenId).id;
		ticketLand.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ItemType_ticketland, ticketLandId]);
		ticketLand.save();
	}
	return ticketLand;
}

export function buildVipLand(nftAddress: Address, tokenId: BigInt): ViplandSchema {
	let ticketLandId = tokenId.toString();
	let ticketLand = ViplandSchema.load(ticketLandId);
	if (ticketLand === null) {
		ticketLand = new ViplandSchema(ticketLandId);
		ticketLand.rcCoordinates = buildRcCoordinates(tokenId).id;
		ticketLand.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ItemType_vipland, ticketLandId]);
		ticketLand.save();
	}
	return ticketLand;
}

export function buildThirdParty(nftAddress: Address, tokenId: BigInt, uri: string): Thirdparty {
	let id = format("{}-{}", [nftAddress.toHex(), tokenId.toString()]);
	let thirdparty = Thirdparty.load(id);
	if (thirdparty === null) {
		thirdparty = new Thirdparty(id);
		thirdparty.imageURL = getNFTImageURIByURI(uri);
		thirdparty.save();
	}
	return thirdparty;
}

export function buildWearable(nftAddress: Address, tokenId: BigInt, uri: string): Wearable {
	let wId = format("{}-{}-{}", [ nftAddress.toHex(), tokenId.toHex(), uri]);
	let w = Wearable.load(wId);
	let wi = MelandWearable.bind(nftAddress);
	let cid = wi.getCidByTokenId(tokenId);
	if (w === null) {
		w = new Wearable(wId);
		w.cid = cid.toString();
		w.imageURL = getNFTImageURIByURI(uri);
		w.save();
	}
	return w;
}

export function buildTier(nftAddress: Address, tokenId: BigInt, uri: string): Tier {
	let wId = format("{}-{}-{}", [ nftAddress.toHex(), tokenId.toHex(), uri]);
	let w = Tier.load(wId);
	if (w === null) {
		w = new Tier(wId);
		w.imageURL = getNFTImageURIByURI(uri);
		w.save();
	}
	return w;
}

export function buildViplandfuture(nftAddress: Address, tokenId: BigInt, uri: string): Viplandfuture {
	let wId = format("{}-{}-{}", [ nftAddress.toHex(), tokenId.toHex(), uri]);
	let w = Viplandfuture.load(wId);
	if (w === null) {
		w = new Viplandfuture(wId);
		w.imageURL = getNFTImageURIByURI(uri);
		w.save();
	}
	return w;
}

export function buildMetadata(
	nftAddress: Address,
	tokenId: BigInt,
	protocol: string,
	uri: string
): Metadata {
	let metadataId: string = format('{}-{}-{}', [nftAddress.toHex(), tokenId.toString(), uri]);
	log.info('metadataId: {}', [metadataId]);
	let metadata = Metadata.load(metadataId);
	if (metadata === null) {
		metadata = new Metadata(metadataId);
		metadata.description = getNFTDescByURI(uri);
		if (isPlaceable(nftAddress)) {
			metadata.itemType = ItemType_placeable;
			metadata.placeable = buildPlaceable(nftAddress).id;
		} else if (isTicketLand(nftAddress, tokenId, uri)) {
			metadata.itemType = ItemType_ticketland;
			metadata.ticketland = buildTicketLand(nftAddress, tokenId).id;
		} else if (isVipLand(nftAddress, tokenId, uri)) {
			metadata.itemType = ItemType_vipland;
			metadata.vipland = buildVipLand(nftAddress, tokenId).id;
		} else if (isWearable(nftAddress)) {
			metadata.itemType = ItemType_wearable;
			metadata.wearable = buildWearable(nftAddress, tokenId, uri).id;
		} else if (isTier(nftAddress)) {
			metadata.itemType = ItemType_tier;
			metadata.tier = buildTier(nftAddress, tokenId, uri).id;
		} else if (isViplandFuture(nftAddress)) {
			metadata.itemType = ItemType_viplandfutures;
			metadata.viplandfutures = buildViplandfuture(nftAddress, tokenId, uri).id;
		} else {
			metadata.itemType = ItemType_thirdparty;
			metadata.thirdparty = buildThirdParty(nftAddress, tokenId, uri).id;
		}

		metadata.nftProtocol = protocol;
		metadata.save();
	}

	return metadata;
}

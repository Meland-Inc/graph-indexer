import { ethereum, JSONValue, TypedMap, Entity, Bytes, Address, BigInt, log } from '@graphprotocol/graph-ts';
import { NFTWithRarity as ERC721 } from './generated/entities/templates/NFTWithRarity/NFTWithRarity';
import {
	Metadata,
	Placeable as PlaceableSchema,
	RcCoordinates,
	Thirdparty,
	Tikcetland as TikcetLandSchema,
	Vipland as ViplandSchema
} from './generated/entities/schema';
import { isPlaceable } from './nft';
import { buildRcCoordinates, isTicketLand, isVipLand } from './land';
import { ItemType_placeable, ItemType_thirdparty, ItemType_ticketland, ItemType_undefined, ItemType_vipland } from './enums';
import { format } from './helper';

export function buildPlaceable(nftAddress: Address): PlaceableSchema {
	let erc721 = ERC721.bind(nftAddress);
	let cidRv = erc721.try_getCid();
	let rarityRv = erc721.try_rarity();
	let rarity = '';
	let cid = '0';
	if (!cidRv.reverted) {
		cid = cidRv.value;
	}
	if (!rarityRv.reverted) {
		rarity = rarityRv.value;
	}
	let placeable = PlaceableSchema.load(cid);
	if (placeable === null) {
		placeable = new PlaceableSchema(cid);
		placeable.rarity = rarity;
		placeable.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ ItemType_placeable, cid ]);
	}
	placeable.save();
	return placeable!;
}

export function buildTicketLand(nftAddress: Address, tokenId: BigInt): TikcetLandSchema {
	let ticketLandId = tokenId.toString();
	let ticketLand = TikcetLandSchema.load(ticketLandId);
	if (ticketLand === null) {
		ticketLand = new TikcetLandSchema(ticketLandId);
        ticketLand.rcCoordinates = buildRcCoordinates(tokenId).id;
		ticketLand.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ ItemType_ticketland, ticketLandId ]);
	}
	ticketLand.save();
	return ticketLand!;
}

export function buildVipLand(nftAddress: Address, tokenId: BigInt): ViplandSchema {
	let ticketLandId = tokenId.toString();
	let ticketLand = ViplandSchema.load(ticketLandId);
	if (ticketLand === null) {
		ticketLand = new ViplandSchema(ticketLandId);
        ticketLand.rcCoordinates = buildRcCoordinates(tokenId).id;
		ticketLand.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ ItemType_vipland, ticketLandId ]);
	}
	ticketLand.save();
	return ticketLand!;
}

export function buildThirdParty(nftAddress: Address, tokenId: BigInt): Thirdparty {
	let thirdparty = Thirdparty.load(tokenId.toString());
	if (thirdparty === null) {
		thirdparty = new Thirdparty(tokenId.toString());
		thirdparty.imageURL = format('https://token-image-release.melandworld.com/{}/{}', [ ItemType_ticketland, tokenId.toString() ]);
	}
	return thirdparty!;
}

export function buildMetadata(nftAddress: Address, tokenId: BigInt): Metadata {
	let erc721 = ERC721.bind(nftAddress);
	let symbol = erc721.symbol();
	let rarity = '';
	let rarityRv = erc721.try_rarity();

	if (!rarityRv.reverted) {
		rarity = rarityRv.value;
	}

	let itemType = ItemType_undefined;

	if (isPlaceable(symbol)) {
		itemType = ItemType_placeable;
	}else if (isTicketLand(symbol)) {
		itemType = ItemType_ticketland;
	}else if (isVipLand(symbol)) {
		itemType = ItemType_vipland;
	}else {
		itemType = ItemType_thirdparty;
	}

	let metadataId: string = format('{}-{}-{}-{}', [ symbol, rarity, nftAddress.toHex(), tokenId.toString() ]);
	log.info('metadataId: {}', [ metadataId ]);
	let metadata = Metadata.load(metadataId);
	if (metadata === null) {
		metadata = new Metadata(metadataId);
	}

	if (isPlaceable(symbol)) {
		metadata.placeable = buildPlaceable(nftAddress).id;
	}else if (isVipLand(symbol)) {
		metadata.vipland = buildVipLand(nftAddress, tokenId).id;
	}else if (isTicketLand(symbol)) {
		metadata.ticketland = buildTicketLand(nftAddress, tokenId).id;
	}else {
		metadata.thirdparty = buildThirdParty(nftAddress, tokenId).id;
	}
	metadata.itemType = itemType;
	metadata.save();

	return metadata!;
}

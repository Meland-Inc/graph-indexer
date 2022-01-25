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
import { fetchMetadata } from './metadata';
import { isMeLandAI } from './selfhost';

export function replaceURIWithERC1155(uri: string, tokenId: BigInt): string {
    let hex = tokenId.toHex();
    hex = hex.replace("0x", "");
    hex = hex.padStart(64, '0');
    if (uri.includes("{id}")) {
        uri = uri.replace("{id}", hex);
    }
    return uri;
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

    uri = replaceURIWithERC1155(uri, tokenId);

    if (uri.includes("ipfs://")) {
        uri = uri.replace("ipfs://", "https://gateway-ipfs.melandworld.com/ipfs/");
    }

    return uri;
}

export function getNFTNameByURI(
    uri: string,
    nftProtocol: NFTProtocol,
    address: Address,
    tokenId: BigInt
): string {
    if (nftProtocol == "erc721") {
        let erc721 = ERC721.bind(address);
        let tryname721 = erc721.try_name();
        if (!tryname721.reverted) {
            return tryname721.value;
        }
    }

    if (!isMeLandAI(address)) {
        return "";
    }

    let name = "";
    let metadata = fetchMetadata(uri, nftProtocol, address, tokenId);
    let nameFromMetadata = metadata.get('name');
    if (nameFromMetadata) {
        name = nameFromMetadata.toString();
    }
    return name;
}

export function getNFTImageByURI(uri: string, nftProtocol: NFTProtocol, address: Address, tokenId: BigInt): string {
    if (!isMeLandAI(address)) {
        return "";
    }
    
    let metadata = fetchMetadata(uri, nftProtocol, address, tokenId);
    let img = "";
    let xFromMetadata = metadata.get('image');
    let urlFromMetadata = metadata.get('image_url');
    if (xFromMetadata) {
        img = xFromMetadata.toString();
    } else if (urlFromMetadata) {
        img = urlFromMetadata.toString();
    }
    img = replaceURIWithERC1155(img, tokenId);
    if (img.includes("ipfs://")) {
        img = img.replace("ipfs://", "https://gateway-ipfs.melandworld.com/ipfs/");
    }
    return img;
}

export function getNFTDescByURI(uri: string, nftProtocol: NFTProtocol, address: Address, tokenId: BigInt): string {
    if (!isMeLandAI(address)) {
        return "";
    }

    let metadata = fetchMetadata(uri, nftProtocol, address, tokenId);
    let description = "";
    let xFromMetadata = metadata.get('description');
    if (xFromMetadata) {
        description = xFromMetadata.toString();
    }
    return description;
}

export function getMintMaxByURI(uri: string, nftProtocol: NFTProtocol, address: Address, tokenId: BigInt): BigInt {
    if (!isMeLandAI(address)) {
        return BigInt.fromI32(200);
    }
    let rarity = getNFTRarityByURI(uri, nftProtocol, address, tokenId);
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

export function getNFTRarityByURI(uri: string, nftProtocol: NFTProtocol, address: Address, tokenId: BigInt): string {
    if (!isMeLandAI(address)) {
        return VUnknow;
    }

    let metadata = fetchMetadata(uri, nftProtocol, address, tokenId);
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

export function buildNFTSymbolByURI(uri: string, nftProtocol: NFTProtocol, address: Address, tokenId: BigInt): string {
    if (!isMeLandAI(address)) {
        return VUnknow;
    }
    
    if (address.toHex() == configs.MelandTier_address) {
        return format("MELD-{}", [ItemType_tier]);
    } else if (address.toHex() == configs.Land_address) {
        let metadata = fetchMetadata(uri, nftProtocol, address, tokenId);
        let name = metadata.get('name');
        if (!name) {
            return format("MELD-{}", ["unknow-land"]);
        }
        return format("MELD-{}", [name.toString()]);
    } else if (address.toHex() == configs.Meland1155Wearable_address) {
        let metadata = fetchMetadata(uri, nftProtocol, address, tokenId);
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
    } else if (address.toHex() == configs.Meland1155Placeable_address) {
        return format("MELD-{}", [ItemType_placeable]);
    } else if (address.toHex() == configs.Meland1155LandFuture_address) {
        return format("MELD-{}", [ItemType_viplandfutures]);
    } else if (address.toHex() == configs.Meland1155MELDFuture_address) {
        return format("MELD-{}", [ItemType_futures]);
    }

    return ItemType_thirdparty;
}
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { RcCoordinates } from "./generated/entities/schema";
import * as configs from './config';
import { Land } from './generated/entities/Land/Land';
import { ItemType_ticketland, ItemType_vipland } from "./enums";
import { getNFTNameByURI } from "./nft";

export function isLand(address: Address, tokenId: BigInt): boolean {
    return configs.Land_address == address.toHex();
}

export function isTicketLand(address: Address, tokenId: BigInt, uri: string): boolean {
    if (!isLand(address, tokenId)) {
        return false;
    }

    if (tokenId.equals(BigInt.fromI32(0))) {
        return getNFTNameByURI(uri).includes("ticket");
    }

    let land = Land.bind(address);
    let landtype = land.landtypeById(tokenId);
    return landtype == ItemType_ticketland;
}

export function isVipLand(address: Address, tokenId: BigInt, uri: string): boolean {
    if (!isLand(address, tokenId)) {
        return false;
    }
    if (tokenId.equals(BigInt.fromI32(0))) {
        return getNFTNameByURI(uri).includes("vip");
    }
    let land = Land.bind(address);
    let landtype = land.landtypeById(tokenId);
    return landtype == ItemType_vipland;
}

export function buildRcCoordinates(landId: BigInt): RcCoordinates {
    let rc = RcCoordinates.load(landId.toString());
    if (rc === null) {
        let pad = BigInt.fromI32(10000);
        let c = landId.mod(pad);
        let r = landId.minus(c).div(pad);
        rc = new RcCoordinates(landId.toString());
        rc.c = c;
        rc.r = r;
        rc.save();
    }
    return rc;
}
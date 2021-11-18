import { BigInt } from "@graphprotocol/graph-ts";
import { RcCoordinates } from "./generated/entities/schema";

export function isLand(symbol: string): boolean {
	return symbol.includes('Land');
}

export function isTicketLand(symbol: string): boolean {
	return isLand(symbol) && (symbol.includes('ticket') || symbol.includes('Ticket'));
}

export function isVipLand(symbol: string): boolean {
	return isLand(symbol) && (symbol.includes('vip') || symbol.includes('Vip'));
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
    return rc!;
}
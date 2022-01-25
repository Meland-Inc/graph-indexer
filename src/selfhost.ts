import * as configs from './config';
import { Address } from '@graphprotocol/graph-ts';

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

// match the address of the NFT from meland
export function isMeLandAI(address: Address): boolean {
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
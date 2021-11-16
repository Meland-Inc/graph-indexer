import { ethereum, Address, BigInt, log } from '@graphprotocol/graph-ts';
import { NFTWithRarity as ERC721 } from './generated/entities/templates/NFTWithRarity/NFTWithRarity';
import { SupplyQuantity, NFT as NFTSchema } from './generated/entities/schema';
import { buildMetadata } from './metadata';
import { buildAccount } from './account';
import { isLand } from './land';
import { format } from './helper';

interface MabyeNFT {
	rarity: string;
	symbol: string;
}

export function buildNFTId(addressOfNFT: Address, tokenId: BigInt): string {
    return format("{}#{}", [addressOfNFT.toString(), tokenId.toString()]);
}

export function buildNFT(block: ethereum.Block, addressOfNFT: Address, tokenId: BigInt): NFTSchema {
	let nftId = buildNFTId(addressOfNFT, tokenId);
	let erc721 = ERC721.bind(addressOfNFT);
	let nft = NFTSchema.load(nftId);
	if (nft === null) {
		nft = new NFTSchema(nftId);
		nft.createdAt = block.timestamp;
		nft.contractAddress = addressOfNFT;
		nft.metadata = buildMetadata(addressOfNFT, tokenId).id;
		nft.owner = buildAccount(erc721.ownerOf(tokenId)).id;
		nft.save();
	}
	return nft!;
}

export function buildSupplyQuantity(addressOfNFT: Address): SupplyQuantity {
	let supplyQuantityId = addressOfNFT.toHex();
	let supplyQuantity = SupplyQuantity.load(supplyQuantityId);
	if (supplyQuantity === null) {
		supplyQuantity = new SupplyQuantity(supplyQuantityId);
	}
	supplyQuantity.soldCount = BigInt.fromI32(0);
	// 最大供应量
	supplyQuantity.maxSupply = getMaxSupply(addressOfNFT);
    supplyQuantity.save();
	return supplyQuantity!;
}

export function getMaxSupply(addressOfNFT: Address): BigInt {
	let erc721 = ERC721.bind(addressOfNFT);
    let symbol = erc721.symbol();
    let max = BigInt.fromI32(2000000);
    if (isPlaceable(symbol)
        || isLand(symbol)
    ) {
        max = erc721.getMintMax();
    }

    return max;
}

export function addNFTProperty<T extends MabyeNFT, T1 extends Address>(object: T, nftAddress: T1): T {
    log.info("nft address: {}", [nftAddress.toHex()]);
	let erc721 = ERC721.bind(nftAddress);
	object.rarity = '';
	object.symbol = erc721.symbol();
	let tryRarity = erc721.try_rarity();
	if (!tryRarity.reverted) {
		object.rarity = tryRarity.value;
	}
	return object;
}

export function isPlaceable(symbol: string): boolean {
	return symbol.includes('placeable');
}

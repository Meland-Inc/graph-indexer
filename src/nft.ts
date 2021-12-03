import { ethereum, Address, BigInt, log } from '@graphprotocol/graph-ts';
import { NFTWithRarity as ERC721, Transfer } from './generated/entities/templates/NFTWithRarity/NFTWithRarity';
import { SupplyQuantity, NFT as NFTSchema, Order } from './generated/entities/schema';
import { buildMetadata } from './metadata';
import { buildAccount } from './account';
import { isLand } from './land';
import { format } from './helper';
import { OrderStatus_cancelled, OrderStatus_open } from './enums';
import { transferLog } from './log';

interface MabyeNFT {
	rarity: string | null;
	symbol: string | null;
    name: string | null;
}

export function buildNFTId(addressOfNFT: Address, tokenId: BigInt): string {
    return format("{}#{}", [addressOfNFT.toHex(), tokenId.toString()]);
}

function isMeLandAI(symbol: string): boolean {
	if (symbol.includes("MELAND")) {
		return true;
	}
	return false;
}

export function buildNFT(block: ethereum.Block, addressOfNFT: Address, tokenId: BigInt): NFTSchema {
	let nftId = buildNFTId(addressOfNFT, tokenId);
	let erc721 = ERC721.bind(addressOfNFT);
    let rarity = '';
	let rarityRv = erc721.try_rarity();

	if (!rarityRv.reverted) {
		rarity = rarityRv.value;
	}
	let nft = NFTSchema.load(nftId);
	if (nft === null) {
		nft = new NFTSchema(nftId);
        nft.tokenId = tokenId;
        nft.tokenURI = erc721.tokenURI(tokenId);
        nft.rarity = rarity;
		nft.supplyQuantity = buildSupplyQuantity(addressOfNFT).id;
        nft.symbol = erc721.symbol();
		nft.isMeLandAI = isMeLandAI(nft.symbol);
        nft.name = erc721.name();
        nft.soldAt = block.timestamp;
		nft.createdAt = block.timestamp;
		nft.updatedAt = block.timestamp;
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
	    supplyQuantity.soldCount = BigInt.fromI32(0);
	}
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
    object.name = erc721.name();
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

// 通用处理nft
// 这里会处理所有nft的转账
export function gensHandleTransfer(event: Transfer, nft: NFTSchema): void {
    // 如果是从0转出来
    // 表示mint一个
    if (event.params.from.equals(Address.fromString("0x0000000000000000000000000000000000000000"))) {

    }


	// 如果nft被转移，并且activeOrder不为null
	// 并且from跟order的creator不是一个人
	// 则将order cancel
	if (nft.activeOrder != null) {
		let order = Order.load(nft.activeOrder);
		if (order !== null
			&& order.status == OrderStatus_open
		) {
			order.status = OrderStatus_cancelled;
			order.save();
		}
	}

	transferLog(event, nft);
}
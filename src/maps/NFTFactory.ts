import { NFTSupportCreate } from '../generated/entities/NFTFactory/NFTFactory';
import { NFTWithRarity as ERC721 } from '../generated/entities/templates';
import { NFTSupport } from '../generated/entities/schema';

export function handleNFTSupportCreate(event: NFTSupportCreate): void {
	ERC721.create(event.params.nft);

	let snft = new NFTSupport(event.params.nft.toHex());
	snft.nftAddress = event.params.nft;
	snft.save();
}
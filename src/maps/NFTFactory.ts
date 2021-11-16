import { NFTSupportCreate } from '../generated/entities/NFTFactory/NFTFactory';
import { NFTWithRarity as ERC721 } from '../generated/entities/templates';

export function handleNFTSupportCreate(event: NFTSupportCreate): void {
	ERC721.create(event.params.nft);
}
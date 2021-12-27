import { NFTSupportCreate } from '../generated/entities/NFTFactory/NFTFactory';
import { ERC721, ERC1155 } from '../generated/entities/templates';
import { NFTSupport } from '../generated/entities/schema';
import { Address } from '@graphprotocol/graph-ts';

export function handleNFTSupportCreate(event: NFTSupportCreate): void {
	if (event.params.nft.erc1155 != Address.zero()) {
		ERC1155.create(event.params.nft.erc1155);
		let snft = new NFTSupport(event.params.nft.erc1155.toHex());
		snft.address = event.params.nft.erc1155;
		snft.save();
	}
	if (event.params.nft.erc721 != Address.zero()) {
		ERC721.create(event.params.nft.erc721);
		let snft = new NFTSupport(event.params.nft.erc721.toHex());
		snft.address = event.params.nft.erc721;
		snft.save();
	}
}
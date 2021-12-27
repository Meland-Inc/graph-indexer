import { buildAccount } from '../account';
import { NFTProtocol_erc721 } from '../enums';
import { Transfer } from '../generated/entities/templates/ERC721/ERC721';
import { buildNFT, gensHandleTransfer } from '../nft';

export function handleTransfer(event: Transfer): void {
	let nft = buildNFT(
		event.address,
		event.params.tokenId,
		event.block.timestamp,
		NFTProtocol_erc721,
	);
	nft.owner = buildAccount(event.params.to).id;
	nft.save();

	gensHandleTransfer(
		event.transaction.hash.toHex(),
		event.block.timestamp,
		event.params.from,
		event.params.to, nft
	);
}

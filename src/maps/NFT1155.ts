import { buildAccount } from '../account';
import { NFTProtocol_erc1155 } from '../enums';
import { TransferSingle, TransferBatch } from '../generated/entities/templates/ERC1155/ERC1155';
import { buildNFT, gensHandleTransfer } from '../nft';

export function handleTransferSingle(event: TransferSingle): void {
	let nft = buildNFT(
		event.address, 
		event.params.id,
		event.block.timestamp,
		NFTProtocol_erc1155
	);
	nft.owner = buildAccount(event.params.to).id;
	nft.save();

	gensHandleTransfer(
        event.transaction.hash.toHex(),
        event.block.timestamp,
        event.params.from,
        event.params.to,
        nft
    );
}

export function handleTransferBatch(event: TransferBatch): void {
    for (let i = 0; i < event.params.ids.length; i ++) {
        let id = event.params.ids[i];
        let nft = buildNFT(
            event.address,
            id,
            event.block.timestamp,
            NFTProtocol_erc1155
        );
        nft.owner = buildAccount(event.params.to).id;
        nft.save();

		gensHandleTransfer(
			event.transaction.hash.toHex(),
			event.block.timestamp,
			event.params.from,
			event.params.to,
			nft
		);
    }
}
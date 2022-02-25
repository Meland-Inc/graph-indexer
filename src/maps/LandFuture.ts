import { buildAccount } from '../account';
import { NFTProtocol_erc1155, OrderStatus_cancelled, OrderStatus_open } from '../enums';
import { LandFuturesClaimUpdate } from '../generated/entities/Marketplace/Meland1155LandFuture';
import { Order } from '../generated/entities/schema';
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
    for (let i = 0; i < event.params.ids.length; i++) {
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

export function handleLandFuturesClaimUpdate(event: LandFuturesClaimUpdate): void {
    let tokenIds = event.params.landIds;

    for (let i = 0; i < tokenIds.length; i++) {
        let tokenId = tokenIds[i];
        let nft = buildNFT(
            event.address,
            tokenId,
            event.block.timestamp,
            NFTProtocol_erc1155
        );

        if (nft.activeOrder !== null) {
            let order = Order.load(nft.activeOrder!);
            if (order !== null
                && order.status == OrderStatus_open
            ) {
                order.status = OrderStatus_cancelled;
                order.save();
            }
        }
    }
}
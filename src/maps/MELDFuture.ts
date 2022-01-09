import { buildAccount } from '../account';
import { NFTProtocol_erc1155 } from '../enums';
import { TransferSingle, TransferBatch } from '../generated/entities/templates/ERC1155/ERC1155';
import { buildNFT, gensHandleTransfer } from '../nft';
import { Claim, Meland1155MELDFuture } from '../generated/entities/MELDFuture/Meland1155MELDFuture';
import { FutureAmount, FutureClaim, _FutureClaimMeta_ } from '../generated/entities/schema';
import { Address, BigInt } from '@graphprotocol/graph-ts';

export function handleTransferSingle(event: TransferSingle): void {
    let nft = buildNFT(
        event.address,
        event.params.id,
        event.block.timestamp,
        NFTProtocol_erc1155
    );
    nft.owner = buildAccount(event.params.to).id;
    nft.save();

    if (event.params.from != Address.zero()) {
        handFromTransfer(event.address, event.params.to, event.params.id);
    }
    handToTransfer(event.address, event.params.to, event.params.id);

    gensHandleTransfer(
        event.transaction.hash.toHex(),
        event.block.timestamp,
        event.params.from,
        event.params.to,
        nft
    );
}

function buildFutureAmount(beneficiary: Address): FutureAmount {
    let faId = beneficiary.toHex();
    let fa = FutureAmount.load(faId);
    if (fa == null) {
        fa = new FutureAmount(faId);
        fa.amount = BigInt.fromI32(0);
        fa.beneficiary = beneficiary;
        fa.count = BigInt.fromI32(0);
        fa.save();
    }
    return fa;
}

function buildFutureClaimMeta(beneficiary: Address): _FutureClaimMeta_ {
    let metaId = beneficiary.toHex();
    let meta = _FutureClaimMeta_.load(metaId);
    if (meta == null) {
        meta = new _FutureClaimMeta_(metaId);
        meta.beneficiary = beneficiary;
        meta.count = BigInt.fromI32(0);
        meta.save();
    }
    return meta;
}

function handFromTransfer(
    faAddress: Address,
    from: Address,
    tokenId: BigInt
): FutureAmount {
    let fa = buildFutureAmount(from);
    let future = Meland1155MELDFuture.bind(faAddress);
    let futureInfo = future.futureById(tokenId);

    fa.amount = fa.amount.minus(futureInfo.value2);
    fa.count = fa.count.minus(BigInt.fromI32(0));
    fa.save();

    return fa;
}

function handToTransfer(
    faAddress: Address,
    to: Address,
    tokenId: BigInt
): FutureAmount {
    let fa = buildFutureAmount(to);
    let future = Meland1155MELDFuture.bind(faAddress);
    let futureInfo = future.futureById(tokenId);

    fa.amount = fa.amount.plus(futureInfo.value2);
    fa.count = fa.count.plus(BigInt.fromI32(0));
    fa.save();

    return fa;
}

export function handleClaim(event: Claim): void {
    let cid = event.transaction.hash.toHex();
    let fc = new FutureClaim(cid);
    fc.amount = event.params.amount;
    fc.claimedAt = event.block.timestamp;
    fc.beneficiary = event.params.beneficiary;
    fc.txHash = event.transaction.hash;
    fc.save();
    let claimMeta = buildFutureClaimMeta(event.params.beneficiary)
    claimMeta.count = claimMeta.count.plus(BigInt.fromI32(1));
    claimMeta.save();
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

        if (event.params.from != Address.zero()) {
            handFromTransfer(event.address, event.params.from, id);
        }
        handToTransfer(event.address, event.params.to, id);

        gensHandleTransfer(
            event.transaction.hash.toHex(),
            event.block.timestamp,
            event.params.from,
            event.params.to,
            nft
        );
    }
}
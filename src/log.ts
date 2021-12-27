import { CreateorderLog, Web3Log, BoughtLog, TransferLog, NFT, Order, CancelorderLog, UpdateorderLog } from './generated/entities/schema';
import { ethereum } from '@graphprotocol/graph-ts/chain/ethereum';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { buildAccount } from './account';
import { LogAction_bought, LogAction_cancelorder, LogAction_createorder, LogAction_transfer, LogAction_updateorder, OrderStatus_cancelled } from './enums';
import { format } from './helper';

export function createorderLog(event: ethereum.Event, order: Order): Web3Log {
    let logId = event.transaction.hash.toHex();
	let oLog = new CreateorderLog(logId);
	order.id = format("{}-{}", [logId, order.id]);
	order.status = OrderStatus_cancelled;
	order.save();
    oLog.order = order.id;
    oLog.save();

	let log = new Web3Log(logId);
	log.account = buildAccount(event.transaction.from).id;
	log.action = LogAction_createorder;
	log.createorder = oLog.id;
    log.createdAt = event.block.timestamp;
	log.save();

	return log;
}

export function updateorderLog(event: ethereum.Event, order: Order): Web3Log {
    let logId = event.transaction.hash.toHex();
	let oLog = new UpdateorderLog(logId);
	order.id = format("{}-{}", [logId, order.id]);
	order.status = OrderStatus_cancelled;
	order.save();
    oLog.order = order.id;
    oLog.save();

	let log = new Web3Log(logId);
	log.account = buildAccount(event.transaction.from).id;
	log.action = LogAction_updateorder;
	log.updateorder = oLog.id;
    log.createdAt = event.block.timestamp;
	log.save();

	return log;
}

export function cancelorderLog(event: ethereum.Event, order: Order): Web3Log {
    let logId = event.transaction.hash.toHex();
	let oLog = new CancelorderLog(logId);
    oLog.order = order.id;
    oLog.save();

	let log = new Web3Log(logId);
	log.account = buildAccount(event.transaction.from).id;
	log.action = LogAction_cancelorder;
	log.cancelorder = oLog.id;
    log.createdAt = event.block.timestamp;
	log.save();

	return log;
}

export function transferLog(
	hash: string,
	timestamp: BigInt,
	from: Address,
	to: Address,
	nft: NFT
): Web3Log | null {
	if (to == Address.zero()) {
		return null;
	}
    let logId = hash;
	let transferLog = new TransferLog(logId);
    transferLog.to = buildAccount(to).id;
    transferLog.nft = nft.id;
    transferLog.save();
	let log = new Web3Log(logId);
	log.account = buildAccount(from).id;
	log.action = LogAction_transfer;
	log.transfer = transferLog.id;
    log.createdAt = timestamp;
	log.save();
	return log;
}

export function boughtLog(event: ethereum.Event, nft: NFT, priceInWei: BigInt): Web3Log {
	let logId = event.transaction.hash.toHex();
	let boughtLog = new BoughtLog(logId);
	boughtLog.nft = nft.id;
	boughtLog.priceInWei = priceInWei;
	boughtLog.save();

	let log = new Web3Log(logId);
	log.account = buildAccount(event.transaction.from).id;
	log.action = LogAction_bought;
	log.bought = boughtLog.id;
    log.createdAt = event.block.timestamp;
	log.save();

	return log;
}

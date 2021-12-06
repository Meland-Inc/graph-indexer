import { CreateorderLog, Web3Log, BoughtLog, TransferLog, NFT, Order, CancelorderLog, UpdateorderLog } from './generated/entities/schema';
import { ethereum } from '@graphprotocol/graph-ts/chain/ethereum';
import { BigInt } from '@graphprotocol/graph-ts';
import { buildAccount } from './account';
import { LogAction_bought, LogAction_cancelorder, LogAction_createorder, LogAction_transfer, LogAction_updateorder } from './enums';
import { format } from './helper';

export function createorderLog(event: ethereum.Event, order: Order): Web3Log {
    let logId = event.transaction.hash.toHex();
	let oLog = new CreateorderLog(logId);
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

export function updateorderLog(event: ethereum.Event, order: Order, oldOrder: Order): Web3Log {
    let logId = event.transaction.hash.toHex();
	oldOrder.id = format("{}-{}", [oldOrder.id, logId]);
	oldOrder.save();
	let oLog = new UpdateorderLog(logId);
	oLog.oldOrder = oldOrder.id;
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

export function transferLog(event: ethereum.Event, nft: NFT): Web3Log {
    let logId = event.transaction.hash.toHex();
	let transferLog = new TransferLog(logId);
    transferLog.to = buildAccount(event.transaction.to!).id;
    transferLog.nft = nft.id;
    transferLog.save();

	let log = new Web3Log(logId);
	log.account = buildAccount(event.transaction.from).id;
	log.action = LogAction_transfer;
	log.transfer = transferLog.id;
    log.createdAt = event.block.timestamp;
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

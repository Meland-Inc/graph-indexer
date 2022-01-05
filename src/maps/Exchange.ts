import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Deposit, DepositPaymentSuccess, Exchange, ExchangePaymentSuccess, MelandExchange } from '../generated/entities/MelandExchange/MelandExchange';
import { DepositDitaminHistory, ExchangeMELDHistory, _DepositDitaminHistoryMeta_, _ExchangeMELDHistoryMeta_ } from '../generated/entities/schema';

function buildExchangeMeta(beneficiary: Address): _ExchangeMELDHistoryMeta_ {
    let id = beneficiary.toHex().toLowerCase();
    let emeta = _ExchangeMELDHistoryMeta_.load(id);
    if (emeta == null) {
        emeta = new _ExchangeMELDHistoryMeta_(id);
        emeta.beneficiary = beneficiary;
        emeta.count = BigInt.fromI32(0);
        emeta.save();
    }
    return emeta;
}

function buildDepositMeta(beneficiary: Address): _DepositDitaminHistoryMeta_ {
    let id = beneficiary.toHex().toLowerCase();
    let dmeta = _DepositDitaminHistoryMeta_.load(id);
    if (dmeta == null) {
        dmeta = new _DepositDitaminHistoryMeta_(id);
        dmeta.beneficiary = beneficiary;
        dmeta.count = BigInt.fromI32(0);
        dmeta.save();
    }
    return dmeta;
}

export function handleExchangePaymentSuccess(event: ExchangePaymentSuccess): void {
    let id = event.params.exchangeId;
    let me = MelandExchange.bind(event.address);
    let exchangeInfo = me.getExchangeMELDById(id);

    let exh = ExchangeMELDHistory.load(id.toString())!;
    exh.paymentAt = exchangeInfo.value4;
    exh.paymentDitamin = exchangeInfo.value3;
    exh.save();
}

export function handleExchange(event: Exchange): void {
    let id = event.params.exchangeId;
    let me = MelandExchange.bind(event.address);
    let exchangeInfo = me.getExchangeMELDById(id);

    let meta = buildExchangeMeta(exchangeInfo.value2);
    meta.count = meta.count.plus(BigInt.fromI32(1));
    meta.save();

    let exh = new ExchangeMELDHistory(id.toString());
    exh.amountOfMELD = exchangeInfo.value1;
    exh.beneficiary = exchangeInfo.value2;
    exh.exchangedAt = exchangeInfo.value0;
    exh.paymentDitamin = exchangeInfo.value3;
    exh.paymentAt = exchangeInfo.value4;
    exh.save();
}

export function handleDepositPaymentSuccess(event: DepositPaymentSuccess): void {
    let id = event.params.depositId;
    let me = MelandExchange.bind(event.address);
    let dInfo = me.getDepositDitaminById(id);
    
    let meta = buildDepositMeta(dInfo.value2);
    meta.count = meta.count.plus(BigInt.fromI32(1));
    meta.save();
    
    let dh = new DepositDitaminHistory(id.toString());
    dh.amountOfMELD = dInfo.value1;
    dh.depositedAt = dInfo.value0;
    dh.beneficiary = dInfo.value2;
    dh.paymentAt = dInfo.value4;
    dh.paymentDitamin = dInfo.value3;
    dh.save();
}

export function handleDeposit(event: Deposit): void {
    let id = event.params.depositId;
    let me = MelandExchange.bind(event.address);
    let dInfo = me.getDepositDitaminById(id);
    
    let meta = buildDepositMeta(dInfo.value2);
    meta.count = meta.count.plus(BigInt.fromI32(1));
    meta.save();

    let dh = new DepositDitaminHistory(id.toString());
    dh.amountOfMELD = dInfo.value1;
    dh.depositedAt = dInfo.value0;
    dh.beneficiary = dInfo.value2;
    dh.paymentAt = dInfo.value4;
    dh.paymentDitamin = dInfo.value3;
    dh.save();
}
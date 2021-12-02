import { Address } from '@graphprotocol/graph-ts';
import { buildAccount, refreshMELDBalance } from '../account';
import { Transfer } from '../generated/entities/MELD/MELD';

export function handleTransfer(event: Transfer): void {
    refreshMELDBalance(event.params.from);
    refreshMELDBalance(event.params.to);
}
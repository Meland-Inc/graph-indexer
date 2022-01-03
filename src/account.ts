import { Address, dataSource } from '@graphprotocol/graph-ts';
import { Web3IAccount as Account } from './generated/entities/schema';
import { MELD } from './generated/entities/MELD/MELD';
import { format } from './helper';
import { MELD_address } from './config';

export function buildAccount(accountAddress: Address): Account {
	let accountId = accountAddress.toHex();
	let account = Account.load(accountId);
	let instanceOfMELD = MELD.bind(Address.fromString(MELD_address));
	if (account === null) {
		account = new Account(accountId);
        account.address = accountAddress;
		account.balanceOfMELD = instanceOfMELD.balanceOf(accountAddress);
		account.imageURL = format("https://token-image-release.melandworld.com/account/{}", [ accountId ]);
		account.save();
	}
    return account;
}

export function refreshMELDBalance(accountAddress: Address): void {
	let instanceOfMELD = MELD.bind(Address.fromString(MELD_address));
	let account = buildAccount(accountAddress);
	account.balanceOfMELD = instanceOfMELD.balanceOf(accountAddress);
	account.save()
}

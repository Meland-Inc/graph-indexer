import { Address } from '@graphprotocol/graph-ts';
import { Web3IAccount as Account } from './generated/entities/schema';
import { format } from './helper';

export function buildAccount(accountAddress: Address): Account {
	let accountId = accountAddress.toHex();
	let account = Account.load(accountId);
	if (account === null) {
		account = new Account(accountId);
        account.address = accountAddress;
	}
    account.imageURL = format("https://token-image-release.melandworld.com/account/{}", [ accountId ]);
    account.save();
    return account!;
}

import { Address } from "@graphprotocol/graph-ts";
import { ERC20 } from './generated/entities/schema';
import { format } from "./helper";
import { MELD } from './generated/entities/MELD/MELD';
import * as configs from './config';

export function buildAcceptedToken(address: Address): ERC20 {
    let erc20 = MELD.bind(address);
    let e20 = ERC20.load(address.toHex());
    if (e20 == null) {
        e20 = new ERC20(address.toHex());
        e20.name = erc20.name();
        e20.symbol = erc20.symbol();
        // https://meland-cdn.melandworld.com/meld-icon3.png
        if (address.toHex() == configs.MELD_address) {
            e20.imageURL = "https://meland-cdn.melandworld.com/meld-icon3.png";
        } else {
            e20.imageURL = "https://meland-cdn.melandworld.com/eth.png";
        }
        e20.save();
    }
    return e20;
}
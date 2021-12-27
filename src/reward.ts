import { MelandTierReward } from './generated/entities/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function buildReward(id: BigInt): MelandTierReward {
    let r = MelandTierReward.load(id.toString());
    if (r == null) {
        r = new MelandTierReward(id.toString());
        r.save();
    }
    return r;
}
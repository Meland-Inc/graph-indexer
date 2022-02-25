export const network = "matic".toLowerCase();
export const Land_address = "0x7d23e34E676212cEFEB715ee023D15FD2049288b".toLowerCase();
export const NFTStore_address = "0x7B5f5A3f675d18d5D33b0b3d7e3a35D3F77d4e28".toLowerCase();
export const Marketplace_address = "0xD5718D48cEfA70A9c452D3c82DcB86b71C5D473C".toLowerCase();
export const MELD_address = "0x48844ddba89799dc40ec31728dac629802d407f3".toLowerCase();
export const NFTFactory_address = "0xEeD19fd5185f484dd67c1a6552d513876F095054".toLowerCase();
export const Faucet_address = "".toLowerCase();
export const VestPool_address = "".toLowerCase();
export const Meland1155Wearable_address = "0x6A7B9fED27AAAD13A91d56B388d370ac5E485a37".toLowerCase();
export const Meland1155Placeable_address = "0xBFb344a498d6BF759c3066754767270C7A08a4d1".toLowerCase();
export const Meland1155LandFuture_address = "0x1A7372C85E1207b8497532aD4147a597172fDF59".toLowerCase();
export const Meland1155MELDFuture_address = "0x64c87BCae4AA5dA669d6CBCBD710dC3d020e6A73".toLowerCase();
export const MelandExchange_address = "0xd3FD1F88DBf232461569DECc35a0cB57b0a6B427".toLowerCase();
export const MelandTier_address = "0x061f636b7beA87C65276fb9ec7119F88d9A4B6E7".toLowerCase();
export const start_block = "23029177".toLowerCase();
export function getAll(): Map<string, string>  {
    let map = new Map<string, string>();
    map.set("network", network);
map.set("Land_address", Land_address);
map.set("NFTStore_address", NFTStore_address);
map.set("Marketplace_address", Marketplace_address);
map.set("MELD_address", MELD_address);
map.set("NFTFactory_address", NFTFactory_address);
map.set("Faucet_address", Faucet_address);
map.set("VestPool_address", VestPool_address);
map.set("Meland1155Wearable_address", Meland1155Wearable_address);
map.set("Meland1155Placeable_address", Meland1155Placeable_address);
map.set("Meland1155LandFuture_address", Meland1155LandFuture_address);
map.set("Meland1155MELDFuture_address", Meland1155MELDFuture_address);
map.set("MelandExchange_address", MelandExchange_address);
map.set("MelandTier_address", MelandTier_address);
map.set("start_block", start_block);
    return map;
}
export function getAllKeys(): string[] {
    return [
        "network",
"Land_address",
"NFTStore_address",
"Marketplace_address",
"MELD_address",
"NFTFactory_address",
"Faucet_address",
"VestPool_address",
"Meland1155Wearable_address",
"Meland1155Placeable_address",
"Meland1155LandFuture_address",
"Meland1155MELDFuture_address",
"MelandExchange_address",
"MelandTier_address",
"start_block"
    ];
}

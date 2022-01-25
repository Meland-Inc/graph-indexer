export const network = "mumbai".toLowerCase();
export const Land_address = "0xD9176e94Fb27a467d0a37b929FB4aB8a06b7263d".toLowerCase();
export const NFTStore_address = "0x6C95E01BF55f70d7afC72C65560112b4311eFFa0".toLowerCase();
export const Marketplace_address = "0x5ba0350d61995989dC50788281e6fB2ED2faaca1".toLowerCase();
export const MELD_address = "0x5A0585D409ca86d9Fa771690ea37d32405Da1f67".toLowerCase();
export const NFTFactory_address = "0xF4977bcF9E0B801d69a25494E9fcE30E44F4A1aa".toLowerCase();
export const Faucet_address = "".toLowerCase();
export const VestPool_address = "".toLowerCase();
export const Meland1155Wearable_address = "0xC3D2ba5C0eB9d394A5ec8690C73Ce284017Fc786".toLowerCase();
export const Meland1155Placeable_address = "0xBf4d936cDC73C37A8DBfABac46BDc45D100db021".toLowerCase();
export const Meland1155LandFuture_address = "0x16dF81d096880E63b469029154c608AfA7298e57".toLowerCase();
export const Meland1155MELDFuture_address = "0xE7caa2c0f2eEE25368649E457Bb289099277DAb2".toLowerCase();
export const MelandExchange_address = "0x8c7fC73c252Ed60A062e6BD332eC1346B6F39534".toLowerCase();
export const MelandTier_address = "0x89B371e1268A9e439a96Fa210aF26A348Cfd5b02".toLowerCase();
export const start_block = "23574402".toLowerCase();
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

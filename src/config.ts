export const network = "mumbai".toLowerCase();
export const Land_address = "0x0a1f209C359fb6191e012E4c3165f6c70DEA231f".toLowerCase();
export const NFTStore_address = "0x9AB9024cf157d4c08ee288F6cDf8431344A46Ca5".toLowerCase();
export const Marketplace_address = "0xAC4FBBE0D874E44AbbF978E65C65F92471193893".toLowerCase();
export const MELD_address = "0x30BcB5D3c0B2aE31fD7457DC4B36c85b520ce673".toLowerCase();
export const NFTFactory_address = "0x4094116c1b2912Fcb38Dd40891Bb5d759AC82cc4".toLowerCase();
export const Faucet_address = "".toLowerCase();
export const VestPool_address = "".toLowerCase();
export const Meland1155Wearable_address = "0x3f56B2EaC8ba9174f7b042342953f0Fb485448C3".toLowerCase();
export const Meland1155Placeable_address = "".toLowerCase();
export const Meland1155LandFuture_address = "0xa489E7E1b4ffA0C34395F587A5Ed961BA32361b1".toLowerCase();
export const Meland1155MELDFuture_address = "0x52d2185D64E24b3c820e799041e3e347b5e09c20".toLowerCase();
export const MelandExchange_address = "0x54E2D21Aac76Be86Fb89bA4bbc8D3AB1F9AB15E2".toLowerCase();
export const MelandTier_address = "0xD2F29487C5c5176c7818690Ced262BA2dd48A9ce".toLowerCase();
export const start_block = "23090652".toLowerCase();
export function getAll(): Map<string, string> {
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

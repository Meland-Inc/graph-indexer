export const network = "mumbai".toLowerCase();
export const Land_address = "0x31A4aE41C42Ca0959C3B7FE6a77908f5aBBc3Bd2".toLowerCase();
export const NFTStore_address = "0x6981AbA56bd63957fEB48d50e5E904746A58b8c0".toLowerCase();
export const Marketplace_address = "0xc38A9DFD1D99969E2f546E3FaA01918A131E435a".toLowerCase();
export const MELD_address = "0x1989c124ff9636909175c61Cb59ADa1BeebEacA6".toLowerCase();
export const NFTFactory_address = "0xa6b10860CE8a5B877e2f02b6099A1084e95B8B56".toLowerCase();
export const Faucet_address = "".toLowerCase();
export const VestPool_address = "".toLowerCase();
export const Meland1155Wearable_address = "0xd1cc979f62d6b5e8C1Dd6E47ca87cF967Dc3Eb73".toLowerCase();
export const Meland1155Placeable_address = "".toLowerCase();
export const Meland1155LandFuture_address = "0x7809E4877d9370BBB5BBA1Cfd8e3dB522BaaCb5d".toLowerCase();
export const Meland1155MELDFuture_address = "0xD473D32EC8c69fE07DBe154c000f578711CD5d96".toLowerCase();
export const MelandExchange_address = "0x5d21B61C7FEa384189B098633b75152C0dC8D9b8".toLowerCase();
export const MelandTier_address = "0xC643935681e2B3f1B8d911B6D5fe549C98B6458C".toLowerCase();
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

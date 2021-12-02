// wsam不支持 string enum
// 所以改成const代替

export const OrderStatus_open = 'open';
export const OrderStatus_sold = 'sold';
export const OrderStatus_cancelled = 'cancelled';

export const NFTStoreStatus_open = 'open';
export const NFTStoreStatus_sold = 'sold';
export const NFTStoreStatus_cancelled = 'cancelled';

export const ItemType_undefined = 'undefined';
export const ItemType_ticketland = 'ticketland';
export const ItemType_vipland = 'vipland';
export const ItemType_placeable = 'placeable';

export const LogAction_transfer = 'transfer';
export const LogAction_createorder = 'createorder';
export const LogAction_cancelorder = 'cancelorder';
export const LogAction_updateorder = 'updateorder';
export const LogAction_bought = 'bought';
export function isLand(symbol: string): boolean {
	return symbol.includes('Land');
}

export function isTicketLand(symbol: string): boolean {
	return isLand(symbol) && (symbol.includes('ticket') || symbol.includes('Ticket'));
}

export function isVipLand(symbol: string): boolean {
	return isLand(symbol) && (symbol.includes('vip') || symbol.includes('Vip'));
}

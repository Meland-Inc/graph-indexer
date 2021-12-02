import {  } from '@graphprotocol/graph-ts';

export function format(fmt: string, args: string[]): string {
	let out = '';
	let argIndex = 0;
	for (let i: i32 = 0, len: i32 = fmt.length; i < len; i++) {
		if (i < len - 1 && fmt.charCodeAt(i) == 0x7b /* '{' */ && fmt.charCodeAt(i + 1) == 0x7d /* '}' */) {
			if (argIndex >= args.length) {
				throw Error('Too few arguments for format string: ' + fmt);
			} else {
				out += args[argIndex++];
				i++;
			}
		} else {
			out += fmt[i];
		}
	}
	return out;
}

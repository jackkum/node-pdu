export interface ClrOptions {
	txt?: TxtColor;
	bg?: BgColor;
	modifier?: Modifier | Modifier[];
}

export function clr(p: Preset | TxtColor | BgColor | Modifier | ClrOptions, text: string) {
	if (typeof p === 'number') {
		return clr(getConfigByPreset(p), text);
	}

	if (typeof p === 'string') {
		return `${p}${text}${Modifier.reset}`;
	}

	const modifier = p.modifier ? (Array.isArray(p.modifier) ? p.modifier.join('') : p.modifier) : '';

	return `${p.txt || ''}${p.bg || ''}${modifier}${text}${Modifier.reset}`;
}

export enum TxtColor {
	black = '\x1b[30m',
	red = '\x1b[31m',
	green = '\x1b[32m',
	yellow = '\x1b[33m',
	blue = '\x1b[34m',
	magenta = '\x1b[35m',
	cyan = '\x1b[36m',
	white = '\x1b[37m'
}

export enum BgColor {
	back = '\x1b[40m',
	red = '\x1b[41m',
	green = '\x1b[42m',
	yellow = '\x1b[43m',
	blue = '\x1b[44m',
	magenta = '\x1b[45m',
	cyan = '\x1b[46m',
	white = '\x1b[47m'
}

export enum Modifier {
	reset = '\x1b[0m',
	bright = '\x1b[1m',
	dim = '\x1b[2m',
	underscore = '\x1b[4m',
	blink = '\x1b[5m',
	reverse = '\x1b[7m',
	hidden = '\x1b[8m'
}

function getConfigByPreset(i: number): ClrOptions {
	switch (i) {
		case 0:
			return { txt: TxtColor.black, bg: BgColor.cyan, modifier: Modifier.bright };
		case 1:
			return { txt: TxtColor.black, bg: BgColor.yellow, modifier: Modifier.bright };
		case 2:
			return { txt: TxtColor.black, bg: BgColor.red, modifier: Modifier.bright };
	}

	return {};
}

export enum Preset {
	info,
	warn,
	danger
}

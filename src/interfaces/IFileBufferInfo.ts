export interface IFileBufferInfo {
	name: string;
	path: string;
	buffer: Buffer;
}

export interface IFileFormattedInfo {
	name: string;
	path: string;
	serverId: number;
	data: Buffer | string | NodeJS.ReadableStream;
}

export interface IFileInfo {
	name?: string;
	path?: string;
	serverId?: number;
	data?: Buffer | string | NodeJS.ReadableStream;
}

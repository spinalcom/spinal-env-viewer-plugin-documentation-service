import { IHash } from "./IHash";

export interface IFileVersionInfo {
	version: string | number;
	hashes: IHash[];
}

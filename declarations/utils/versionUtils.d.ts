/// <reference types="node" />
/// <reference types="node" />
import { IHash } from "../interfaces";
export default class VersionUtils {
    private static _instance;
    private constructor();
    static getInstance(): VersionUtils;
    convertFileToHashes(fileBuffer: Buffer, allHashes?: IHash[], _chunkSize?: number): IHash[];
    splitBufferIntoChunks(fileBuffer: Buffer, chunkSize?: number): Buffer[];
    hashBuffer(buffer: Buffer): string;
    private _checkIfChunkExists;
    private _createHashPath;
}
export { VersionUtils };

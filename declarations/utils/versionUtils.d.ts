/// <reference types="node" />
/// <reference types="node" />
import { FilesArgType, IHash } from "../interfaces";
export default class VersionUtils {
    private static _instance;
    private constructor();
    static getInstance(): VersionUtils;
    convertFileToHashes(fileBuffer: Buffer | FilesArgType, allHashes?: IHash[], _chunkSize?: number): Promise<IHash[]>;
    splitBufferIntoChunks(fileBuffer: Buffer | FilesArgType, chunkSize?: number): Buffer[];
    hashBuffer(buffer: Buffer): string;
    private _checkIfChunkExists;
    private _createHashPath;
}
export { VersionUtils };

import { createHash } from "crypto";
import { Path } from "spinal-core-connectorjs";
import { FilesArgType, IHash } from "../interfaces";
import { convertFileToBuffer } from "./files";
export default class VersionUtils {
	private static _instance: VersionUtils | null = null;

	private constructor() {}

	public static getInstance(): VersionUtils {
		if (!this._instance) this._instance = new VersionUtils();
		return this._instance;
	}

	async convertFileToHashes(fileBuffer: Buffer | FilesArgType, allHashes: IHash[] = [], _chunkSize: number = -1): Promise<IHash[]> {
		fileBuffer = await convertFileToBuffer(fileBuffer);

		const chunks = this.splitBufferIntoChunks(fileBuffer, _chunkSize);
		const chunkRefs = [];

		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			const hash = this.hashBuffer(chunk);

			let hashPath = this._checkIfChunkExists(hash, allHashes);

			if (!hashPath) {
				hashPath = this._createHashPath(chunk);
			}

			chunkRefs.push({ hash, size: chunk.length, path: hashPath, index: i });
		}

		return chunkRefs;
	}

	splitBufferIntoChunks(fileBuffer: Buffer | FilesArgType, chunkSize: number = -1): Buffer[] {
		const chuncks = [];
		if (chunkSize <= 0) chunkSize = fileBuffer.length;

		for (let i = 0; i < fileBuffer.length; i += chunkSize) {
			let temp_chunk = fileBuffer.subarray(i, i + chunkSize);
			chuncks.push(temp_chunk);
		}
		return chuncks;
	}

	hashBuffer(buffer: Buffer): string {
		const hash = createHash("sha256"); // create a SHA-256 hash instance
		hash.update(buffer); // update the hash with the buffer data
		return hash.digest("hex"); // return the hash as a hexadecimal string
	}

	private _checkIfChunkExists(hash: string, allHashes: IHash[]): spinal.Path | null {
		const foundHash = allHashes.find((h) => h.hash === hash);
		return foundHash ? foundHash.path : null;

		// const lastVersionHashes = lastVersion ? lastVersion.hashes : [];
		// return lastVersionHashes.includes(hash);
	}

	private _createHashPath(chunk: Buffer): spinal.Path {
		const path = new Path(chunk);
		return path;
	}
}

export { VersionUtils };

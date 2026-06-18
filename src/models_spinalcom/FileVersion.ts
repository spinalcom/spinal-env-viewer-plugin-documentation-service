import { Lst, Model, Path as SpinalPath, Ptr, spinalCore } from "spinal-core-connectorjs";
import { fileFormat, IFileVersionInfo, IHash } from "../interfaces";
import { getPathData } from "../utils/files";
import { randomUUID } from "crypto";
import VersionUtils from "../utils/versionUtils";
import { Readable } from "stream";

class FileVersion extends Model {
	constructor(versionInfo: IFileVersionInfo) {
		super();

		if (!versionInfo || !versionInfo.version || !Array.isArray(versionInfo.hashes) || versionInfo.hashes.length === 0) {
			return;
		}

		const hashesModel = new Lst(versionInfo.hashes);

		this.add_attr({
			creationDate: Date.now(),
			id: globalThis.crypto ? globalThis.crypto.randomUUID() : randomUUID(),
			version: versionInfo.version,
			hashes: hashesModel,
		});
	}

	getAsBuffer(hubUrl: string = ""): Promise<Buffer> {
		const hashes: IHash[] = Array.from(this.hashes);
		const promises = hashes.map((hash) => this._convertHashInfoToBuffer(hash, hubUrl));

		return Promise.all(promises).then((results) => {
			const buffers = results.sort((a, b) => a.index - b.index).map((result) => result.buffer); // Ensure buffers are concatenated in the correct order based on index
			return Buffer.concat(buffers);
		});
	}

	getAsSpecialFormat(format: fileFormat, hubUrl: string = ""): Promise<Buffer | string | NodeJS.ReadableStream> {
		switch (format) {
			case "buffer":
				return this.getAsBuffer(hubUrl);
			case "base64":
				return this.getAsBase64(hubUrl);
			case "stream":
				return this.getAsStream(hubUrl);
			default:
				return this.getAsBuffer(hubUrl);
		}
	}

	getAsBase64(hubUrl: string = ""): Promise<string> {
		return this.getAsBuffer(hubUrl).then((buffer) => buffer.toString("base64"));
	}

	getAsStream(hubUrl: string = ""): Promise<NodeJS.ReadableStream> {
		return this.getAsBuffer(hubUrl).then((buffer) => {
			const stream = new Readable();
			stream.push(buffer);
			stream.push(null); // Signal the end of the stream
			return stream;
		});
	}

	private async _convertHashInfoToBuffer(hashInfo: IHash, hubUrl: string): Promise<{ index: number; buffer: Buffer }> {
		const dynamicId = hashInfo.path._server_id;
		if (!dynamicId) throw new Error("Invalid path: missing _server_id");

		const data = await getPathData(dynamicId, hubUrl);
		return { index: hashInfo.index, buffer: data };
	}

	static async createFakeFileVersionInstance(spinalFile: any): Promise<FileVersion | undefined> {
		const filePath = await new Promise((resolve) => (spinalFile._ptr ? spinalFile._ptr?.load((filePath: SpinalPath) => resolve(filePath)) : resolve(null)));
		if (!filePath || !(filePath instanceof SpinalPath)) return;

		const hashInfo: IHash = {
			hash: VersionUtils.getInstance().hashBuffer(new Buffer(0)), // Create a hash for an empty buffer or use a default value
			size: -1,
			path: filePath,
			index: 0,
		};

		const fileVersionInfo: IFileVersionInfo = {
			version: 1,
			hashes: [hashInfo],
		};

		return new FileVersion(fileVersionInfo);
	}
}

spinalCore.register_models([FileVersion]);

export { FileVersion };
export default FileVersion;

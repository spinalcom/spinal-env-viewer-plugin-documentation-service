import { Lst, Model, Path, Ptr, spinalCore } from "spinal-core-connectorjs";
import { randomUUID } from "crypto";
import { IFileVersionInfo, IHash } from "../interfaces";
import { getPathData } from "../utils/files";

class FileVersion extends Model {
	constructor(versionInfo: IFileVersionInfo) {
		if (!versionInfo || !versionInfo.version || versionInfo.hashes.length === 0) return;

		super();

		const hashesModel = new Lst(versionInfo.hashes);

		this.add_attr({
			creationDate: Date.now(),
			id: randomUUID(),
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

	private async _convertHashInfoToBuffer(hashInfo: IHash, hubUrl: string): Promise<{ index: number; buffer: Buffer }> {
		const dynamicId = hashInfo.path._server_id;
		if (!dynamicId) throw new Error("Invalid path: missing _server_id");

		const data = await getPathData(dynamicId, hubUrl);
		return { index: hashInfo.index, buffer: data };
	}
}

spinalCore.register_models([FileVersion]);

export { FileVersion };
export default FileVersion;

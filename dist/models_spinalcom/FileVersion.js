"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileVersion = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const files_1 = require("../utils/files");
const crypto_1 = require("crypto");
class FileVersion extends spinal_core_connectorjs_1.Model {
    constructor(versionInfo) {
        super();
        console.log("Creating FileVersion with info:", versionInfo);
        if (!versionInfo || !versionInfo.version || !Array.isArray(versionInfo.hashes) || versionInfo.hashes.length === 0) {
            return;
        }
        const hashesModel = new spinal_core_connectorjs_1.Lst(versionInfo.hashes);
        this.add_attr({
            creationDate: Date.now(),
            id: (0, crypto_1.randomUUID)(),
            version: versionInfo.version,
            hashes: hashesModel,
        });
    }
    getAsBuffer(hubUrl = "") {
        const hashes = Array.from(this.hashes);
        const promises = hashes.map((hash) => this._convertHashInfoToBuffer(hash, hubUrl));
        return Promise.all(promises).then((results) => {
            const buffers = results.sort((a, b) => a.index - b.index).map((result) => result.buffer); // Ensure buffers are concatenated in the correct order based on index
            return Buffer.concat(buffers);
        });
    }
    async _convertHashInfoToBuffer(hashInfo, hubUrl) {
        const dynamicId = hashInfo.path._server_id;
        if (!dynamicId)
            throw new Error("Invalid path: missing _server_id");
        const data = await (0, files_1.getPathData)(dynamicId, hubUrl);
        return { index: hashInfo.index, buffer: data };
    }
}
exports.FileVersion = FileVersion;
spinal_core_connectorjs_1.spinalCore.register_models([FileVersion]);
exports.default = FileVersion;
//# sourceMappingURL=FileVersion.js.map
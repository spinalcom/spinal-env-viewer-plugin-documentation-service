"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionUtils = void 0;
const crypto_1 = require("crypto");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
class VersionUtils {
    constructor() { }
    static getInstance() {
        if (!this._instance)
            this._instance = new VersionUtils();
        return this._instance;
    }
    convertFileToHashes(fileBuffer, allHashes = [], _chunkSize = -1) {
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
    splitBufferIntoChunks(fileBuffer, chunkSize = -1) {
        const chuncks = [];
        if (chunkSize <= 0)
            chunkSize = fileBuffer.length;
        for (let i = 0; i < fileBuffer.length; i += chunkSize) {
            let temp_chunk = fileBuffer.subarray(i, i + chunkSize);
            chuncks.push(temp_chunk);
        }
        return chuncks;
    }
    hashBuffer(buffer) {
        const hash = (0, crypto_1.createHash)("sha256"); // create a SHA-256 hash instance
        hash.update(buffer); // update the hash with the buffer data
        return hash.digest("hex"); // return the hash as a hexadecimal string
    }
    _checkIfChunkExists(hash, allHashes) {
        const foundHash = allHashes.find((h) => h.hash === hash);
        return foundHash ? foundHash.path : null;
        // const lastVersionHashes = lastVersion ? lastVersion.hashes : [];
        // return lastVersionHashes.includes(hash);
    }
    _createHashPath(chunk) {
        const path = new spinal_core_connectorjs_1.Path(chunk);
        return path;
    }
}
exports.default = VersionUtils;
exports.VersionUtils = VersionUtils;
VersionUtils._instance = null;
//# sourceMappingURL=versionUtils.js.map
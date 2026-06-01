"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalDocument = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const files_1 = require("../utils/files");
const constants_1 = require("../Models/constants");
const FileVersion_1 = require("./FileVersion");
const versionUtils_1 = require("../utils/versionUtils");
class SpinalDocument extends spinal_core_connectorjs_1.File {
    constructor(name, initialVersion, info = {}) {
        name = name || "";
        if (!initialVersion)
            initialVersion = new spinal_core_connectorjs_1.Lst();
        const isDirectory = !(0, files_1.isFileVersion)(initialVersion);
        if (!info.model_type)
            info.model_type = isDirectory ? constants_1.DIRECTORY_MODEL_TYPE : constants_1.FILE_MODEL_TYPE;
        if (!info.icon)
            info.icon = isDirectory ? "folder" : "file";
        super(name, undefined, info);
        this._node = null;
        if (!name || !initialVersion)
            return;
        const element = isDirectory ? initialVersion : undefined;
        if (element)
            this.mod_attr("_ptr", new spinal_core_connectorjs_1.Ptr(element));
        this._addNodeToInfo();
        if (!isDirectory) {
            this.add_attr({
                currentVersion: new spinal_core_connectorjs_1.Ptr(initialVersion),
                versionHistory: new spinal_core_connectorjs_1.Ptr(new spinal_core_connectorjs_1.Lst([initialVersion])),
                hashes: new spinal_core_connectorjs_1.Lst(Array.from(initialVersion.hashes)),
            });
        }
        // this.add_attr({});
        // this.createNode();
    }
    async getDirectoryElement() {
        if (!this.isDirectory())
            return null;
        return new Promise((resolve) => this._ptr.load((element) => resolve(element)));
    }
    async updateVersion(buffer, versionName, chunkSize) {
        if (this.isDirectory())
            throw new Error("Cannot update version of a directory.");
        const hashes = await versionUtils_1.default.getInstance().convertFileToHashes(buffer, Array.from(this.hashes), chunkSize);
        const versionHistory = await this._loadVersionHistory();
        const newVersion = new FileVersion_1.default({ version: versionName || versionHistory.length + 1, hashes });
        versionHistory.push(newVersion); // Add new version to history
        this.hashes.concat(newVersion.hashes); // Update file hashes with new version's hashes
        this.mod_attr("currentVersion", new spinal_core_connectorjs_1.Ptr(newVersion)); // Update current version pointer
    }
    getCurrentVersion() {
        if (this.isDirectory())
            throw new Error("Directories do not have versions.");
        return new Promise((resolve, reject) => {
            try {
                this.currentVersion?.load((version) => resolve(version));
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async getCurrentVersionAsBuffer(hubUrl = "") {
        if (this.isDirectory())
            throw new Error("Directories do not have versions.");
        const currentVersion = await this.getCurrentVersion();
        return currentVersion.getAsBuffer(hubUrl);
    }
    async getVersionHistory() {
        if (this.isDirectory())
            throw new Error("Directories do not have versions.");
        const historyLst = await this._loadVersionHistory();
        return Array.from(historyLst);
    }
    async linkToNode(parentNode, contextNode) {
        if (!this._node)
            await this.createNode();
        const relationName = this.isDirectory() ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
        return (0, files_1.addSpinalDocumentAsNodeChild)(parentNode, this._node, relationName, contextNode);
    }
    async remove() {
        if (!this._node)
            this._node = (await this.getNode());
        if (!this._node)
            return false;
        if (!this.isDirectory())
            return (0, files_1.removeFileNode)(this._node);
        const files = await this._node.getChildren([constants_1.TO_FOLDER_RELATION, constants_1.TO_FILE_RELATION]);
        const promises = [];
        for (const file of files) {
            promises.push(file.remove());
        }
        return Promise.all(promises).then((result) => {
            return true;
        });
    }
    getNode() {
        if (this._node)
            return Promise.resolve(this._node);
        const infoAttr = this._info;
        const nodePtr = infoAttr?.node;
        if (!nodePtr)
            return Promise.resolve(null);
        return new Promise((resolve) => nodePtr.load((node) => {
            this._node = node;
            resolve(node);
        }));
    }
    async getParentNodes() {
        const fileNode = await this.getNode();
        if (!fileNode)
            return [];
        const parents = await fileNode.getParents();
        return parents;
    }
    async getFilesTreeAsBuffers(hubUrl = "") {
        const node = await this.getNode();
        if (!node)
            return [];
        return (0, files_1.convertTreeToFileBuffers)(node, hubUrl);
    }
    async createNode() {
        const node = await this.getNode();
        if (node)
            return node;
        if (!this._node)
            this._node = this._addNodeToInfo();
        return this._node;
    }
    isDirectory() {
        return this._info?.model_type?.get() === constants_1.DIRECTORY_MODEL_TYPE;
    }
    _addNodeToInfo() {
        const type = this.isDirectory() ? constants_1.DIRECTORY_NODE_TYPE : constants_1.FILE_NODE_TYPE;
        const name = this.name.get();
        const node = new spinal_env_viewer_graph_service_1.SpinalNode(name, type, this);
        this._info.add_attr({ node: new spinal_core_connectorjs_1.Ptr(node) });
        return node;
    }
    _loadVersionHistory() {
        return new Promise((resolve, reject) => {
            try {
                this.versionHistory?.load((history) => resolve(history));
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.default = SpinalDocument;
exports.SpinalDocument = SpinalDocument;
spinal_core_connectorjs_1.spinalCore.register_models(SpinalDocument, "SpinalDocument");
//# sourceMappingURL=SpinalDocument.js.map
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
        return newVersion;
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
    async setAsCurrentVersion(versionName) {
        if (this.isDirectory())
            throw new Error("Directories do not have versions.");
        const version = await this.getVersionByName(versionName);
        if (!version)
            throw new Error(`Version ${versionName} not found.`);
        this.mod_attr("currentVersion", new spinal_core_connectorjs_1.Ptr(version));
        return version;
    }
    async getCurrentVersionAsBuffer(hubUrl = "") {
        if (this.isDirectory())
            throw new Error("Directories do not have versions.");
        const currentVersion = await this.getCurrentVersion();
        return currentVersion.getAsBuffer(hubUrl);
    }
    async removeVersion(versionName) {
        if (this.isDirectory())
            throw new Error("Cannot remove version of a directory.");
        const currentVersion = await this.getCurrentVersion();
        const isCurrentVersion = currentVersion.version.get() == versionName;
        let versionHistory = await this._loadVersionHistory();
        const versionsArray = Array.from(versionHistory);
        // If the version to remove is not the current version, simply remove it from the history
        if (!isCurrentVersion) {
            const versionFound = versionsArray.find((version) => version.version.get() == versionName);
            if (!versionFound)
                throw new Error(`Version ${versionName} not found.`);
            versionHistory.remove(versionFound);
            return true;
        }
        // If the version to remove is the current version, ensure there are other versions to switch to
        if (versionsArray.length == 1)
            throw new Error("Cannot remove the only version of the file.");
        // Find the last version based on creation date
        const lastVersion = [...versionsArray].sort((a, b) => b.creationDate.get() - a.creationDate.get())[0];
        if (!lastVersion)
            throw new Error("No other version found to set as current.");
        this.mod_attr("currentVersion", new spinal_core_connectorjs_1.Ptr(lastVersion)); // Set the last version as the current version
        versionHistory.remove(currentVersion); // Remove the current version from history
        return true;
    }
    async getVersionByName(versionName) {
        if (this.isDirectory())
            throw new Error("Directories do not have versions.");
        const versionHistory = await this._loadVersionHistory();
        for (const version of versionHistory) {
            if (version.version.get() == versionName) {
                return version;
            }
        }
        return null; // Return null if the version is not found
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
    async remove(unlinkToAll = true) {
        if (!this._node)
            this._node = (await this.getNode());
        if (!this._node)
            return false;
        const parentNodes = await this._node.getParents([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
        const unlinkPromises = parentNodes.map(async (parent) => {
            if (!unlinkToAll && (0, files_1.isRootDirectoryNode)(parent))
                return true;
            return (0, files_1.removeFileNodeFromParent)(parent, this._node);
        });
        return Promise.all(unlinkPromises)
            .then(async () => {
            // If the document is a directory, remove it from its children
            if (this.isDirectory())
                await this._node?._removeFromChildren();
            return true;
        })
            .catch(() => false);
        // if (!this.isDirectory()) return removeFileNode(this._node, undefined, unlinkToAll);
        // const files = await this._node.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
        // const promises: Promise<boolean | boolean[]>[] = [];
        // for (const file of files) {
        // 	promises.push(file.remove());
        // }
        // return Promise.all(promises).then((result) => {
        // 	return true;
        // });
    }
    async removeFromParent(parentNode) {
        if (!this._node)
            this._node = (await this.getNode());
        if (!this._node)
            return false;
        return (0, files_1.removeFileNodeFromParent)(parentNode, this._node);
    }
    async removeFromContext(contextNode) {
        if (!this._node)
            this._node = (await this.getNode());
        if (!this._node)
            return Promise.resolve(false);
        const parents = await this._node.getParentsInContext(contextNode, [constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
        const unLinkPromises = parents.map((parent) => (0, files_1.removeFileNodeFromParent)(parent, this._node));
        return Promise.all(unLinkPromises)
            .then(() => true)
            .catch(() => false);
    }
    async removeAllLinks() {
        if (!this._node)
            this._node = (await this.getNode());
        if (!this._node)
            return false;
        const parents = await this._node.getParents([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
        const unlinkPromises = parents.map((parent) => {
            if ((0, files_1.isRootDirectoryNode)(parent))
                return (0, files_1.removeFileNodeFromParent)(parent, this._node);
            return Promise.resolve(false);
        });
        return Promise.all(unlinkPromises)
            .then(() => true)
            .catch(() => false);
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
        return this._info?.model_type?.get() == constants_1.DIRECTORY_MODEL_TYPE;
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
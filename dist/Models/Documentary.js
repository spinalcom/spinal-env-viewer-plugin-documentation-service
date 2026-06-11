"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalDocumentary = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_model_graph_1 = require("spinal-model-graph");
const files_1 = require("../utils/files");
const constants_1 = require("./constants");
const models_spinalcom_1 = require("../models_spinalcom");
const FileExplorer_1 = require("./FileExplorer");
class SpinalDocumentary {
    constructor() { }
    async addFileToNode(parentNode, files, contextNode, chunkSize = -1) {
        const filesConverted = await (0, files_1.convertFileToSpinalDocument)(files, chunkSize);
        const promises = [];
        for (const file of filesConverted) {
            promises.push(file.linkToNode(parentNode, contextNode));
        }
        return Promise.all(promises);
    }
    async getAllFileVersions(fileNode) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode)
            throw new Error("File model not found for the given node.");
        if (fileNode instanceof models_spinalcom_1.SpinalDocument)
            return fileNode.getVersionHistory();
        // if (fileNode instanceof SpinalFile) {
        // const fakeFileVersion = FileVersion.createFakeFileVersionInstance(fileNode);
        // return [fakeFileVersion];
        // }
        throw new Error("Unsupported file model type.");
    }
    async updateFileVersion(fileNode, buffer, versionName, chunkSize) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode || !(fileNode instanceof models_spinalcom_1.SpinalDocument))
            throw new Error("File model not found for the given node.");
        return fileNode.updateVersion(buffer, versionName, chunkSize);
    }
    async removeFile(fileNode) {
        if (fileNode instanceof models_spinalcom_1.SpinalDocument)
            fileNode = (await fileNode.getNode());
        if (fileNode.getType().get() !== constants_1.DIRECTORY_NODE_TYPE)
            return (0, files_1.removeFileNode)(fileNode);
        const files = await fileNode.getChildren([constants_1.TO_FOLDER_RELATION, constants_1.TO_FILE_RELATION]);
        const promises = [];
        for (const file of files) {
            promises.push(this.removeFile(file));
        }
        return Promise.all(promises).then((result) => {
            return true;
        });
    }
    createDirectoryNode(parentNode, name, contextNode, icon = "folder") {
        const file = new models_spinalcom_1.SpinalDocument(name, new spinal_core_connectorjs_type_1.Lst(), { model_type: constants_1.DIRECTORY_MODEL_TYPE, icon });
        return file.linkToNode(parentNode, contextNode);
    }
    async importFilesFromSpinalDrive(contextNode, parentNode, startFile) {
        const queue = [{ file: startFile, parent: parentNode }];
        const createdNodes = [];
        while (queue.length > 0) {
            const itemToProcess = queue.shift();
            if (!itemToProcess)
                continue;
            const { file, parent } = itemToProcess;
            const { name, nodeType, relationName } = await (0, files_1._getFileAttributes)(file);
            const node = await this._createNodeInContext(file, parent, relationName, contextNode);
            if (!node)
                continue;
            // Only push to createdNodes if it's a file, directories will be processed for their children
            if (nodeType === constants_1.DIRECTORY_NODE_TYPE) {
                const children = await (0, files_1._getFileChildren)(file, node);
                queue.push(...children);
            }
            createdNodes.push(node);
        }
        return createdNodes;
    }
    async getFilesInTreeAsBuffer(startNode, hubUrl = "") {
        return (0, files_1.convertTreeToFileBuffers)(startNode, hubUrl);
    }
    async convertFileToBuffer(file, hubUrl = "") {
        // if (file instanceof SpinalNode) file = (await file.getElement(true)) as SpinalDocument;
        const buffer = await (0, files_1._getFileAsBuffer)(file, hubUrl);
        const name = file.name.get();
        return { name, buffer };
    }
    async linkFileToNode(node, fileNode) {
        const fileModel = await (0, files_1.getFileModelFromNode)(fileNode);
        return FileExplorer_1.FileExplorer.addFileUpload(node, fileModel);
        // const rootDirNode = await _getOrCreateRootNode(node);
        // if (!rootDirNode) throw new Error("Unable to create or get root directory node");
        // const relationName = fileNode.getType().get() === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;
        // return addSpinalDocumentAsNodeChild(rootDirNode, fileNode, relationName, undefined);
    }
    async getFileLinkedToNode(node) {
        return FileExplorer_1.FileExplorer.getFilesLinkedToNode(node);
        // const rootDirNode = await _getOrCreateRootNode(node, false);
        // if (!rootDirNode) return [];
        // const children = await rootDirNode.getChildren([TO_FILE_RELATION, TO_FOLDER_RELATION]);
        // return children;
    }
    async getFileLinkedToNodeAsBuffers(node, hubUrl = "") {
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node, false);
        if (!rootDirNode)
            return [];
        return (0, files_1.convertTreeToFileBuffers)(rootDirNode, hubUrl);
    }
    //TODO: correct this function
    async unlinkFileFromNode(node, fileNode) {
        return FileExplorer_1.FileExplorer.removeFileLinked(node, fileNode);
    }
    async _createNodeInContext(file, parent, relationName, contextNode) {
        // let node: SpinalNode | null = null;
        const node = await (0, files_1.createFileNode)(file);
        if (!node)
            return null;
        await parent.addChildInContext(node, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode);
        return node;
    }
    static async pushFileToDirectory(directoryNode, file) {
        const fileNode = await (0, files_1.createFileNode)(file);
        const directoryElement = await (0, files_1.getFileModelFromNode)(directoryNode);
        const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
        if (!list)
            throw new Error("Directory list not found or failed to load.");
        if (list instanceof spinal_core_connectorjs_type_1.Lst || list instanceof spinal_core_connectorjs_type_1.Directory) {
            const relationName = fileNode.getType().get() === constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
            list.push(file);
            return directoryNode.addChild(fileNode, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        return null;
    }
    static async removeFileFromDirectory(directoryNode, file) {
        const directoryElement = await (0, files_1.getFileModelFromNode)(directoryNode);
        const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
        if (!list)
            return false;
        if (list instanceof spinal_core_connectorjs_type_1.Lst || list instanceof spinal_core_connectorjs_type_1.Directory) {
            for (let f of list) {
                if (f._server_id === file._server_id) {
                    list.remove(f);
                    return true;
                }
            }
        }
        return false;
    }
}
exports.SpinalDocumentary = SpinalDocumentary;
exports.default = SpinalDocumentary;
//# sourceMappingURL=Documentary.js.map
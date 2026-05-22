"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalDocumentary = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_model_graph_1 = require("spinal-model-graph");
const files_1 = require("../utils/files");
const constants_1 = require("./constants");
const models_spinalcom_1 = require("../models_spinalcom");
class SpinalDocumentary {
    constructor() { }
    addFileToNode(parentNode, files, contextNode, chunkSize = -1) {
        const filesConverted = (0, files_1.convertFileToSpinalFile)(files, chunkSize);
        const promises = [];
        for (const file of filesConverted) {
            promises.push(file.linkToNode(parentNode, contextNode));
        }
        return Promise.all(promises);
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
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node);
        if (!rootDirNode)
            throw new Error("Unable to create or get root directory node");
        const relationName = fileNode.getType().get() === constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
        return (0, files_1.addChildrenToNode)(rootDirNode, fileNode, relationName, undefined);
    }
    async getFileLinkedToNode(node) {
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node, false);
        if (!rootDirNode)
            return [];
        const children = await rootDirNode.getChildren([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
        return children;
    }
    async getFileLinkedToNodeAsBuffers(node, hubUrl = "") {
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node, false);
        if (!rootDirNode)
            return [];
        return (0, files_1.convertTreeToFileBuffers)(rootDirNode, hubUrl);
    }
    async unlinkFileFromNode(node, fileNode) {
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node, false);
        if (!rootDirNode)
            return;
        const relationName = fileNode.getType().get() === constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
        await rootDirNode.removeChild(fileNode, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    async _createNodeInContext(file, parent, relationName, contextNode) {
        const node = await file.getNode();
        await parent.addChildInContext(node, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode);
        return node;
    }
}
exports.SpinalDocumentary = SpinalDocumentary;
exports.default = SpinalDocumentary;
//# sourceMappingURL=Documentary.js.map
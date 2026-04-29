"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalDocumentary = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_model_graph_1 = require("spinal-model-graph");
const files_1 = require("../utils/files");
const constants_1 = require("./constants");
class SpinalDocumentary {
    constructor() { }
    createFileNode(contextNode, parentNode, files) {
        const filesConverted = (0, files_1.convertFileToSpinalFile)(files);
        const promises = [];
        for (const file of filesConverted) {
            const node = new spinal_model_graph_1.SpinalNode(file.name.get(), constants_1.FILE_NODE_TYPE, file);
            promises.push((0, files_1.addChildrenToNode)(parentNode, node, constants_1.TO_FILE_RELATION, contextNode));
        }
        return Promise.all(promises);
    }
    createDirectoryNode(contextNode, parentNode, name, icon = "folder") {
        const file = new spinal_core_connectorjs_type_1.File(name, new spinal_core_connectorjs_type_1.Directory(), { model_type: "Directory", icon });
        const node = new spinal_model_graph_1.SpinalNode(name, constants_1.DIRECTORY_NODE_TYPE, file);
        return (0, files_1.addChildrenToNode)(parentNode, node, constants_1.TO_FOLDER_RELATION, contextNode);
    }
    async importFilesFromDirectory(contextNode, parentNode, startFile) {
        const queue = [{ file: startFile, parent: parentNode }];
        const createdNodes = [];
        while (queue.length > 0) {
            const itemToProcess = queue.shift();
            if (!itemToProcess)
                continue;
            const { file, parent } = itemToProcess;
            const { name, nodeType, relationName } = this._getFileAttributes(file);
            const node = await this._createNodeInContext(name, nodeType, file, parent, relationName, contextNode);
            // Only push to createdNodes if it's a file, directories will be processed for their children
            if (nodeType === constants_1.DIRECTORY_NODE_TYPE) {
                const children = await this._getFileChildren(file, node);
                queue.push(...children);
            }
            createdNodes.push(node);
        }
        return createdNodes;
    }
    async _getFileChildren(file, parentNode) {
        const children = await (0, files_1.getFilesFromDirectory)(file);
        const res = [];
        for (const child of children) {
            res.push({ file: child, parent: parentNode });
        }
        return res;
    }
    async _createNodeInContext(name, nodeType, file, parent, relationName, contextNode) {
        const node = new spinal_model_graph_1.SpinalNode(name, nodeType, file);
        await parent.addChildInContext(node, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode);
        return node;
    }
    _getFileAttributes(file) {
        const name = file.name.get();
        const fileType = file._info?.model_type?.get();
        const nodeType = fileType === "Directory" ? constants_1.DIRECTORY_NODE_TYPE : constants_1.FILE_NODE_TYPE;
        const relationName = nodeType === constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
        return { name, nodeType, relationName };
    }
}
exports.SpinalDocumentary = SpinalDocumentary;
exports.default = SpinalDocumentary;
//# sourceMappingURL=Documentary.js.map
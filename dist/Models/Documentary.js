"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalDocumentary = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_model_graph_1 = require("spinal-model-graph");
const files_1 = require("../utils/files");
const constants_1 = require("./constants");
class SpinalDocumentary {
    constructor() { }
    createFileNode(contextNode, parentNode, file) {
        const filesConverted = (0, files_1.convertFileToSpinalFile)(file);
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
}
exports.SpinalDocumentary = SpinalDocumentary;
exports.default = SpinalDocumentary;
//# sourceMappingURL=Documentary.js.map
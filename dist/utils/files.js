"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChildrenToNode = exports.convertFileToSpinalFile = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const FileExplorer_1 = require("../Models/FileExplorer");
const constants_1 = require("../Models/constants");
function convertFileToSpinalFile(files) {
    const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
    if (!isFileList && !Array.isArray(files))
        files = [files];
    const res = [];
    for (let i = 0; i < files.length; i++) {
        const element = files[i];
        let filePath;
        if (element.buffer)
            filePath = new spinal_core_connectorjs_type_1.Path(element.buffer, FileExplorer_1.FileExplorer.getMimeType(element.name));
        else
            filePath = new spinal_core_connectorjs_type_1.Path(element, FileExplorer_1.FileExplorer.getMimeType(element.name));
        let file = new spinal_core_connectorjs_type_1.File(element.name, filePath, { model_type: "File" });
        res.push(file);
    }
    return res;
}
exports.convertFileToSpinalFile = convertFileToSpinalFile;
function addChildrenToNode(parentNode, childNode, relationName, contextNode) {
    return parentNode.addChildInContext(childNode, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode).then(async (result) => {
        if (parentNode.getType().get() === constants_1.DIRECTORY_NODE_TYPE) {
            const element = await childNode.getElement(true);
            if (!element)
                return result;
            await _addFileNodeToDirectory(parentNode, element);
        }
        ;
        return result;
    });
}
exports.addChildrenToNode = addChildrenToNode;
async function _addFileNodeToDirectory(directoryNode, file) {
    let directory = await directoryNode.getElement(true);
    if (directory instanceof spinal_core_connectorjs_type_1.File && directory._info?.model_type?.get() === "Directory") {
        const directoryElement = await new Promise(resolve => directory.load((e) => resolve(e)));
        if (directoryElement instanceof spinal_core_connectorjs_type_1.Directory)
            directory = directoryElement;
    }
    if (!directory)
        return;
    directory.push(file);
    return directory;
}
//# sourceMappingURL=files.js.map
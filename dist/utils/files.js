"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTreeToFileBuffers = exports._getFileAsBuffer = exports._getFileAttributes = exports._getFileChildren = exports.createFileNode = exports.getFilesFromDirectory = exports.addChildrenToNode = exports.convertFileToSpinalFile = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const FileExplorer_1 = require("../Models/FileExplorer");
const constants_1 = require("../Models/constants");
const axios_retry_1 = require("axios-retry");
const axios_1 = require("axios");
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
async function getFilesFromDirectory(directoryNode) {
    const directory = await new Promise(resolve => directoryNode.load((e) => resolve(e)));
    const res = [];
    if (directory instanceof spinal_core_connectorjs_type_1.Directory) {
        for (let i = 0; i < directory.length; i++) {
            const element = directory[i];
            res.push(element);
        }
    }
    return res;
}
exports.getFilesFromDirectory = getFilesFromDirectory;
function createFileNode(file) {
    const type = file._info?.model_type?.get() === "Directory" ? constants_1.DIRECTORY_NODE_TYPE : constants_1.FILE_NODE_TYPE;
    const name = file.name.get();
    const node = new spinal_env_viewer_graph_service_1.SpinalNode(name, type, file);
    file._info.add_attr({ node: new spinal_core_connectorjs_type_1.Ptr(node) });
    return node;
}
exports.createFileNode = createFileNode;
async function _getFileChildren(file, parentNode) {
    const children = await getFilesFromDirectory(file);
    const res = [];
    for (const child of children) {
        res.push({ file: child, parent: parentNode });
    }
    return res;
}
exports._getFileChildren = _getFileChildren;
async function _getFileAttributes(file) {
    const name = file.name.get();
    const fileType = file._info?.model_type?.get();
    const nodeType = fileType === "Directory" ? constants_1.DIRECTORY_NODE_TYPE : constants_1.FILE_NODE_TYPE;
    const relationName = nodeType === constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
    return { name, nodeType, relationName };
}
exports._getFileAttributes = _getFileAttributes;
function _getFileAsBuffer(file, hubUrl = "") {
    const pathServerId = file._ptr.data.value;
    return getPathData(pathServerId, hubUrl);
}
exports._getFileAsBuffer = _getFileAsBuffer;
function getPathData(dynamicId, hubUrl = "") {
    if (hubUrl.endsWith("/"))
        hubUrl = hubUrl.slice(0, -1);
    const path = `${hubUrl}/sceen/_?u=${dynamicId}`;
    const client = axios_1.default.create({ baseURL: hubUrl });
    (0, axios_retry_1.default)(client, { retries: 3, retryDelay: axios_retry_1.default.exponentialDelay });
    return client.get(path, { responseType: 'arraybuffer' }).then((response) => {
        return Buffer.from(response.data);
        // return new Uint8Array(response.data);
    });
}
async function convertTreeToFileBuffers(startNode) {
    const queue = await getStarterQueue(startNode);
    const filesBuffers = [];
    const alreadyProcessedNodes = new Set();
    while (queue.length > 0) {
        const itemToProcess = queue.shift();
        if (!itemToProcess)
            continue;
        const { path, file } = itemToProcess;
        if (alreadyProcessedNodes.has(file._ptr.data.value))
            continue;
        alreadyProcessedNodes.add(file._ptr.data.value);
        if (file._info?.model_type?.get() !== "Directory") {
            filesBuffers.push({ name: file.name.get(), path, buffer: await _getFileAsBuffer(file) });
        }
        if (file._info?.model_type?.get() === "Directory") {
            const children = await getFilesFromDirectory(file);
            for (const child of children) {
                queue.push({ path: `${path}/${child.name.get()}`, file: child });
            }
        }
    }
    return filesBuffers;
}
exports.convertTreeToFileBuffers = convertTreeToFileBuffers;
async function getStarterQueue(startNode) {
    const queue = [{ node: startNode, path: startNode.getName().get() }];
    const res = [];
    while (queue.length > 0) {
        const data = queue.shift();
        if (!data)
            continue;
        const { node, path } = data;
        const type = node.getType().get();
        if (type === constants_1.FILE_NODE_TYPE || type === constants_1.DIRECTORY_NODE_TYPE) {
            res.push({ path, file: await node.getElement(true) });
        }
        const children = await node.getChildren();
        for (const child of children) {
            queue.push({ node: child, path: `${path}/${child.getName().get()}` });
        }
    }
    return res;
}
//# sourceMappingURL=files.js.map
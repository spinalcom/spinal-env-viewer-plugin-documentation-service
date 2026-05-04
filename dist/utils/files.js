"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFileNode = exports._getOrCreateRootNode = exports.convertTreeToFileBuffers = exports._getFileAsBuffer = exports._getFileAttributes = exports._getFileChildren = exports.createFileNode = exports.getFilesFromDirectory = exports.addChildrenToNode = exports.convertFileToSpinalFile = void 0;
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
    let prom;
    if (contextNode)
        prom = parentNode.addChildInContext(childNode, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode);
    else
        prom = parentNode.addChild(childNode, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    return prom.then(async (result) => {
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
async function convertTreeToFileBuffers(startNode, hubUrl = "") {
    const queue = await getStarterQueue(startNode);
    const filesBuffers = [];
    const alreadyProcessedNodes = new Set();
    while (queue.length > 0) {
        const itemToProcess = queue.shift();
        if (!itemToProcess)
            continue;
        const { path, file } = itemToProcess;
        const serverId = file._ptr.data.value;
        if (alreadyProcessedNodes.has(serverId))
            continue;
        if (file._info?.model_type?.get() !== "Directory") {
            filesBuffers.push({ name: file.name.get(), serverId, path, buffer: await _getFileAsBuffer(file, hubUrl) });
        }
        if (file._info?.model_type?.get() === "Directory") {
            const children = await getFilesFromDirectory(file);
            for (const child of children) {
                queue.push({ path: `${path}/${child.name.get()}`, file: child });
            }
        }
        alreadyProcessedNodes.add(serverId);
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
async function _getOrCreateRootNode(node, createIfNotExist = true) {
    const children = await node.getChildren([constants_1.TO_ROOT_DIRECTORY_RELATION]);
    if (children.length > 0)
        return children[0];
    if (!createIfNotExist)
        return null;
    const name = node.getName().get() + "_root_directory";
    const file = new spinal_core_connectorjs_type_1.File(name, new spinal_core_connectorjs_type_1.Directory(), { model_type: "Directory", icon: "folder" });
    const directoryNode = createFileNode(file);
    await node.addChild(directoryNode, constants_1.TO_ROOT_DIRECTORY_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    return directoryNode;
}
exports._getOrCreateRootNode = _getOrCreateRootNode;
async function removeFileNode(fileNode) {
    const parentNodes = await fileNode.getParents([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
    const fileElement = await fileNode.getElement(true);
    const unlinkPromises = parentNodes.map(async (parent) => {
        if (parent.getType().get() === constants_1.DIRECTORY_NODE_TYPE) {
            const directory = await parent.getElement(true);
            directory?.remove(fileElement);
        }
        return parent.removeChild(fileNode, constants_1.TO_FILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    });
    return Promise.all(unlinkPromises).then((result) => {
        return true;
    }).catch((err) => {
        return false;
    });
}
exports.removeFileNode = removeFileNode;
//# sourceMappingURL=files.js.map
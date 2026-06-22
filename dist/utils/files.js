"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileVersion = exports.removeFileNode = exports._getOrCreateRootNode = exports.convertTreeToFileBuffers = exports.convertFileToSpecialFormat = exports.convertFileInTreeToSpecialFormat = exports.getPathData = exports._getFileAsBuffer = exports._getFileAttributes = exports._getFileChildren = exports.createorGetFileNode = exports.getFilesFromDirectory = exports.getFileModelFromNode = exports.addSpinalDocumentAsNodeChild = exports.convertFileToBuffer = exports.convertFileToSpinalDocument = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("../Models/constants");
const axios_retry_1 = require("axios-retry");
const axios_1 = require("axios");
const SpinalDocument_1 = require("../models_spinalcom/SpinalDocument");
const versionUtils_1 = require("./versionUtils");
const FileVersion_1 = require("../models_spinalcom/FileVersion");
const stream_1 = require("stream");
async function convertFileToSpinalDocument(files, chunkSize = -1) {
    const isFileList = typeof FileList !== "undefined" && files instanceof FileList;
    if (!isFileList && !Array.isArray(files))
        files = [files];
    const res = [];
    for (let i = 0; i < files.length; i++) {
        const element = files[i];
        // If the element is already a SpinalNode, we try to get its file model and add it to the result if it exists
        if (element instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
            const fileModel = await getFileModelFromNode(element);
            if (fileModel)
                res.push(fileModel);
            continue;
        }
        // If the element is already a SpinalDocument or SpinalFile, we add it to the result and ensure it has a node
        if (element instanceof spinal_core_connectorjs_type_1.File || element instanceof SpinalDocument_1.SpinalDocument) {
            res.push(element);
            await createorGetFileNode(element);
            continue;
        }
        // let filePath: SpinalPath | undefined;
        // if (element.buffer) filePath = new SpinalPath(element.buffer, FileExplorer.getMimeType(element.name));
        // else filePath = new SpinalPath(element, FileExplorer.getMimeType(element.name));
        const hashes = await versionUtils_1.default.getInstance().convertFileToHashes(element.buffer || element, [], chunkSize);
        const fileVersion = new FileVersion_1.FileVersion({ version: 1, hashes });
        let file = new SpinalDocument_1.SpinalDocument(element.name, fileVersion, { model_type: constants_1.FILE_MODEL_TYPE });
        res.push(file);
    }
    return res;
}
exports.convertFileToSpinalDocument = convertFileToSpinalDocument;
async function convertFileToBuffer(file) {
    if (Buffer.isBuffer(file))
        return file;
    let arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
exports.convertFileToBuffer = convertFileToBuffer;
function addSpinalDocumentAsNodeChild(parentNode, spinalDocumentNode, relationName, contextNode) {
    let prom;
    if (contextNode)
        prom = parentNode.addChildInContext(spinalDocumentNode, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode);
    else
        prom = parentNode.addChild(spinalDocumentNode, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    return prom.then(async (result) => {
        if (parentNode.getType().get() === constants_1.DIRECTORY_NODE_TYPE) {
            const childSpinalDocument = await getFileModelFromNode(spinalDocumentNode);
            if (!childSpinalDocument)
                return result;
            await _addFileNodeToDirectory(parentNode, childSpinalDocument);
        }
        return result;
    });
}
exports.addSpinalDocumentAsNodeChild = addSpinalDocumentAsNodeChild;
async function getFileModelFromNode(node) {
    const file = await node.getElement(true);
    return file;
}
exports.getFileModelFromNode = getFileModelFromNode;
async function _addFileNodeToDirectory(directoryNode, file) {
    let spinalDocument = await getFileModelFromNode(directoryNode);
    if (!spinalDocument)
        return;
    let directory = await getDirectoryElement(spinalDocument);
    if (directory)
        directory.push(file);
    return directory;
}
async function getDirectoryElement(spinalDocument) {
    const isDirectory = spinalDocument._info?.model_type?.get() === constants_1.DIRECTORY_MODEL_TYPE;
    if (!isDirectory)
        return;
    return new Promise((resolve) => {
        spinalDocument._ptr.load((element) => {
            resolve(element);
        });
    });
}
async function getFilesFromDirectory(directoryNode) {
    const directory = await getDirectoryElement(directoryNode); // Get the directory element (Lst or Directory) from the SpinalDocument
    const res = [];
    if (!directory)
        return res;
    for (let i = 0; i < directory.length; i++) {
        const element = directory[i];
        res.push(element);
    }
    return res;
}
exports.getFilesFromDirectory = getFilesFromDirectory;
async function createorGetFileNode(file) {
    if (file instanceof spinal_env_viewer_graph_service_1.SpinalNode)
        return file;
    if (file instanceof SpinalDocument_1.SpinalDocument)
        return file.createNode();
    if (!file._info?.node)
        return createAndAddNodeToFile(file);
    return new Promise((resolve) => file._info.node.load((node) => resolve(node)));
}
exports.createorGetFileNode = createorGetFileNode;
function createAndAddNodeToFile(file) {
    const isDirectory = file._info?.model_type?.get() === constants_1.DIRECTORY_MODEL_TYPE;
    const type = isDirectory ? constants_1.DIRECTORY_NODE_TYPE : constants_1.FILE_NODE_TYPE;
    const name = file.name.get();
    const node = new spinal_env_viewer_graph_service_1.SpinalNode(name, type, file);
    file._info.add_attr({ node: new spinal_core_connectorjs_type_1.Ptr(node) });
    return node;
}
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
    const isDirectory = file._info?.model_type?.get() === constants_1.DIRECTORY_MODEL_TYPE;
    const nodeType = isDirectory ? constants_1.DIRECTORY_NODE_TYPE : constants_1.FILE_NODE_TYPE;
    const relationName = nodeType === constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
    return { name, nodeType, relationName };
}
exports._getFileAttributes = _getFileAttributes;
async function _getFileAsBuffer(file, hubUrl = "") {
    if (file instanceof spinal_env_viewer_graph_service_1.SpinalNode)
        file = (await getFileModelFromNode(file));
    if (file instanceof SpinalDocument_1.SpinalDocument)
        return file.getCurrentVersionAsBuffer();
    const pathServerId = file._ptr.data.value;
    return getPathData(pathServerId, hubUrl);
}
exports._getFileAsBuffer = _getFileAsBuffer;
function getPathData(dynamicId, hubUrl = "") {
    if (hubUrl.endsWith("/"))
        hubUrl = hubUrl.slice(0, -1);
    const path = `${hubUrl}/sceen/_?u=${dynamicId}`;
    const client = axios_1.default.create({ baseURL: hubUrl });
    (0, axios_retry_1.default)(client, { retries: 5, retryDelay: axios_retry_1.default.exponentialDelay });
    return client.get(path, { responseType: "arraybuffer" }).then((response) => {
        return Buffer.from(response.data);
        // return new Uint8Array(response.data);
    });
}
exports.getPathData = getPathData;
async function convertFileInTreeToSpecialFormat(startNode, format, hubUrl = "") {
    const queue = await getStarterQueue(startNode);
    const filesBuffers = [];
    const alreadyProcessedNodes = new Set();
    while (queue.length > 0) {
        const itemToProcess = queue.shift();
        if (!itemToProcess)
            continue;
        const { path, file } = itemToProcess;
        const serverId = file._server_id || 0;
        if (alreadyProcessedNodes.has(serverId))
            continue;
        if (file._info.model_type?.get() !== constants_1.DIRECTORY_MODEL_TYPE) {
            const data = await convertFileToSpecialFormat(file, format, hubUrl);
            filesBuffers.push({ path, ...data });
        }
        if (file._info.model_type?.get() === constants_1.DIRECTORY_MODEL_TYPE) {
            const children = await getFilesFromDirectory(file);
            for (const child of children) {
                queue.push({ path: `${path}/${child.name.get()}`, file: child });
            }
        }
        alreadyProcessedNodes.add(serverId);
    }
    return filesBuffers;
}
exports.convertFileInTreeToSpecialFormat = convertFileInTreeToSpecialFormat;
function bufferToStream(buffer) {
    const stream = new stream_1.Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}
async function convertFileToSpecialFormat(file, format, hubUrl = "") {
    const buffer = await _getFileAsBuffer(file, hubUrl);
    const data = format === "base64" ? buffer.toString("base64") : format === "stream" ? bufferToStream(buffer) : buffer;
    return { name: file.name.get(), serverId: file._server_id, data };
}
exports.convertFileToSpecialFormat = convertFileToSpecialFormat;
async function convertTreeToFileBuffers(startNode, hubUrl = "") {
    return convertFileInTreeToSpecialFormat(startNode, "buffer", hubUrl).then((files) => {
        return files.map((file) => {
            return { name: file.name, path: file.path, buffer: file.data };
        });
    });
}
exports.convertTreeToFileBuffers = convertTreeToFileBuffers;
async function getStarterQueue(startNode) {
    if (!(startNode instanceof spinal_env_viewer_graph_service_1.SpinalNode))
        startNode = await createorGetFileNode(startNode);
    const queue = [{ node: startNode, path: startNode.getName().get() }];
    const res = [];
    while (queue.length > 0) {
        const data = queue.shift();
        if (!data)
            continue;
        const { node, path } = data;
        const type = node.getType().get();
        if (type === constants_1.FILE_NODE_TYPE || type === constants_1.DIRECTORY_NODE_TYPE) {
            res.push({ path, file: (await getFileModelFromNode(node)) });
        }
        const children = await node.getChildren([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
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
    const file = new SpinalDocument_1.SpinalDocument(name, new spinal_core_connectorjs_type_1.Lst(), { model_type: constants_1.DIRECTORY_MODEL_TYPE, icon: "folder" });
    const directoryNode = await createorGetFileNode(file);
    await node.addChild(directoryNode, constants_1.TO_ROOT_DIRECTORY_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    return directoryNode;
}
exports._getOrCreateRootNode = _getOrCreateRootNode;
async function removeFileNode(fileNode) {
    const parentNodes = await fileNode.getParents([constants_1.TO_FILE_RELATION, constants_1.TO_FOLDER_RELATION]);
    const fileElement = await getFileModelFromNode(fileNode);
    const unlinkPromises = parentNodes.map(async (parent) => {
        if (parent.getType().get() === constants_1.DIRECTORY_NODE_TYPE) {
            const directory = await parent.getElement(true);
            directory?.remove(fileElement);
        }
        return parent.removeChild(fileNode, constants_1.TO_FILE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
    });
    return Promise.all(unlinkPromises)
        .then(() => true)
        .catch((err) => false);
}
exports.removeFileNode = removeFileNode;
function isFileVersion(fileVersion) {
    return fileVersion?.constructor?.name === "FileVersion";
}
exports.isFileVersion = isFileVersion;
//# sourceMappingURL=files.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalDocumentary = void 0;
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_model_graph_1 = require("spinal-model-graph");
const files_1 = require("../utils/files");
const constants_1 = require("./constants");
const models_spinalcom_1 = require("../models_spinalcom");
const FileExplorer_1 = require("./FileExplorer");
/**
 * Service class that manages documentation files and directories in a Spinal graph context.
 */
class SpinalDocumentary {
    constructor() { }
    ////////////////// Inside context functions ///////////////////////
    /**
     * Creates and adds a documentary context to a graph.
     * @param {SpinalGraph} graph Graph that will contain the context.
     * @param {string} name Name of the context to create.
     * @returns {Promise<SpinalContext>} The created context.
     */
    async createDocumentaryContext(graph, name) {
        const context = new spinal_model_graph_1.SpinalContext(name, constants_1.DOCUMENTARY_CONTEXT_TYPE);
        return graph.addContext(context);
    }
    /**
     * Converts input files to Spinal documents and links them under a parent node in context.
     * @param {SpinalNode} parentNode Parent node receiving file links.
     * @param {FilesArgType} files File input(s) to convert.
     * @param {SpinalContext} contextNode Context where links are created.
     * @param {number} [chunkSize=-1] Optional chunk size used by file conversion.
     * @returns {Promise<SpinalNode[]>} Linked file nodes.
     */
    async addFileToNodeInContext(parentNode, files, contextNode, chunkSize = -1) {
        const filesConverted = await (0, files_1.convertFileToSpinalDocument)(files, chunkSize);
        const promises = [];
        for (const file of filesConverted) {
            promises.push(file.linkToNode(parentNode, contextNode));
        }
        return Promise.all(promises);
    }
    /**
     * Adds an existing file node/model to a parent node in context.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File reference to add.
     * @param {SpinalNode} parentNode Parent node receiving the file.
     * @param {SpinalContext} contextNode Context where the link is created.
     * @returns {Promise<SpinalNode | null>} The created file node link, or null.
     */
    async addExistingFileToContext(fileNode, parentNode, contextNode) {
        const file = await (0, files_1.createorGetFileNode)(fileNode);
        if (!file)
            return null;
        return this.addFileToNodeInContext(parentNode, file, contextNode).then((result) => (result.length > 0 ? result[0] : null));
    }
    /**
     * Removes a file from a context and optionally removes descendants.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model to remove.
     * @param {SpinalContext} contextNode Context from which the file is removed.
     * @param {{ unlinkRefs?: boolean; removeChildren?: boolean }} [options] Removal options.
     * @returns {Promise<boolean>} True when completed.
     */
    async removeFileFromContext(fileNode, contextNode, options) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode || !(fileNode instanceof models_spinalcom_1.SpinalDocument))
            throw new Error("File model not found for the given node.");
        const unlinkRefs = options?.unlinkRefs ?? true;
        await fileNode.removeFromContext(contextNode, unlinkRefs);
        if (options?.removeChildren && fileNode.getType().get() === constants_1.DIRECTORY_NODE_TYPE) {
            const children = await fileNode.getChildren([constants_1.TO_FOLDER_RELATION, constants_1.TO_FILE_RELATION]);
            const removeChildrenPromises = children.map((child) => this.removeFileFromContext(child, contextNode, options));
            await Promise.all(removeChildrenPromises);
        }
        // if (unlinkRefs) await fileNode.removeAllLinks();
        return true;
        // if (fileNode instanceof SpinalDocument) fileNode = (await fileNode.getNode()) as SpinalNode;
        // if (fileNode.getType().get() !== DIRECTORY_NODE_TYPE) return removeFileNode(fileNode, contextNode, unlinkRefs);
        // const files = await fileNode.getChildren([TO_FOLDER_RELATION, TO_FILE_RELATION]);
        // const promises: Promise<boolean | boolean[]>[] = [];
        // for (const file of files) {
        // 	promises.push(this.removeFileFromContext(file, contextNode, unlinkRefs));
        // }
        // return Promise.all(promises).then((result) => {
        // 	return true;
        // });
    }
    /**
     * Creates a directory and links it under a parent node in context.
     * @param {SpinalNode} parentNode Parent node receiving the directory.
     * @param {string} name Directory name.
     * @param {SpinalContext} [contextNode] Optional context for contextual linking.
     * @param {string} [icon="folder"] Icon metadata.
     * @returns {Promise<SpinalNode>} Linked directory node.
     */
    addDirectoryToNodeInContext(parentNode, name, contextNode, icon = "folder") {
        const file = new models_spinalcom_1.SpinalDocument(name, new spinal_core_connectorjs_type_1.Lst(), { model_type: constants_1.DIRECTORY_MODEL_TYPE, icon });
        return file.linkToNode(parentNode, contextNode);
    }
    /**
     * Moves a document from a source parent to a target parent in context.
     * @param {SpinalNode | SpinalDocument | SpinalFile} documentToMove File to move.
     * @param {SpinalNode | SpinalDocument | SpinalFile} sourceNode Current parent node.
     * @param {SpinalNode | SpinalDocument | SpinalFile} targetNode Destination parent node.
     * @param {SpinalContext} contextNode Context where the move occurs.
     * @returns {Promise<boolean>} True on success, false otherwise.
     */
    async moveDocumentInContext(documentToMove, sourceNode, targetNode, contextNode) {
        documentToMove = await (0, files_1.createorGetFileNode)(documentToMove);
        sourceNode = await (0, files_1.createorGetFileNode)(sourceNode);
        targetNode = await (0, files_1.createorGetFileNode)(targetNode);
        if (contextNode.belongsToContext(documentToMove))
            return false;
        if (contextNode.belongsToContext(sourceNode))
            return false;
        if (contextNode.belongsToContext(targetNode))
            return false;
        await (0, files_1.removeFileNodeFromParent)(sourceNode, documentToMove);
        return this.addFileToNodeInContext(targetNode, documentToMove, contextNode)
            .then((result) => !!result)
            .catch(() => false);
    }
    // public async copyFileInContext(fileNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile, contextNode: SpinalContext, useSymbolicLink: boolean = false): Promise<SpinalNode | null> {
    // 	if (!useSymbolicLink) {
    // 		const
    // 	}
    // }
    /////////////////// Versioning functions ///////////////////////
    /**
     * Gets the versions of a file.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
     * @returns {Promise<FileVersion[]>} Version history for the file.
     */
    async getFileVersions(fileNode) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode)
            throw new Error("File model not found for the given node.");
        if (fileNode instanceof models_spinalcom_1.SpinalDocument)
            return fileNode.getVersionHistory();
        if (fileNode instanceof spinal_core_connectorjs_type_1.File) {
            const fakeFileVersion = await models_spinalcom_1.FileVersion.createFakeFileVersionInstance(fileNode);
            if (fakeFileVersion)
                return [fakeFileVersion];
        }
        // if (fileNode instanceof SpinalFile) {
        // const fakeFileVersion = FileVersion.createFakeFileVersionInstance(fileNode);
        // return [fakeFileVersion];
        // }
        throw new Error("Unsupported file model type.");
    }
    /**
     * Gets one version by its name.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
     * @param {string} versionName Version name to retrieve.
     * @returns {Promise<FileVersion | null>} Matching version or null.
     */
    async getFileVersionByName(fileNode, versionName) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode)
            throw new Error("File model not found for the given node.");
        if (fileNode instanceof models_spinalcom_1.SpinalDocument)
            return fileNode.getVersionByName(versionName);
        return null;
    }
    /**
     * Creates a new version from a buffer or file input.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model to update.
     * @param {Buffer | FilesArgType} buffer New content payload.
     * @param {string} [versionName] Optional version name.
     * @param {number} [chunkSize] Optional chunk size used by persistence.
     * @returns {Promise<FileVersion>} Created file version.
     */
    async updateFileVersion(fileNode, buffer, versionName, chunkSize) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode || !(fileNode instanceof models_spinalcom_1.SpinalDocument))
            throw new Error("File model not found for the given node.");
        return fileNode.updateVersion(buffer, versionName, chunkSize);
    }
    /**
     * Removes a version from a file history.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model.
     * @param {string} versionName Version name to remove.
     * @returns {Promise<boolean>} True if version is removed.
     */
    async removeFileVersion(fileNode, versionName) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode || !(fileNode instanceof models_spinalcom_1.SpinalDocument))
            throw new Error("File model not found for the given node.");
        return fileNode.removeVersion(versionName);
    }
    /**
     * Sets a version as the current version.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model.
     * @param {string} versionName Version name to set as current.
     * @returns {Promise<FileVersion>} The new current version.
     */
    async downgradeFileVersion(fileNode, versionName) {
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileNode = (await (0, files_1.getFileModelFromNode)(fileNode));
        if (!fileNode || !(fileNode instanceof models_spinalcom_1.SpinalDocument))
            throw new Error("File model not found for the given node.");
        return fileNode.setAsCurrentVersion(versionName);
    }
    //////////////////////////////////
    /**
     * Lists all paths in a file tree from a starting node.
     * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
     * @returns {Promise<IFileInfo[]>} File tree entries with path data.
     */
    async getAllPathsInTree(startNode) {
        return (0, files_1.convertFileInTreeToSpecialFormat)(startNode, undefined, "", false);
    }
    /**
     * Exports all files in a tree as buffers.
     * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<IFileInfo[]>} Converted file data.
     */
    async getFilesInTreeAsBuffer(startNode, hubUrl = "") {
        return (0, files_1.convertTreeToFileBuffers)(startNode, hubUrl);
    }
    /**
     * Exports all files in a tree to a specific format.
     * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
     * @param {fileFormat} format Output format.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<IFileInfo[]>} Converted file data.
     */
    async getFilesInTreeToSpecificFormat(startNode, format, hubUrl = "") {
        return (0, files_1.convertFileInTreeToSpecialFormat)(startNode, format, hubUrl, true);
    }
    /**
     * Converts a file to a `{ name, buffer }` structure.
     * @param {SpinalNode | SpinalDocument | SpinalFile} file File node/model.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<{ name: string; buffer: Buffer }>} Converted buffer payload.
     */
    async convertFileToBuffer(file, hubUrl = "") {
        return (0, files_1.convertFileToSpecialFormat)(file, "buffer", hubUrl).then((result) => {
            return { name: result.name, buffer: result.data };
        });
    }
    /**
     * Converts a file to the requested special format.
     * @param {SpinalNode | SpinalDocument | SpinalFile} file File node/model.
     * @param {fileFormat} format Output format.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<IFileInfo>} Converted file descriptor.
     */
    async convertFileToSpecialFormat(file, format, hubUrl = "") {
        return (0, files_1.convertFileToSpecialFormat)(file, format, hubUrl);
    }
    /**
     * Links a file to a business node through file explorer relation.
     * @param {SpinalNode} node Business node.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
     * @returns {Promise<SpinalNode | null>} First linked file node or null.
     */
    async linkFileToNode(node, fileNode) {
        let fileModel;
        if (fileNode instanceof spinal_model_graph_1.SpinalNode)
            fileModel = await (0, files_1.getFileModelFromNode)(fileNode);
        else
            fileModel = fileNode;
        const filesUploaded = await FileExplorer_1.FileExplorer.addFileUpload(node, fileModel);
        return filesUploaded[0] || null;
    }
    ///////////// file Linked to node functions
    /**
     * Gets files linked to a business node.
     * @param {SpinalNode} node Business node.
     * @returns {ReturnType<typeof FileExplorer.getFilesLinkedToNode>} Linked files.
     */
    async getFileLinkedToNode(node) {
        return FileExplorer_1.FileExplorer.getFilesLinkedToNode(node);
    }
    /**
     * Gets linked files as buffers.
     * @param {SpinalNode} node Business node.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<{ name: string; path: string; buffer: Buffer }[]>} Linked files as buffers.
     */
    async getFileLinkedToNodeAsBuffers(node, hubUrl = "") {
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node, false);
        if (!rootDirNode)
            return [];
        return (0, files_1.convertTreeToFileBuffers)(rootDirNode, hubUrl);
    }
    /**
     * Gets linked files converted to a specific format.
     * @param {SpinalNode} node Business node.
     * @param {fileFormat} format Output format.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<{ name: string; data: Buffer | string | NodeJS.ReadableStream }[]>} Converted linked files.
     */
    async getFileLinkedToNodeToSpecificFormat(node, format, hubUrl = "") {
        const rootDirNode = await (0, files_1._getOrCreateRootNode)(node, false);
        if (!rootDirNode)
            return [];
        return (0, files_1.convertFileInTreeToSpecialFormat)(rootDirNode, format, hubUrl, true);
    }
    /**
     * Gets parent nodes of a file.
     * @param {SpinalNode | SpinalDocument | SpinalFile} node File node/model.
     * @returns {Promise<SpinalNode[]>} Parent nodes.
     */
    async getFileParents(node) {
        return FileExplorer_1.FileExplorer.getFileParents(node);
    }
    ///////////// end of file Linked to node functions
    /**
     * Unlinks a file from a business node.
     * @param {SpinalNode} node Business node.
     * @param {SpinalNode} fileNode File node to unlink.
     * @returns {ReturnType<typeof FileExplorer.removeFileLinked>} Result of unlink operation.
     */
    async unlinkFileFromNode(node, fileNode) {
        return FileExplorer_1.FileExplorer.removeFileLinked(node, fileNode);
    }
    async _createNodeInContext(file, parent, relationName, contextNode) {
        // let node: SpinalNode | null = null;
        const node = await (0, files_1.createorGetFileNode)(file);
        if (!node)
            return null;
        await parent.addChildInContext(node, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE, contextNode);
        return node;
    }
    /**
     * Pushes a file into a directory list and adds corresponding graph relation.
     * @param {SpinalNode} directoryNode Directory node.
     * @param {SpinalDocument | SpinalFile} file File model to push.
     * @returns {Promise<SpinalNode | null>} Created child node relation or null.
     */
    static async pushFileToDirectory(directoryNode, file) {
        const fileNode = await (0, files_1.createorGetFileNode)(file);
        const directoryElement = await (0, files_1.getFileModelFromNode)(directoryNode);
        const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
        if (!list)
            throw new Error("Directory list not found or failed to load.");
        if (list instanceof spinal_core_connectorjs_type_1.Lst || list instanceof spinal_core_connectorjs_type_1.Directory) {
            const relationName = fileNode.getType().get() == constants_1.DIRECTORY_NODE_TYPE ? constants_1.TO_FOLDER_RELATION : constants_1.TO_FILE_RELATION;
            list.push(file);
            return directoryNode.addChild(fileNode, relationName, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        return null;
    }
    /**
     * Removes a file from a directory list.
     * @param {SpinalNode} directoryNode Directory node.
     * @param {SpinalDocument | SpinalFile | SpinalNode} file File node/model to remove.
     * @returns {Promise<boolean>} True if removed.
     */
    static async removeFileFromDirectory(directoryNode, file) {
        const directoryElement = await (0, files_1.getFileModelFromNode)(directoryNode);
        const fileModel = await (0, files_1.getFileModelFromNode)(file);
        if (!fileModel)
            return false;
        const list = await new Promise((resolve) => directoryElement?._ptr?.load((e) => resolve(e)));
        if (!list)
            return false;
        if (list instanceof spinal_core_connectorjs_type_1.Lst || list instanceof spinal_core_connectorjs_type_1.Directory) {
            for (let f of list) {
                if (f._server_id == fileModel._server_id) {
                    list.remove(f);
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Imports a SpinalDrive hierarchy into context using breadth-first traversal.
     * @param {SpinalContext} contextNode Destination context.
     * @param {SpinalNode} parentNode Parent node used as import root.
     * @param {SpinalDocument} startFile First file/directory to import.
     * @returns {Promise<SpinalNode[]>} All created nodes.
     */
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
            if (nodeType == constants_1.DIRECTORY_NODE_TYPE) {
                const children = await (0, files_1._getFileChildren)(file, node);
                queue.push(...children);
            }
            createdNodes.push(node);
        }
        return createdNodes;
    }
}
exports.SpinalDocumentary = SpinalDocumentary;
exports.default = SpinalDocumentary;
//# sourceMappingURL=Documentary.js.map
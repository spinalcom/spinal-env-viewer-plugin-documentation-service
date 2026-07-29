/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { fileFormat, FilesArgType, IFileInfo } from "../interfaces";
import { FileVersion, SpinalDocument } from "../models_spinalcom";
import { FileExplorer } from "./FileExplorer";
/**
 * Service class that manages documentation files and directories in a Spinal graph context.
 */
declare class SpinalDocumentary {
    constructor();
    /**
     * Creates and adds a documentary context to a graph.
     * @param {SpinalGraph} graph Graph that will contain the context.
     * @param {string} name Name of the context to create.
     * @returns {Promise<SpinalContext>} The created context.
     */
    createDocumentaryContext(graph: SpinalGraph, name: string): Promise<SpinalContext>;
    /**
     * Converts input files to Spinal documents and links them under a parent node in context.
     * @param {SpinalNode} parentNode Parent node receiving file links.
     * @param {FilesArgType} files File input(s) to convert.
     * @param {SpinalContext} contextNode Context where links are created.
     * @param {number} [chunkSize=-1] Optional chunk size used by file conversion.
     * @returns {Promise<SpinalNode[]>} Linked file nodes.
     */
    addFileToNodeInContext(parentNode: SpinalNode, files: FilesArgType, contextNode: SpinalContext, chunkSize?: number): Promise<SpinalNode[]>;
    /**
     * Adds an existing file node/model to a parent node in context.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File reference to add.
     * @param {SpinalNode} parentNode Parent node receiving the file.
     * @param {SpinalContext} contextNode Context where the link is created.
     * @returns {Promise<SpinalNode | null>} The created file node link, or null.
     */
    addExistingFileToContext(fileNode: SpinalNode | SpinalDocument | SpinalFile, parentNode: SpinalNode, contextNode: SpinalContext): Promise<SpinalNode | null>;
    /**
     * Removes a file from a context and optionally removes descendants.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model to remove.
     * @param {SpinalContext} contextNode Context from which the file is removed.
     * @param {{ unlinkRefs?: boolean; removeChildren?: boolean }} [options] Removal options.
     * @returns {Promise<boolean>} True when completed.
     */
    removeFileFromContext(fileNode: SpinalNode | SpinalDocument, contextNode: SpinalContext, options?: {
        unlinkRefs?: boolean;
        removeChildren?: boolean;
    }): Promise<boolean>;
    /**
     * Creates a directory and links it under a parent node in context.
     * @param {SpinalNode} parentNode Parent node receiving the directory.
     * @param {string} name Directory name.
     * @param {SpinalContext} [contextNode] Optional context for contextual linking.
     * @param {string} [icon="folder"] Icon metadata.
     * @returns {Promise<SpinalNode>} Linked directory node.
     */
    addDirectoryToNodeInContext(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon?: string): Promise<SpinalNode>;
    /**
     * Moves a document from a source parent to a target parent in context.
     * @param {SpinalNode | SpinalDocument | SpinalFile} documentToMove File to move.
     * @param {SpinalNode | SpinalDocument | SpinalFile} sourceNode Current parent node.
     * @param {SpinalNode | SpinalDocument | SpinalFile} targetNode Destination parent node.
     * @param {SpinalContext} contextNode Context where the move occurs.
     * @returns {Promise<boolean>} True on success, false otherwise.
     */
    moveDocumentInContext(documentToMove: SpinalNode | SpinalDocument | SpinalFile, sourceNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile, contextNode: SpinalContext): Promise<boolean>;
    /**
     * Gets the versions of a file.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
     * @returns {Promise<FileVersion[]>} Version history for the file.
     */
    getFileVersions(fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<FileVersion[]>;
    /**
     * Gets one version by its name.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
     * @param {string} versionName Version name to retrieve.
     * @returns {Promise<FileVersion | null>} Matching version or null.
     */
    getFileVersionByName(fileNode: SpinalNode | SpinalDocument | SpinalFile, versionName: string): Promise<FileVersion | null>;
    /**
     * Creates a new version from a buffer or file input.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model to update.
     * @param {Buffer | FilesArgType} buffer New content payload.
     * @param {string} [versionName] Optional version name.
     * @param {number} [chunkSize] Optional chunk size used by persistence.
     * @returns {Promise<FileVersion>} Created file version.
     */
    updateFileVersion(fileNode: SpinalNode | SpinalDocument, buffer: Buffer | FilesArgType, versionName?: string, chunkSize?: number): Promise<FileVersion>;
    /**
     * Removes a version from a file history.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model.
     * @param {string} versionName Version name to remove.
     * @returns {Promise<boolean>} True if version is removed.
     */
    removeFileVersion(fileNode: SpinalNode | SpinalDocument, versionName: string): Promise<boolean>;
    /**
     * Sets a version as the current version.
     * @param {SpinalNode | SpinalDocument} fileNode File node/model.
     * @param {string} versionName Version name to set as current.
     * @returns {Promise<FileVersion>} The new current version.
     */
    downgradeFileVersion(fileNode: SpinalNode | SpinalDocument, versionName: string): Promise<FileVersion>;
    /**
     * Lists all paths in a file tree from a starting node.
     * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
     * @returns {Promise<IFileInfo[]>} File tree entries with path data.
     */
    getAllPathsInTree(startNode: SpinalNode | SpinalDocument | SpinalFile): Promise<IFileInfo[]>;
    /**
     * Exports all files in a tree as buffers.
     * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<IFileInfo[]>} Converted file data.
     */
    getFilesInTreeAsBuffer(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<IFileInfo[]>;
    /**
     * Exports all files in a tree to a specific format.
     * @param {SpinalNode | SpinalDocument | SpinalFile} startNode Tree root.
     * @param {fileFormat} format Output format.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<IFileInfo[]>} Converted file data.
     */
    getFilesInTreeToSpecificFormat(startNode: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<IFileInfo[]>;
    /**
     * Converts a file to a `{ name, buffer }` structure.
     * @param {SpinalNode | SpinalDocument | SpinalFile} file File node/model.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<{ name: string; buffer: Buffer }>} Converted buffer payload.
     */
    convertFileToBuffer(file: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<{
        name: string;
        buffer: Buffer;
    }>;
    /**
     * Converts a file to the requested special format.
     * @param {SpinalNode | SpinalDocument | SpinalFile} file File node/model.
     * @param {fileFormat} format Output format.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<IFileInfo>} Converted file descriptor.
     */
    convertFileToSpecialFormat(file: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<IFileInfo>;
    /**
     * Links a file to a business node through file explorer relation.
     * @param {SpinalNode} node Business node.
     * @param {SpinalNode | SpinalDocument | SpinalFile} fileNode File node/model.
     * @returns {Promise<SpinalNode | null>} First linked file node or null.
     */
    linkFileToNode(node: SpinalNode, fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode | null>;
    /**
     * Gets files linked to a business node.
     * @param {SpinalNode} node Business node.
     * @returns {ReturnType<typeof FileExplorer.getFilesLinkedToNode>} Linked files.
     */
    getFileLinkedToNode(node: SpinalNode): ReturnType<typeof FileExplorer.getFilesLinkedToNode>;
    /**
     * Gets linked files as buffers.
     * @param {SpinalNode} node Business node.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<{ name: string; path: string; buffer: Buffer }[]>} Linked files as buffers.
     */
    getFileLinkedToNodeAsBuffers(node: SpinalNode, hubUrl?: string): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    /**
     * Gets linked files converted to a specific format.
     * @param {SpinalNode} node Business node.
     * @param {fileFormat} format Output format.
     * @param {string} [hubUrl=""] Optional hub URL.
     * @returns {Promise<{ name: string; data: Buffer | string | NodeJS.ReadableStream }[]>} Converted linked files.
     */
    getFileLinkedToNodeToSpecificFormat(node: SpinalNode, format: fileFormat, hubUrl?: string): Promise<{
        name: string;
        data: Buffer | string | NodeJS.ReadableStream;
    }[]>;
    /**
     * Gets parent nodes of a file.
     * @param {SpinalNode | SpinalDocument | SpinalFile} node File node/model.
     * @returns {Promise<SpinalNode[]>} Parent nodes.
     */
    getFileParents(node: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode[]>;
    /**
     * Unlinks a file from a business node.
     * @param {SpinalNode} node Business node.
     * @param {SpinalNode} fileNode File node to unlink.
     * @returns {ReturnType<typeof FileExplorer.removeFileLinked>} Result of unlink operation.
     */
    unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode): Promise<boolean>;
    private _createNodeInContext;
    /**
     * Pushes a file into a directory list and adds corresponding graph relation.
     * @param {SpinalNode} directoryNode Directory node.
     * @param {SpinalDocument | SpinalFile} file File model to push.
     * @returns {Promise<SpinalNode | null>} Created child node relation or null.
     */
    static pushFileToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<SpinalNode | null>;
    /**
     * Removes a file from a directory list.
     * @param {SpinalNode} directoryNode Directory node.
     * @param {SpinalDocument | SpinalFile | SpinalNode} file File node/model to remove.
     * @returns {Promise<boolean>} True if removed.
     */
    static removeFileFromDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile | SpinalNode): Promise<boolean>;
    /**
     * Imports a SpinalDrive hierarchy into context using breadth-first traversal.
     * @param {SpinalContext} contextNode Destination context.
     * @param {SpinalNode} parentNode Parent node used as import root.
     * @param {SpinalDocument} startFile First file/directory to import.
     * @returns {Promise<SpinalNode[]>} All created nodes.
     */
    importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalDocument): Promise<SpinalNode[]>;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalContext, SpinalGraph, SpinalNode } from "spinal-model-graph";
import { fileFormat, FilesArgType, IFileInfo } from "../interfaces";
import { FileVersion, SpinalDocument } from "../models_spinalcom";
import { FileExplorer } from "./FileExplorer";
declare class SpinalDocumentary {
    constructor();
    createDocumentaryContext(graph: SpinalGraph, name: string): Promise<SpinalContext>;
    addFileToNodeInContext(parentNode: SpinalNode, files: FilesArgType, contextNode: SpinalContext, chunkSize?: number): Promise<SpinalNode[]>;
    addExistingFileToContext(fileNode: SpinalNode | SpinalDocument | SpinalFile, parentNode: SpinalNode, contextNode: SpinalContext): Promise<SpinalNode | null>;
    removeFileFromContext(fileNode: SpinalNode | SpinalDocument, contextNode: SpinalContext, unlinkRefs?: boolean): Promise<boolean>;
    addDirectoryToNodeInContext(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon?: string): Promise<SpinalNode>;
    moveDocumentInContext(documentToMove: SpinalNode | SpinalDocument | SpinalFile, sourceNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile, contextNode: SpinalContext): Promise<boolean>;
    getFileVersions(fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<FileVersion[]>;
    getFileVersionByName(fileNode: SpinalNode | SpinalDocument | SpinalFile, versionName: string): Promise<FileVersion | null>;
    updateFileVersion(fileNode: SpinalNode | SpinalDocument, buffer: Buffer | FilesArgType, versionName?: string, chunkSize?: number): Promise<FileVersion>;
    removeFileVersion(fileNode: SpinalNode | SpinalDocument, versionName: string): Promise<boolean>;
    downgradeFileVersion(fileNode: SpinalNode | SpinalDocument, versionName: string): Promise<FileVersion>;
    getAllPathsInTree(startNode: SpinalNode | SpinalDocument | SpinalFile): Promise<IFileInfo[]>;
    getFilesInTreeAsBuffer(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<IFileInfo[]>;
    getFilesInTreeToSpecificFormat(startNode: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<IFileInfo[]>;
    convertFileToBuffer(file: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<{
        name: string;
        buffer: Buffer;
    }>;
    convertFileToSpecialFormat(file: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<IFileInfo>;
    linkFileToNode(node: SpinalNode, fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode | null>;
    getFileLinkedToNode(node: SpinalNode): ReturnType<typeof FileExplorer.getFilesLinkedToNode>;
    getFileLinkedToNodeAsBuffers(node: SpinalNode, hubUrl?: string): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    getFileLinkedToNodeToSpecificFormat(node: SpinalNode, format: fileFormat, hubUrl?: string): Promise<{
        name: string;
        data: Buffer | string | NodeJS.ReadableStream;
    }[]>;
    getFileParents(node: SpinalNode | SpinalDocument | SpinalFile): Promise<SpinalNode[]>;
    unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode): Promise<boolean>;
    private _createNodeInContext;
    static pushFileToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<SpinalNode | null>;
    static removeFileFromDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile | SpinalNode): Promise<boolean>;
    importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalDocument): Promise<SpinalNode[]>;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

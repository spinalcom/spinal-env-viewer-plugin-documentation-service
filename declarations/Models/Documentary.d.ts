/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalContext, SpinalNode } from "spinal-model-graph";
import { fileFormat, FilesArgType } from "../interfaces";
import { FileVersion, SpinalDocument } from "../models_spinalcom";
import { FileExplorer } from "./FileExplorer";
declare class SpinalDocumentary {
    constructor();
    addFileToNodeInContext(parentNode: SpinalNode, files: FilesArgType, contextNode: SpinalContext, chunkSize?: number): Promise<SpinalNode[]>;
    removeFileFromContext(fileNode: SpinalNode | SpinalDocument): Promise<boolean>;
    addDirectoryToNodeInContext(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon?: string): Promise<SpinalNode>;
    moveDocumentInContext(documentToMove: SpinalNode | SpinalDocument | SpinalFile, sourceNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile, contextNode: SpinalContext): Promise<boolean>;
    getFileVersions(fileNode: SpinalNode | SpinalDocument | SpinalFile): Promise<FileVersion[]>;
    updateFileVersion(fileNode: SpinalNode | SpinalDocument, buffer: Buffer | FilesArgType, versionName?: string, chunkSize?: number): Promise<FileVersion>;
    importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalDocument): Promise<SpinalNode[]>;
    getFilesInTreeAsBuffer(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    getFilesInTreeToSpecificFormat(startNode: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<{
        name: string;
        path: string;
        data: Buffer | string | NodeJS.ReadableStream;
    }[]>;
    convertFileToBuffer(file: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<{
        name: string;
        buffer: Buffer;
    }>;
    convertFileToSpecialFormat(file: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<{
        name: string;
        data: Buffer | string | NodeJS.ReadableStream;
    }>;
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
    unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode): Promise<boolean>;
    private _createNodeInContext;
    static pushFileToDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<SpinalNode | null>;
    static removeFileFromDirectory(directoryNode: SpinalNode, file: SpinalDocument | SpinalFile): Promise<boolean>;
    moveDocument(documentToMove: SpinalNode | SpinalDocument | SpinalFile, sourceNode: SpinalNode | SpinalDocument | SpinalFile, targetNode: SpinalNode | SpinalDocument | SpinalFile): Promise<boolean>;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

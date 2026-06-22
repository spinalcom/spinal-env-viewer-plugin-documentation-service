/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { fileFormat, FilesArgType, IFileBufferInfo, IFileFormattedInfo } from "../interfaces";
import { SpinalDocument } from "../models_spinalcom/SpinalDocument";
import { FileVersion } from "../models_spinalcom/FileVersion";
export declare function convertFileToSpinalDocument(files: FilesArgType, chunkSize?: number): Promise<(SpinalDocument | SpinalFile)[]>;
export declare function convertFileToBuffer(file: any): Promise<Buffer>;
export declare function addSpinalDocumentAsNodeChild(parentNode: SpinalNode, spinalDocumentNode: SpinalNode, relationName: string, contextNode?: SpinalContext): Promise<SpinalNode>;
export declare function getFileModelFromNode(node: SpinalNode): Promise<SpinalDocument | SpinalFile | undefined>;
export declare function getFilesFromDirectory(directoryNode: SpinalFile | SpinalDocument): Promise<(SpinalDocument | SpinalFile)[]>;
export declare function createorGetFileNode(file: SpinalDocument | SpinalFile | SpinalNode): Promise<SpinalNode>;
export declare function _getFileChildren(file: SpinalDocument | SpinalFile, parentNode: SpinalNode): Promise<{
    file: SpinalDocument;
    parent: SpinalNode;
}[]>;
export declare function _getFileAttributes(file: SpinalDocument | SpinalFile): Promise<{
    name: string;
    nodeType: string;
    relationName: string;
}>;
export declare function _getFileAsBuffer(file: SpinalDocument | SpinalNode | SpinalFile, hubUrl?: string): Promise<Buffer>;
export declare function getPathData(dynamicId: number, hubUrl?: string): Promise<Buffer>;
export declare function convertFileInTreeToSpecialFormat(startNode: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<IFileFormattedInfo[]>;
export declare function convertFileToSpecialFormat(file: SpinalNode | SpinalDocument | SpinalFile, format: fileFormat, hubUrl?: string): Promise<{
    name: string;
    serverId: number;
    data: Buffer | string | NodeJS.ReadableStream;
}>;
export declare function convertTreeToFileBuffers(startNode: SpinalNode | SpinalDocument | SpinalFile, hubUrl?: string): Promise<IFileBufferInfo[]>;
export declare function _getOrCreateRootNode(node: SpinalNode, createIfNotExist?: boolean): Promise<SpinalNode | null>;
export declare function removeFileNode(fileNode: SpinalNode): Promise<boolean>;
export declare function isFileVersion(fileVersion: any): fileVersion is FileVersion;

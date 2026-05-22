/// <reference types="node" />
/// <reference types="node" />
import { Directory as SpinalDirectory, File } from "spinal-core-connectorjs_type";
import { SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { FilesArgType } from "../interfaces";
import { SpinalFile } from "../models_spinalcom/SpinalFileModel";
export declare function convertFileToSpinalFile(files: FilesArgType, chunkSize?: number): SpinalFile[];
export declare function addChildrenToNode(parentNode: SpinalNode, childNode: SpinalNode, relationName: string, contextNode?: SpinalContext): Promise<SpinalNode>;
export declare function getFilesFromDirectory(directoryNode: File): Promise<(SpinalFile | SpinalDirectory)[]>;
export declare function createFileNode(file: SpinalFile): Promise<SpinalNode>;
export declare function _getFileChildren(file: File, parentNode: SpinalNode): Promise<{
    file: SpinalFile;
    parent: SpinalNode;
}[]>;
export declare function _getFileAttributes(file: File): Promise<{
    name: string;
    nodeType: string;
    relationName: string;
}>;
export declare function _getFileAsBuffer(file: SpinalFile | SpinalNode | File, hubUrl?: string): Promise<Buffer>;
export declare function getPathData(dynamicId: number, hubUrl?: string): Promise<Buffer>;
export declare function convertTreeToFileBuffers(startNode: SpinalNode<any>, hubUrl?: string): Promise<{
    name: string;
    serverId: number;
    path: string;
    buffer: Buffer;
}[]>;
export declare function _getOrCreateRootNode(node: SpinalNode, createIfNotExist?: boolean): Promise<SpinalNode | null>;
export declare function removeFileNode(fileNode: SpinalNode): Promise<boolean>;

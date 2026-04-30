/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile, Directory as SpinalDirectory } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
import { FilesArgType } from '../interfaces';
export declare function convertFileToSpinalFile(files: FilesArgType): SpinalFile[];
export declare function addChildrenToNode(parentNode: SpinalNode, childNode: SpinalNode, relationName: string, contextNode: SpinalContext): Promise<SpinalNode>;
export declare function getFilesFromDirectory(directoryNode: SpinalFile): Promise<(SpinalFile | SpinalDirectory)[]>;
export declare function createFileNode(file: SpinalFile): SpinalNode;
export declare function _getFileChildren(file: SpinalFile<any>, parentNode: SpinalNode): Promise<{
    file: SpinalFile;
    parent: SpinalNode;
}[]>;
export declare function _getFileAttributes(file: SpinalFile<any>): Promise<{
    name: string;
    nodeType: string;
    relationName: string;
}>;
export declare function _getFileAsBuffer(file: SpinalFile, hubUrl?: string): Promise<Buffer>;
export declare function convertTreeToFileBuffers(startNode: SpinalNode<any>): Promise<{
    name: string;
    path: string;
    buffer: Buffer;
}[]>;

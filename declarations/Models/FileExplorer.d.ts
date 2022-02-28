/// <reference types="node" />
import { SpinalNode } from "spinal-env-viewer-graph-service";
export declare class FileExplorer {
    static getDirectory(selectedNode: SpinalNode<any>): Promise<spinal.Directory<any>>;
    static getNbChildren(selectedNode: SpinalNode<any>): Promise<number>;
    static createDirectory(selectedNode: SpinalNode<any>): Promise<spinal.Directory<any>>;
    static _getFileType(file: any): string;
    static addFileUpload(directory: spinal.Directory<any>, files: (File | {
        name: string;
        buffer: Buffer;
    })[] | FileList | any): spinal.File<any>[];
    static uploadFiles(node: SpinalNode<any>, files: (File | {
        name: string;
        buffer: Buffer;
    })[] | FileList | any): Promise<spinal.File<any>[]>;
    static _getOrCreateFileDirectory(node: SpinalNode<any>): Promise<spinal.Directory<any>>;
}

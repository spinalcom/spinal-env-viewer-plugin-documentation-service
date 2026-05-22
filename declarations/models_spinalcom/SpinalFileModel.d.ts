/// <reference types="node" />
/// <reference types="node" />
import { File, Directory } from "spinal-core-connectorjs";
import { SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { IFileBufferInfo } from "../interfaces";
import FileVersion from "./FileVersion";
export default class SpinalFile extends File {
    private _node;
    constructor(name?: string, initialVersion?: FileVersion | Directory, info?: {
        [key: string]: any;
    });
    updateVersion(buffer: Buffer, hubUrl?: string, chunkSize?: number): Promise<void>;
    getCurrentVersion(): Promise<FileVersion>;
    getCurrentVersionAsBuffer(hubUrl?: string): Promise<Buffer>;
    getVersionHistory(): Promise<FileVersion[]>;
    linkToNode(parentNode: SpinalNode, contextNode?: SpinalContext): Promise<SpinalNode>;
    remove(): Promise<boolean>;
    getNode(): Promise<SpinalNode | null>;
    static getFileModelFromNode(node: SpinalNode): Promise<SpinalFile | undefined>;
    getParentNodes(): Promise<SpinalNode<any>[]>;
    getFilesTreeAsBuffers(hubUrl?: string): Promise<IFileBufferInfo[]>;
    createNode(): Promise<SpinalNode>;
    isDirectory(): boolean;
    private _addNodeToInfo;
    private _loadVersionHistory;
}
export { SpinalFile };

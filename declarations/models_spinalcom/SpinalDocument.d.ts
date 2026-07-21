/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile, Directory, Lst } from "spinal-core-connectorjs";
import { SpinalContext, SpinalNode } from "spinal-env-viewer-graph-service";
import { FilesArgType, IFileBufferInfo } from "../interfaces";
import FileVersion from "./FileVersion";
export default class SpinalDocument extends SpinalFile {
    private _node;
    constructor(name?: string, initialVersion?: FileVersion | Directory | Lst, info?: {
        [key: string]: any;
    });
    getDirectoryElement(): Promise<Directory | Lst | null>;
    updateVersion(buffer: Buffer | FilesArgType, versionName?: string, chunkSize?: number): Promise<FileVersion>;
    getCurrentVersion(): Promise<FileVersion>;
    getCurrentVersionAsBuffer(hubUrl?: string): Promise<Buffer>;
    removeVersion(versionName: string): Promise<boolean>;
    getVersionByName(versionName: string): Promise<FileVersion | null>;
    getVersionHistory(): Promise<FileVersion[]>;
    linkToNode(parentNode: SpinalNode, contextNode?: SpinalContext): Promise<SpinalNode>;
    remove(unlinkToAll?: boolean): Promise<boolean>;
    removeFromParent(parentNode: SpinalNode): Promise<boolean>;
    removeFromContext(contextNode: SpinalContext): Promise<boolean>;
    removeAllLinks(): Promise<boolean>;
    getNode(): Promise<SpinalNode | null>;
    getParentNodes(): Promise<SpinalNode<any>[]>;
    getFilesTreeAsBuffers(hubUrl?: string): Promise<IFileBufferInfo[]>;
    createNode(): Promise<SpinalNode>;
    isDirectory(): boolean;
    private _addNodeToInfo;
    private _loadVersionHistory;
}
export { SpinalDocument };

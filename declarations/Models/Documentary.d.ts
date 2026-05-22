/// <reference types="node" />
/// <reference types="node" />
import { SpinalContext, SpinalNode } from "spinal-model-graph";
import { FilesArgType } from "../interfaces";
import { SpinalDocument } from "../models_spinalcom";
declare class SpinalDocumentary {
    constructor();
    addFileToNode(parentNode: SpinalNode, files: FilesArgType, contextNode?: SpinalContext, chunkSize?: number): Promise<SpinalNode[]>;
    removeFile(fileNode: SpinalNode | SpinalDocument): Promise<boolean>;
    createDirectoryNode(parentNode: SpinalNode, name: string, contextNode?: SpinalContext, icon?: string): Promise<SpinalNode>;
    importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalDocument): Promise<SpinalNode[]>;
    getFilesInTreeAsBuffer(startNode: SpinalNode, hubUrl?: string): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    convertFileToBuffer(file: SpinalNode | SpinalDocument, hubUrl?: string): Promise<{
        name: string;
        buffer: Buffer;
    }>;
    linkFileToNode(node: SpinalNode, fileNode: SpinalNode): Promise<SpinalNode<any>>;
    getFileLinkedToNode(node: SpinalNode): Promise<SpinalNode[]>;
    getFileLinkedToNodeAsBuffers(node: SpinalNode, hubUrl?: string): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    unlinkFileFromNode(node: SpinalNode, fileNode: SpinalNode): Promise<void>;
    private _createNodeInContext;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

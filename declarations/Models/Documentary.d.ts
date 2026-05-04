/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { FilesArgType } from '../interfaces';
declare class SpinalDocumentary {
    constructor();
    createFileNode(contextNode: SpinalContext, parentNode: SpinalNode, files: FilesArgType): Promise<SpinalNode[]>;
    removeFile(fileNode: SpinalNode): Promise<boolean>;
    createDirectoryNode(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon?: string): Promise<SpinalNode>;
    importFilesFromSpinalDrive(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalFile): Promise<SpinalNode[]>;
    getFilesInTreeAsBuffer(startNode: SpinalNode, hubUrl?: string): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    convertFileToBuffer(file: SpinalNode | SpinalFile, hubUrl?: string): Promise<{
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

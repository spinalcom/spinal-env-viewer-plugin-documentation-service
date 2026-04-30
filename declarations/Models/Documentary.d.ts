/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { FilesArgType } from '../interfaces';
declare class SpinalDocumentary {
    constructor();
    createFileNode(contextNode: SpinalContext, parentNode: SpinalNode, files: FilesArgType): Promise<SpinalNode[]>;
    createDirectoryNode(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon?: string): Promise<SpinalNode>;
    importFilesFromDirectory(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalFile): Promise<SpinalNode[]>;
    getFilesAsBuffer(startNode: SpinalNode): Promise<{
        name: string;
        path: string;
        buffer: Buffer;
    }[]>;
    convertFileToBuffer(file: SpinalNode | SpinalFile, hubUrl?: string): Promise<{
        name: string;
        buffer: Buffer;
    }>;
    private _createNodeInContext;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

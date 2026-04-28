/// <reference types="node" />
/// <reference types="node" />
import { File as SpinalFile } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
export type FilesArgType = (SpinalFile | {
    name: string;
    buffer: Buffer;
})[] | FileList | any;
export declare function convertFileToSpinalFile(files: FilesArgType): SpinalFile[];
export declare function addChildrenToNode(parentNode: SpinalNode, childNode: SpinalNode, relationName: string, contextNode: SpinalContext): Promise<SpinalNode>;

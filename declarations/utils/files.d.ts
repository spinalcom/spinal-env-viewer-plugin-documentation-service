import { File as SpinalFile, Directory as SpinalDirectory } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
import { FilesArgType } from '../interfaces';
export declare function convertFileToSpinalFile(files: FilesArgType): SpinalFile[];
export declare function addChildrenToNode(parentNode: SpinalNode, childNode: SpinalNode, relationName: string, contextNode: SpinalContext): Promise<SpinalNode>;
export declare function getFilesFromDirectory(directoryNode: SpinalFile): Promise<(SpinalFile | SpinalDirectory)[]>;

import { File as SpinalFile } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { FilesArgType } from '../interfaces';
declare class SpinalDocumentary {
    constructor();
    createFileNode(contextNode: SpinalContext, parentNode: SpinalNode, files: FilesArgType): Promise<SpinalNode[]>;
    createDirectoryNode(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon?: string): Promise<SpinalNode>;
    importFilesFromDirectory(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalFile): Promise<SpinalNode[]>;
    private _getFileChildren;
    private _createNodeInContext;
    private _getFileAttributes;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

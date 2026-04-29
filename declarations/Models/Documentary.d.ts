import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { FilesArgType } from '../interfaces';
declare class SpinalDocumentary {
    constructor();
    createFileNode(contextNode: SpinalContext, parentNode: SpinalNode, files: FilesArgType): Promise<SpinalNode[]>;
    createDirectoryNode(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon?: string): Promise<SpinalNode>;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

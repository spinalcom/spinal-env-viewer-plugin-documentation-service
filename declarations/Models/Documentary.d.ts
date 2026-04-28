import { SpinalContext, SpinalNode } from 'spinal-model-graph';
import { FilesArgType } from '../interfaces';
declare class SpinalDocumentary {
    constructor();
    createFile(contextNode: SpinalContext, parentNode: SpinalNode, file: FilesArgType): Promise<SpinalNode[]>;
    createDirectory(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon?: string): Promise<SpinalNode>;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

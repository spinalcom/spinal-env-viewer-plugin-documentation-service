import { File as SpinalFile } from 'spinal-core-connectorjs_type';
import { SpinalContext, SpinalNode } from 'spinal-model-graph';
declare class SpinalDocumentary {
    constructor();
    createFile(contextNode: SpinalContext, parentNode: SpinalNode, file: SpinalFile): Promise<SpinalNode[]>;
    createDirectory(contextNode: SpinalContext, parentNode: SpinalNode, name: string): Promise<SpinalNode>;
}
export { SpinalDocumentary };
export default SpinalDocumentary;

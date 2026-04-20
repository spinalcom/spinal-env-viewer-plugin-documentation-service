import type { SpinalNode } from 'spinal-env-viewer-graph-service';
import type { Lst } from 'spinal-core-connectorjs';
import type { SpinalAttribute } from 'spinal-models-documentation';
export interface ICategory {
    nameCat: string;
    node: SpinalNode;
    element: Lst<SpinalAttribute>;
}

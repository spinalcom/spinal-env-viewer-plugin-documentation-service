import type { SpinalNode } from 'spinal-env-viewer-graph-service';
export interface ICategory {
    nameCat: string;
    node: SpinalNode<any>;
    element: spinal.Lst<any>;
}

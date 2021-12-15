import { SpinalNode } from "spinal-model-graph";
import { SpinalURL } from "spinal-models-documentation";
import { IUrl } from "../interfaces";
declare class UrlService {
    constructor();
    addURL(node: SpinalNode<any>, urlName: string, urlLink: string): Promise<IUrl>;
    getURL(node: SpinalNode<any>, urlName?: string): Promise<IUrl | IUrl[]>;
    updateUrl(argNode: SpinalNode<any>, label: string, newValue: string): Promise<IUrl>;
    getParents(node: SpinalNode<any>, url_relationNames: Array<string>): Promise<SpinalNode<any>[]>;
    getParentGroup(node: SpinalNode<any>): Promise<SpinalNode<any>[]>;
    deleteURL(node: SpinalNode<any>, label: string): Promise<void>;
    getSharedUrls(node: SpinalNode<any>): Promise<{
        node: SpinalNode<any>;
        urls: SpinalURL[];
    }[]>;
    _getUrlData(urlNode: any, urlName?: string): Promise<IUrl>;
}
declare const urlService: UrlService;
export { UrlService, urlService };
export default UrlService;

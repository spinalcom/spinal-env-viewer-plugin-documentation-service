import { SpinalNode } from 'spinal-model-graph';
import { SpinalURL } from 'spinal-models-documentation';
import type { IUrl } from '../interfaces';
declare class UrlService {
    constructor();
    /**
     * @param {SpinalNode<any>} node
     * @param {string} urlName
     * @param {string} urlLink
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    addURL(node: SpinalNode<any>, urlName: string, urlLink: string): Promise<IUrl>;
    /**
     * @param {SpinalNode<any>} node
     * @param {string} [urlName]
     * @return {*}  {(Promise<IUrl | IUrl[]>)}
     * @memberof UrlService
     */
    getURL(node: SpinalNode<any>, urlName?: string): Promise<IUrl | IUrl[]>;
    /**
     * @param {SpinalNode<any>} argNode
     * @param {string} label
     * @param {string} newValue
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    updateUrl(argNode: SpinalNode<any>, label: string, newValue: string): Promise<IUrl>;
    /**
     * @param {SpinalNode<any>} node
     * @param {Array<string>} url_relationNames
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof UrlService
     */
    getParents(node: SpinalNode<any>, url_relationNames: Array<string>): Promise<SpinalNode<any>[]>;
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof UrlService
     */
    getParentGroup(node: SpinalNode<any>): Promise<SpinalNode<any>[]>;
    /**
     * @param {SpinalNode<any>} node
     * @param {string} label
     * @return {*}  {Promise<void>}
     * @memberof UrlService
     */
    deleteURL(node: SpinalNode<any>, label: string): Promise<void>;
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<{ node: SpinalNode<any>; urls: SpinalURL[] }[]>}
     * @memberof UrlService
     */
    getSharedUrls(node: SpinalNode<any>): Promise<{
        node: SpinalNode<any>;
        urls: SpinalURL[];
    }[]>;
    /**
     * @param {*} urlNode
     * @param {string} [urlName]
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    _getUrlData(urlNode: any, urlName?: string): Promise<IUrl>;
}
declare const urlService: UrlService;
export { UrlService, urlService };
export default UrlService;

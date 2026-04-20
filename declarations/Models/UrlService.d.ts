import type { IUrl } from '../interfaces';
import { SpinalNode } from 'spinal-model-graph';
import { SpinalURL } from 'spinal-models-documentation';
declare class UrlService {
    constructor();
    /**
     * @param {SpinalNode} node
     * @param {string} urlName
     * @param {string} urlLink
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    addURL(node: SpinalNode, urlName: string, urlLink: string): Promise<IUrl>;
    /**
     * @param {SpinalNode} node
     * @param {string} urlName
     * @return {*}  {(Promise<IUrl | undefined>)}
     * @memberof UrlService
     */
    getURL(node: SpinalNode, urlName: string): Promise<IUrl | undefined>;
    /**
     * @param {SpinalNode} node
     * @param {string} urlName
     * @return {*}  {Promise<IUrl | undefined | IUrl[]>}
     * @memberof UrlService
     */
    getURL(node: SpinalNode): Promise<IUrl[]>;
    /**
     * @param {SpinalNode} argNode
     * @param {string} label
     * @param {string} newValue
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    updateUrl(argNode: SpinalNode, label: string, newValue: string): Promise<IUrl | undefined>;
    /**
     * @param {SpinalNode} node
     * @param {Array<string>} url_relationNames
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof UrlService
     * @deprecated
     */
    getParents(node: SpinalNode, url_relationNames: Array<string>): Promise<SpinalNode[]>;
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof UrlService
     * @deprecated
     */
    getParentGroup(node: SpinalNode): Promise<SpinalNode[]>;
    /**
     * @param {SpinalNode} node
     * @param {string} label
     * @return {*}  {Promise<void>}
     * @memberof UrlService
     */
    deleteURL(node: SpinalNode, label: string): Promise<void>;
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<{ node: SpinalNode; urls: SpinalURL[] }[]>}
     * @memberof UrlService
     */
    getSharedUrls(node: SpinalNode): Promise<{
        node: SpinalNode;
        urls: SpinalURL[];
    }[]>;
    /**
     * @param {*} urlNode
     * @param {string} [urlName]
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    _getUrlData(urlNode: any): Promise<IUrl>;
}
declare const urlService: UrlService;
export { UrlService, urlService };
export default UrlService;

declare class UrlService {
    constructor();
    addURL(node: any, urlName: string, urlLink: string): Promise<any>;
    getURL(node: any, urlName?: string): Promise<any>;
    getParents(node: any, url_relationNames: Array<string>): any;
    getParentGroup(node: any): any;
    deleteURL(node: any, label: string): Promise<void>;
    _getUrlData(urlNode: any, urlName?: string): Promise<any>;
}
export default UrlService;

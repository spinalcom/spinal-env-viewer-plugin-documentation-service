/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import { SpinalNode, SpinalGraph, SpinalContext, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-model-graph";
import { SpinalURL } from "spinal-models-documentation";

import { URL_RELATION, URL_TYPE } from './constants';
import { IUrl } from "../interfaces";

class UrlService {

    constructor() { }

    public async addURL(node: SpinalNode<any>, urlName: string, urlLink: string): Promise<IUrl> {
        urlName = urlName && urlName.trim().toLowerCase();
        urlLink = urlLink && urlLink.trim().toLowerCase();

        const urlNameIsValid: boolean = urlName && urlName.length > 0;
        const urlLinkIsValid: boolean = urlLink && urlLink.length > 0;
        if (!(urlNameIsValid && urlLinkIsValid)) throw new Error("name or link is invalid");

        const urlExist = await this.getURL(node, urlName);

        if (urlExist) throw new Error(`${urlName} already exist in ${node.getName().get()}`);

        const urlModel = new SpinalURL(urlName, urlLink);

        const urlNode = await node.addChild(urlModel, URL_RELATION, SPINAL_RELATION_PTR_LST_TYPE);

        if (urlNode && urlNode.info) {
            urlNode.info.name.set(`[URL] ${urlName}`);
            urlNode.info.type.set(URL_TYPE);
            return this._getUrlData(urlNode);
        }
    }

    public async getURL(node: SpinalNode<any>, urlName?: string): Promise<IUrl | IUrl[]> {

        const urlNodes = await node.getChildren(URL_RELATION);
        const promises = [];

        for (const urlNode of urlNodes) {
            promises.push(this._getUrlData(urlNode, urlName));
        }

        const values = await Promise.all(promises);
        if (urlName && urlName.trim().length) {
            return values.find(({ element }) => {
                const elementName = element.name.get();
                return elementName.trim().toLowerCase() === urlName.trim().toLowerCase()
            })
        }
        return values;
    }

    public async updateUrl(argNode: SpinalNode<any>, label: string, newValue: string): Promise<IUrl> {
        let _url = await this.getURL(argNode, label);
        let url = Array.isArray(_url) ? _url[0] : _url;

        if (url) {
            const { node, element } = url;

            if (node && element) {
                const elementUrl = element.URL.get();
                const _newValue = newValue.trim().toLowerCase();
                if (!!_newValue && elementUrl.trim().toLowerCase() !== _newValue) element.URL.set(_newValue);
            }

            return url;
        }
    }

    public getParents(node: SpinalNode<any>, url_relationNames: Array<string>) {
        return node.getParents(url_relationNames);
    }

    public getParentGroup(node: SpinalNode<any>) {
        return this.getParents(node, [])
    }

    public async deleteURL(node: SpinalNode<any>, label: string): Promise<void> {
        // const nodeValid: boolean = node instanceof SpinalNode || node instanceof SpinalContext || node instanceof SpinalGraph;
        // if (!nodeValid) return;

        const url = await this.getURL(node, label);
        if (Array.isArray(url)) return;

        if (url && url.node) {
            return url.node.removeFromGraph();
        }
    }

    public async getSharedUrls(node: SpinalNode<any>): Promise<{ node: SpinalNode<any>; urls: SpinalURL[] }[]> {
        const parents = await node.getParents();
        const promises = parents.map(async parent => {
            let _urls = await this.getURL(parent);
            _urls = Array.isArray(_urls) ? _urls : [_urls];
            return {
                node: parent,
                urls: _urls.map(el => el.element)
            }
        })

        return Promise.all(promises);
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                                     PRIVATES                                 //
    //////////////////////////////////////////////////////////////////////////////////

    public async _getUrlData(urlNode: any, urlName?: string): Promise<IUrl> {
        const element = await urlNode.getElement();
        // const elementName = element.name.get();

        // if (urlName && urlName.trim().length > 0 && elementName && elementName.trim().toLowerCase() !== urlName.trim().toLowerCase()) return;

        return {
            element: element,
            node: urlNode
        }
    }

}

const urlService = new UrlService;

export {
    UrlService,
    urlService
}
export default UrlService;
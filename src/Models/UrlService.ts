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
import * as documentationModel from "spinal-models-documentation";

import { URL_RELATION, URL_TYPE } from './constants';

class UrlService {

    constructor() { }

    public async addURL(node: any, urlName: string, urlLink: string): Promise<any> {
        const urlNameIsValid: boolean = urlName && urlName.trim().length > 0;
        const urlLinkIsValid: boolean = urlLink && urlLink.trim().length > 0;
        const nodeValid: boolean = node instanceof SpinalNode || node instanceof SpinalContext || node instanceof SpinalGraph;

        if (!(urlNameIsValid && urlLinkIsValid && nodeValid)) return;

        const urlModel = new documentationModel.SpinalURL(urlName, urlLink);

        const urlNode = await node.addChild(urlModel, URL_RELATION, SPINAL_RELATION_PTR_LST_TYPE);

        if (urlNode && urlNode.info) {
            urlNode.info.name.set(`[URL] ${urlName}`);
            urlNode.info.type.set(URL_TYPE);
            return urlNode;
        }
    }

    public async getURL(node: any, urlName?: string): Promise<any> {
        const nodeValid: boolean = node instanceof SpinalNode || node instanceof SpinalContext || node instanceof SpinalGraph;
        if (!nodeValid) return;

        const urlNodes = await node.getChildren(URL_RELATION);
        const promises = [];

        for (const urlNode of urlNodes) {
            promises.push(this._getUrlData(urlNode, urlName));
        }

        const values = await Promise.all(promises);

        return urlName && urlName.trim().length > 0 ? values.filter(el => typeof el !== "undefined")[0] : values;
    }

    public getParents(node: any, url_relationNames: Array<string>) {
        const nodeValid: boolean = node instanceof SpinalNode || node instanceof SpinalContext || node instanceof SpinalGraph;
        if (!nodeValid) return Promise.resolve([]);

        return node.getParents(url_relationNames);
    }

    public getParentGroup(node: any) {
        const nodeValid: boolean = node instanceof SpinalNode || node instanceof SpinalContext || node instanceof SpinalGraph;

        return this.getParents(node, [])

    }

    public async deleteURL(node: any, label: string) {
        const nodeValid: boolean = node instanceof SpinalNode || node instanceof SpinalContext || node instanceof SpinalGraph;
        if (!nodeValid) return;

        const url = await this.getURL(node, label);

        if (url && url.node) url.node.removeFromGraph();
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                                     PRIVATES                                 //
    //////////////////////////////////////////////////////////////////////////////////

    public async _getUrlData(urlNode: any, urlName?: string): Promise<any> {
        const element = await urlNode.getElement();

        if (urlName && urlName.trim().length > 0 && element.name.get() !== urlName) return;

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
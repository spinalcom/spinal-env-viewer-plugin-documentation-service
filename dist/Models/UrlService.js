"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlService = exports.UrlService = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const zodUtils_1 = require("../utils/zodUtils");
const constants_1 = require("./constants");
class UrlService {
    constructor() { }
    /**
     * @param {SpinalNode} node
     * @param {string} urlName
     * @param {string} urlLink
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    async addURL(node, urlName, urlLink) {
        urlName = zodUtils_1.validateString.parse(urlName);
        urlLink = zodUtils_1.validateString.parse(urlLink);
        node = zodUtils_1.validateSpinalNode.parse(node);
        const urlExist = await this.getURL(node, urlName);
        if (urlExist)
            throw new Error(`${urlName} already exist in ${node.getName().get()}`);
        const urlModel = new spinal_models_documentation_1.SpinalURL(urlName, urlLink);
        const urlNode = new spinal_model_graph_1.SpinalNode(`[URL] ${urlName}`, constants_1.URL_TYPE, urlModel);
        await node.addChild(urlNode, constants_1.URL_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        return this._getUrlData(urlNode);
    }
    async getURL(node, urlName) {
        urlName = zodUtils_1.validateStringOptional.parse(urlName);
        const urlNodes = await node.getChildren(constants_1.URL_RELATION);
        const promises = [];
        for (const urlNode of urlNodes) {
            promises.push(this._getUrlData(urlNode));
        }
        const values = await Promise.all(promises);
        if (urlName) {
            return values.find(({ element }) => {
                const elementName = element.name.get();
                return elementName.toString().trim() === urlName;
            });
        }
        return values;
    }
    /**
     * @param {SpinalNode} argNode
     * @param {string} label
     * @param {string} newValue
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    async updateUrl(argNode, label, newValue) {
        newValue = zodUtils_1.validateString.parse(newValue);
        let url = await this.getURL(argNode, label);
        if (url) {
            const { node, element } = url;
            if (node && element) {
                const elementUrl = element.URL.get();
                if (elementUrl.toString().trim() !== newValue)
                    element.URL.set(newValue);
            }
            return url;
        }
    }
    /**
     * @param {SpinalNode} node
     * @param {Array<string>} url_relationNames
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof UrlService
     * @deprecated
     */
    getParents(node, url_relationNames) {
        return node.getParents(url_relationNames);
    }
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof UrlService
     * @deprecated
     */
    getParentGroup(node) {
        return this.getParents(node, []);
    }
    /**
     * @param {SpinalNode} node
     * @param {string} label
     * @return {*}  {Promise<void>}
     * @memberof UrlService
     */
    async deleteURL(node, label) {
        label = zodUtils_1.validateString.parse(label);
        const url = await this.getURL(node, label);
        if (url && url.node) {
            return url.node.removeFromGraph();
        }
    }
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<{ node: SpinalNode; urls: SpinalURL[] }[]>}
     * @memberof UrlService
     */
    async getSharedUrls(node) {
        const parents = await node.getParents();
        const promises = parents.map(async (parent) => {
            const _urls = await this.getURL(parent);
            return {
                node: parent,
                urls: _urls.map((el) => el.element),
            };
        });
        return Promise.all(promises);
    }
    //////////////////////////////////////////////////////////////////////////////////
    //                                     PRIVATES                                 //
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * @param {*} urlNode
     * @param {string} [urlName]
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    async _getUrlData(urlNode) {
        const element = await urlNode.getElement();
        return {
            element: element,
            node: urlNode,
        };
    }
}
exports.UrlService = UrlService;
const urlService = new UrlService();
exports.urlService = urlService;
exports.default = UrlService;
//# sourceMappingURL=UrlService.js.map
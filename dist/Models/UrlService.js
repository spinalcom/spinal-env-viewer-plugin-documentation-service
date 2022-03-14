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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlService = exports.UrlService = void 0;
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const constants_1 = require("./constants");
class UrlService {
    constructor() { }
    /**
     * @param {SpinalNode<any>} node
     * @param {string} urlName
     * @param {string} urlLink
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    addURL(node, urlName, urlLink) {
        return __awaiter(this, void 0, void 0, function* () {
            urlName = urlName && urlName.toString().trim();
            urlLink = urlLink && urlLink.toString().trim();
            const urlNameIsValid = urlName && urlName.length > 0;
            const urlLinkIsValid = urlLink && urlLink.length > 0;
            if (!(urlNameIsValid && urlLinkIsValid))
                throw new Error('name or link is invalid');
            const urlExist = yield this.getURL(node, urlName);
            if (urlExist)
                throw new Error(`${urlName} already exist in ${node.getName().get()}`);
            const urlModel = new spinal_models_documentation_1.SpinalURL(urlName, urlLink);
            const urlNode = yield node.addChild(urlModel, constants_1.URL_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
            if (urlNode && urlNode.info) {
                urlNode.info.name.set(`[URL] ${urlName}`);
                urlNode.info.type.set(constants_1.URL_TYPE);
                return this._getUrlData(urlNode);
            }
        });
    }
    /**
     * @param {SpinalNode<any>} node
     * @param {string} [urlName]
     * @return {*}  {(Promise<IUrl | IUrl[]>)}
     * @memberof UrlService
     */
    getURL(node, urlName) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlNodes = yield node.getChildren(constants_1.URL_RELATION);
            const promises = [];
            for (const urlNode of urlNodes) {
                promises.push(this._getUrlData(urlNode, urlName));
            }
            const values = yield Promise.all(promises);
            if (urlName && urlName.toString().trim().length) {
                return values.find(({ element }) => {
                    const elementName = element.name.get();
                    return elementName.toString().trim() === urlName.toString().trim();
                });
            }
            return values;
        });
    }
    /**
     * @param {SpinalNode<any>} argNode
     * @param {string} label
     * @param {string} newValue
     * @return {*}  {Promise<IUrl>}
     * @memberof UrlService
     */
    updateUrl(argNode, label, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let _url = yield this.getURL(argNode, label);
            let url = Array.isArray(_url) ? _url[0] : _url;
            if (url) {
                const { node, element } = url;
                if (node && element) {
                    const elementUrl = element.URL.get();
                    const _newValue = newValue.toString().trim();
                    if (!!_newValue && elementUrl.toString().trim() !== _newValue)
                        element.URL.set(_newValue);
                }
                return url;
            }
        });
    }
    /**
     * @param {SpinalNode<any>} node
     * @param {Array<string>} url_relationNames
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof UrlService
     */
    getParents(node, url_relationNames) {
        return node.getParents(url_relationNames);
    }
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof UrlService
     */
    getParentGroup(node) {
        return this.getParents(node, []);
    }
    /**
     * @param {SpinalNode<any>} node
     * @param {string} label
     * @return {*}  {Promise<void>}
     * @memberof UrlService
     */
    deleteURL(node, label) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getURL(node, label);
            if (Array.isArray(url))
                return;
            if (url && url.node) {
                return url.node.removeFromGraph();
            }
        });
    }
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<{ node: SpinalNode<any>; urls: SpinalURL[] }[]>}
     * @memberof UrlService
     */
    getSharedUrls(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const parents = yield node.getParents();
            const promises = parents.map((parent) => __awaiter(this, void 0, void 0, function* () {
                let _urls = yield this.getURL(parent);
                _urls = Array.isArray(_urls) ? _urls : [_urls];
                return {
                    node: parent,
                    urls: _urls.map((el) => el.element),
                };
            }));
            return Promise.all(promises);
        });
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
    _getUrlData(urlNode, urlName) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = yield urlNode.getElement();
            return {
                element: element,
                node: urlNode,
            };
        });
    }
}
exports.UrlService = UrlService;
const urlService = new UrlService();
exports.urlService = urlService;
exports.default = UrlService;
//# sourceMappingURL=UrlService.js.map
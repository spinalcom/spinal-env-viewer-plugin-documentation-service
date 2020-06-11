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
const spinal_model_graph_1 = require("spinal-model-graph");
const documentationModel = require("spinal-models-documentation");
const constants_1 = require("./constants");
class UrlService {
    constructor() { }
    addURL(node, urlName, urlLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlNameIsValid = urlName && urlName.trim().length > 0;
            const urlLinkIsValid = urlLink && urlLink.trim().length > 0;
            const nodeValid = node instanceof spinal_model_graph_1.SpinalNode || node instanceof spinal_model_graph_1.SpinalContext || node instanceof spinal_model_graph_1.SpinalGraph;
            if (!(urlNameIsValid && urlLinkIsValid && nodeValid))
                return;
            const urlModel = new documentationModel.SpinalURL(urlName, urlLink);
            const urlNode = yield node.addChild(urlModel, constants_1.URL_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
            if (urlNode && urlNode.info) {
                urlNode.info.name.set(`[URL] ${urlName}`);
                urlNode.info.type.set(constants_1.URL_TYPE);
                return urlNode;
            }
        });
    }
    getURL(node, urlName) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeValid = node instanceof spinal_model_graph_1.SpinalNode || node instanceof spinal_model_graph_1.SpinalContext || node instanceof spinal_model_graph_1.SpinalGraph;
            if (!nodeValid)
                return;
            const urlNodes = yield node.getChildren(constants_1.URL_RELATION);
            const promises = [];
            for (const urlNode of urlNodes) {
                promises.push(this._getUrlData(urlNode, urlName));
            }
            const values = yield Promise.all(promises);
            return urlName && urlName.trim().length > 0 ? values.filter(el => typeof el !== "undefined")[0] : values;
        });
    }
    getParents(node, url_relationNames) {
        const nodeValid = node instanceof spinal_model_graph_1.SpinalNode || node instanceof spinal_model_graph_1.SpinalContext || node instanceof spinal_model_graph_1.SpinalGraph;
        if (!nodeValid)
            return;
        return node.getParents(url_relationNames);
    }
    getParentGroup(node) {
        const nodeValid = node instanceof spinal_model_graph_1.SpinalNode || node instanceof spinal_model_graph_1.SpinalContext || node instanceof spinal_model_graph_1.SpinalGraph;
        if (!nodeValid)
            return;
        return this.getParents(node, []);
    }
    deleteURL(node, label) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeValid = node instanceof spinal_model_graph_1.SpinalNode || node instanceof spinal_model_graph_1.SpinalContext || node instanceof spinal_model_graph_1.SpinalGraph;
            if (!nodeValid)
                return;
            const url = yield this.getURL(node, label);
            if (url && url.node)
                url.node.removeFromGraph();
        });
    }
    //////////////////////////////////////////////////////////////////////////////////
    //                                     PRIVATES                                 //
    //////////////////////////////////////////////////////////////////////////////////
    _getUrlData(urlNode, urlName) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = yield urlNode.getElement();
            if (urlName && urlName.trim().length > 0 && element.label.get() !== urlName)
                return;
            return {
                element: element,
                node: urlNode
            };
        });
    }
}
exports.default = UrlService;
//# sourceMappingURL=UrlService.js.map
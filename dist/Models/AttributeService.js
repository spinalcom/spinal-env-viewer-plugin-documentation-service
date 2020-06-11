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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const spinal_env_viewer_plugin_bimobjectservice_1 = require("spinal-env-viewer-plugin-bimobjectservice");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("./constants");
class AttributeService {
    constructor() { }
    addCategoryAttribute(node, label) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_model_graph_1.SpinalNode))
                return;
            let categoryFound = yield this._categoryExist(node, label);
            if (!categoryFound) {
                const categoryModel = new spinal_model_graph_1.SpinalNode(label, constants_1.CATEGORY_TYPE, new spinal_core_connectorjs_type_1.Lst());
                categoryFound = yield node.addChild(categoryModel, constants_1.NODE_TO_CATEGORY_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            return this._getCategoryElement(categoryFound);
        });
    }
    getCategoryByName(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.getCategory(node);
            return categories.find(el => {
                if ((el.nameCat instanceof spinal_core_connectorjs_type_1.Model))
                    return el.nameCat.get() === categoryName;
                return el.nameCat === categoryName;
            });
        });
    }
    getCategory(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_model_graph_1.SpinalNode))
                return [];
            const categories = yield node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            const promises = categories.map(el => this._getCategoryElement(el));
            return Promise.all(promises);
        });
    }
    getAttributesByCategory(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this.getCategoryByName(node, categoryName);
            const res = [];
            if (category && category.element) {
                for (let index = 0; index < category.element.length; index++) {
                    const element = category.element[index];
                    res.push(element);
                }
            }
            return res;
        });
    }
    addAttributeByCategory(node, category, label, value) {
        const labelIsValid = label && label.trim().length > 0;
        const valueIsValid = typeof value !== "undefined";
        if (!(labelIsValid && valueIsValid))
            return;
        if (!this._labelExistInCategory(category, label)) {
            const attributeModel = new spinal_models_documentation_1.SpinalAttribute(label, value);
            category.element.push(attributeModel);
        }
    }
    addAttributeByCategoryName(node, categoryName, label, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const labelIsValid = label && label.trim().length > 0;
            const valueIsValid = typeof value !== "undefined";
            if (!(labelIsValid && valueIsValid))
                return;
            const category = yield this.getCategoryByName(node, categoryName);
            this.addAttributeByCategory(node, category, label, value);
        });
    }
    addAttribute(node, label, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const labelIsValid = label && label.trim().length > 0;
            const valueIsValid = typeof value !== "undefined";
            if (!(labelIsValid && valueIsValid))
                return;
            const attributeExist = yield this._attributeExist(node, label);
            if (!attributeExist) {
                const attributeModel = spinal_models_documentation_1.SpinalAttribute(label, value);
                const attributeNode = yield node.addChild(attributeModel, constants_1.NODE_TO_ATTRIBUTE, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
                attributeNode.info.name.set(`[Attributes] ${label}`);
                node.info.type.set(constants_1.ATTRIBUTE_TYPE);
            }
        });
    }
    getAllAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.getCategory(node);
            const promises = categories.map(el => this.getAttributesByCategory(node, el.info.name.get()));
            return Promise.all(promises).then(res => {
                const result = [];
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];
                    result.push(...element);
                }
                return result;
            });
        });
    }
    getAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = yield node.getChildren(constants_1.NODE_TO_ATTRIBUTE);
            const promises = attributes.map((el) => __awaiter(this, void 0, void 0, function* () {
                return {
                    node: el,
                    element: yield el.getElement()
                };
            }));
            return Promise.all(promises);
        });
    }
    compareAttr(listAttr1, listAttr2) {
        let sharedAttributes = [];
        for (let j = 0; j < listAttr1.length; j++) {
            const element = listAttr1[j];
            for (let k = 0; k < listAttr2.length; k++) {
                const element2 = listAttr2[k];
                if (element.label.get() == element2.label.get()) {
                    sharedAttributes.push(element);
                }
            }
        }
        return sharedAttributes;
    }
    getAttributesShared(listOfdbId) {
        const bimsNodes = listOfdbId.map(dbId => {
            return spinal_env_viewer_plugin_bimobjectservice_1.default.getBIMObject(dbId);
        });
        return Promise.all(bimsNodes).then((result) => __awaiter(this, void 0, void 0, function* () {
            let sharedAttributes = yield this.getAllAttributes(result[0]);
            const promises = result.map((element, index) => __awaiter(this, void 0, void 0, function* () {
                if (index === 0)
                    return;
                const attributes = yield this.getAllAttributes(element);
                sharedAttributes = this.compareAttr(sharedAttributes, attributes);
            }));
            yield Promise.all(promises);
            return sharedAttributes;
        }));
    }
    getBuildingInformationAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let lst = [];
            if (!(node instanceof spinal_model_graph_1.SpinalNode))
                return lst;
            if (node.getType().get() === spinal_env_viewer_context_geographic_service_1.default.constants.BUILDING_TYPE) {
                lst = constants_1.BUILDINGINFORMATION.map(el => {
                    return this.findAttributesByLabel(node, el);
                });
                return Promise.all(lst).then(element => element.filter(el => typeof el !== "undefined"));
            }
            return lst;
        });
    }
    setBuildingInformationAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_model_graph_1.SpinalNode))
                node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(node);
            if (node && node.getType().get() === spinal_env_viewer_context_geographic_service_1.default.constants.BUILDING_TYPE) {
                const category = yield this.addCategoryAttribute(node, constants_1.BUILDINGINFORMATIONCATNAME);
                const promises = constants_1.BUILDINGINFORMATION.map(el => {
                    return this.addAttributeByCategory(node, category, el, "To configure");
                });
                yield Promise.all(promises);
                return this.getBuildingInformationAttributes(node);
            }
            return [];
        });
    }
    findAttributesByLabel(node, label, category) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = [];
            if (typeof category !== "undefined") {
                const categoryName = this._getCategoryName(category);
                data = yield this.getAttributesByCategory(node, categoryName);
            }
            else {
                data = yield this.getAllAttributes(node);
            }
            return data.find(el => el.label.get() === label);
        });
    }
    removeAttributesByLabel(node, label) {
        return;
    }
    ///////////////////////////////////////////////////////////////////
    //                          PRIVATES                             //
    ///////////////////////////////////////////////////////////////////
    _categoryExist(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            const found = categories.find(el => {
                return el.info.name.get() === categoryName;
            });
            return found;
        });
    }
    _getCategoryElement(categoryNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = yield categoryNode.getElement();
            return {
                element: element,
                nameCat: categoryNode.info.name.get(),
                node: categoryNode
            };
        });
    }
    _labelExistInCategory(category, argAttributeName) {
        if (category && category.element) {
            const attributes = category.element instanceof spinal_core_connectorjs_type_1.Model ? category.element.get() : category.element;
            return attributes.find(el => {
                if (el instanceof spinal_core_connectorjs_type_1.Model) {
                    return el.get() === argAttributeName;
                }
                else {
                    return el === argAttributeName;
                }
            });
        }
    }
    _attributeExist(node, argAttributeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = yield node.getChildren([constants_1.NODE_TO_ATTRIBUTE]);
            return attributes.find(el => {
                return el.info.name.get() === `[Attributes] ${argAttributeName}`;
            });
        });
    }
    _getCategoryName(category) {
        if (category && category.name) {
            return category.name instanceof spinal_core_connectorjs_type_1.Model ? category.name.get() : category.name;
        }
        else if (category) {
            return category instanceof spinal_core_connectorjs_type_1.Model ? category.get() : category;
        }
    }
    removeNode(node) {
        node.removeFromGraph();
    }
}
exports.default = AttributeService;
//# sourceMappingURL=AttributeService.js.map
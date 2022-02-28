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
exports.attributeService = exports.AttributeService = void 0;
// import { SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-model-graph";
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const constants_1 = require("./constants");
class AttributeService {
    constructor() { }
    /**
     * This method creates a category and link it to the node passed in parameter. It returs an object of category
     * @param  {SpinalNode<any>} node - node on which the category must be linked
     * @param  {string} categoryName - The category name
     * @returns Promise
     */
    addCategoryAttribute(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            categoryName = categoryName.toString().trim();
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("Node must be a SpinalNode.");
            if (categoryName.toString().trim().length === 0)
                throw new Error("Category name must be a string and have at leat one character.");
            const categoryExist = yield this.getCategoryByName(node, categoryName);
            if (categoryExist)
                return categoryExist;
            const categoryModel = new spinal_env_viewer_graph_service_1.SpinalNode(categoryName, constants_1.CATEGORY_TYPE, new spinal_core_connectorjs_type_1.Lst());
            const categoryFound = yield node.addChild(categoryModel, constants_1.NODE_TO_CATEGORY_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            return this._getCategoryElement(categoryFound);
        });
    }
    /**
     * This method deletes a category from the given node.
     * @param  {SpinalNode<any>} node - node on which the category to be deleted is
     * @param  {number} serverId - The server ID for the category to delete
     * @returns Promise
     */
    delCategoryAttribute(node, serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("Node must be a SpinalNode.");
            if (serverId === 0)
                throw new Error("Invalid server ID.");
            const child = spinal_core_connectorjs_type_1.FileSystem._objects[serverId];
            if (child instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
                yield node.removeChild(child, constants_1.NODE_TO_CATEGORY_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
        });
    }
    deleteAttributeCategory(node, category) {
        return __awaiter(this, void 0, void 0, function* () {
            let _category;
            if (category instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
                _category = category;
            }
            else if (typeof category === 'string') {
                let temp = yield this.getCategoryByName(node, category);
                _category = temp.node;
            }
            else if (category.node instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
                _category = category.node;
            }
            if (_category instanceof spinal_env_viewer_graph_service_1.SpinalNode)
                return node.removeChild(_category, constants_1.NODE_TO_CATEGORY_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            throw new Error("category not found");
        });
    }
    /**
     * This method changes the name of a category from the given node.
     * @param  {SpinalNode<any>} node - node on which the category to be edited is
     * @param  {number} serverId - The server ID for the category to edit
     * @param  {string} categoryName - The new category name
     * @returns Promise
     */
    editCategoryAttribute(node, serverId, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            categoryName = categoryName.toString().trim();
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("Node must be a SpinalNode.");
            if (serverId === 0)
                throw new Error("Invalid server ID.");
            if (categoryName.length === 0)
                throw new Error("Category name must be a string and have at leat one character.");
            const child = spinal_core_connectorjs_type_1.FileSystem._objects[serverId];
            if (child instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
                child.info.name.set(categoryName);
            }
        });
    }
    /**
     * This method takes as parameter a node and return an array of All categories of attributes linked to this node
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    getCategory(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("node must be a SpinalNode instance");
            const categories = yield node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            const promises = categories.map(el => this._getCategoryElement(el));
            return Promise.all(promises);
        });
    }
    /**
     * This method takes a node and string(category name) as parameters and check if the node has a categorie of attribute which matches the category name
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName
     * @returns Promise
     */
    getCategoryByName(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            categoryName = categoryName.toString().trim();
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("node must be a spinalNode instance");
            if (!categoryName || categoryName.length === 0)
                throw new Error("category name must be a string and have at leat one character");
            const categories = yield this.getCategory(node);
            return categories.find(el => {
                return el.nameCat.toString().trim() === categoryName;
            });
        });
    }
    /**
     * Updates the category name
     * @param  {SpinalNode<any>} node
     * @param  {SpinalNode<any>|ICategory|string} category
     * @param  {string} newName
     * @returns Promise
     */
    updateCategoryName(node, category, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            newName = newName.toString().trim();
            if (!newName || newName.length === 0)
                throw new Error("category name must be a string and have at leat one character");
            if (category instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
                category.info.name.set(newName);
                return this._getCategoryElement(category);
            }
            else if (typeof category === 'string') {
                let _category = yield this.getCategoryByName(node, category);
                _category.node.info.name.set(newName);
                return _category;
            }
            else if (category.node instanceof spinal_env_viewer_graph_service_1.SpinalNode) {
                category.node.info.name.set(newName);
                return category;
            }
            throw new Error("category not found");
        });
    }
    /**
     * This method adds(if not exists) an attribute in a category (creates the category if not exist)
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName
     * @param  {string} label
     * @param  {string} value
     * @param  {string=""} type
     * @param  {string=""} unit
     * @returns Promise
     */
    addAttributeByCategoryName(node, categoryName = "", label = "", value = "", type = "", unit = "") {
        return __awaiter(this, void 0, void 0, function* () {
            // const labelIsValid = label && label.toString().trim().length > 0;
            // const valueIsValid = typeof value !== "undefined";
            // if (!(labelIsValid && valueIsValid)) return;
            categoryName = categoryName.toString().trim();
            label = label.toString().trim();
            value = typeof value === "string" ? value.toString().trim() : value;
            type = type.toString().trim();
            unit = unit.toString().trim();
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("node must be a spinalNode instance");
            if (!label || label.toString().trim().length === 0)
                throw new Error("attribute label must be a string and have at leat one character");
            if (!categoryName || categoryName.toString().trim().length === 0)
                throw new Error("category name must be a string and have at leat one character");
            if (typeof value === "undefined")
                throw new Error("The attribute value is required");
            let category = yield this.getCategoryByName(node, categoryName);
            if (!category) {
                category = yield this.addCategoryAttribute(node, categoryName);
            }
            return this.addAttributeByCategory(node, category, label, value, type, unit);
        });
    }
    /**
     * This method adds(if not exists) or update(if exists) an attribute in a category
     * @param  {SpinalNode<any>} node
     * @param  {ICategory} category
     * @param  {string} label
     * @param  {string} value
     * @param  {string=""} type
     * @param  {string=""} unit
     * @returns SpinalAttribute
     */
    addAttributeByCategory(node, category, label = "", value = "", type = "", unit = "") {
        label = label.toString().trim();
        value = typeof value === "string" ? value.toString().trim() : value;
        type = type.toString().trim();
        unit = unit.toString().trim();
        if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
            throw new Error("node must be a spinalNode instance");
        if (!label || label.toString().trim().length === 0)
            throw new Error("attribute label must be a string and have at leat one character");
        if (typeof value === "undefined")
            throw new Error("The attribute value is required");
        // const labelIsValid = label && label.toString().trim().length > 0;
        // const valueIsValid = typeof value !== "undefined";
        // if (!(labelIsValid && valueIsValid)) return;
        const found = this._labelExistInCategory(category, label);
        if (!found) {
            const attributeModel = new spinal_models_documentation_1.SpinalAttribute(label, value, type, unit);
            category.element.push(attributeModel);
            return attributeModel;
        }
        else {
            // throw new Error(`${label} already exists in this category`);
            // this.updateAttribute(node, category, label, { value });
            for (let index = 0; index < category.element.length; index++) {
                const element = category.element[index];
                const elementLabel = element.label.get();
                if (elementLabel.toString().trim() === label) {
                    element.value.set(value);
                    return element;
                }
            }
        }
    }
    /**
     * Returns an array of all SpinalAttirbute with all categories
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    getAllAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.getCategory(node);
            const promises = categories.map(el => {
                return this.getAttributesByCategory(node, el.node.info.name.get());
            });
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
    findOneAttributeInCategory(node, category, label = "") {
        return __awaiter(this, void 0, void 0, function* () {
            label = label.toString().trim();
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("node must be a spinalNode instance");
            // if (categoryName.toString().trim().length === 0) throw new Error("category name must be a string and have at leat one character");
            const _category = typeof category === "string" ? yield this.getCategoryByName(node, category) : category;
            const res = [];
            if (_category && _category.element) {
                for (let index = 0; index < _category.element.length; index++) {
                    const element = _category.element[index];
                    if (!!label && element.label.get().toString().trim() === label) {
                        // res.push(element);
                        // break;
                        return element;
                    }
                }
            }
            return -1;
        });
    }
    /**
     * Takes as parmaters a node and a string(category name) and return all attributes of the category.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName
     * @param  {string} label?
     * @returns Promise
     */
    getAttributesByCategory(node, category, label) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("node must be a spinalNode instance");
            const _category = typeof category === "string" ? yield this.getCategoryByName(node, category) : category;
            if (!_category || !_category.element || _category.element.length === 0)
                return [];
            if (label) {
                const labelFound = this._findInLst(_category.element, label);
                return labelFound ? [labelFound] : [];
            }
            const res = [];
            for (let index = 0; index < _category.element.length; index++) {
                const element = _category.element[index];
                res.push(element);
            }
            return res;
            // if (categoryName.toString().trim().length === 0) throw new Error("category name must be a string and have at leat one character");
            // const _category = typeof category === "string" ? await this.getCategoryByName(node, category) : category;
            // const res = [];
            // if (_category && _category.element) {
            //     for (let index = 0; index < _category.element.length; index++) {
            //         const element = _category.element[index];
            //         if (!!label && element.label.get().toString().trim() === label) {
            //             // res.push(element);
            //             // break;
            //             return [element]
            //         } else {
            //             res.push(element);
            //         }
            //     }
            // }
            // return res;
        });
    }
    updateAttribute(node, category, label, newValues) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!label)
                throw new Error("Label is required");
            const [attribute] = yield this.getAttributesByCategory(node, category, label);
            if (!attribute)
                throw new Error("no attribute found");
            for (const key in newValues) {
                if (Object.prototype.hasOwnProperty.call(newValues, key)) {
                    const value = newValues[key];
                    if (attribute[key])
                        attribute[key].set(value);
                }
            }
            // if (attributes && attributes.length > 0) {
            //     return attributes.map(attr => {
            //         for (const key in newValues) {
            //             if (Object.prototype.hasOwnProperty.call(newValues, key)) {
            //                 const val = newValues[key].toString().trim();
            //                 if (attr[key]) attr[key].set(val);
            //             }
            //         }
            //         return attr
            //     })
            // }
            throw new Error("no attribute found");
        });
    }
    /**
     * This methods updates all attributes which have the old_label as label
     * @param  {SpinalNode<any>} node
     * @param  {string} old_label
     * @param  {string} old_value
     * @param  {string} new_label
     * @param  {string} new_value
     * @returns Promise
     */
    setAttribute(node, old_label, old_value, new_label, new_value) {
        return __awaiter(this, void 0, void 0, function* () {
            // let labelIsValid = old_label && old_label.toString().trim().length > 0;
            // let valueIsValid = typeof old_value !== "undefined";
            // if (!(labelIsValid && valueIsValid)) return;
            // labelIsValid = new_label && new_label.toString().trim().length > 0;
            // valueIsValid = typeof new_value !== "undefined";
            // if (!(labelIsValid && valueIsValid)) return;
            old_label = old_label.toString().trim();
            old_value = typeof old_value === "string" ? old_value.toString().trim() : old_value;
            new_label = new_label.toString().trim();
            new_value = typeof new_value === "string" ? new_value.toString().trim() : new_value;
            if (!old_label || old_label.length === 0)
                throw new Error("old_label must be a string and have at leat one character");
            if (!new_label || new_label.length === 0)
                throw new Error("new_label must be a string and have at leat one character");
            if (typeof old_value === "undefined")
                throw new Error("old_value is required");
            if (typeof new_value === "undefined")
                throw new Error("new_value is required");
            let allAttributes = yield this.getAllAttributes(node);
            for (let i = 0; i < allAttributes.length; i++) {
                const element = allAttributes[i];
                if (element.label.get() == old_label) {
                    if (new_label != "") {
                        element.label.set(new_label);
                    }
                    if (new_value != "") {
                        element.value.set(new_value);
                    }
                }
            }
        });
    }
    /**
     * This methods updates the attribute with the given id from the given node
     * @param  {SpinalNode<any>} node
     * @param  {number} serverId
     * @param  {string} new_label
     * @param  {string} new_value
     * @param  {string} new_type
     * @param  {string} new_unit
     * @returns Promise
     */
    setAttributeById(node, serverId, new_label, new_value, new_type, new_unit) {
        return __awaiter(this, void 0, void 0, function* () {
            new_label = new_label.toString().trim();
            new_value = typeof new_value === "string" ? new_value.toString().trim() : new_value;
            new_type = new_type.toString().trim();
            new_unit = new_unit.toString().trim();
            const labelIsValid = new_label && new_label.toString().trim().length > 0;
            const valueIsValid = typeof new_value !== "undefined";
            if (!(labelIsValid && valueIsValid))
                return;
            let allAttributes = yield this.getAllAttributes(node);
            for (let i = 0; i < allAttributes.length; i++) {
                const element = allAttributes[i];
                if (element._server_id == serverId) {
                    element.label.set(new_label);
                    element.value.set(new_value);
                    element.type.set(new_type);
                    element.unit.set(new_unit);
                }
            }
        });
    }
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @returns Promise
     */
    getAttributesShared(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            categoryName = categoryName.toString().trim();
            const parents = yield node.getParents();
            const promises = parents.map((parent) => __awaiter(this, void 0, void 0, function* () {
                const categories = yield this.getCategory(parent);
                const filterCategory = !categoryName || categoryName.length === 0 ? categories : categories.filter(el => el.nameCat.toString().trim() === categoryName);
                return {
                    parentNode: parent,
                    categories: filterCategory
                };
            }));
            return Promise.all(promises);
        });
    }
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @returns Promise
     */
    removeAttributesByLabel(category, label) {
        return __awaiter(this, void 0, void 0, function* () {
            const listAttributes = yield category.element.load();
            for (let i = 0; i < listAttributes.length; i++) {
                const element = listAttributes[i];
                const elementLabel = element.label.get();
                if (elementLabel.toString().trim() == label.toString().trim()) {
                    listAttributes.splice(i, 1);
                    return true;
                }
            }
            return false;
        });
    }
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @returns Promise
     */
    removeAttributesById(category, serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const listAttributes = yield category.element.load();
            for (let i = 0; i < listAttributes.length; i++) {
                const element = listAttributes[i];
                if (element._server_id == serverId) {
                    listAttributes.splice(i, 1);
                    return true;
                }
            }
            return false;
        });
    }
    // public getAttributesShared(listOfdbId: number[]) {
    //     const bimsNodes = listOfdbId.map(dbId => {
    //         return bimObjectService.getBIMObject(dbId);
    //     })
    //     return Promise.all(bimsNodes).then(async (result) => {
    //         let sharedAttributes = await this.getAllAttributes(result[0]);
    //         const promises = result.map(async (element, index) => {
    //             if (index === 0) return;
    //             const attributes = await this.getAllAttributes(element);
    //             sharedAttributes = this.compareAttr(sharedAttributes, attributes);
    //         })
    //         await Promise.all(promises);
    //         return sharedAttributes;
    //     })
    // }
    // public compareAttr(listAttr1, listAttr2) {
    //     let sharedAttributes = [];
    //     for (let j = 0; j < listAttr1.length; j++) {
    //         const element = listAttr1[j];
    //         for (let k = 0; k < listAttr2.length; k++) {
    //             const element2 = listAttr2[k];
    //             if (element.label.get() == element2.label.get()) {
    //                 sharedAttributes.push(element);
    //             }
    //         }
    //     }
    //     return sharedAttributes;
    // }
    /**
     * Takes a node of Building and return all attributes
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    getBuildingInformationAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let lst = [];
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
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
    /**
     * Takes a node of Building and creates all attributes
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    setBuildingInformationAttributes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
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
                // const categoryName = this._getCategoryName(category);
                data = yield this.getAttributesByCategory(node, category.nameCat);
            }
            else {
                data = yield this.getAllAttributes(node);
            }
            return data.find(el => el.label.get() === label);
        });
    }
    ///////////////////////////////////////////////////////////////////
    //              ATTRIBUTES LINKED DIRECTLY TO NODE               //
    ///////////////////////////////////////////////////////////////////
    /**
     * This methods link directily the attribute to the node without use category.
     * @param  {SpinalNode<any>} node
     * @param  {string} label
     * @param  {string} value
     * @param  {string=""} type
     * @param  {string=""} unit
     * @returns Promise
     */
    addAttribute(node, label, value, type = "", unit = "") {
        return __awaiter(this, void 0, void 0, function* () {
            // const labelIsValid = label && label.toString().trim().length > 0;
            // const valueIsValid = typeof value !== "undefined";
            // if (!(labelIsValid && valueIsValid)) return;
            label = label.toString().trim();
            value = typeof value === "string" ? value.toString().trim() : value;
            type = type.toString().trim();
            unit = unit.toString().trim();
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error("node must be a spinalNode instance");
            if (!label || label.length === 0)
                throw new Error("attribute label must be a string and have at leat one character");
            if (typeof value === "undefined")
                throw new Error("The attribute value is required");
            const attributeExist = yield this._attributeExist(node, label);
            if (attributeExist) {
                return attributeExist;
            }
            const attributeModel = (0, spinal_models_documentation_1.SpinalAttribute)(label, value, type, unit);
            const attributeNode = new spinal_env_viewer_graph_service_1.SpinalNode(`[Attributes] ${label}`, constants_1.ATTRIBUTE_TYPE, attributeModel);
            yield node.addChild(attributeNode, constants_1.NODE_TO_ATTRIBUTE, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            return attributeNode;
            // attributeNode.info.name.set(`[Attributes] ${label}`);
            // node.info.type.set(ATTRIBUTE_TYPE);
        });
    }
    /**
     * get and returns all attribute linked directely to the node
     * @param  {SpinalNode<any>} node
     * @returns SpinalAttribute
     */
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
    ///////////////////////////////////////////////////////////////////
    //                          PRIVATES                             //
    ///////////////////////////////////////////////////////////////////
    /**
     * Check if category is linked to node and return it.
     * @param  {any} node
     * @param  {string} categoryName
     * @returns Promise
     */
    _categoryExist(node, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            // const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
            const categories = yield this.getCategory(node);
            const found = categories.map(el => el.node).find(el => {
                return el.getName().get() === categoryName;
            });
            return found;
        });
    }
    /**
     * Takes a category node and format it like an ICategory type;
     * @param  {SpinalNode<any>} categoryNode
     * @returns Promise
     */
    _getCategoryElement(categoryNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = yield categoryNode.getElement();
            return {
                element: element,
                nameCat: categoryNode.getName().get(),
                node: categoryNode
            };
        });
    }
    /**
     * Check if an attribute exists in a category
     * @param  {ICategory} category
     * @param  {string} argAttributeName
     * @returns boolean
     */
    _labelExistInCategory(category, argAttributeName) {
        let found;
        if (category && category.element) {
            const attributes = category.element instanceof spinal_core_connectorjs_type_1.Model ? category.element.get() : category.element;
            found = attributes.find(el => {
                if (el instanceof spinal_core_connectorjs_type_1.Model) {
                    return el.label.get() === argAttributeName;
                }
                else {
                    return el.label === argAttributeName;
                }
            });
        }
        return found;
    }
    /**
     * Check if an attribute is directely link to the node
     * @param  {SpinalNode<any>} node
     * @param  {string} argAttributeName
     * @returns Promise
     */
    _attributeExist(node, argAttributeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = yield node.getChildren([constants_1.NODE_TO_ATTRIBUTE]);
            return attributes.find(el => {
                return el.getName().get() === `[Attributes] ${argAttributeName}`;
            });
        });
    }
    removeNode(node) {
        node.removeFromGraph();
    }
    // public _getCategoryName(category: ICategory): string {
    //     return
    //     // if (category && category.nameCat) {
    //     //     return category.name instanceof Model ? category.name.get() : category.name;
    //     // } else if (category) {
    //     //     return category instanceof Model ? category.get() : category;
    //     // }
    // }
    _findInLst(Lst, value) {
        for (let index = 0; index < Lst.length; index++) {
            const element = Lst[index];
            if (element.label.get() == value)
                return element;
        }
    }
}
exports.AttributeService = AttributeService;
const attributeService = new AttributeService();
exports.attributeService = attributeService;
exports.default = AttributeService;
//# sourceMappingURL=AttributeService.js.map
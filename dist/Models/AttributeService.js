"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
exports.attributeService = exports.AttributeService = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const constants_1 = require("./constants");
const zodUtils_1 = require("../utils/zodUtils");
const zod_1 = require("zod");
/**
 * @class AttributeService
 */
class AttributeService {
    constructor() { }
    // #region CATEGORY
    /**
     * This method creates a category and link it to the node passed in parameter. It returns an object of category.
     * - if the category already exist it returns the existing category.
     * @param  {SpinalNode} node - node on which the category must be linked
     * @param  {string} categoryName - The category name
     * @return {*}  {Promise<ICategory>}
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the category name is not a string or is empty
     * @memberof AttributeService
     */
    async addCategoryAttribute(node, categoryName) {
        categoryName = zodUtils_1.validateString.parse(categoryName);
        node = zodUtils_1.validateSpinalNode.parse(node);
        const categoryExist = await this.getCategoryByName(node, categoryName);
        if (categoryExist)
            return categoryExist;
        const categoryModel = new spinal_model_graph_1.SpinalNode(categoryName, constants_1.CATEGORY_TYPE, new spinal_core_connectorjs_1.Lst());
        const categoryFound = await node.addChild(categoryModel, constants_1.NODE_TO_CATEGORY_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        return this._getCategoryElement(categoryFound);
    }
    /**
     * This method deletes a category from the given node using the category server ID.
     * @param  {SpinalNode} node - node on which the category to be deleted is linked
     * @param  {number} serverId - The server ID for the category to delete
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the server ID is invalid
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    async delCategoryAttribute(node, serverId) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        serverId = zod_1.z.number().positive().parse(serverId);
        const child = spinal_core_connectorjs_1.FileSystem._objects[serverId];
        if (child instanceof spinal_model_graph_1.SpinalNode) {
            await node.removeChild(child, constants_1.NODE_TO_CATEGORY_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        }
        else {
            throw new Error('category not found');
        }
    }
    /**
     * This method deletes a category from the given node using the category name or the category object.
     * @param {SpinalNode} node
     * @param {(SpinalNode | ICategory | string)} category
     * @return {*}  {Promise<void>}
     * @throws {Error} When the category is not found or the input is invalid
     * @memberof AttributeService
     */
    async deleteAttributeCategory(node, category) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        const _category = await this.validateICategoryOrString(node, category);
        if (_category.node instanceof spinal_model_graph_1.SpinalNode)
            return node.removeChild(_category.node, constants_1.NODE_TO_CATEGORY_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        throw new Error('category not found');
    }
    /**
     * This method takes as parameter a node and return an array of All categories of attributes linked to this node
     * @param {SpinalNode} node
     * @return {*}  {Promise<ICategory[]>}
     * @throws {Error} When the node is not a SpinalNode
     * @memberof AttributeService
     */
    async getCategory(node) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        const categories = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        const promises = categories.map((el) => this._getCategoryElement(el));
        return Promise.all(promises);
    }
    /**
     * This method takes a node and string(category name) as parameters and check if the node has a category of attribute which matches the category name
     * @param  {SpinalNode} node
     * @param  {string} categoryName
     * @return {*}  {Promise<ICategory | undefined>} return the category if found or undefined if not found
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the category name is invalid
     * @memberof AttributeService
     */
    async getCategoryByName(node, categoryName) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        categoryName = zodUtils_1.validateString.parse(categoryName);
        const categories = await this.getCategory(node);
        return categories.find((el) => {
            return el.nameCat.toString().trim() === categoryName;
        });
    }
    /**
     * This method changes the name of a category from the given node.
     * @param  {SpinalNode} node - node on which the category to be edited is linked
     * @param  {number} serverId - The server ID for the category to edit
     * @param  {string} categoryName - The new category name
     * @return {*}  {void}
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the server ID is invalid
     * @memberof AttributeService
     */
    editCategoryAttribute(node, serverId, categoryName) {
        categoryName = zodUtils_1.validateString.parse(categoryName);
        node = zodUtils_1.validateSpinalNode.parse(node);
        serverId = zod_1.z.number().positive().parse(serverId);
        const child = spinal_core_connectorjs_1.FileSystem._objects[serverId];
        (0, zodUtils_1.validateSpinalNodeOfType)(constants_1.CATEGORY_TYPE).parse(child);
        child.info.name.set(categoryName);
    }
    /**
     * Updates the category name
     * @param {SpinalNode} node
     * @param {(SpinalNode | ICategory | string)} category
     * @param {string} newName
     * @return {*}  {Promise<ICategory>}
     * @throws {Error} When the category is not found
     * @throws {Error} When the new name is invalid
     * @memberof AttributeService
     */
    async updateCategoryName(node, category, newName) {
        newName = zodUtils_1.validateString.parse(newName);
        node = zodUtils_1.validateSpinalNode.parse(node);
        category = await this.validateICategoryOrString(node, category);
        category.node.info.name.set(newName);
        return category;
    }
    // #endregion CATEGORY
    // #region ATTRIBUTE
    /**
     * This method adds(if not exists) an attribute in a category (creates the category if not exist)
     * @param {SpinalNode} node
     * @param {string} [categoryName='']
     * @param {string} [label='']
     * @param {string} [value='']
     * @param {string} [type]
     * @param {string} [unit]
     * @return {*}  {Promise<SpinalAttribute>}
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the category name is invalid
     * @throws {Error} When the attribute label is invalid
     * @throws {Error} When the attribute value is invalid
     * @throws {Error} When the attribute type is invalid when provided
     * @throws {Error} When the attribute unit is invalid when provided
     * @memberof AttributeService
     */
    async addAttributeByCategoryName(node, categoryName, label, value = '', type, unit) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        categoryName = zodUtils_1.validateString.parse(categoryName);
        label = zodUtils_1.validateString.parse(label);
        value = zodUtils_1.validateStringCoerce.parse(value);
        type = zodUtils_1.validateStringOptional.parse(type);
        unit = zodUtils_1.validateStringOptional.parse(unit);
        let category = await this.getCategoryByName(node, categoryName);
        if (!category) {
            category = await this.addCategoryAttribute(node, categoryName);
        }
        // we are sure that category exist at this point
        return this.addAttributeByCategory(node, category, label, value, type, unit);
    }
    /**
     * This method adds(if not exists) or update(if exists) an attribute in a category
     * @param {any} unused
     * @param {ICategory} category
     * @param {string} [label='']
     * @param {string} [value='']
     * @param {string} [type]
     * @param {string} [unit]
     * @return {*}  {SpinalAttribute}
     * @memberof AttributeService
     */
    addAttributeByCategory(unused, category, label, value, type, unit) {
        category = zodUtils_1.validateICategory.parse(category);
        label = zodUtils_1.validateString.parse(label);
        value = zodUtils_1.validateStringCoerce.parse(value);
        type = zodUtils_1.validateStringOptional.parse(type);
        unit = zodUtils_1.validateStringOptional.parse(unit);
        if (!this._labelExistInCategory(category, label)) {
            const attributeModel = new spinal_models_documentation_1.SpinalAttribute(label, value, type, unit);
            category.element.push(attributeModel);
            return attributeModel;
        }
        else {
            for (const element of category.element) {
                element.upgradeDate();
                const elementLabel = element.label.get();
                if (elementLabel.toString().trim() === label) {
                    element.setValue(value);
                    if (type)
                        element.setType(type);
                    if (unit)
                        element.setUnit(unit);
                    return element;
                }
            }
        }
    }
    /**
     * Returns an array of all SpinalAttribute with all categories
     * @param {SpinalNode} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    async getAllAttributes(node) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        const categories = await this.getCategory(node);
        const promises = categories.map((el) => {
            return this.getAttributesByCategory(node, el.node.info.name.get());
        });
        const attributeResults = await Promise.all(promises);
        const result = [];
        for (const attrs of attributeResults) {
            result.push(...attrs);
        }
        result.forEach((el) => el.upgradeDate());
        return result;
    }
    /**
     * @param {SpinalNode} node
     * @param {(string | ICategory)} category
     * @param {string} label
     * @return {*}  {(Promise<SpinalAttribute | -1>)} : -1 when not found
     * @memberof AttributeService
     */
    async findOneAttributeInCategory(node, category, label) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        label = zodUtils_1.validateString.parse(label);
        category = await this.validateICategoryOrString(node, category);
        for (const element of category.element) {
            element.upgradeDate();
            if (label && element.label.get().toString().trim() === label) {
                return element;
            }
        }
        return -1;
    }
    /**
     * Takes as parmaters a node and a string(category name) and return all attributes of the category.
     * @param {SpinalNode} node
     * @param {(string | ICategory)} category
     * @param {string} [label]
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    async getAttributesByCategory(node, category, label) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        label = zodUtils_1.validateStringOptional.parse(label);
        try {
            category = await this.validateICategoryOrString(node, category);
        }
        catch (error) {
            return [];
        }
        if (label) {
            const labelFound = this._findInLst(category.element, label);
            return labelFound ? [labelFound] : [];
        }
        const res = [];
        for (const element of category.element) {
            element.upgradeDate();
            res.push(element);
        }
        return res;
    }
    /**
     * @param {SpinalNode} node
     * @param {(string | ICategory)} category
     * @param {string} label
     * @param {{ label?: string; value?: string; type?: string; unit?: string }} newValues
     * @param {boolean} [createIt=false]
     * @return {*}  {Promise<SpinalAttribute>}
     * @memberof AttributeService
     */
    async updateAttribute(node, category, label, newValues, createIt = false) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        category = await this.validateICategoryOrString(node, category);
        label = zodUtils_1.validateString.parse(label);
        const newValue = zodUtils_1.validateStringCoerce.optional().parse(newValues.value);
        const newLabel = zodUtils_1.validateStringOptional.parse(newValues.label);
        const newType = zodUtils_1.validateStringOptional.parse(newValues.type);
        const newUnit = zodUtils_1.validateStringOptional.parse(newValues.unit);
        if (!newValue && !newLabel && !newType && !newUnit) {
            throw new Error('at least one value to update must be provided');
        }
        const [attribute] = await this.getAttributesByCategory(node, category, label);
        if (!attribute && !createIt)
            throw new Error('no attribute found');
        else if (!attribute && createIt && newValue && newLabel) {
            const res = this.addAttributeByCategory(node, category, label, newValue);
            return res;
        }
        if (newLabel)
            attribute.setLabel(newLabel);
        if (newValue)
            attribute.setValue(newValue);
        if (newType)
            attribute.setType(newType);
        if (newUnit)
            attribute.setUnit(newUnit);
        return attribute;
    }
    /**
     * This methods updates all attributes which have the old_label as label
     * @param {SpinalNode} node
     * @param {string} old_label
     * @param {string} old_value
     * @param {string} new_label
     * @param {string} new_value
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    async setAttribute(node, old_label, old_value, new_label, new_value) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        old_label = zodUtils_1.validateString.parse(old_label);
        old_value = zodUtils_1.validateStringCoerce.parse(old_value);
        new_label = zodUtils_1.validateString.parse(new_label);
        new_value = zodUtils_1.validateStringCoerce.parse(new_value);
        let allAttributes = await this.getAllAttributes(node);
        for (let i = 0; i < allAttributes.length; i++) {
            const element = allAttributes[i];
            if (element.label.get().toString().trim() == old_label) {
                if (new_label != '') {
                    element.setLabel(new_label);
                }
                element.setValue(new_value);
            }
            else {
                element.upgradeDate();
            }
        }
    }
    /**
     * This methods updates the attribute with the given id from the given node
     * @param  {SpinalNode} node
     * @param  {number} serverId
     * @param  {string} new_label
     * @param  {string} new_value
     * @param  {string} new_type
     * @param  {string} new_unit
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    async setAttributeById(node, serverId, new_label, new_value, new_type, new_unit) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        serverId = zod_1.z.number().positive().parse(serverId);
        new_label = zodUtils_1.validateStringOptional.parse(new_label);
        new_value = zodUtils_1.validateStringCoerce.optional().parse(new_value);
        new_type = zodUtils_1.validateStringOptional.parse(new_type);
        new_unit = zodUtils_1.validateStringOptional.parse(new_unit);
        if (!new_label && !new_value && !new_type && !new_unit) {
            throw new Error('at least one value to update must be provided');
        }
        let allAttributes = await this.getAllAttributes(node);
        for (let i = 0; i < allAttributes.length; i++) {
            const element = allAttributes[i];
            if (element._server_id == serverId) {
                if (new_label)
                    element.setLabel(new_label);
                if (new_value)
                    element.setValue(new_value);
                if (new_type)
                    element.setType(new_type);
                if (new_unit)
                    element.setUnit(new_unit);
            }
        }
    }
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode} node
     * @param  {string} categoryName?
     * @return {*}  {Promise<{ parentNode: SpinalNode; categories: ICategory[] }[]>}
     * @memberof AttributeService
     */
    async getAttributesShared(node, categoryName) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        categoryName = zodUtils_1.validateStringOptional.parse(categoryName);
        const parents = await node.getParents();
        const promises = parents.map(async (parent) => {
            const categories = await this.getCategory(parent);
            const filterCategory = !categoryName
                ? categories
                : categories.filter((el) => el.nameCat.toString().trim() === categoryName);
            return {
                parentNode: parent,
                categories: filterCategory,
            };
        });
        return Promise.all(promises);
    }
    /**
     * Get all attribute shared with other nodes.
     * @param {ICategory} category
     * @param {string} label
     * @return {*}  {Promise<boolean>}
     * @memberof AttributeService
     */
    async removeAttributesByLabel(category, label) {
        category = zodUtils_1.validateICategory.parse(category);
        label = zodUtils_1.validateString.parse(label);
        const listAttributes = await category.element.load();
        for (let i = 0; i < listAttributes.length; i++) {
            const element = listAttributes[i];
            const elementLabel = element.label.get();
            if (elementLabel.toString().trim() == label) {
                listAttributes.splice(i, 1);
                return true;
            }
            else
                element.upgradeDate();
        }
        return false;
    }
    /**
     * Get all attribute shared with other nodes.
     * @param {ICategory} category
     * @param {number} serverId
     * @return {*}  {Promise<boolean>}
     * @memberof AttributeService
     */
    async removeAttributesById(category, serverId) {
        category = zodUtils_1.validateICategory.parse(category);
        serverId = zod_1.z.number().positive().parse(serverId);
        const listAttributes = await category.element.load();
        for (let i = 0; i < listAttributes.length; i++) {
            const element = listAttributes[i];
            element.upgradeDate();
            if (element._server_id == serverId) {
                listAttributes.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    /**
     * Takes a node of Building and return all attributes
     * @param {SpinalNode} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    async getBuildingInformationAttributes(node) {
        try {
            node = zodUtils_1.validateSpinalNode.parse(node);
        }
        catch (error) {
            return [];
        }
        if (node.getType().get() === spinal_env_viewer_context_geographic_service_1.BUILDING_TYPE) {
            const lst = constants_1.BUILDINGINFORMATION.map((el) => {
                return this.findAttributesByLabel(node, el);
            });
            return Promise.all(lst).then((element) => element.filter((el) => typeof el !== 'undefined'));
        }
        return [];
    }
    /**
     * Takes a node of Building and creates all attributes
     * @param {SpinalNode | string} node node or nodeId
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    async setBuildingInformationAttributes(node) {
        if (typeof node === 'string')
            node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(node);
        try {
            node = (0, zodUtils_1.validateSpinalNodeOfType)(spinal_env_viewer_context_geographic_service_1.BUILDING_TYPE).parse(node);
        }
        catch (error) {
            return [];
        }
        const category = await this.addCategoryAttribute(node, constants_1.BUILDINGINFORMATIONCATNAME);
        const promises = constants_1.BUILDINGINFORMATION.map((el) => {
            return this.addAttributeByCategory(node, category, el, 'To configure');
        });
        await Promise.all(promises);
        return this.getBuildingInformationAttributes(node);
    }
    /**
     * @param {SpinalNode} node
     * @param {string} label
     * @param {ICategory} [category]
     * @return {*}  {Promise<SpinalAttribute>}
     * @memberof AttributeService
     */
    async findAttributesByLabel(node, label, category) {
        let data;
        node = zodUtils_1.validateSpinalNode.parse(node);
        label = zodUtils_1.validateString.parse(label);
        if (typeof category !== 'undefined') {
            category = zodUtils_1.validateICategory.parse(category);
            data = await this.getAttributesByCategory(node, category.nameCat);
        }
        else {
            data = await this.getAllAttributes(node);
        }
        return data.find((el) => el.label.get() === label);
    }
    /**
     * Retrieves attributes based on a given node and document schema.
     * e.g. getAttrBySchema(node, { 'Cat1': ['Attr1', 'Attr2'] as const, 'Cat2': ['Attr3'] as const })`
     * => `{ 'Cat1': { 'Attr1': 'Value1', 'Attr2': 'Value2' }, 'Cat2': { 'Attr3': 'Value3' } }`
     *
     * @template T - The type of the document schema.
     * @param {SpinalNode} node - The node to retrieve attributes from.
     * @param {T} docSchema - The document schema to match attributes against.
     * @returns {Promise<{ [K in keyof T]: { [V in T[K][number]]: string; }; }>} - A promise that resolves to an object containing the matched attributes.
     */
    async getAttrBySchema(node, docSchema) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        const cats = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
        const promises = [];
        for (const key in docSchema) {
            if (Object.prototype.hasOwnProperty.call(docSchema, key)) {
                const catFound = cats.find((cat) => cat.info.name.get() === key);
                if (catFound) {
                    promises.push(catFound.getElement(true).then((attrs) => {
                        return {
                            key,
                            attrs,
                        };
                    }));
                }
            }
        }
        const res = await Promise.all(promises);
        const docRes = {};
        for (const { key, attrs } of res) {
            docRes[key] = {};
            for (const attr of attrs) {
                attr.upgradeDate();
                if (docSchema[key].includes(attr.label.get())) {
                    const attrName = attr.label.get();
                    const attrValue = attr.value.get();
                    docRes[key][attrName] = attrValue;
                }
            }
        }
        return docRes;
    }
    /**
     * Creates or updates attributes and categories in bulk for a given node.
     *
     * @param node - The SpinalNode to create or update attributes and categories for.
     * @param categoryName - The name of the category.
     * @param attrsToUp - The attributes to create or update, represented as a record where the keys are the attribute labels and the values are the attribute values.
     * @returns A Promise that resolves when the attributes and categories have been created or updated.
     */
    async createOrUpdateAttrsAndCategories(node, categoryName, attrsToUp) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        categoryName = zodUtils_1.validateString.parse(categoryName);
        attrsToUp = zod_1.z.record(zodUtils_1.validateString, zodUtils_1.validateString).parse(attrsToUp);
        async function getCatNode(node, name) {
            const children = await node.getChildren(constants_1.NODE_TO_CATEGORY_RELATION);
            for (const child of children) {
                if (child.info.name.get() === name)
                    return child;
            }
        }
        const catNode = await getCatNode(node, categoryName);
        let cat;
        if (!catNode) {
            cat = await this.addCategoryAttribute(node, categoryName);
        }
        else {
            cat = {
                element: await catNode.getElement(true),
                nameCat: categoryName,
                node,
            };
        }
        const attrs = await this.getAttributesByCategory(node, cat);
        attrs.forEach((attr) => attr.upgradeDate());
        for (const label in attrsToUp) {
            if (Object.prototype.hasOwnProperty.call(attrsToUp, label)) {
                const value = attrsToUp[label];
                let attr = attrs.find((itm) => itm.label.get() === label);
                if (attr) {
                    attr.setValue(value);
                }
                else {
                    this.addAttributeByCategory(node, cat, label, value);
                }
            }
        }
    }
    // #endregion ATTRIBUTE
    // #region PRIVATES
    /**
     * Check if category is linked to node and return it.
     * @param {SpinalNode} node
     * @param {string} categoryName
     * @return {*}  {Promise<SpinalNode>}
     * @memberof AttributeService
     */
    async _categoryExist(node, categoryName) {
        // const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);
        const categories = await this.getCategory(node);
        const found = categories
            .map((el) => el.node)
            .find((el) => {
            return el.getName().get() === categoryName;
        });
        return found;
    }
    /**
     * Takes a category node and format it like an ICategory type;
     * @param {SpinalNode<Lst<SpinalAttribute>>} categoryNode
     * @return {*}  {Promise<ICategory>}
     * @memberof AttributeService
     */
    async _getCategoryElement(categoryNode) {
        const element = await categoryNode.getElement();
        return {
            element: element,
            nameCat: categoryNode.getName().get(),
            node: categoryNode,
        };
    }
    /**
     * Check if an attribute exists in a category
     * @param {ICategory} category
     * @param {string} argAttributeName
     * @return {*}  {boolean}
     * @memberof AttributeService
     */
    _labelExistInCategory(category, argAttributeName) {
        let found = false;
        if (category && category.element) {
            const attributes = category.element instanceof spinal_core_connectorjs_1.Model
                ? category.element.get()
                : category.element;
            found = attributes.find((el) => {
                if (el instanceof spinal_core_connectorjs_1.Model) {
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
     * @param {SpinalNode} node
     * @param {string} argAttributeName
     * @return {*}  {Promise<SpinalNode>}
     * @memberof AttributeService
     */
    async _attributeExist(node, argAttributeName) {
        const attributes = await node.getChildren([constants_1.NODE_TO_ATTRIBUTE]);
        return attributes.find((el) => {
            return el.getName().get() === `[Attributes] ${argAttributeName}`;
        });
    }
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    removeNode(node) {
        return node.removeFromGraph();
    }
    /**
     * @private
     * @param {spinal.Lst<SpinalAttribute>} Lst
     * @param {string} label
     * @return {*}  {SpinalAttribute}
     * @memberof AttributeService
     */
    _findInLst(Lst, label) {
        for (let index = 0; index < Lst.length; index++) {
            const element = Lst[index];
            if (element.label.get().trim() == label)
                return element;
        }
        return undefined;
    }
    async validateICategoryOrString(node, category) {
        if (typeof category === 'string') {
            const temp = await this.getCategoryByName(node, category);
            if (!temp)
                throw new Error('category not found');
            return temp;
        }
        else if (category instanceof spinal_model_graph_1.SpinalNode) {
            (0, zodUtils_1.validateSpinalNodeOfType)(constants_1.CATEGORY_TYPE).parse(category);
            return this._getCategoryElement(category);
        }
        zodUtils_1.validateICategory.parse(category);
        return category;
    }
}
exports.AttributeService = AttributeService;
const attributeService = new AttributeService();
exports.attributeService = attributeService;
exports.default = AttributeService;
//# sourceMappingURL=AttributeService.js.map
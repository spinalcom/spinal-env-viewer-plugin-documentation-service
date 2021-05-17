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

import { SpinalNode, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-model-graph";

import { Lst, Model } from 'spinal-core-connectorjs_type';

import { SpinalAttribute } from 'spinal-models-documentation'

import bimObjectService from "spinal-env-viewer-plugin-bimobjectservice";

import geographicService from "spinal-env-viewer-context-geographic-service";

import { SpinalGraphService } from "spinal-env-viewer-graph-service";

import {
    NODE_TO_CATEGORY_RELATION,
    NODE_TO_ATTRIBUTE,
    CATEGORY_TYPE,
    ATTRIBUTE_TYPE,
    BUILDINGINFORMATION,
    BUILDINGINFORMATIONCATNAME
} from "./constants";


class AttributeService {

    private instanceCreated: AttributeService;

    constructor() { }

    public async addCategoryAttribute(node: any, label: string): Promise<any> {
        if (!(node instanceof SpinalNode)) return;

        let categoryFound = await this._categoryExist(node, label);

        if (!categoryFound) {
            const categoryModel = new SpinalNode(label, CATEGORY_TYPE, new Lst());

            categoryFound = await node.addChild(categoryModel, NODE_TO_CATEGORY_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
        }

        return this._getCategoryElement(categoryFound);

    }

    public async getCategoryByName(node: any, categoryName: string) {
        const categories = await this.getCategory(node);

        return categories.find(el => {
            if ((el.nameCat instanceof Model))
                return el.nameCat.get() === categoryName;

            return el.nameCat === categoryName;
        })
    }

    public async getCategory(node: any): Promise<any> {
        if (!(node instanceof SpinalNode)) return [];

        const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);

        const promises = categories.map(el => this._getCategoryElement(el));

        return Promise.all(promises);
    }

    public async getAttributesByCategory(node: any, categoryName: string): Promise<Array<any>> {
        const category = await this.getCategoryByName(node, categoryName);
        const res = [];

        if (category && category.element) {
            for (let index = 0; index < category.element.length; index++) {
                const element = category.element[index];
                res.push(element);
            }
        }

        return res;

    }

    public addAttributeByCategory(node: any, category, label: string, value: string, type: string = "", unit: string = "") {
        const labelIsValid = label && label.trim().length > 0;
        const valueIsValid = typeof value !== "undefined";

        if (!(labelIsValid && valueIsValid)) return;

        if (!this._labelExistInCategory(category, label)) {
            const attributeModel = new SpinalAttribute(label, value, type, unit);
            category.element.push(attributeModel);
        }

    }

    public async addAttributeByCategoryName(node: any, categoryName: string, label: string, value: string, type: string = "", unit: string = "") {
        const labelIsValid = label && label.trim().length > 0;
        const valueIsValid = typeof value !== "undefined";

        if (!(labelIsValid && valueIsValid)) return;

        const category = await this.getCategoryByName(node, categoryName);

        this.addAttributeByCategory(node, category, label, value, type, unit);
    }

    public async addAttribute(node: any, label: string, value: string, type: string = "", unit: string = "") {
        const labelIsValid = label && label.trim().length > 0;
        const valueIsValid = typeof value !== "undefined";

        if (!(labelIsValid && valueIsValid)) return;

        const attributeExist = await this._attributeExist(node, label);

        if (!attributeExist) {
            const attributeModel = SpinalAttribute(label, value, type, unit);

            const attributeNode = await node.addChild(attributeModel, NODE_TO_ATTRIBUTE, SPINAL_RELATION_PTR_LST_TYPE);
            attributeNode.info.name.set(`[Attributes] ${label}`);
            node.info.type.set(ATTRIBUTE_TYPE);
        }
    }

    public async setAttribute(node: any, old_label: string, old_value: string, new_label: string, new_value: string): Promise<any> {
        let labelIsValid = old_label && old_label.trim().length > 0;
        let valueIsValid = typeof old_value !== "undefined";
        if (!(labelIsValid && valueIsValid)) return;
        labelIsValid = new_label && new_label.trim().length > 0;
        valueIsValid = typeof new_value !== "undefined";
        if (!(labelIsValid && valueIsValid)) return;

        let allAttributes = await this.getAllAttributes(node);
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
    }

    public async getAllAttributes(node: any): Promise<any> {
        const categories = await this.getCategory(node);
        const promises = categories.map(el => {
            return this.getAttributesByCategory(node, el.node.info.name.get())
        });

        return Promise.all(promises).then(res => {
            const result = [];

            for (let index = 0; index < res.length; index++) {
                const element: any = res[index];
                result.push(...element);
            }

            return result;
        })

    }

    public async getAttributes(node: any): Promise<any> {
        const attributes = await node.getChildren(NODE_TO_ATTRIBUTE);
        const promises = attributes.map(async el => {
            return {
                node: el,
                element: await el.getElement()
            }
        })

        return Promise.all(promises);
    }

    public compareAttr(listAttr1, listAttr2) {
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


    public getAttributesShared(listOfdbId: number[]) {
        const bimsNodes = listOfdbId.map(dbId => {
            return bimObjectService.getBIMObject(dbId);
        })

        return Promise.all(bimsNodes).then(async (result) => {
            let sharedAttributes = await this.getAllAttributes(result[0]);

            const promises = result.map(async (element, index) => {
                if (index === 0) return;
                const attributes = await this.getAllAttributes(element);
                sharedAttributes = this.compareAttr(sharedAttributes, attributes);
            })

            await Promise.all(promises);

            return sharedAttributes;



        })

    }


    public async getBuildingInformationAttributes(node: any): Promise<any[]> {
        let lst = [];
        if (!(node instanceof SpinalNode)) return lst;

        if (node.getType().get() === geographicService.constants.BUILDING_TYPE) {
            lst = BUILDINGINFORMATION.map(el => {
                return this.findAttributesByLabel(node, el);
            })

            return Promise.all(lst).then(element => element.filter(el => typeof el !== "undefined"))

        }

        return lst;
    }


    public async setBuildingInformationAttributes(node: any): Promise<any[]> {
        if (!(node instanceof SpinalNode)) node = SpinalGraphService.getRealNode(node)

        if (node && node.getType().get() === geographicService.constants.BUILDING_TYPE) {
            const category = await this.addCategoryAttribute(node, BUILDINGINFORMATIONCATNAME);
            const promises = BUILDINGINFORMATION.map(el => {
                return this.addAttributeByCategory(node, category, el, "To configure");
            })

            await Promise.all(promises);
            return this.getBuildingInformationAttributes(node);
        }

        return []

    }


    public async findAttributesByLabel(node: any, label: string, category?: any) {
        let data = [];

        if (typeof category !== "undefined") {
            const categoryName = this._getCategoryName(category);
            data = await this.getAttributesByCategory(node, categoryName);
        } else {
            data = await this.getAllAttributes(node);
        }

        return data.find(el => el.label.get() === label);
    }



    public async removeAttributesByLabel(category: any, label: string) {
        const listAttributes = await category.element.load();
        for (let i = 0; i < listAttributes.length; i++) {
            const element = listAttributes[i];
            if (element.label.get() == label) {
                listAttributes.splice(i, 1);
            }
        }
    }

    ///////////////////////////////////////////////////////////////////
    //                          PRIVATES                             //
    ///////////////////////////////////////////////////////////////////

    public async _categoryExist(node: any, categoryName: string): Promise<any> {
        const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);

        const found = categories.find(el => {
            return el.info.name.get() === categoryName;
        })

        return found;
    }

    public async _getCategoryElement(categoryNode: any): Promise<any> {
        const element = await categoryNode.getElement();
        return {
            element: element,
            nameCat: categoryNode.info.name.get(),
            node: categoryNode
        }
    }

    public _labelExistInCategory(category: any, argAttributeName: string): boolean {
        if (category && category.element) {
            const attributes = category.element instanceof Model ? category.element.get() : category.element;

            return attributes.find(el => {
                if (el instanceof Model) {
                    return el.get() === argAttributeName;
                } else {
                    return el === argAttributeName;
                }
            })
        }
    }

    public async _attributeExist(node: any, argAttributeName: string): Promise<any> {
        const attributes = await node.getChildren([NODE_TO_ATTRIBUTE]);

        return attributes.find(el => {
            return el.info.name.get() === `[Attributes] ${argAttributeName}`;
        })

    }

    public _getCategoryName(category: any): string {

        if (category && category.name) {
            return category.name instanceof Model ? category.name.get() : category.name;
        } else if (category) {
            return category instanceof Model ? category.get() : category;
        }
    }

    public removeNode(node: any) {
        node.removeFromGraph();
    }

}

export default AttributeService;

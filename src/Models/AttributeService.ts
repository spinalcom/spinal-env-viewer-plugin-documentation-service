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

import { FileSystem, Lst, Model } from 'spinal-core-connectorjs_type';
import geographicService from 'spinal-env-viewer-context-geographic-service';
import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
  SpinalNode,
} from 'spinal-env-viewer-graph-service';
import { SpinalAttribute } from 'spinal-models-documentation';
import type { ICategory } from '../interfaces';
import {
  ATTRIBUTE_TYPE,
  BUILDINGINFORMATION,
  BUILDINGINFORMATIONCATNAME,
  CATEGORY_TYPE,
  NODE_TO_ATTRIBUTE,
  NODE_TO_CATEGORY_RELATION,
} from './constants';

/**
 * @class AttributeService
 */
class AttributeService {
  constructor() {}

  /**
   * This method creates a category and link it to the node passed in parameter. It returs an object of category
   * @param  {SpinalNode<any>} node - node on which the category must be linked
   * @param  {string} categoryName - The category name
   * @return {*}  {Promise<ICategory>}
   * @memberof AttributeService
   */
  public async addCategoryAttribute(
    node: SpinalNode<any>,
    categoryName: string
  ): Promise<ICategory> {
    categoryName = categoryName.toString().trim();
    if (!(node instanceof SpinalNode))
      throw new Error('Node must be a SpinalNode.');
    if (categoryName.toString().trim().length === 0)
      throw new Error(
        'Category name must be a string and have at leat one character.'
      );

    const categoryExist = await this.getCategoryByName(node, categoryName);
    if (categoryExist) return categoryExist;

    const categoryModel = new SpinalNode(
      categoryName,
      CATEGORY_TYPE,
      new Lst()
    );
    const categoryFound = await node.addChild(
      categoryModel,
      NODE_TO_CATEGORY_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
    return this._getCategoryElement(categoryFound);
  }

  /**
   * This method deletes a category from the given node.
   * @param  {SpinalNode<any>} node - node on which the category to be deleted is
   * @param  {number} serverId - The server ID for the category to delete
   * @return {*}  {Promise<void>}
   * @memberof AttributeService
   */
  public async delCategoryAttribute(
    node: SpinalNode<any>,
    serverId: number
  ): Promise<void> {
    if (!(node instanceof SpinalNode))
      throw new Error('Node must be a SpinalNode.');
    if (serverId === 0) throw new Error('Invalid server ID.');

    const child = FileSystem._objects[serverId];
    if (child instanceof SpinalNode) {
      await node.removeChild(
        child,
        NODE_TO_CATEGORY_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE
      );
    }
  }

  /**
   * @param {SpinalNode<any>} node
   * @param {(SpinalNode<any> | ICategory | string)} category
   * @return {*}  {Promise<void>}
   * @memberof AttributeService
   */
  public async deleteAttributeCategory(
    node: SpinalNode<any>,
    category: SpinalNode<any> | ICategory | string
  ): Promise<void> {
    let _category;
    if (category instanceof SpinalNode) {
      _category = category;
    } else if (typeof category === 'string') {
      let temp = await this.getCategoryByName(node, category);
      _category = temp.node;
    } else if (category.node instanceof SpinalNode) {
      _category = category.node;
    }

    if (_category instanceof SpinalNode)
      return node.removeChild(
        _category,
        NODE_TO_CATEGORY_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE
      );

    throw new Error('category not found');
  }

  /**
   * This method changes the name of a category from the given node.
   * @param  {SpinalNode<any>} node - node on which the category to be edited is
   * @param  {number} serverId - The server ID for the category to edit
   * @param  {string} categoryName - The new category name
   * @return {*}  {Promise<void>}
   * @memberof AttributeService
   */
  public async editCategoryAttribute(
    node: SpinalNode<any>,
    serverId: number,
    categoryName: string
  ): Promise<void> {
    categoryName = categoryName.toString().trim();

    if (!(node instanceof SpinalNode))
      throw new Error('Node must be a SpinalNode.');
    if (serverId === 0) throw new Error('Invalid server ID.');
    if (categoryName.length === 0)
      throw new Error(
        'Category name must be a string and have at leat one character.'
      );

    const child = FileSystem._objects[serverId];
    if (child instanceof SpinalNode) {
      child.info.name.set(categoryName);
    }
  }

  /**
   * This method takes as parameter a node and return an array of All categories of attributes linked to this node
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<ICategory[]>}
   * @memberof AttributeService
   */
  public async getCategory(node: SpinalNode<any>): Promise<ICategory[]> {
    if (!(node instanceof SpinalNode))
      throw new Error('node must be a SpinalNode instance');

    const categories = await node.getChildren(NODE_TO_CATEGORY_RELATION);

    const promises = categories.map((el) => this._getCategoryElement(el));

    return Promise.all(promises);
  }

  /**
   * This method takes a node and string(category name) as parameters and check if the node has a categorie of attribute which matches the category name
   * @param  {SpinalNode<any>} node
   * @param  {string} categoryName
   * @return {*}  {Promise<ICategory>}
   * @memberof AttributeService
   */
  public async getCategoryByName(
    node: SpinalNode<any>,
    categoryName: string
  ): Promise<ICategory> {
    categoryName = categoryName.toString().trim();
    if (!(node instanceof SpinalNode))
      throw new Error('node must be a spinalNode instance');
    if (!categoryName || categoryName.length === 0)
      throw new Error(
        'category name must be a string and have at leat one character'
      );

    const categories = await this.getCategory(node);

    return categories.find((el) => {
      return el.nameCat.toString().trim() === categoryName;
    });
  }

  /**
   * Updates the category name
   * @param {SpinalNode<any>} node
   * @param {(SpinalNode<any> | ICategory | string)} category
   * @param {string} newName
   * @return {*}  {Promise<ICategory>}
   * @memberof AttributeService
   */
  public async updateCategoryName(
    node: SpinalNode<any>,
    category: SpinalNode<any> | ICategory | string,
    newName: string
  ): Promise<ICategory> {
    newName = newName.toString().trim();

    if (!newName || newName.length === 0)
      throw new Error(
        'category name must be a string and have at leat one character'
      );

    if (category instanceof SpinalNode) {
      category.info.name.set(newName);
      return this._getCategoryElement(category);
    } else if (typeof category === 'string') {
      let _category = await this.getCategoryByName(node, category);
      _category.node.info.name.set(newName);
      return _category;
    } else if (category.node instanceof SpinalNode) {
      category.node.info.name.set(newName);
      return category;
    }

    throw new Error('category not found');
  }

  /**
   * This method adds(if not exists) an attribute in a category (creates the category if not exist)
   * @param {SpinalNode<any>} node
   * @param {string} [categoryName='']
   * @param {string} [label='']
   * @param {string} [value='']
   * @param {string} [type='']
   * @param {string} [unit='']
   * @return {*}  {Promise<SpinalAttribute>}
   * @memberof AttributeService
   */
  public async addAttributeByCategoryName(
    node: SpinalNode<any>,
    categoryName: string = '',
    label: string = '',
    value: string = '',
    type: string = '',
    unit: string = ''
  ): Promise<SpinalAttribute> {
    categoryName = categoryName.toString().trim();
    label = label.toString().trim();
    value = typeof value === 'string' ? value.toString().trim() : value;
    type = type.toString().trim();
    unit = unit.toString().trim();

    if (!(node instanceof SpinalNode))
      throw new Error('node must be a spinalNode instance');
    if (!label || label.toString().trim().length === 0)
      throw new Error(
        'attribute label must be a string and have at leat one character'
      );
    if (!categoryName || categoryName.toString().trim().length === 0)
      throw new Error(
        'category name must be a string and have at leat one character'
      );
    if (typeof value === 'undefined')
      throw new Error('The attribute value is required');

    let category = await this.getCategoryByName(node, categoryName);

    if (!category) {
      category = await this.addCategoryAttribute(node, categoryName);
    }

    return this.addAttributeByCategory(
      node,
      category,
      label,
      value,
      type,
      unit
    );
  }

  /**
   * This method adds(if not exists) or update(if exists) an attribute in a category
   * @param {SpinalNode<any>} node
   * @param {ICategory} category
   * @param {string} [label='']
   * @param {string} [value='']
   * @param {string} [type='']
   * @param {string} [unit='']
   * @return {*}  {SpinalAttribute}
   * @memberof AttributeService
   */
  public addAttributeByCategory(
    node: SpinalNode<any>,
    category: ICategory,
    label: string = '',
    value: string = '',
    type: string = '',
    unit: string = ''
  ): SpinalAttribute {
    label = label.toString().trim();
    value = typeof value === 'string' ? value.toString().trim() : value;
    type = type.toString().trim();
    unit = unit.toString().trim();

    if (!(node instanceof SpinalNode))
      throw new Error('node must be a spinalNode instance');
    if (!label || label.toString().trim().length === 0)
      throw new Error(
        'attribute label must be a string and have at leat one character'
      );
    if (typeof value === 'undefined')
      throw new Error('The attribute value is required');

    const found = this._labelExistInCategory(category, label);
    if (!found) {
      const attributeModel = new SpinalAttribute(label, value, type, unit);
      category.element.push(attributeModel);
      return attributeModel;
    } else {
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
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<SpinalAttribute[]>}
   * @memberof AttributeService
   */
  public async getAllAttributes(
    node: SpinalNode<any>
  ): Promise<SpinalAttribute[]> {
    const categories = await this.getCategory(node);
    const promises = categories.map((el) => {
      return this.getAttributesByCategory(node, el.node.info.name.get());
    });

    return Promise.all(promises).then((res) => {
      const result = [];

      for (let index = 0; index < res.length; index++) {
        const element: Array<SpinalAttribute> = res[index];
        result.push(...element);
      }

      return result;
    });
  }

  /**
   * @param {SpinalNode<any>} node
   * @param {(string | ICategory)} category
   * @param {string} [label='']
   * @return {*}  {(Promise<SpinalAttribute | -1>)} : -1 when not found
   * @memberof AttributeService
   */
  public async findOneAttributeInCategory(
    node: SpinalNode<any>,
    category: string | ICategory,
    label: string = ''
  ): Promise<SpinalAttribute | -1> {
    label = label.toString().trim();
    if (!(node instanceof SpinalNode))
      throw new Error('node must be a spinalNode instance');
    const _category =
      typeof category === 'string'
        ? await this.getCategoryByName(node, category)
        : category;
    if (_category && _category.element) {
      for (let index = 0; index < _category.element.length; index++) {
        const element = _category.element[index];
        if (!!label && element.label.get().toString().trim() === label) {
          return element;
        }
      }
    }

    return -1;
  }

  /**
   * Takes as parmaters a node and a string(category name) and return all attributes of the category.
   * @param {SpinalNode<any>} node
   * @param {(string | ICategory)} category
   * @param {string} [label]
   * @return {*}  {Promise<SpinalAttribute[]>}
   * @memberof AttributeService
   */
  public async getAttributesByCategory(
    node: SpinalNode<any>,
    category: string | ICategory,
    label?: string
  ): Promise<SpinalAttribute[]> {
    if (!(node instanceof SpinalNode))
      throw new Error('node must be a spinalNode instance');
    const _category =
      typeof category === 'string'
        ? await this.getCategoryByName(node, category)
        : category;
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
  }

  /**
   * @param {SpinalNode<any>} node
   * @param {(string | ICategory)} category
   * @param {string} label
   * @param {{ label?: string; value?: string; type?: string; unit?: string }} newValues
   * @param {boolean} [createIt=false]
   * @return {*}  {Promise<SpinalAttribute>}
   * @memberof AttributeService
   */
  public async updateAttribute(
    node: SpinalNode<any>,
    category: string | ICategory,
    label: string,
    newValues: { label?: string; value?: string; type?: string; unit?: string },
    createIt: boolean = false
  ): Promise<SpinalAttribute> {
    const [attribute] = await this.getAttributesByCategory(
      node,
      category,
      label
    );
    if (!attribute && !createIt) throw new Error('no attribute found');
    else if (!attribute && createIt && newValues.value) {
      const _category =
        typeof category === 'string'
          ? await this.getCategoryByName(node, category)
          : category;
      const lab = newValues.label || label;

      return this.addAttributeByCategory(
        node,
        _category,
        label,
        newValues.value
      );
    }

    for (const key in newValues) {
      if (Object.prototype.hasOwnProperty.call(newValues, key)) {
        const value = newValues[key];
        if (attribute[key]) attribute[key].set(value);
      }
    }

    return attribute;
  }

  /**
   * This methods updates all attributes which have the old_label as label
   * @param {SpinalNode<any>} node
   * @param {string} old_label
   * @param {string} old_value
   * @param {string} new_label
   * @param {string} new_value
   * @return {*}  {Promise<void>}
   * @memberof AttributeService
   */
  public async setAttribute(
    node: SpinalNode<any>,
    old_label: string,
    old_value: string,
    new_label: string,
    new_value: string
  ): Promise<void> {
    old_label = old_label.toString().trim();
    old_value =
      typeof old_value === 'string' ? old_value.toString().trim() : old_value;
    new_label = new_label.toString().trim();
    new_value =
      typeof new_value === 'string' ? new_value.toString().trim() : new_value;

    if (!old_label || old_label.length === 0)
      throw new Error(
        'old_label must be a string and have at leat one character'
      );
    if (!new_label || new_label.length === 0)
      throw new Error(
        'new_label must be a string and have at leat one character'
      );
    if (typeof old_value === 'undefined')
      throw new Error('old_value is required');
    if (typeof new_value === 'undefined')
      throw new Error('new_value is required');

    let allAttributes = await this.getAllAttributes(node);
    for (let i = 0; i < allAttributes.length; i++) {
      const element = allAttributes[i];
      if (element.label.get() == old_label) {
        if (new_label != '') {
          element.label.set(new_label);
        }
        if (new_value != '') {
          element.value.set(new_value);
        }
      }
    }
  }

  /**
   * This methods updates the attribute with the given id from the given node
   * @param  {SpinalNode<any>} node
   * @param  {number} serverId
   * @param  {string} new_label
   * @param  {string} new_value
   * @param  {string} new_type
   * @param  {string} new_unit
   * @return {*}  {Promise<void>}
   * @memberof AttributeService
   */
  public async setAttributeById(
    node: SpinalNode<any>,
    serverId: number,
    new_label: string,
    new_value: string,
    new_type: string,
    new_unit: string
  ): Promise<void> {
    new_label = new_label.toString().trim();
    new_value =
      typeof new_value === 'string' ? new_value.toString().trim() : new_value;
    new_type = new_type.toString().trim();
    new_unit = new_unit.toString().trim();

    const labelIsValid = new_label && new_label.toString().trim().length > 0;
    const valueIsValid = typeof new_value !== 'undefined';
    if (!(labelIsValid && valueIsValid)) return;

    let allAttributes = await this.getAllAttributes(node);
    for (let i = 0; i < allAttributes.length; i++) {
      const element = allAttributes[i];
      if (element._server_id == serverId) {
        element.label.set(new_label);
        element.value.set(new_value);
        element.type.set(new_type);
        element.unit.set(new_unit);
      }
    }
  }

  /**
   * Get all attribute shared with other nodes.
   * @param  {SpinalNode<any>} node
   * @param  {string} categoryName?
   * @return {*}  {Promise<{ parentNode: SpinalNode<any>; categories: ICategory[] }[]>}
   * @memberof AttributeService
   */
  public async getAttributesShared(
    node: SpinalNode<any>,
    categoryName?: string
  ): Promise<{ parentNode: SpinalNode<any>; categories: ICategory[] }[]> {
    categoryName = categoryName.toString().trim();
    const parents = await node.getParents();
    const promises = parents.map(async (parent) => {
      const categories = await this.getCategory(parent);
      const filterCategory =
        !categoryName || categoryName.length === 0
          ? categories
          : categories.filter(
              (el) => el.nameCat.toString().trim() === categoryName
            );
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
  public async removeAttributesByLabel(
    category: ICategory,
    label: string
  ): Promise<boolean> {
    const listAttributes = await category.element.load();
    for (let i = 0; i < listAttributes.length; i++) {
      const element = listAttributes[i];
      const elementLabel = element.label.get();

      if (elementLabel.toString().trim() == label.toString().trim()) {
        listAttributes.splice(i, 1);
        return true;
      }
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
  public async removeAttributesById(
    category: ICategory,
    serverId: number
  ): Promise<boolean> {
    const listAttributes = await category.element.load();
    for (let i = 0; i < listAttributes.length; i++) {
      const element = listAttributes[i];
      if (element._server_id == serverId) {
        listAttributes.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * Takes a node of Building and return all attributes
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<SpinalAttribute[]>}
   * @memberof AttributeService
   */
  public async getBuildingInformationAttributes(
    node: SpinalNode<any>
  ): Promise<SpinalAttribute[]> {
    if (!(node instanceof SpinalNode)) return [];

    if (node.getType().get() === geographicService.constants.BUILDING_TYPE) {
      let lst: Promise<SpinalAttribute>[] = [];
      lst = BUILDINGINFORMATION.map((el: string): Promise<SpinalAttribute> => {
        return this.findAttributesByLabel(node, el);
      });

      return Promise.all(lst).then((element) =>
        element.filter((el) => typeof el !== 'undefined')
      );
    }
    return [];
  }

  /**
   * Takes a node of Building and creates all attributes
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<SpinalAttribute[]>}
   * @memberof AttributeService
   */
  public async setBuildingInformationAttributes(
    node: SpinalNode<any>
  ): Promise<SpinalAttribute[]> {
    if (!(node instanceof SpinalNode))
      node = SpinalGraphService.getRealNode(node);

    if (
      node &&
      node.getType().get() === geographicService.constants.BUILDING_TYPE
    ) {
      const category = await this.addCategoryAttribute(
        node,
        BUILDINGINFORMATIONCATNAME
      );
      const promises = BUILDINGINFORMATION.map((el) => {
        return this.addAttributeByCategory(node, category, el, 'To configure');
      });

      await Promise.all(promises);
      return this.getBuildingInformationAttributes(node);
    }

    return [];
  }

  /**
   * @param {SpinalNode<any>} node
   * @param {string} label
   * @param {ICategory} [category]
   * @return {*}  {Promise<SpinalAttribute>}
   * @memberof AttributeService
   */
  public async findAttributesByLabel(
    node: SpinalNode<any>,
    label: string,
    category?: ICategory
  ): Promise<SpinalAttribute> {
    let data: SpinalAttribute[] = [];

    if (typeof category !== 'undefined') {
      // const categoryName = this._getCategoryName(category);
      data = await this.getAttributesByCategory(node, category.nameCat);
    } else {
      data = await this.getAllAttributes(node);
    }

    return data.find((el) => el.label.get() === label);
  }

  ///////////////////////////////////////////////////////////////////
  //              ATTRIBUTES LINKED DIRECTLY TO NODE               //
  ///////////////////////////////////////////////////////////////////

  /**
   * This methods link directily the attribute to the node without use category.
   * @param {SpinalNode<any>} node
   * @param {string} label
   * @param {string} value
   * @param {string} [type='']
   * @param {string} [unit='']
   * @return {*}  {Promise<SpinalNode<any>>}
   * @memberof AttributeService
   */
  public async addAttribute(
    node: SpinalNode<any>,
    label: string,
    value: string,
    type: string = '',
    unit: string = ''
  ): Promise<SpinalNode<any>> {
    // const labelIsValid = label && label.toString().trim().length > 0;
    // const valueIsValid = typeof value !== "undefined";

    // if (!(labelIsValid && valueIsValid)) return;
    label = label.toString().trim();
    value = typeof value === 'string' ? value.toString().trim() : value;
    type = type.toString().trim();
    unit = unit.toString().trim();

    if (!(node instanceof SpinalNode))
      throw new Error('node must be a spinalNode instance');
    if (!label || label.length === 0)
      throw new Error(
        'attribute label must be a string and have at leat one character'
      );
    if (typeof value === 'undefined')
      throw new Error('The attribute value is required');

    const attributeExist = await this._attributeExist(node, label);

    if (attributeExist) {
      return attributeExist;
    }

    const attributeModel = new SpinalAttribute(label, value, type, unit);
    const attributeNode = new SpinalNode(
      `[Attributes] ${label}`,
      ATTRIBUTE_TYPE,
      attributeModel
    );
    await node.addChild(
      attributeNode,
      NODE_TO_ATTRIBUTE,
      SPINAL_RELATION_PTR_LST_TYPE
    );
    return attributeNode;
  }

  /**
   * get and returns all attribute linked directely to the node
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<{ node: SpinalNode<any>; element: SpinalAttribute }[]>}
   * @memberof AttributeService
   */
  public async getAttributes(
    node: SpinalNode<any>
  ): Promise<{ node: SpinalNode<any>; element: SpinalAttribute }[]> {
    const attributes = await node.getChildren(NODE_TO_ATTRIBUTE);
    const promises = attributes.map(async (el) => {
      return {
        node: el,
        element: await el.getElement(),
      };
    });

    return Promise.all(promises);
  }

  ///////////////////////////////////////////////////////////////////
  //                          PRIVATES                             //
  ///////////////////////////////////////////////////////////////////

  /**
   * Check if category is linked to node and return it.
   * @param {SpinalNode<any>} node
   * @param {string} categoryName
   * @return {*}  {Promise<SpinalNode<any>>}
   * @memberof AttributeService
   */
  public async _categoryExist(
    node: SpinalNode<any>,
    categoryName: string
  ): Promise<SpinalNode<any>> {
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
   * @param {SpinalNode<any>} categoryNode
   * @return {*}  {Promise<ICategory>}
   * @memberof AttributeService
   */
  public async _getCategoryElement(
    categoryNode: SpinalNode<any>
  ): Promise<ICategory> {
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
  public _labelExistInCategory(
    category: ICategory,
    argAttributeName: string
  ): boolean {
    let found = false;
    if (category && category.element) {
      const attributes =
        category.element instanceof Model
          ? category.element.get()
          : category.element;

      found = attributes.find((el) => {
        if (el instanceof Model) {
          return el.label.get() === argAttributeName;
        } else {
          return el.label === argAttributeName;
        }
      });
    }

    return found;
  }

  /**
   * Check if an attribute is directely link to the node
   * @param {SpinalNode<any>} node
   * @param {string} argAttributeName
   * @return {*}  {Promise<SpinalNode<any>>}
   * @memberof AttributeService
   */
  public async _attributeExist(
    node: SpinalNode<any>,
    argAttributeName: string
  ): Promise<SpinalNode<any>> {
    const attributes = await node.getChildren([NODE_TO_ATTRIBUTE]);

    return attributes.find((el) => {
      return el.getName().get() === `[Attributes] ${argAttributeName}`;
    });
  }

  /**
   * @param {SpinalNode<any>} node
   * @return {*}  {Promise<void>}
   * @memberof AttributeService
   */
  public removeNode(node: SpinalNode<any>): Promise<void> {
    return node.removeFromGraph();
  }

  /**
   * @private
   * @param {spinal.Lst<SpinalAttribute>} Lst
   * @param {string} value
   * @return {*}  {SpinalAttribute}
   * @memberof AttributeService
   */
  private _findInLst(
    Lst: spinal.Lst<SpinalAttribute>,
    value: string
  ): SpinalAttribute {
    for (let index = 0; index < Lst.length; index++) {
      const element = Lst[index];
      if (element.label.get() == value) return element;
    }
  }
}

const attributeService = new AttributeService();

export { AttributeService, attributeService };

export default AttributeService;

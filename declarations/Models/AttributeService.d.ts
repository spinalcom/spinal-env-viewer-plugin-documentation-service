import { SpinalNode } from 'spinal-env-viewer-graph-service';
import { SpinalAttribute } from 'spinal-models-documentation';
import type { ICategory } from '../interfaces';
/**
 * @class AttributeService
 */
declare class AttributeService {
    constructor();
    /**
     * This method creates a category and link it to the node passed in parameter. It returs an object of category
     * @param  {SpinalNode<any>} node - node on which the category must be linked
     * @param  {string} categoryName - The category name
     * @return {*}  {Promise<ICategory>}
     * @memberof AttributeService
     */
    addCategoryAttribute(node: SpinalNode<any>, categoryName: string): Promise<ICategory>;
    /**
     * This method deletes a category from the given node.
     * @param  {SpinalNode<any>} node - node on which the category to be deleted is
     * @param  {number} serverId - The server ID for the category to delete
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    delCategoryAttribute(node: SpinalNode<any>, serverId: number): Promise<void>;
    /**
     * @param {SpinalNode<any>} node
     * @param {(SpinalNode<any> | ICategory | string)} category
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    deleteAttributeCategory(node: SpinalNode<any>, category: SpinalNode<any> | ICategory | string): Promise<void>;
    /**
     * This method changes the name of a category from the given node.
     * @param  {SpinalNode<any>} node - node on which the category to be edited is
     * @param  {number} serverId - The server ID for the category to edit
     * @param  {string} categoryName - The new category name
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    editCategoryAttribute(node: SpinalNode<any>, serverId: number, categoryName: string): Promise<void>;
    /**
     * This method takes as parameter a node and return an array of All categories of attributes linked to this node
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<ICategory[]>}
     * @memberof AttributeService
     */
    getCategory(node: SpinalNode<any>): Promise<ICategory[]>;
    /**
     * This method takes a node and string(category name) as parameters and check if the node has a categorie of attribute which matches the category name
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName
     * @return {*}  {Promise<ICategory>}
     * @memberof AttributeService
     */
    getCategoryByName(node: SpinalNode<any>, categoryName: string): Promise<ICategory>;
    /**
     * Updates the category name
     * @param {SpinalNode<any>} node
     * @param {(SpinalNode<any> | ICategory | string)} category
     * @param {string} newName
     * @return {*}  {Promise<ICategory>}
     * @memberof AttributeService
     */
    updateCategoryName(node: SpinalNode<any>, category: SpinalNode<any> | ICategory | string, newName: string): Promise<ICategory>;
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
    addAttributeByCategoryName(node: SpinalNode<any>, categoryName?: string, label?: string, value?: string, type?: string, unit?: string): Promise<SpinalAttribute>;
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
    addAttributeByCategory(node: SpinalNode<any>, category: ICategory, label?: string, value?: string, type?: string, unit?: string): SpinalAttribute;
    /**
     * Returns an array of all SpinalAttirbute with all categories
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    getAllAttributes(node: SpinalNode<any>): Promise<SpinalAttribute[]>;
    /**
     * @param {SpinalNode<any>} node
     * @param {(string | ICategory)} category
     * @param {string} [label='']
     * @return {*}  {(Promise<SpinalAttribute | -1>)} : -1 when not found
     * @memberof AttributeService
     */
    findOneAttributeInCategory(node: SpinalNode<any>, category: string | ICategory, label?: string): Promise<SpinalAttribute | -1>;
    /**
     * Takes as parmaters a node and a string(category name) and return all attributes of the category.
     * @param {SpinalNode<any>} node
     * @param {(string | ICategory)} category
     * @param {string} [label]
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    getAttributesByCategory(node: SpinalNode<any>, category: string | ICategory, label?: string): Promise<SpinalAttribute[]>;
    /**
     * @param {SpinalNode<any>} node
     * @param {(string | ICategory)} category
     * @param {string} label
     * @param {{ label?: string; value?: string; type?: string; unit?: string }} newValues
     * @param {boolean} [createIt=false]
     * @return {*}  {Promise<SpinalAttribute>}
     * @memberof AttributeService
     */
    updateAttribute(node: SpinalNode<any>, category: string | ICategory, label: string, newValues: {
        label?: string;
        value?: string;
        type?: string;
        unit?: string;
    }, createIt?: boolean): Promise<SpinalAttribute>;
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
    setAttribute(node: SpinalNode<any>, old_label: string, old_value: string, new_label: string, new_value: string): Promise<void>;
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
    setAttributeById(node: SpinalNode<any>, serverId: number, new_label: string, new_value: string, new_type: string, new_unit: string): Promise<void>;
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @return {*}  {Promise<{ parentNode: SpinalNode<any>; categories: ICategory[] }[]>}
     * @memberof AttributeService
     */
    getAttributesShared(node: SpinalNode<any>, categoryName?: string): Promise<{
        parentNode: SpinalNode<any>;
        categories: ICategory[];
    }[]>;
    /**
     * Get all attribute shared with other nodes.
     * @param {ICategory} category
     * @param {string} label
     * @return {*}  {Promise<boolean>}
     * @memberof AttributeService
     */
    removeAttributesByLabel(category: ICategory, label: string): Promise<boolean>;
    /**
     * Get all attribute shared with other nodes.
     * @param {ICategory} category
     * @param {number} serverId
     * @return {*}  {Promise<boolean>}
     * @memberof AttributeService
     */
    removeAttributesById(category: ICategory, serverId: number): Promise<boolean>;
    /**
     * Takes a node of Building and return all attributes
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    getBuildingInformationAttributes(node: SpinalNode<any>): Promise<SpinalAttribute[]>;
    /**
     * Takes a node of Building and creates all attributes
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    setBuildingInformationAttributes(node: SpinalNode<any>): Promise<SpinalAttribute[]>;
    /**
     * @param {SpinalNode<any>} node
     * @param {string} label
     * @param {ICategory} [category]
     * @return {*}  {Promise<SpinalAttribute>}
     * @memberof AttributeService
     */
    findAttributesByLabel(node: SpinalNode<any>, label: string, category?: ICategory): Promise<SpinalAttribute>;
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
    addAttribute(node: SpinalNode<any>, label: string, value: string, type?: string, unit?: string): Promise<SpinalNode<any>>;
    /**
     * get and returns all attribute linked directely to the node
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<{ node: SpinalNode<any>; element: SpinalAttribute }[]>}
     * @memberof AttributeService
     */
    getAttributes(node: SpinalNode<any>): Promise<{
        node: SpinalNode<any>;
        element: SpinalAttribute;
    }[]>;
    /**
     * Check if category is linked to node and return it.
     * @param {SpinalNode<any>} node
     * @param {string} categoryName
     * @return {*}  {Promise<SpinalNode<any>>}
     * @memberof AttributeService
     */
    _categoryExist(node: SpinalNode<any>, categoryName: string): Promise<SpinalNode<any>>;
    /**
     * Takes a category node and format it like an ICategory type;
     * @param {SpinalNode<any>} categoryNode
     * @return {*}  {Promise<ICategory>}
     * @memberof AttributeService
     */
    _getCategoryElement(categoryNode: SpinalNode<any>): Promise<ICategory>;
    /**
     * Check if an attribute exists in a category
     * @param {ICategory} category
     * @param {string} argAttributeName
     * @return {*}  {boolean}
     * @memberof AttributeService
     */
    _labelExistInCategory(category: ICategory, argAttributeName: string): boolean;
    /**
     * Check if an attribute is directely link to the node
     * @param {SpinalNode<any>} node
     * @param {string} argAttributeName
     * @return {*}  {Promise<SpinalNode<any>>}
     * @memberof AttributeService
     */
    _attributeExist(node: SpinalNode<any>, argAttributeName: string): Promise<SpinalNode<any>>;
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    removeNode(node: SpinalNode<any>): Promise<void>;
    /**
     * @private
     * @param {spinal.Lst<SpinalAttribute>} Lst
     * @param {string} value
     * @return {*}  {SpinalAttribute}
     * @memberof AttributeService
     */
    private _findInLst;
}
declare const attributeService: AttributeService;
export { AttributeService, attributeService };
export default AttributeService;

import type { ICategory } from '../interfaces';
import { Lst } from 'spinal-core-connectorjs';
import { SpinalNode } from 'spinal-model-graph';
import { SpinalAttribute } from 'spinal-models-documentation';
/**
 * @class AttributeService
 */
declare class AttributeService {
    constructor();
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
    addCategoryAttribute(node: SpinalNode, categoryName: string): Promise<ICategory>;
    /**
     * This method deletes a category from the given node using the category server ID.
     * @param  {SpinalNode} node - node on which the category to be deleted is linked
     * @param  {number} serverId - The server ID for the category to delete
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the server ID is invalid
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    delCategoryAttribute(node: SpinalNode, serverId: number): Promise<void>;
    /**
     * This method deletes a category from the given node using the category name or the category object.
     * @param {SpinalNode} node
     * @param {(SpinalNode | ICategory | string)} category
     * @return {*}  {Promise<void>}
     * @throws {Error} When the category is not found or the input is invalid
     * @memberof AttributeService
     */
    deleteAttributeCategory(node: SpinalNode, category: SpinalNode | ICategory | string): Promise<void>;
    /**
     * This method takes as parameter a node and return an array of All categories of attributes linked to this node
     * @param {SpinalNode} node
     * @return {*}  {Promise<ICategory[]>}
     * @throws {Error} When the node is not a SpinalNode
     * @memberof AttributeService
     */
    getCategory(node: SpinalNode): Promise<ICategory[]>;
    /**
     * This method takes a node and string(category name) as parameters and check if the node has a category of attribute which matches the category name
     * @param  {SpinalNode} node
     * @param  {string} categoryName
     * @return {*}  {Promise<ICategory | undefined>} return the category if found or undefined if not found
     * @throws {Error} When the node is not a SpinalNode
     * @throws {Error} When the category name is invalid
     * @memberof AttributeService
     */
    getCategoryByName(node: SpinalNode, categoryName: string): Promise<ICategory | undefined>;
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
    editCategoryAttribute(node: SpinalNode, serverId: number, categoryName: string): void;
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
    updateCategoryName(node: SpinalNode, category: SpinalNode | ICategory | string, newName: string): Promise<ICategory>;
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
    addAttributeByCategoryName(node: SpinalNode, categoryName: string, label: string, value?: string, type?: string, unit?: string): Promise<SpinalAttribute>;
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
    addAttributeByCategory(unused: any, category: ICategory, label: string, value: string, type?: string, unit?: string): SpinalAttribute | undefined;
    /**
     * Returns an array of all SpinalAttribute with all categories
     * @param {SpinalNode} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    getAllAttributes(node: SpinalNode): Promise<SpinalAttribute[]>;
    /**
     * @param {SpinalNode} node
     * @param {(string | ICategory)} category
     * @param {string} label
     * @return {*}  {(Promise<SpinalAttribute | -1>)} : -1 when not found
     * @memberof AttributeService
     */
    findOneAttributeInCategory(node: SpinalNode, category: string | ICategory, label: string): Promise<SpinalAttribute | -1>;
    /**
     * Takes as parmaters a node and a string(category name) and return all attributes of the category.
     * @param {SpinalNode} node
     * @param {(string | ICategory)} category
     * @param {string} [label]
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    getAttributesByCategory(node: SpinalNode, category: string | ICategory, label?: string): Promise<SpinalAttribute[]>;
    /**
     * @param {SpinalNode} node
     * @param {(string | ICategory)} category
     * @param {string} label
     * @param {{ label?: string; value?: string; type?: string; unit?: string }} newValues
     * @param {boolean} [createIt=false]
     * @return {*}  {Promise<SpinalAttribute>}
     * @memberof AttributeService
     */
    updateAttribute(node: SpinalNode, category: string | ICategory, label: string, newValues: {
        label?: string;
        value?: string;
        type?: string;
        unit?: string;
    }, createIt?: boolean): Promise<SpinalAttribute>;
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
    setAttribute(node: SpinalNode, old_label: string, old_value: string, new_label: string, new_value: string): Promise<void>;
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
    setAttributeById(node: SpinalNode, serverId: number, new_label?: string, new_value?: string, new_type?: string, new_unit?: string): Promise<void>;
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode} node
     * @param  {string} categoryName?
     * @return {*}  {Promise<{ parentNode: SpinalNode; categories: ICategory[] }[]>}
     * @memberof AttributeService
     */
    getAttributesShared(node: SpinalNode, categoryName?: string): Promise<{
        parentNode: SpinalNode;
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
     * @param {SpinalNode} node
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    getBuildingInformationAttributes(node: SpinalNode): Promise<SpinalAttribute[]>;
    /**
     * Takes a node of Building and creates all attributes
     * @param {SpinalNode | string} node node or nodeId
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof AttributeService
     */
    setBuildingInformationAttributes(node: SpinalNode | string): Promise<SpinalAttribute[]>;
    /**
     * @param {SpinalNode} node
     * @param {string} label
     * @param {ICategory} [category]
     * @return {*}  {Promise<SpinalAttribute>}
     * @memberof AttributeService
     */
    findAttributesByLabel(node: SpinalNode, label: string, category?: ICategory): Promise<SpinalAttribute | undefined>;
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
    getAttrBySchema<T extends Record<string, readonly string[]>>(node: SpinalNode, docSchema: T): Promise<{
        [K in keyof T]: {
            [V in T[K][number]]: string;
        };
    }>;
    /**
     * Creates or updates attributes and categories in bulk for a given node.
     *
     * @param node - The SpinalNode to create or update attributes and categories for.
     * @param categoryName - The name of the category.
     * @param attrsToUp - The attributes to create or update, represented as a record where the keys are the attribute labels and the values are the attribute values.
     * @returns A Promise that resolves when the attributes and categories have been created or updated.
     */
    createOrUpdateAttrsAndCategories(node: SpinalNode, categoryName: string, attrsToUp: Record<string, string>): Promise<void>;
    /**
     * Check if category is linked to node and return it.
     * @param {SpinalNode} node
     * @param {string} categoryName
     * @return {*}  {Promise<SpinalNode>}
     * @memberof AttributeService
     */
    _categoryExist(node: SpinalNode, categoryName: string): Promise<SpinalNode | undefined>;
    /**
     * Takes a category node and format it like an ICategory type;
     * @param {SpinalNode<Lst<SpinalAttribute>>} categoryNode
     * @return {*}  {Promise<ICategory>}
     * @memberof AttributeService
     */
    _getCategoryElement(categoryNode: SpinalNode<Lst<SpinalAttribute>>): Promise<ICategory>;
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
     * @param {SpinalNode} node
     * @param {string} argAttributeName
     * @return {*}  {Promise<SpinalNode>}
     * @memberof AttributeService
     */
    _attributeExist(node: SpinalNode, argAttributeName: string): Promise<SpinalNode | undefined>;
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<void>}
     * @memberof AttributeService
     */
    removeNode(node: SpinalNode): Promise<void>;
    /**
     * @private
     * @param {spinal.Lst<SpinalAttribute>} Lst
     * @param {string} label
     * @return {*}  {SpinalAttribute}
     * @memberof AttributeService
     */
    private _findInLst;
    private validateICategoryOrString;
}
declare const attributeService: AttributeService;
export { AttributeService, attributeService };
export default AttributeService;

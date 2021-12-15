import { SpinalAttribute } from 'spinal-models-documentation';
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { ICategory } from "../interfaces";
declare class AttributeService {
    private instanceCreated;
    constructor();
    /**
     * This method creates a category and link it to the node passed in parameter. It returs an object of category
     * @param  {SpinalNode<any>} node - node on which the category must be linked
     * @param  {string} categoryName - The category name
     * @returns Promise
     */
    addCategoryAttribute(node: SpinalNode<any>, categoryName: string): Promise<ICategory>;
    /**
     * This method deletes a category from the given node.
     * @param  {SpinalNode<any>} node - node on which the category to be deleted is
     * @param  {number} serverId - The server ID for the category to delete
     * @returns Promise
     */
    delCategoryAttribute(node: SpinalNode<any>, serverId: number): Promise<any>;
    deleteAttributeCategory(node: SpinalNode<any>, category: SpinalNode<any> | ICategory | string): Promise<void>;
    /**
     * This method changes the name of a category from the given node.
     * @param  {SpinalNode<any>} node - node on which the category to be edited is
     * @param  {number} serverId - The server ID for the category to edit
     * @param  {string} categoryName - The new category name
     * @returns Promise
     */
    editCategoryAttribute(node: SpinalNode<any>, serverId: number, categoryName: string): Promise<any>;
    /**
     * This method takes as parameter a node and return an array of All categories of attributes linked to this node
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    getCategory(node: SpinalNode<any>): Promise<Array<ICategory>>;
    /**
     * This method takes a node and string(category name) as parameters and check if the node has a categorie of attribute which matches the category name
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName
     * @returns Promise
     */
    getCategoryByName(node: SpinalNode<any>, categoryName: string): Promise<ICategory>;
    /**
     * Updates the category name
     * @param  {SpinalNode<any>} node
     * @param  {SpinalNode<any>|ICategory|string} category
     * @param  {string} newName
     * @returns Promise
     */
    updateCategoryName(node: SpinalNode<any>, category: SpinalNode<any> | ICategory | string, newName: string): Promise<ICategory>;
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
    addAttributeByCategoryName(node: SpinalNode<any>, categoryName?: string, label?: string, value?: string, type?: string, unit?: string): Promise<SpinalAttribute>;
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
    addAttributeByCategory(node: SpinalNode<any>, category: ICategory, label?: string, value?: string, type?: string, unit?: string): SpinalAttribute;
    /**
     * Returns an array of all SpinalAttirbute with all categories
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    getAllAttributes(node: SpinalNode<any>): Promise<Array<SpinalAttribute>>;
    /**
     * Takes as parmaters a node and a string(category name) and return all attributes of the category.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName
     * @param  {string} label?
     * @returns Promise
     */
    getAttributesByCategory(node: SpinalNode<any>, category: string | ICategory, label?: string): Promise<Array<SpinalAttribute>>;
    updateAttribute(node: SpinalNode<any>, category: string | ICategory, label: string, newValues: {
        label?: string;
        value?: string;
        type?: string;
        unit?: string;
    }): Promise<Array<SpinalAttribute>>;
    /**
     * This methods updates all attributes which have the old_label as label
     * @param  {SpinalNode<any>} node
     * @param  {string} old_label
     * @param  {string} old_value
     * @param  {string} new_label
     * @param  {string} new_value
     * @returns Promise
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
     * @returns Promise
     */
    setAttributeById(node: SpinalNode<any>, serverId: number, new_label: string, new_value: string, new_type: string, new_unit: string): Promise<any>;
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @returns Promise
     */
    getAttributesShared(node: SpinalNode<any>, categoryName?: string): Promise<Array<{
        parentNode: SpinalNode<any>;
        categories: ICategory[];
    }>>;
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @returns Promise
     */
    removeAttributesByLabel(category: ICategory, label: string): Promise<boolean>;
    /**
     * Get all attribute shared with other nodes.
     * @param  {SpinalNode<any>} node
     * @param  {string} categoryName?
     * @returns Promise
     */
    removeAttributesById(category: ICategory, serverId: number): Promise<boolean>;
    /**
     * Takes a node of Building and return all attributes
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    getBuildingInformationAttributes(node: SpinalNode<any>): Promise<any[]>;
    /**
     * Takes a node of Building and creates all attributes
     * @param  {SpinalNode<any>} node
     * @returns Promise
     */
    setBuildingInformationAttributes(node: SpinalNode<any>): Promise<any[]>;
    findAttributesByLabel(node: SpinalNode<any>, label: string, category?: ICategory): Promise<any>;
    /**
     * This methods link directily the attribute to the node without use category.
     * @param  {SpinalNode<any>} node
     * @param  {string} label
     * @param  {string} value
     * @param  {string=""} type
     * @param  {string=""} unit
     * @returns Promise
     */
    addAttribute(node: SpinalNode<any>, label: string, value: string, type?: string, unit?: string): Promise<SpinalNode<any>>;
    /**
     * get and returns all attribute linked directely to the node
     * @param  {SpinalNode<any>} node
     * @returns SpinalAttribute
     */
    getAttributes(node: SpinalNode<any>): Promise<Array<{
        node: SpinalNode<any>;
        element: SpinalAttribute;
    }>>;
    /**
     * Check if category is linked to node and return it.
     * @param  {any} node
     * @param  {string} categoryName
     * @returns Promise
     */
    _categoryExist(node: any, categoryName: string): Promise<any>;
    /**
     * Takes a category node and format it like an ICategory type;
     * @param  {SpinalNode<any>} categoryNode
     * @returns Promise
     */
    _getCategoryElement(categoryNode: SpinalNode<any>): Promise<ICategory>;
    /**
     * Check if an attribute exists in a category
     * @param  {ICategory} category
     * @param  {string} argAttributeName
     * @returns boolean
     */
    _labelExistInCategory(category: ICategory, argAttributeName: string): boolean;
    /**
     * Check if an attribute is directely link to the node
     * @param  {SpinalNode<any>} node
     * @param  {string} argAttributeName
     * @returns Promise
     */
    _attributeExist(node: SpinalNode<any>, argAttributeName: string): Promise<SpinalNode<any>>;
    removeNode(node: any): void;
}
declare const attributeService: AttributeService;
export { AttributeService, attributeService };
export default AttributeService;

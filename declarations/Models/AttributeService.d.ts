declare class AttributeService {
    private instanceCreated;
    constructor();
    addCategoryAttribute(node: any, label: string): Promise<any>;
    getCategoryByName(node: any, categoryName: string): Promise<any>;
    getCategory(node: any): Promise<any>;
    getAttributesByCategory(node: any, categoryName: string): Promise<Array<any>>;
    addAttributeByCategory(node: any, category: any, label: string, value: string): void;
    addAttributeByCategoryName(node: any, categoryName: string, label: string, value: string): Promise<void>;
    addAttribute(node: any, label: string, value: string): Promise<void>;
    getAllAttributes(node: any): Promise<any>;
    getAttributes(node: any): Promise<any>;
    compareAttr(listAttr1: any, listAttr2: any): any[];
    getAttributesShared(listOfdbId: number[]): Promise<any>;
    getBuildingInformationAttributes(node: any): Promise<any[]>;
    setBuildingInformationAttributes(node: any): Promise<any[]>;
    findAttributesByLabel(node: any, label: string, category?: any): Promise<any>;
    removeAttributesByLabel(node: any, label: string): void;
    _categoryExist(node: any, categoryName: string): Promise<any>;
    _getCategoryElement(categoryNode: any): Promise<any>;
    _labelExistInCategory(category: any, argAttributeName: string): boolean;
    _attributeExist(node: any, argAttributeName: string): Promise<any>;
    _getCategoryName(category: any): string;
    removeNode(node: any): void;
}
export default AttributeService;

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
Object.defineProperty(exports, "__esModule", { value: true });
const AttributeService_1 = require("./Models/AttributeService");
const NoteService_1 = require("./Models/NoteService");
const UrlService_1 = require("./Models/UrlService");
function applyMixins(derivedConstructor, baseConstructors) {
    baseConstructors.forEach(baseConstructor => {
        Object.getOwnPropertyNames(baseConstructor.prototype)
            .forEach(name => {
            Object.defineProperty(derivedConstructor.prototype, name, Object.
                getOwnPropertyDescriptor(baseConstructor.prototype, name));
        });
    });
}
// interface AttributeService extends NoteService, UrlService { }
applyMixins(AttributeService_1.default, [NoteService_1.default, UrlService_1.default]);
const serviceDocumentation = new AttributeService_1.default();
exports.serviceDocumentation = serviceDocumentation;
window.spinal["serviceDocumentation"] = serviceDocumentation;
exports.default = serviceDocumentation;
/*

class ServiceDocumentation implements AttributeService, NoteService, UrlService {

    ///////////////////////////////////////////////////////////////////////
    //                       Attribute Service                           //
    ///////////////////////////////////////////////////////////////////////

    addCategoryAttribute: (node: any, label: string) => Promise<any>;
    getCategoryByName: (node: any, categoryName: string) => Promise<any>;
    getCategory: (node: any) => Promise<any>;
    getAttributesByCategory: (node: any, categoryName: string) => Promise<any[]>;
    addAttributeByCategory: (node: any, category: any, label: string, value: string) => void;
    addAttributeByCategoryName: (node: any, categoryName: string, label: string, value: string) => Promise<void>;
    addAttribute: (node: any, label: string, value: string) => Promise<void>;
    getAllAttributes: (node: any) => Promise<any>;
    getAttributes: (node: any) => Promise<any>;
    compareAttr: (listAttr1: any, listAttr2: any) => any[];
    getAttributesShared: (listOfdbId: number[]) => Promise<any>;
    getBuildingInformationAttributes: (node: any) => Promise<any[]>;
    setBuildingInformationAttributes: (node: any) => Promise<any[]>;
    findAttributesByLabel: (node: any, label: string, category?: any) => Promise<any>;
    removeAttributesByLabel: (node: any, label: string) => void;

    ///////////////////////////////////////////////////////////////////////
    //                         NOTE Service                              //
    ///////////////////////////////////////////////////////////////////////

    addNote: (node: any, userInfo: { username: string; userId: number; }, note: string) => Promise<void>;
    getNotes: (node: any) => Promise<any>;
    editNote: (element: any, note: string) => void;
    predicate: (node: any) => boolean;

    ///////////////////////////////////////////////////////////////////////
    //                          URL Service                              //
    ///////////////////////////////////////////////////////////////////////

    addURL: (node: any, urlName: string, urlLink: string) => Promise<any>;
    getURL: (node: any, urlName?: string) => Promise<any>;
    getParents: (node: any, relationNames: string[]) => Promise<any>;
    getParentGroup: (node: any) => void;
    deleteURL: (node: any, label: string) => Promise<void>;

}

*/
//# sourceMappingURL=index.js.map
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
exports.BUILDINGINFORMATIONCATNAME = exports.BUILDINGINFORMATION = exports.ATTRIBUTE_TYPE = exports.CATEGORY_TYPE = exports.NODE_TO_ATTRIBUTE = exports.NODE_TO_CATEGORY_RELATION = exports.NOTE_GROUP_NAME = exports.NOTE_CATEGORY_NAME = exports.NOTE_CONTEXT_NAME = exports.NOTE_TYPE = exports.NOTE_RELATION = exports.URL_TYPE = exports.URL_RELATION = void 0;
const URL_RELATION = 'hasURL';
exports.URL_RELATION = URL_RELATION;
const URL_TYPE = 'SpinalURL';
exports.URL_TYPE = URL_TYPE;
const NOTE_RELATION = 'hasNotes';
exports.NOTE_RELATION = NOTE_RELATION;
const NOTE_TYPE = 'SpinalNote';
exports.NOTE_TYPE = NOTE_TYPE;
const NOTE_CONTEXT_NAME = 'Default Note Context';
exports.NOTE_CONTEXT_NAME = NOTE_CONTEXT_NAME;
const NOTE_CATEGORY_NAME = 'Default Note Category';
exports.NOTE_CATEGORY_NAME = NOTE_CATEGORY_NAME;
const NOTE_GROUP_NAME = 'Default Note Group';
exports.NOTE_GROUP_NAME = NOTE_GROUP_NAME;
const NODE_TO_CATEGORY_RELATION = 'hasCategoryAttributes';
exports.NODE_TO_CATEGORY_RELATION = NODE_TO_CATEGORY_RELATION;
const NODE_TO_ATTRIBUTE = 'hasAttributes';
exports.NODE_TO_ATTRIBUTE = NODE_TO_ATTRIBUTE;
const CATEGORY_TYPE = 'categoryAttributes';
exports.CATEGORY_TYPE = CATEGORY_TYPE;
const ATTRIBUTE_TYPE = 'SpinalAttributes';
exports.ATTRIBUTE_TYPE = ATTRIBUTE_TYPE;
const BUILDINGINFORMATION = [
    'Titre',
    'Bâtiment',
    'Surface',
    'Adresse',
    'Ville',
];
exports.BUILDINGINFORMATION = BUILDINGINFORMATION;
const BUILDINGINFORMATIONCATNAME = 'Spinal Building Information';
exports.BUILDINGINFORMATIONCATNAME = BUILDINGINFORMATIONCATNAME;
//# sourceMappingURL=constants.js.map
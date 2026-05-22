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
exports.FILE_MODEL_TYPE = exports.DIRECTORY_MODEL_TYPE = exports.TO_ROOT_DIRECTORY_RELATION = exports.TO_FOLDER_RELATION = exports.TO_FILE_RELATION = exports.FILE_NODE_TYPE = exports.DIRECTORY_NODE_TYPE = exports.BUILDINGINFORMATIONCATNAME = exports.BUILDINGINFORMATION = exports.ATTRIBUTE_TYPE = exports.CATEGORY_TYPE = exports.NODE_TO_ATTRIBUTE = exports.NODE_TO_CATEGORY_RELATION = exports.NOTE_GROUP_NAME = exports.NOTE_CATEGORY_NAME = exports.NOTE_CONTEXT_NAME = exports.NOTE_TYPE = exports.NOTE_RELATION = exports.URL_TYPE = exports.URL_RELATION = void 0;
exports.URL_RELATION = "hasURL";
exports.URL_TYPE = "SpinalURL";
exports.NOTE_RELATION = "hasNotes";
exports.NOTE_TYPE = "SpinalNote";
exports.NOTE_CONTEXT_NAME = "Default Note Context";
exports.NOTE_CATEGORY_NAME = "Default Note Category";
exports.NOTE_GROUP_NAME = "Default Note Group";
exports.NODE_TO_CATEGORY_RELATION = "hasCategoryAttributes";
exports.NODE_TO_ATTRIBUTE = "hasAttributes";
exports.CATEGORY_TYPE = "categoryAttributes";
exports.ATTRIBUTE_TYPE = "SpinalAttributes";
exports.BUILDINGINFORMATION = ["Titre", "Bâtiment", "Surface", "Adresse", "Ville"];
exports.BUILDINGINFORMATIONCATNAME = "Spinal Building Information";
exports.DIRECTORY_NODE_TYPE = "SpinalDirectory";
exports.FILE_NODE_TYPE = "SpinalFile";
exports.TO_FILE_RELATION = "DirectoryhasFiles";
exports.TO_FOLDER_RELATION = "DirectoryhasDirectory";
exports.TO_ROOT_DIRECTORY_RELATION = "hasFiles";
exports.DIRECTORY_MODEL_TYPE = "Directory";
exports.FILE_MODEL_TYPE = "File";
//# sourceMappingURL=constants.js.map
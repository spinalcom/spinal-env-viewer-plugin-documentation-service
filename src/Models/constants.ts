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

export const URL_RELATION: string = "hasURL";
export const URL_TYPE: string = "SpinalURL";

export const NOTE_RELATION: string = "hasNotes";
export const NOTE_TYPE: string = "SpinalNote";
export const NOTE_CONTEXT_NAME: string = "Default Note Context";
export const NOTE_CATEGORY_NAME: string = "Default Note Category";
export const NOTE_GROUP_NAME: string = "Default Note Group";

export const NODE_TO_CATEGORY_RELATION: string = "hasCategoryAttributes";
export const NODE_TO_ATTRIBUTE: string = "hasAttributes";
export const CATEGORY_TYPE: string = "categoryAttributes";
export const ATTRIBUTE_TYPE: string = "SpinalAttributes";
export const BUILDINGINFORMATION: string[] = ["Titre", "Bâtiment", "Surface", "Adresse", "Ville"];
export const BUILDINGINFORMATIONCATNAME: string = "Spinal Building Information";

export const DIRECTORY_NODE_TYPE: string = "SpinalDirectory";
export const FILE_NODE_TYPE: string = "SpinalFile";
export const TO_FILE_RELATION: string = "DirectoryhasFiles";
export const TO_FOLDER_RELATION: string = "DirectoryhasDirectory";
export const TO_ROOT_DIRECTORY_RELATION: string = "hasFiles";

export const DIRECTORY_MODEL_TYPE: string = "Directory";
export const FILE_MODEL_TYPE: string = "File";

export const TO_DOCUMENTARY_RELATION: string = "hasDocumentation";

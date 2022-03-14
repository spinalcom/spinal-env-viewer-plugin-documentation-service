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

const URL_RELATION: string = 'hasURL';
const URL_TYPE: string = 'SpinalURL';

const NOTE_RELATION: string = 'hasNotes';
const NOTE_TYPE: string = 'SpinalNote';
const NOTE_CONTEXT_NAME: string = 'Default Note Context';
const NOTE_CATEGORY_NAME: string = 'Default Note Category';
const NOTE_GROUP_NAME: string = 'Default Note Group';

const NODE_TO_CATEGORY_RELATION: string = 'hasCategoryAttributes';
const NODE_TO_ATTRIBUTE: string = 'hasAttributes';
const CATEGORY_TYPE: string = 'categoryAttributes';
const ATTRIBUTE_TYPE: string = 'SpinalAttributes';
const BUILDINGINFORMATION: string[] = [
  'Titre',
  'Bâtiment',
  'Surface',
  'Adresse',
  'Ville',
];
const BUILDINGINFORMATIONCATNAME: string = 'Spinal Building Information';

export {
  URL_RELATION,
  URL_TYPE,
  NOTE_RELATION,
  NOTE_TYPE,
  NOTE_CONTEXT_NAME,
  NOTE_CATEGORY_NAME,
  NOTE_GROUP_NAME,
  NODE_TO_CATEGORY_RELATION,
  NODE_TO_ATTRIBUTE,
  CATEGORY_TYPE,
  ATTRIBUTE_TYPE,
  BUILDINGINFORMATION,
  BUILDINGINFORMATIONCATNAME,
};

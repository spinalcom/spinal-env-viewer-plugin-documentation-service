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
import {
  Directory,
  File as spinalFile,
  Path,
} from 'spinal-core-connectorjs_type';
import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-env-viewer-graph-service';
import { MESSAGE_TYPES } from 'spinal-models-documentation';

export class FileExplorer {
  /**
   * @static
   * @param {SpinalNode<any>} selectedNode
   * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
   * @memberof FileExplorer
   */
  public static async getDirectory(
    selectedNode: SpinalNode<any>
  ): Promise<spinal.Directory<spinal.File<spinal.Path>>> {
    if (selectedNode != undefined) {
      const fileNode = await selectedNode.getChildren('hasFiles');
      if (fileNode.length == 0) {
        return undefined;
      } else {
        let directory = await fileNode[0].getElement();
        return directory;
      }
    }
  }

  /**
   * @static
   * @param {SpinalNode<any>} selectedNode
   * @return {*}  {Promise<number>}
   * @memberof FileExplorer
   */
  public static async getNbChildren(
    selectedNode: SpinalNode<any>
  ): Promise<number> {
    const fileNode = await selectedNode.getChildren('hasFiles');
    return fileNode.length;
  }

  public static async createDirectory(
    selectedNode: SpinalNode<any>
  ): Promise<spinal.Directory<any>> {
    let nbNode = await this.getNbChildren(selectedNode);
    if (nbNode == 0) {
      let myDirectory = new Directory();
      let node = await selectedNode.addChild(
        myDirectory,
        'hasFiles',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      node.info.name.set('[Files]');
      node.info.type.set('SpinalFiles');
      return myDirectory;
    } else {
      return this.getDirectory(selectedNode);
    }
  }

  /**
   * @static
   * @param {File} file - HTML File
   * @return {*}  {string}
   * @memberof FileExplorer
   */
  public static _getFileType(file: File): string {
    const imagesExtension = [
      'JPG',
      'PNG',
      'GIF',
      'WEBP',
      'TIFF',
      'PSD',
      'RAW',
      'BMP',
      'HEIF',
      'INDD',
      'JPEG 2000',
      'SVG',
    ];
    const extension = /[^.]+$/.exec(file.name)[0];

    return imagesExtension.indexOf(extension.toUpperCase()) !== -1
      ? MESSAGE_TYPES.image
      : MESSAGE_TYPES.file;
  }

  /**
   * @static
   * @param {spinal.Directory<any>} directory
   * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
   * @return {*}  {spinal.File<any>[]}
   * @memberof FileExplorer
   */
  public static addFileUpload(
    directory: spinal.Directory<any>,
    files: (spinalFile | { name: string; buffer: Buffer })[] | FileList | any
  ): spinal.File<any>[] {
    const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;

    if (!isFileList && !Array.isArray(files)) files = [files];

    console.log("files", files)
    const res = [];

    for (let i = 0; i < files.length; i++) {
      const element = files[i];

      let filePath: spinal.Path = element.buffer
        ? new Path(element.buffer)
        : new Path(element);
      let myFile = new spinalFile(element.name, filePath, undefined);

      directory.push(myFile);
      res.push(myFile);
    }

    return res;
  }

  /**
   * @static
   * @param {SpinalNode<any>} node
   * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
   * @return {*}  {Promise<spinal.File<any>[]>}
   * @memberof FileExplorer
   */
  public static async uploadFiles(
    node: SpinalNode<any>,
    files: (spinalFile | { name: string; buffer: Buffer })[] | FileList | any
  ): Promise<spinal.File<any>[]> {
    const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
    if (!isFileList && !Array.isArray(files)) files = [files];

    const directory = await this._getOrCreateFileDirectory(node);
    return this.addFileUpload(directory, files);
  }

  public static async _getOrCreateFileDirectory(
    node: SpinalNode<any>
  ): Promise<spinal.Directory<any>> {
    let directory = await FileExplorer.getDirectory(node);

    if (!directory) {
      directory = await FileExplorer.createDirectory(node);
    }

    return directory;
  }
}

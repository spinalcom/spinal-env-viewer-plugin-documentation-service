/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import { Directory, File as SpinalFile, Path } from 'spinal-core-connectorjs';
import {
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-env-viewer-graph-service';
import { MESSAGE_TYPES } from 'spinal-models-documentation';
import { validateSpinalNode } from '../utils/zodUtils';

export class FileExplorer {
  /**
   * @static
   * @param {SpinalNode} selectedNode
   * @return {*}  {Promise<Directory<SpinalFile<Path>>>}
   * @memberof FileExplorer
   */
  public static async getDirectory(
    selectedNode: SpinalNode
  ): Promise<Directory<SpinalFile<Path>> | undefined> {
    selectedNode = validateSpinalNode.parse(selectedNode);
    if (selectedNode != undefined) {
      const fileNode = await selectedNode.getChildren('hasFiles');
      if (fileNode.length == 0) {
        return undefined;
      } else {
        const directory = await fileNode[0].getElement();
        return directory;
      }
    }
  }

  /**
   * @static
   * @param {SpinalNode} selectedNode
   * @return {*}  {Promise<number>}
   * @memberof FileExplorer
   */
  public static async getNbChildren(selectedNode: SpinalNode): Promise<number> {
    selectedNode = validateSpinalNode.parse(selectedNode);
    const fileNode = await selectedNode.getChildren('hasFiles');
    return fileNode.length;
  }

  public static async createDirectory(
    selectedNode: SpinalNode
  ): Promise<Directory<SpinalFile<Path>>> {
    selectedNode = validateSpinalNode.parse(selectedNode);
    const nbNode = await this.getNbChildren(selectedNode);
    if (nbNode == 0) {
      const myDirectory = new Directory<SpinalFile<Path>>();
      const node = await selectedNode.addChild(
        myDirectory,
        'hasFiles',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      node.info.name.set('[Files]');
      node.info.type.set('SpinalFiles');
      return myDirectory;
    } else {
      const dir = await this.getDirectory(selectedNode);
      return dir!;
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
    const extension = /[^.]+$/.exec(file.name || '')?.[0];

    return imagesExtension.indexOf(extension?.toUpperCase() || '') !== -1
      ? MESSAGE_TYPES.image
      : MESSAGE_TYPES.file;
  }

  static getMimeType(fileName: string): string {
    const extension = /[^.]+$/.exec(fileName || '')?.[0];
    if (!extension) return 'application/octet-stream';
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      bmp: 'image/bmp',
      pdf: 'application/pdf',
      json: 'application/json',
    };
    return (
      mimeTypes[extension.toLowerCase() as keyof typeof mimeTypes] ||
      'application/octet-stream'
    );
  }

  /**
   * @static
   * @param {Directory} directory
   * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
   * @return {*}  {SpinalFile<any>[]}
   * @memberof FileExplorer
   */
  public static addFileUpload(
    directory: Directory<SpinalFile<Path>>,
    files: (SpinalFile | { name: string; buffer: Buffer })[] | FileList | any
  ): SpinalFile<any>[] {
    const isFileList =
      typeof FileList !== 'undefined' && files instanceof FileList;
    if (!isFileList && !Array.isArray(files)) files = [files];
    const res = [];
    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      const filePath: Path = element.buffer
        ? new Path(element.buffer, FileExplorer.getMimeType(element.name))
        : new Path(element, FileExplorer.getMimeType(element.name));
      const myFile = new SpinalFile(element.name, filePath, undefined);
      directory.push(myFile);
      res.push(myFile);
    }

    return res;
  }

  /**
   * @static
   * @param {SpinalNode} node
   * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
   * @return {*}  {Promise<SpinalFile<any>[]>}
   * @memberof FileExplorer
   */
  public static async uploadFiles(
    node: SpinalNode,
    files: (SpinalFile | { name: string; buffer: Buffer })[] | FileList | any
  ): Promise<SpinalFile[]> {
    const isFileList =
      typeof FileList !== 'undefined' && files instanceof FileList;
    if (!isFileList && !Array.isArray(files)) files = [files];

    const directory = await this._getOrCreateFileDirectory(node);
    return this.addFileUpload(directory, files);
  }

  public static async _getOrCreateFileDirectory(
    node: SpinalNode
  ): Promise<Directory<SpinalFile<Path>>> {
    let directory = await FileExplorer.getDirectory(node);

    if (!directory) {
      directory = await FileExplorer.createDirectory(node);
    }

    return directory;
  }
}

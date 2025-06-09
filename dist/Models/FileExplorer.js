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
exports.FileExplorer = void 0;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_models_documentation_1 = require("spinal-models-documentation");
class FileExplorer {
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
     * @memberof FileExplorer
     */
    static async getDirectory(selectedNode) {
        if (selectedNode != undefined) {
            const fileNode = await selectedNode.getChildren('hasFiles');
            if (fileNode.length == 0) {
                return undefined;
            }
            else {
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
    static async getNbChildren(selectedNode) {
        const fileNode = await selectedNode.getChildren('hasFiles');
        return fileNode.length;
    }
    static async createDirectory(selectedNode) {
        let nbNode = await this.getNbChildren(selectedNode);
        if (nbNode == 0) {
            let myDirectory = new spinal_core_connectorjs_1.Directory();
            let node = await selectedNode.addChild(myDirectory, 'hasFiles', spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            node.info.name.set('[Files]');
            node.info.type.set('SpinalFiles');
            return myDirectory;
        }
        else {
            return this.getDirectory(selectedNode);
        }
    }
    /**
     * @static
     * @param {File} file - HTML File
     * @return {*}  {string}
     * @memberof FileExplorer
     */
    static _getFileType(file) {
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
            ? spinal_models_documentation_1.MESSAGE_TYPES.image
            : spinal_models_documentation_1.MESSAGE_TYPES.file;
    }
    static getMimeType(file) {
        const extension = /[^.]+$/.exec(file.name)[0];
        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            bmp: 'image/bmp',
            pdf: 'application/pdf',
            json: 'application/json',
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
    /**
     * @static
     * @param {spinal.Directory<any>} directory
     * @param {((File | { name: string; buffer: Buffer })[] | FileList | any)} files - HTML Files
     * @return {*}  {spinal.File<any>[]}
     * @memberof FileExplorer
     */
    static addFileUpload(directory, files) {
        const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
        if (!isFileList && !Array.isArray(files))
            files = [files];
        console.log('files', files);
        const res = [];
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            let filePath = element.buffer
                ? new spinal_core_connectorjs_1.Path(element.buffer, FileExplorer.getMimeType(element.name))
                : new spinal_core_connectorjs_1.Path(element, FileExplorer.getMimeType(element.name));
            let myFile = new spinal_core_connectorjs_1.File(element.name, filePath, undefined);
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
    static async uploadFiles(node, files) {
        const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
        if (!isFileList && !Array.isArray(files))
            files = [files];
        const directory = await this._getOrCreateFileDirectory(node);
        return this.addFileUpload(directory, files);
    }
    static async _getOrCreateFileDirectory(node) {
        let directory = await FileExplorer.getDirectory(node);
        if (!directory) {
            directory = await FileExplorer.createDirectory(node);
        }
        return directory;
    }
}
exports.FileExplorer = FileExplorer;
//# sourceMappingURL=FileExplorer.js.map
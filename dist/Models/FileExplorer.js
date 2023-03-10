"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExplorer = void 0;
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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_models_documentation_1 = require("spinal-models-documentation");
class FileExplorer {
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<spinal.Directory<spinal.File<spinal.Path>>>}
     * @memberof FileExplorer
     */
    static getDirectory(selectedNode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (selectedNode != undefined) {
                const fileNode = yield selectedNode.getChildren('hasFiles');
                if (fileNode.length == 0) {
                    return undefined;
                }
                else {
                    let directory = yield fileNode[0].getElement();
                    return directory;
                }
            }
        });
    }
    /**
     * @static
     * @param {SpinalNode<any>} selectedNode
     * @return {*}  {Promise<number>}
     * @memberof FileExplorer
     */
    static getNbChildren(selectedNode) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileNode = yield selectedNode.getChildren('hasFiles');
            return fileNode.length;
        });
    }
    static createDirectory(selectedNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let nbNode = yield this.getNbChildren(selectedNode);
            if (nbNode == 0) {
                let myDirectory = new spinal_core_connectorjs_type_1.Directory();
                let node = yield selectedNode.addChild(myDirectory, 'hasFiles', spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                node.info.name.set('[Files]');
                node.info.type.set('SpinalFiles');
                return myDirectory;
            }
            else {
                return this.getDirectory(selectedNode);
            }
        });
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
        console.log("files", files);
        const res = [];
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            let filePath = element.buffer
                ? new spinal_core_connectorjs_type_1.Path(element.buffer)
                : new spinal_core_connectorjs_type_1.Path(element);
            let myFile = new spinal_core_connectorjs_type_1.File(element.name, filePath, undefined);
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
    static uploadFiles(node, files) {
        return __awaiter(this, void 0, void 0, function* () {
            const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
            if (!isFileList && !Array.isArray(files))
                files = [files];
            const directory = yield this._getOrCreateFileDirectory(node);
            return this.addFileUpload(directory, files);
        });
    }
    static _getOrCreateFileDirectory(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let directory = yield FileExplorer.getDirectory(node);
            if (!directory) {
                directory = yield FileExplorer.createDirectory(node);
            }
            return directory;
        });
    }
}
exports.FileExplorer = FileExplorer;
//# sourceMappingURL=FileExplorer.js.map
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
    SPINAL_RELATION_PTR_LST_TYPE
} from "spinal-env-viewer-graph-service";

import { MESSAGE_TYPES } from "spinal-models-documentation";


import { Directory, Path, File } from "spinal-core-connectorjs_type";


export class FileExplorer {

    public static async getDirectory(selectedNode): Promise<any> {
        if (selectedNode != undefined) {
            const fileNode = await selectedNode.getChildren("hasFiles");
            if (fileNode.length == 0) {
                return undefined;
            } else {
                let directory = await fileNode[0].getElement();
                return (directory);
            }
        }
    }

    public static async getNbChildren(selectedNode): Promise<any> {
        const fileNode = await selectedNode.getChildren("hasFiles");
        return fileNode.length;
    }

    public static async createDirectory(selectedNode): Promise<any> {
        let nbNode = await this.getNbChildren(selectedNode);
        if (nbNode == 0) {
            let myDirectory = new Directory();
            let node = await selectedNode.addChild(
                myDirectory,
                'hasFiles',
                SPINAL_RELATION_PTR_LST_TYPE
            );
            node.info.name.set("[Files]");
            node.info.type.set("SpinalFiles");
            return myDirectory;
        } else {
            return this.getDirectory(selectedNode);
        }
    }

    public static _getFileType(file): any {
        const imagesExtension = [
            "JPG",
            "PNG",
            "GIF",
            "WEBP",
            "TIFF",
            "PSD",
            "RAW",
            "BMP",
            "HEIF",
            "INDD",
            "JPEG 2000",
            "SVG",
        ];
        const extension = /[^.]+$/.exec(file.name)[0];

        return imagesExtension.indexOf(extension.toUpperCase()) !== -1
            ? MESSAGE_TYPES.image
            : MESSAGE_TYPES.file;
    }

    public static addFileUpload(directory, uploadFileList): any {
        const files = [];

        for (let i = 0; i < uploadFileList.length; i++) {
            const element = uploadFileList[i];
            let filePath = new Path(element);
            let myFile = new File(element.name, filePath, undefined);

            directory.push(myFile);
            files.push(myFile);
        }

        return files
    }
}


import { File as SpinalFile, Path as SpinalPath, Directory as SpinalDirectory } from 'spinal-core-connectorjs_type';
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
import { FileExplorer } from '../Models/FileExplorer';
import { DIRECTORY_NODE_TYPE } from "../Models/constants"

export type FilesArgType = (SpinalFile | { name: string; buffer: Buffer })[] | FileList | any


export function convertFileToSpinalFile(files: FilesArgType): SpinalFile[] {
    const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
    if (!isFileList && !Array.isArray(files)) files = [files];

    const res: SpinalFile[] = [];

    for (let i = 0; i < files.length; i++) {
        const element = files[i];

        let filePath: SpinalPath | undefined;

        if (element.buffer) filePath = new SpinalPath(element.buffer, FileExplorer.getMimeType(element.name));
        else filePath = new SpinalPath(element, FileExplorer.getMimeType(element.name));

        let file = new SpinalFile(element.name, filePath, undefined);

        res.push(file);
    }

    return res;
}


export function addChildrenToNode(parentNode: SpinalNode, childNode: SpinalNode, relationName: string, contextNode: SpinalContext): Promise<SpinalNode> {
    return parentNode.addChildInContext(childNode, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode).then(async (result) => {

        if (parentNode.getType().get() === DIRECTORY_NODE_TYPE) {
            const element = await childNode.getElement(true);
            if (!element) return result;
            await _addFileNodeToDirectory(parentNode, element as SpinalFile | SpinalDirectory);
        };

        return result;
    })
}


async function _addFileNodeToDirectory(directoryNode: SpinalNode, file: SpinalFile | SpinalDirectory): Promise<SpinalDirectory | undefined> {
    const directory = await directoryNode.getElement(true) as SpinalDirectory;
    if (!directory) return;

    directory.addFile(file);
    return directory;
}
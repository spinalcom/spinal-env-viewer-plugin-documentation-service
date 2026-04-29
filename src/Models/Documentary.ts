import { File as SpinalFile, Directory as SpinalDirectory } from 'spinal-core-connectorjs_type';
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from 'spinal-model-graph';
import { addChildrenToNode, convertFileToSpinalFile, getFilesFromDirectory } from '../utils/files';
import { DIRECTORY_NODE_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from './constants';
import { FilesArgType } from '../interfaces';

class SpinalDocumentary {
    constructor() { }


    public createFileNode(contextNode: SpinalContext, parentNode: SpinalNode, files: FilesArgType): Promise<SpinalNode[]> {
        const filesConverted = convertFileToSpinalFile(files);
        const promises: Promise<SpinalNode>[] = [];

        for (const file of filesConverted) {
            const node = new SpinalNode(file.name.get(), FILE_NODE_TYPE, file);
            promises.push(addChildrenToNode(parentNode, node, TO_FILE_RELATION, contextNode));
        }

        return Promise.all(promises);
    }


    public createDirectoryNode(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon: string = "folder"): Promise<SpinalNode> {
        const file = new SpinalFile(name, new SpinalDirectory(), { model_type: "Directory", icon });

        const node = new SpinalNode(name, DIRECTORY_NODE_TYPE, file);
        return addChildrenToNode(parentNode, node, TO_FOLDER_RELATION, contextNode);
    }

    public async importFilesFromDirectory(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalFile): Promise<SpinalNode[]> {
        const queue: { file: SpinalFile, parent: SpinalNode }[] = [{ file: startFile, parent: parentNode }];
        const createdNodes: SpinalNode[] = [];

        while (queue.length > 0) {
            const itemToProcess = queue.shift();
            if (!itemToProcess) continue;

            const { file, parent } = itemToProcess;
            const { name, nodeType, relationName } = this._getFileAttributes(file);

            const node = await this._createNodeInContext(name, nodeType, file, parent, relationName, contextNode);

            // Only push to createdNodes if it's a file, directories will be processed for their children
            if (nodeType === DIRECTORY_NODE_TYPE) {
                const children = await this._getFileChildren(file, node);
                queue.push(...children);
            }

            createdNodes.push(node);

        }

        return createdNodes;
    }





    private async _getFileChildren(file: SpinalFile<any>, parentNode: SpinalNode): Promise<{ file: SpinalFile, parent: SpinalNode }[]> {
        const children = await getFilesFromDirectory(file);
        const res = [];
        for (const child of children) {
            res.push({ file: child as SpinalFile, parent: parentNode });
        }
        return res;
    }

    private async _createNodeInContext(name: string, nodeType: string, file: SpinalFile<any>, parent: SpinalNode<any>, relationName: string, contextNode: SpinalContext<any>) {
        const node = new SpinalNode(name, nodeType, file);
        await parent.addChildInContext(node, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
        return node;
    }

    private _getFileAttributes(file: SpinalFile<any>) {
        const name = file.name.get();
        const fileType = file._info?.model_type?.get();

        const nodeType = fileType === "Directory" ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
        const relationName = nodeType === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;

        return { name, nodeType, relationName };
    }
    // public linkDocumentToNode(documentNode: SpinalNode, targetNode: SpinalNode): Promise<SpinalNode> {
    //     const relationName = documentNode.getType().get() === FILE_NODE_TYPE ? TO_FILE_RELATION : TO_FOLDER_RELATION;
    //     return 
    // }




}

export { SpinalDocumentary };
export default SpinalDocumentary;
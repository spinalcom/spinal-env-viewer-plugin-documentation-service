import { File as SpinalFile, Directory as SpinalDirectory, Ptr } from 'spinal-core-connectorjs_type';
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from 'spinal-model-graph';
import { _getFileAsBuffer, _getFileAttributes, _getFileChildren, addChildrenToNode, convertFileToSpinalFile, convertTreeToFileBuffers, createFileNode } from '../utils/files';
import { DIRECTORY_NODE_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from './constants';
import { FilesArgType } from '../interfaces';

class SpinalDocumentary {
    constructor() { }

    public createFileNode(contextNode: SpinalContext, parentNode: SpinalNode, files: FilesArgType): Promise<SpinalNode[]> {
        const filesConverted = convertFileToSpinalFile(files);
        const promises: Promise<SpinalNode>[] = [];

        for (const file of filesConverted) {
            const node = createFileNode(file);
            promises.push(addChildrenToNode(parentNode, node, TO_FILE_RELATION, contextNode));
        }

        return Promise.all(promises);
    }

    public createDirectoryNode(contextNode: SpinalContext, parentNode: SpinalNode, name: string, icon: string = "folder"): Promise<SpinalNode> {
        const file = new SpinalFile(name, new SpinalDirectory(), { model_type: "Directory", icon });

        const node = createFileNode(file);
        return addChildrenToNode(parentNode, node, TO_FOLDER_RELATION, contextNode).then((nodeCreated) => {
            file._info.add_attr({ node: new Ptr(nodeCreated) });
            return nodeCreated;
        })
    }

    public async importFilesFromDirectory(contextNode: SpinalContext, parentNode: SpinalNode, startFile: SpinalFile): Promise<SpinalNode[]> {
        const queue: { file: SpinalFile, parent: SpinalNode }[] = [{ file: startFile, parent: parentNode }];
        const createdNodes: SpinalNode[] = [];

        while (queue.length > 0) {
            const itemToProcess = queue.shift();
            if (!itemToProcess) continue;

            const { file, parent } = itemToProcess;
            const { name, nodeType, relationName } = await _getFileAttributes(file);

            const node = await this._createNodeInContext(name, nodeType, file, parent, relationName, contextNode);

            // Only push to createdNodes if it's a file, directories will be processed for their children
            if (nodeType === DIRECTORY_NODE_TYPE) {
                const children = await _getFileChildren(file, node);
                queue.push(...children);
            }
            createdNodes.push(node);

        }

        return createdNodes;
    }

    public async getFilesAsBuffer(startNode: SpinalNode): Promise<{ name: string, path: string; buffer: Buffer }[]> {
        return convertTreeToFileBuffers(startNode);
    }

    public async convertFileToBuffer(file: SpinalNode | SpinalFile, hubUrl: string = ""): Promise<{ name: string, buffer: Buffer }> {
        if (file instanceof SpinalNode) file = await file.getElement(true) as SpinalFile;
        const buffer = await _getFileAsBuffer(file, hubUrl);
        const name = file.name.get();

        return { name, buffer };
    }

    // public linkDocumentToNode(documentNode: SpinalNode, targetNode: SpinalNode): Promise<SpinalNode> {
    //     const relationName = documentNode.getType().get() === FILE_NODE_TYPE ? TO_FILE_RELATION : TO_FOLDER_RELATION;
    //     return 
    // }



    private async _createNodeInContext(name: string, nodeType: string, file: SpinalFile<any>, parent: SpinalNode<any>, relationName: string, contextNode: SpinalContext<any>) {
        const node = createFileNode(file);
        await parent.addChildInContext(node, relationName, SPINAL_RELATION_PTR_LST_TYPE, contextNode);
        return node;
    }


}

export { SpinalDocumentary };
export default SpinalDocumentary;
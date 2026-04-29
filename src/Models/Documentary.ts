import { File as SpinalFile, Directory as SpinalDirectory } from 'spinal-core-connectorjs_type';
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from 'spinal-model-graph';
import { addChildrenToNode, convertFileToSpinalFile } from '../utils/files';
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

    // public linkDocumentToNode(documentNode: SpinalNode, targetNode: SpinalNode): Promise<SpinalNode> {
    //     const relationName = documentNode.getType().get() === FILE_NODE_TYPE ? TO_FILE_RELATION : TO_FOLDER_RELATION;
    //     return 
    // }




}

export { SpinalDocumentary };
export default SpinalDocumentary;
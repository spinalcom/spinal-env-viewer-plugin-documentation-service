import { File as SpinalFile, Path as SpinalPath, Directory as SpinalDirectory, Ptr } from 'spinal-core-connectorjs_type';
import { SPINAL_RELATION_PTR_LST_TYPE, SpinalContext, SpinalNode } from 'spinal-env-viewer-graph-service';
import { FileExplorer } from '../Models/FileExplorer';
import { DIRECTORY_NODE_TYPE, FILE_NODE_TYPE, TO_FILE_RELATION, TO_FOLDER_RELATION } from "../Models/constants"
import { FilesArgType } from '../interfaces';
import axiosRetry from 'axios-retry';
import axios from "axios";
import { start } from 'repl';



export function convertFileToSpinalFile(files: FilesArgType): SpinalFile[] {
    const isFileList = typeof FileList !== 'undefined' && files instanceof FileList;
    if (!isFileList && !Array.isArray(files)) files = [files];

    const res: SpinalFile[] = [];

    for (let i = 0; i < files.length; i++) {
        const element = files[i];

        let filePath: SpinalPath | undefined;

        if (element.buffer) filePath = new SpinalPath(element.buffer, FileExplorer.getMimeType(element.name));
        else filePath = new SpinalPath(element, FileExplorer.getMimeType(element.name));

        let file = new SpinalFile(element.name, filePath, { model_type: "File" });

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
    let directory = await directoryNode.getElement(true);

    if (directory instanceof SpinalFile && directory._info?.model_type?.get() === "Directory") {
        const directoryElement = await new Promise(resolve => directory.load((e: SpinalDirectory) => resolve(e)));

        if (directoryElement instanceof SpinalDirectory) directory = directoryElement;
    }

    if (!directory) return;


    directory.push(file);
    return directory;
}


export async function getFilesFromDirectory(directoryNode: SpinalFile): Promise<(SpinalFile | SpinalDirectory)[]> {
    const directory = await new Promise(resolve => directoryNode.load((e: SpinalDirectory) => resolve(e)));
    const res: (SpinalFile | SpinalDirectory)[] = [];

    if (directory instanceof SpinalDirectory) {
        for (let i = 0; i < directory.length; i++) {
            const element = directory[i];
            res.push(element);
        }
    }

    return res;
}

export function createFileNode(file: SpinalFile): SpinalNode {
    const type = file._info?.model_type?.get() === "Directory" ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
    const name = file.name.get();

    const node = new SpinalNode(name, type, file);
    file._info.add_attr({ node: new Ptr(node) });

    return node;
}


export async function _getFileChildren(file: SpinalFile<any>, parentNode: SpinalNode): Promise<{ file: SpinalFile, parent: SpinalNode }[]> {
    const children = await getFilesFromDirectory(file);
    const res = [];
    for (const child of children) {
        res.push({ file: child as SpinalFile, parent: parentNode });
    }
    return res;
}

export async function _getFileAttributes(file: SpinalFile<any>) {
    const name = file.name.get();
    const fileType = file._info?.model_type?.get();

    const nodeType = fileType === "Directory" ? DIRECTORY_NODE_TYPE : FILE_NODE_TYPE;
    const relationName = nodeType === DIRECTORY_NODE_TYPE ? TO_FOLDER_RELATION : TO_FILE_RELATION;

    return { name, nodeType, relationName };
}

export function _getFileAsBuffer(file: SpinalFile, hubUrl: string = ""): Promise<Buffer> {
    const pathServerId = file._ptr.data.value;
    return getPathData(pathServerId, hubUrl);
}

function getPathData(dynamicId: number, hubUrl: string = ""): Promise<Buffer> {
    if (hubUrl.endsWith("/")) hubUrl = hubUrl.slice(0, -1);

    const path = `${hubUrl}/sceen/_?u=${dynamicId}`;
    const client = axios.create({ baseURL: hubUrl });
    axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
    return client.get(path, { responseType: 'arraybuffer' }).then((response) => {
        return Buffer.from(response.data);
        // return new Uint8Array(response.data);
    });
}

export async function convertTreeToFileBuffers(startNode: SpinalNode<any>): Promise<{ name: string; path: string; buffer: Buffer; }[]> {
    const queue = await getStarterQueue(startNode);
    const filesBuffers: { name: string; path: string; buffer: Buffer; }[] = [];
    const alreadyProcessedNodes = new Set<number>();

    while (queue.length > 0) {
        const itemToProcess = queue.shift();
        if (!itemToProcess) continue;

        const { path, file } = itemToProcess;
        if (alreadyProcessedNodes.has(file._ptr.data.value)) continue;


        alreadyProcessedNodes.add(file._ptr.data.value);
        if (file._info?.model_type?.get() !== "Directory") {
            filesBuffers.push({ name: file.name.get(), path, buffer: await _getFileAsBuffer(file) });
        }

        if (file._info?.model_type?.get() === "Directory") {
            const children = await getFilesFromDirectory(file);

            for (const child of children) {
                queue.push({ path: `${path}/${child.name.get()}`, file: child as SpinalFile });
            }
        }
    }

    return filesBuffers;
}

async function getStarterQueue(startNode: SpinalNode): Promise<{ path: string, file: SpinalFile }[]> {
    const queue: { node: SpinalNode, path: string }[] = [{ node: startNode, path: startNode.getName().get() }];
    const res: { path: string, file: SpinalFile }[] = [];

    while (queue.length > 0) {
        const data = queue.shift();
        if (!data) continue;

        const { node, path } = data;
        const type = node.getType().get();
        if (type === FILE_NODE_TYPE || type === DIRECTORY_NODE_TYPE) {
            res.push({ path, file: await node.getElement(true) as SpinalFile });
        }

        const children = await node.getChildren();

        for (const child of children) {
            queue.push({ node: child, path: `${path}/${child.getName().get()}` });
        }
    }

    return res;
}

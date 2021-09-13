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

import { SpinalNode, SPINAL_RELATION_PTR_LST_TYPE, SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SpinalNote, ViewStateInterface } from "spinal-models-documentation";

import { groupManagerService } from "spinal-env-viewer-plugin-group-manager-service";

import {
    NOTE_RELATION, NOTE_TYPE, NOTE_CONTEXT_NAME, NOTE_CATEGORY_NAME, NOTE_GROUP_NAME
} from "./constants";

import { FileExplorer } from "./FileExplorer"
// import AttributeService from "./AttributeService";

const globalType: any = typeof window === "undefined" ? global : window;


class NoteService {

    constructor() {

    }

    public async addNote(node: SpinalNode<any>, userInfo: { username: string, userId: number }, note: string, type?: string, file?: spinal.Model, noteContextId?: string, noteGroupId?: string, viewPoint?: ViewStateInterface): Promise<SpinalNode<any>> {
        if (!(node instanceof SpinalNode)) return;

        const spinalNote = new SpinalNote(userInfo.username, note, userInfo.userId, type, file, viewPoint);
        const spinalNode = await node.addChild(spinalNote, NOTE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)

        if (spinalNode && spinalNode.info) {
            spinalNode.info.name.set(`message-${Date.now()}`);
            spinalNode.info.type.set(NOTE_TYPE);
        }

        await this.createAttribute(spinalNode, spinalNote);

        (<any>SpinalGraphService)._addNode(spinalNode);

        let contextId = noteContextId;
        let groupId = noteGroupId;

        if (typeof contextId === "undefined") {
            const noteContext = await this.createDefaultContext();
            contextId = noteContext.getId().get()
        }

        if (typeof groupId === "undefined") {
            const groupNode = await this.createDefaultGroup();
            groupId = groupNode.getId().get()
        }

        await this.linkNoteToGroup(contextId, groupId, spinalNode.getId().get());

        return spinalNode;

    }

    public addFileAsNote(node: SpinalNode<any>, files: any, userInfo: { username: string, userId: number }, noteContextId?: string, noteGroupId?: string): Promise<any> {
        if (!(Array.isArray(files))) files = [files];

        const promises = files.map(async (file) => {
            return {
                viewPoint: {
                    viewState: file.viewState,
                    objectState: file.objectState
                },
                file: file,
                directory: await this._getOrCreateFileDirectory(node)
            }
        })

        return Promise.all(promises).then((res) => {
            return res.map((data: { viewPoint: any, file: any, directory: any }) => {
                const type = FileExplorer._getFileType(data.file);

                let files = FileExplorer.addFileUpload(data.directory, [data.file]);
                let file = files.length > 0 ? files[0] : undefined;

                const viewPoint = Object.keys(data.viewPoint).length > 0 ? data.viewPoint : undefined;

                return this.addNote(
                    node, userInfo, data.file.name, type, file, noteContextId, noteGroupId, viewPoint
                );
            });
        })
    }

    
    /**
     * Adding a note to a node
     *
     * @param {SpinalNode<any>} node node to add the note to
     * @param {{ username: string, userId: number }} userInfo information of the user posting the note
     * @param {string} note note to add
     * @param {string} [type] type of the note
     * @param {spinal.Model} [file] file to add to the node
     * @param {ViewStateInterface} [viewPoint] viewpoint to save in the note
     * @param {string} [noteContextId] contextID of the note
     * @param {string} [noteGroupId] groupID of the note
     * @return {*} {Promise<SpinalNode<any>>} note as a node
     * @memberof NoteService
     */
    public async twinAddNote(
        node: SpinalNode<any>,
        userInfo: { username: string, userId: number },
        note: string,
        type?: string,
        file?: spinal.Model,
        viewPoint?: ViewStateInterface,
        noteContextId?: string,
        noteGroupId?: string
        ) : Promise<SpinalNode<any>>
    {
        if (!(node instanceof SpinalNode)) return;

        let uploaded = undefined;
        if (typeof file !== "undefined")
        {
            uploaded = FileExplorer.addFileUpload(await this._getOrCreateFileDirectory(node), file);
        }

        const view = Object.keys(viewPoint).length > 0 ? viewPoint : undefined;

        const spinalNote = new SpinalNote(userInfo.username, note, userInfo.userId, type, uploaded, view);
        const spinalNode = await node.addChild(spinalNote, NOTE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)

        if (spinalNode && spinalNode.info) {
            spinalNode.info.name.set(`message-${Date.now()}`);
            spinalNode.info.type.set(NOTE_TYPE);
        }

        await this.createAttribute(spinalNode, spinalNote);

        (<any>SpinalGraphService)._addNode(spinalNode);

        let contextId = noteContextId;
        let groupId = noteGroupId;

        if (typeof contextId === "undefined") {
            const noteContext = await this.createDefaultContext();
            contextId = noteContext.getId().get()
        }

        if (typeof groupId === "undefined") {
            const groupNode = await this.createDefaultGroup();
            groupId = groupNode.getId().get()
        }

        await this.linkNoteToGroup(contextId, groupId, spinalNode.getId().get());

        return spinalNode;
    }

    public async getNotes(node: SpinalNode<any>): Promise<Array<{ element: SpinalNote, selectedNode: SpinalNode<any> }>> {
        if (!(node instanceof SpinalNode)) return;
        const messagesNodes = await node.getChildren(NOTE_RELATION);

        const promises = messagesNodes.map(async el => {
            const element = await el.getElement();
            return {
                element: element,
                selectedNode: el
            }
        })

        return Promise.all(promises);
    }

    public editNote(element: SpinalNote, note: string): SpinalNote {
        let date = new Date();
        element.message.set(note);
        element.date.set(date);

        return element
    }

    // public predicate(node: any) {
    //     return true;
    // }

    public linkNoteToGroup(contextId: string, groupId: string, noteId: string): any {
        return groupManagerService.linkElementToGroup(contextId, groupId, noteId);
    }

    public createDefaultContext(): Promise<any> {
        return groupManagerService.createGroupContext(NOTE_CONTEXT_NAME, NOTE_TYPE);
    }

    public async createDefaultCategory(): Promise<any> {
        const context = await this.createDefaultContext();
        return groupManagerService.addCategory(context.getId().get(), NOTE_CATEGORY_NAME, "add");
    }

    public async createDefaultGroup(): Promise<any> {
        const context = await this.createDefaultContext();
        const category = await this.createDefaultCategory();

        return groupManagerService.addGroup(context.getId().get(), category.getId().get(), NOTE_GROUP_NAME, "#FFF000")
    }

    public async createAttribute(spinalNode: SpinalNode<any>, spinalNote: SpinalNote) {
        const categoryName: string = "default";
        const service = globalType.spinal.serviceDocumentation;
        if (service) {
            const category = await service.addCategoryAttribute(spinalNode, categoryName);

            const promises = spinalNote._attribute_names.map(key => {
                return service.addAttributeByCategory(spinalNode, category, key, spinalNote[key]);
            })

            return Promise.all(promises);
        }
    }


    private async _getOrCreateFileDirectory(node: SpinalNode<any>): Promise<any> {
        let directory = await FileExplorer.getDirectory(node);

        if (!directory) {
            directory = await FileExplorer.createDirectory(node);
        }

        return directory;
    }
}

const noteService = new NoteService()

export {
    NoteService,
    noteService
}
export default NoteService;

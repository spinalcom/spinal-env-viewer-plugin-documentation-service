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
import { SpinalNote } from "spinal-models-documentation";

import { groupManagerService } from "spinal-env-viewer-plugin-group-manager-service";

import {
    NOTE_RELATION, NOTE_TYPE, NOTE_CONTEXT_NAME, NOTE_CATEGORY_NAME, NOTE_GROUP_NAME
} from "./constants";

// import AttributeService from "./AttributeService";

class NoteService {

    constructor() {

    }
    s
    public async addNote(node: any, userInfo: { username: string, userId: number }, note: string, type?: string, file?: spinal.Model) {
        if (!(node instanceof SpinalNode)) return;

        const spinalNote = new SpinalNote(userInfo.username, note, userInfo.userId, type, file);
        const spinalNode = await node.addChild(spinalNote, NOTE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)

        if (spinalNode && spinalNode.info) {
            spinalNode.info.name.set(`message-${Date.now()}`);
            spinalNode.info.type.set(NOTE_TYPE);
        }

        await this.createAttribute(spinalNode, spinalNote);

        (<any>SpinalGraphService)._addNode(spinalNode);
        return spinalNode;

    }

    public async getNotes(node: any): Promise<any> {
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

    public editNote(element: any, note: string) {
        let date = new Date();
        element.message.set(note);
        element.date.set(date);
    }

    public predicate(node: any) {
        return true;
    }

    public linkNoteToGroup(contextId: string, groupId: string, noteId: string) {
        groupManagerService.linkElementToGroup(contextId, groupId, noteId);
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
        const service = (<any>window.spinal).serviceDocumentation;
        if (service) {
            const category = await service.addCategoryAttribute(spinalNode, categoryName);

            const promises = spinalNote._attribute_names.map(key => {
                return service.addAttributeByCategory(spinalNode, category, key, spinalNote[key]);
            })

            return Promise.all(promises);
        }
    }

}

export default NoteService;
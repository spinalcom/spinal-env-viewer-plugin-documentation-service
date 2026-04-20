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
exports.noteService = exports.NoteService = void 0;
const zod_1 = require("zod");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_model_graph_1 = require("spinal-model-graph");
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const FileExplorer_1 = require("./FileExplorer");
const zodUtils_1 = require("../utils/zodUtils");
const constants_1 = require("./constants");
const AttributeService_1 = require("./AttributeService");
const globalType = typeof window === 'undefined' ? global : window;
class NoteService {
    constructor() { }
    /**
     * @param {SpinalNode} node
     * @param {{ username: string; userId: number }} userInfo
     * @param {string} note - Your message or File name
     * @param {string} [type]
     * @param {SpinalFile} [file] - Spinal File
     * @param {string} [noteContextId]
     * @param {string} [noteGroupId]
     * @param {ViewStateInterface} [viewPoint]
     * @return {*}  {Promise<SpinalNode>}
     * @memberof NoteService
     */
    async addNote(node, userInfo, note, type, file, noteContextId, noteGroupId, viewPoint) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        userInfo = zod_1.z
            .object({
            username: zod_1.z.string().trim().min(1),
            userId: zod_1.z.number(),
        })
            .parse(userInfo);
        note = zodUtils_1.validateString.parse(note);
        type = zodUtils_1.validateStringOptional.parse(type);
        file = file instanceof spinal_core_connectorjs_1.File ? file : undefined;
        noteContextId = zodUtils_1.validateStringOptional.parse(noteContextId);
        noteGroupId = zodUtils_1.validateStringOptional.parse(noteGroupId);
        const spinalNote = new spinal_models_documentation_1.SpinalNote(userInfo.username, note, userInfo.userId.toString(), type, file, viewPoint);
        const noteNode = new spinal_model_graph_1.SpinalNode(`message-${Date.now()}`, constants_1.NOTE_TYPE, spinalNote);
        await node.addChild(noteNode, constants_1.NOTE_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        await this.addNoteToContext(noteNode, noteContextId, noteGroupId);
        return noteNode;
    }
    /**
     * @param {SpinalNode} node
     * @param {*} files
     * @param {{ username: string; userId: number }} userInfo
     * @param {string} [noteContextId]
     * @param {string} [noteGroupId]
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof NoteService
     */
    async addFileAsNote(node, files, userInfo, noteContextId, noteGroupId) {
        zodUtils_1.validateSpinalNode.parse(node);
        if (typeof FileList !== 'undefined' && files instanceof FileList)
            files = Array.from(files);
        const res = await this.prepareFileDirectories(node, files);
        const promises = res.map((data) => {
            const type = FileExplorer_1.FileExplorer._getFileType(data.file);
            let files_1 = FileExplorer_1.FileExplorer.addFileUpload(data.directory, [data.file]);
            let file_1 = files_1.length > 0 ? files_1[0] : undefined;
            const viewPoint = data.viewPoint && Object.keys(data.viewPoint).length > 0
                ? data.viewPoint
                : undefined;
            return this.addNote(node, userInfo, data.file.name, type, file_1, noteContextId, noteGroupId, viewPoint);
        });
        return await Promise.all(promises);
    }
    /**
     * Adding a note to a node
     *
     * @param {SpinalNode} node node to add the note to
     * @param {{ username: string, userId: number }} userInfo information of the user posting the note
     * @param {string} note note to add
     * @param {string} [type] type of the note
     * @param {File} [file] html file to add to the node
     * @param {ViewStateInterface} [viewPoint] viewpoint to save in the note
     * @param {string} [noteContextId] contextID of the note
     * @param {string} [noteGroupId] groupID of the note
     * @return {*} {Promise<SpinalNode>} note as a node
     * @memberof NoteService
     */
    async twinAddNote(node, userInfo, note, type, file, viewPoint, noteContextId, noteGroupId) {
        if (!(node instanceof spinal_model_graph_1.SpinalNode))
            return;
        let uploaded = undefined;
        if (typeof file !== 'undefined') {
            uploaded = FileExplorer_1.FileExplorer.addFileUpload(await FileExplorer_1.FileExplorer._getOrCreateFileDirectory(node), [file]);
        }
        let view = undefined;
        if (typeof viewPoint !== 'undefined') {
            view = Object.keys(viewPoint).length > 0 ? viewPoint : undefined;
        }
        const spinalNote = new spinal_models_documentation_1.SpinalNote(userInfo.username, note, userInfo.userId?.toString(), type, uploaded ? uploaded[0] : undefined, view);
        const spinalNode = await node.addChild(spinalNote, constants_1.NOTE_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
        if (spinalNode && spinalNode.info) {
            spinalNode.info.name.set(`message-${Date.now()}`);
            spinalNode.info.type.set(constants_1.NOTE_TYPE);
        }
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(spinalNode);
        let contextId = noteContextId;
        let groupId = noteGroupId;
        if (typeof contextId === 'undefined') {
            const noteContext = await this.createDefaultContext();
            contextId = noteContext.getId().get();
        }
        if (typeof groupId === 'undefined') {
            const groupNode = await this.createDefaultGroup();
            groupId = groupNode.getId().get();
        }
        await this.linkNoteToGroup(contextId, groupId, spinalNode.getId().get());
        return spinalNode;
    }
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<{ element: SpinalNote; selectedNode: SpinalNode }[]>}
     * @memberof NoteService
     */
    async getNotes(node) {
        if (!(node instanceof spinal_model_graph_1.SpinalNode))
            return;
        const messagesNodes = await node.getChildren(constants_1.NOTE_RELATION);
        const promises = messagesNodes.map(async (el) => {
            const element = await el.getElement();
            return {
                element: element,
                selectedNode: el,
            };
        });
        return Promise.all(promises);
    }
    /**
     * @param {SpinalNote} element
     * @param {string} note
     * @return {*}  {SpinalNote}
     * @memberof NoteService
     */
    editNote(element, note) {
        note = zodUtils_1.validateString.parse(note);
        let date = new Date();
        element.message.set(note);
        element.date.set(date);
        return element;
    }
    /**
     * @param {SpinalNode} noteNode
     * @param {string} [contextId]
     * @param {string} [groupId]
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    async addNoteToContext(noteNode, contextId, groupId) {
        noteNode = zodUtils_1.validateSpinalNode.parse(noteNode);
        contextId = zodUtils_1.validateStringOptional.parse(contextId);
        groupId = zodUtils_1.validateStringOptional.parse(groupId);
        //@ts-ignore
        spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(noteNode);
        if (typeof contextId === 'undefined') {
            const noteContext = await this.createDefaultContext();
            contextId = noteContext.getId().get();
        }
        if (typeof groupId === 'undefined') {
            const groupNode = await this.createDefaultGroup();
            groupId = groupNode.getId().get();
        }
        return this.linkNoteToGroup(contextId, groupId, noteNode.getId().get());
    }
    /**
     * @param {SpinalNode} noteContext
     * @param {SpinalNode} startNode
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof NoteService
     */
    getNotesInNoteContext(noteContext, startNode) {
        noteContext = zodUtils_1.validateSpinalNode.parse(noteContext);
        startNode = zodUtils_1.validateSpinalNode.parse(startNode);
        return startNode.findInContext(noteContext, (node) => {
            let type = node.getType().get();
            if (type === constants_1.NOTE_TYPE) {
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                return true;
            }
            return false;
        });
    }
    /**
     * @param {(SpinalNode | SpinalNode[])} notes
     * @return {*}  {Promise<{ [key: string]: SpinalNode[] }>}
     * @memberof NoteService
     */
    async getNotesReferencesNodes(notes) {
        if (!Array.isArray(notes))
            notes = [notes];
        const obj = {};
        const promises = notes.map(async (note) => {
            obj[note.info.id.get()] = await note.getParents(constants_1.NOTE_RELATION);
        });
        await Promise.all(promises);
        return obj;
    }
    /**
     * Deletes a note from a node
     * @param {SpinalNode} node node to delete from
     * @param {SpinalNode} note note to delete
     * @memberof NoteService
     */
    async delNote(node, note) {
        node = zodUtils_1.validateSpinalNode.parse(node);
        note = zodUtils_1.validateSpinalNode.parse(note);
        await node.removeChild(note, constants_1.NOTE_RELATION, spinal_model_graph_1.SPINAL_RELATION_PTR_LST_TYPE);
    }
    /**
     * @param {string} contextId
     * @param {string} groupId
     * @param {string} noteId
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    linkNoteToGroup(contextId, groupId, noteId) {
        contextId = zodUtils_1.validateString.parse(contextId);
        groupId = zodUtils_1.validateString.parse(groupId);
        noteId = zodUtils_1.validateString.parse(noteId);
        return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.linkElementToGroup(contextId, groupId, noteId);
    }
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    createDefaultContext() {
        return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.createGroupContext(constants_1.NOTE_CONTEXT_NAME, constants_1.NOTE_TYPE);
    }
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    async createDefaultCategory() {
        const context = await this.createDefaultContext();
        return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.addCategory(context.getId().get(), constants_1.NOTE_CATEGORY_NAME, 'add');
    }
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    async createDefaultGroup() {
        const context = await this.createDefaultContext();
        const category = await this.createDefaultCategory();
        return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.addGroup(context.getId().get(), category.getId().get(), constants_1.NOTE_GROUP_NAME, '#FFF000');
    }
    /**
     * @param {SpinalNode} spinalNode
     * @param {SpinalNote} spinalNote
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof NoteService
     */
    async createAttribute(spinalNode, spinalNote) {
        spinalNode = zodUtils_1.validateSpinalNode.parse(spinalNode);
        const categoryName = 'default';
        const category = await AttributeService_1.attributeService.addCategoryAttribute(spinalNode, categoryName);
        const promises = spinalNote._attribute_names.map((key) => {
            return AttributeService_1.attributeService.addAttributeByCategory(spinalNode, category, key, spinalNote[key].get());
        });
        return Promise.all(promises);
    }
    /**
     * @private
     * @param {SpinalNode} noteNode
     * @param {(any | any[])} files
     * @return {*}  {Promise<IFileNote[]>}
     * @memberof NoteService
     */
    prepareFileDirectories(noteNode, files) {
        if (!Array.isArray(files))
            files = [files];
        const promises = files.map(async (file) => {
            return {
                viewPoint: {
                    viewState: file.viewState,
                    objectState: file.objectState,
                },
                file: file,
                directory: await FileExplorer_1.FileExplorer._getOrCreateFileDirectory(noteNode),
            };
        });
        return Promise.all(promises);
    }
}
exports.NoteService = NoteService;
const noteService = new NoteService();
exports.noteService = noteService;
exports.default = NoteService;
//# sourceMappingURL=NoteService.js.map
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
exports.noteService = exports.NoteService = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const constants_1 = require("./constants");
const FileExplorer_1 = require("./FileExplorer");
const globalType = typeof window === 'undefined' ? global : window;
class NoteService {
    constructor() { }
    /**
     * @param {SpinalNode<any>} node
     * @param {{ username: string; userId: number }} userInfo
     * @param {string} note - Your message or File name
     * @param {string} [type]
     * @param {spinal.File} [file] - Spinal File
     * @param {string} [noteContextId]
     * @param {string} [noteGroupId]
     * @param {ViewStateInterface} [viewPoint]
     * @return {*}  {Promise<SpinalNode<any>>}
     * @memberof NoteService
     */
    addNote(node, userInfo, note, type, file, noteContextId, noteGroupId, viewPoint) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw 'node must be a SpinalNode';
            if (file && !(file instanceof spinal.File))
                throw 'File must be a SpinalFile';
            const spinalNote = new spinal_models_documentation_1.SpinalNote(userInfo.username, note, (_a = userInfo.userId) === null || _a === void 0 ? void 0 : _a.toString(), type, file, viewPoint);
            const noteNode = new spinal_env_viewer_graph_service_1.SpinalNode(`message-${Date.now()}`, constants_1.NOTE_TYPE, spinalNote);
            yield node.addChild(noteNode, constants_1.NOTE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            // if (noteNode instanceof SpinalNode) {
            //   noteNode.info.name.set(`message-${Date.now()}`);
            //   noteNode.info.type.set(NOTE_TYPE);
            // }
            yield this.createAttribute(noteNode, spinalNote);
            yield this.addNoteToContext(noteNode, noteContextId, noteGroupId);
            return noteNode;
        });
    }
    /**
     * @param {SpinalNode<any>} node
     * @param {*} files
     * @param {{ username: string; userId: number }} userInfo
     * @param {string} [noteContextId]
     * @param {string} [noteGroupId]
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof NoteService
     */
    addFileAsNote(node, files, userInfo, noteContextId, noteGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof FileList !== 'undefined' && files instanceof FileList)
                files = Array.from(files);
            const res = yield this.addFilesInDirectory(node, files);
            const promises = res.map((data) => {
                const type = FileExplorer_1.FileExplorer._getFileType(data.file);
                let files_1 = FileExplorer_1.FileExplorer.addFileUpload(data.directory, [data.file]);
                let file_1 = files_1.length > 0 ? files_1[0] : undefined;
                const viewPoint = Object.keys(data.viewPoint).length > 0 ? data.viewPoint : undefined;
                return this.addNote(node, userInfo, data.file.name, type, file_1, noteContextId, noteGroupId, viewPoint);
            });
            return yield Promise.all(promises);
        });
    }
    /**
     * Adding a note to a node
     *
     * @param {SpinalNode<any>} node node to add the note to
     * @param {{ username: string, userId: number }} userInfo information of the user posting the note
     * @param {string} note note to add
     * @param {string} [type] type of the note
     * @param {File} [file] file to add to the node
     * @param {ViewStateInterface} [viewPoint] viewpoint to save in the note
     * @param {string} [noteContextId] contextID of the note
     * @param {string} [noteGroupId] groupID of the note
     * @return {*} {Promise<SpinalNode<any>>} note as a node
     * @memberof NoteService
     */
    twinAddNote(node, userInfo, note, type, file, viewPoint, noteContextId, noteGroupId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                return;
            let uploaded = undefined;
            if (typeof file !== 'undefined') {
                uploaded = FileExplorer_1.FileExplorer.addFileUpload(yield FileExplorer_1.FileExplorer._getOrCreateFileDirectory(node), [file]);
            }
            let view = undefined;
            if (typeof viewPoint !== 'undefined') {
                view = Object.keys(viewPoint).length > 0 ? viewPoint : undefined;
            }
            const spinalNote = new spinal_models_documentation_1.SpinalNote(userInfo.username, note, (_a = userInfo.userId) === null || _a === void 0 ? void 0 : _a.toString(), type, uploaded[0], view);
            const spinalNode = yield node.addChild(spinalNote, constants_1.NOTE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            if (spinalNode && spinalNode.info) {
                spinalNode.info.name.set(`message-${Date.now()}`);
                spinalNode.info.type.set(constants_1.NOTE_TYPE);
            }
            yield this.createAttribute(spinalNode, spinalNote);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(spinalNode);
            let contextId = noteContextId;
            let groupId = noteGroupId;
            if (typeof contextId === 'undefined') {
                const noteContext = yield this.createDefaultContext();
                contextId = noteContext.getId().get();
            }
            if (typeof groupId === 'undefined') {
                const groupNode = yield this.createDefaultGroup();
                groupId = groupNode.getId().get();
            }
            yield this.linkNoteToGroup(contextId, groupId, spinalNode.getId().get());
            return spinalNode;
        });
    }
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<{ element: SpinalNote; selectedNode: SpinalNode<any> }[]>}
     * @memberof NoteService
     */
    getNotes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                return;
            const messagesNodes = yield node.getChildren(constants_1.NOTE_RELATION);
            const promises = messagesNodes.map((el) => __awaiter(this, void 0, void 0, function* () {
                const element = yield el.getElement();
                return {
                    element: element,
                    selectedNode: el,
                };
            }));
            return Promise.all(promises);
        });
    }
    /**
     * @param {SpinalNote} element
     * @param {string} note
     * @return {*}  {SpinalNote}
     * @memberof NoteService
     */
    editNote(element, note) {
        let date = new Date();
        element.message.set(note);
        element.date.set(date);
        return element;
    }
    /**
     * @param {SpinalNode<any>} noteNode
     * @param {string} [contextId]
     * @param {string} [groupId]
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    addNoteToContext(noteNode, contextId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            //@ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(noteNode);
            if (typeof contextId === 'undefined') {
                const noteContext = yield this.createDefaultContext();
                contextId = noteContext.getId().get();
            }
            if (typeof groupId === 'undefined') {
                const groupNode = yield this.createDefaultGroup();
                groupId = groupNode.getId().get();
            }
            return this.linkNoteToGroup(contextId, groupId, noteNode.getId().get());
        });
    }
    /**
     * @param {SpinalNode<any>} noteContext
     * @param {SpinalNode<any>} startNode
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof NoteService
     */
    getNotesInNoteContext(noteContext, startNode) {
        return startNode.findInContext(noteContext, (node) => {
            let type = node.getType().get();
            if (type === constants_1.NOTE_TYPE) {
                //@ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
                return true;
            }
        });
    }
    /**
     * @param {(SpinalNode<any> | SpinalNode<any>[])} notes
     * @return {*}  {Promise<{ [key: string]: SpinalNode<any>[] }>}
     * @memberof NoteService
     */
    getNotesReferencesNodes(notes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(notes))
                notes = [notes];
            const obj = {};
            const promises = notes.map((note) => __awaiter(this, void 0, void 0, function* () {
                obj[note.getId().get()] = yield note.getParents(constants_1.NOTE_RELATION);
                return;
            }));
            yield Promise.all(promises);
            return obj;
        });
    }
    /**
     * Deletes a note from a node
     * @param {SpinalNode<any>} node node to delete from
     * @param {SpinalNode<any>} note note to delete
     * @memberof NoteService
     */
    delNote(node, note) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error('Node must be a SpinalNode.');
            if (!(note instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                throw new Error('Note must be a SpinalNode.');
            yield node.removeChild(note, constants_1.NOTE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
        });
    }
    /**
     * @param {string} contextId
     * @param {string} groupId
     * @param {string} noteId
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    linkNoteToGroup(contextId, groupId, noteId) {
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
    createDefaultCategory() {
        return __awaiter(this, void 0, void 0, function* () {
            const context = yield this.createDefaultContext();
            return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.addCategory(context.getId().get(), constants_1.NOTE_CATEGORY_NAME, 'add');
        });
    }
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    createDefaultGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            const context = yield this.createDefaultContext();
            const category = yield this.createDefaultCategory();
            return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.addGroup(context.getId().get(), category.getId().get(), constants_1.NOTE_GROUP_NAME, '#FFF000');
        });
    }
    /**
     * @param {SpinalNode<any>} spinalNode
     * @param {SpinalNote} spinalNote
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof NoteService
     */
    createAttribute(spinalNode, spinalNote) {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryName = 'default';
            const service = globalType.spinal.serviceDocumentation;
            if (service) {
                const category = yield service.addCategoryAttribute(spinalNode, categoryName);
                const promises = spinalNote._attribute_names.map((key) => {
                    return service.addAttributeByCategory(spinalNode, category, key, spinalNote[key].get());
                });
                return Promise.all(promises);
            }
        });
    }
    /**
     * @private
     * @param {SpinalNode<any>} noteNode
     * @param {(any | any[])} files
     * @return {*}  {Promise<IFileNote[]>}
     * @memberof NoteService
     */
    addFilesInDirectory(noteNode, files) {
        if (!Array.isArray(files))
            files = [files];
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            return {
                viewPoint: {
                    viewState: file.viewState,
                    objectState: file.objectState,
                },
                file: file,
                directory: yield FileExplorer_1.FileExplorer._getOrCreateFileDirectory(noteNode),
            };
        }));
        return Promise.all(promises);
    }
}
exports.NoteService = NoteService;
const noteService = new NoteService();
exports.noteService = noteService;
exports.default = NoteService;
//# sourceMappingURL=NoteService.js.map
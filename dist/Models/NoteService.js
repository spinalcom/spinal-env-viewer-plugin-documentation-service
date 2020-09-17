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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_models_documentation_1 = require("spinal-models-documentation");
const spinal_env_viewer_plugin_group_manager_service_1 = require("spinal-env-viewer-plugin-group-manager-service");
const constants_1 = require("./constants");
const FileExplorer_1 = require("./FileExplorer");
// import AttributeService from "./AttributeService";
class NoteService {
    constructor() {
    }
    addNote(node, userInfo, note, type, file, noteContextId, noteGroupId, viewPoint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                return;
            const spinalNote = new spinal_models_documentation_1.SpinalNote(userInfo.username, note, userInfo.userId, type, file, viewPoint);
            const spinalNode = yield node.addChild(spinalNote, constants_1.NOTE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            if (spinalNode && spinalNode.info) {
                spinalNode.info.name.set(`message-${Date.now()}`);
                spinalNode.info.type.set(constants_1.NOTE_TYPE);
            }
            yield this.createAttribute(spinalNode, spinalNote);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(spinalNode);
            let contextId = noteContextId;
            let groupId = noteGroupId;
            if (typeof contextId === "undefined") {
                const noteContext = yield this.createDefaultContext();
                contextId = noteContext.getId().get();
            }
            if (typeof groupId === "undefined") {
                const groupNode = yield this.createDefaultGroup();
                groupId = groupNode.getId().get();
            }
            yield this.linkNoteToGroup(contextId, groupId, spinalNode.getId().get());
            return spinalNode;
        });
    }
    addFileAsNote(node, files, userInfo, noteContextId, noteGroupId) {
        if (!(Array.isArray(files)))
            files = [files];
        const promises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
            return {
                viewPoint: {
                    viewState: file.viewState,
                    objectState: file.objectState
                },
                file: file,
                directory: yield this._getOrCreateFileDirectory(node)
            };
        }));
        return Promise.all(promises).then((res) => {
            return res.map((data) => {
                const type = FileExplorer_1.FileExplorer._getFileType(data.file);
                let files = FileExplorer_1.FileExplorer.addFileUpload(data.directory, [data.file]);
                let file = files.length > 0 ? files[0] : undefined;
                this.addNote(node, userInfo, data.file.name, type, file, noteContextId, noteGroupId, data.viewPoint);
            });
        });
    }
    getNotes(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                return;
            const messagesNodes = yield node.getChildren(constants_1.NOTE_RELATION);
            const promises = messagesNodes.map((el) => __awaiter(this, void 0, void 0, function* () {
                const element = yield el.getElement();
                return {
                    element: element,
                    selectedNode: el
                };
            }));
            return Promise.all(promises);
        });
    }
    editNote(element, note) {
        let date = new Date();
        element.message.set(note);
        element.date.set(date);
    }
    predicate(node) {
        return true;
    }
    linkNoteToGroup(contextId, groupId, noteId) {
        spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.linkElementToGroup(contextId, groupId, noteId);
    }
    createDefaultContext() {
        return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.createGroupContext(constants_1.NOTE_CONTEXT_NAME, constants_1.NOTE_TYPE);
    }
    createDefaultCategory() {
        return __awaiter(this, void 0, void 0, function* () {
            const context = yield this.createDefaultContext();
            return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.addCategory(context.getId().get(), constants_1.NOTE_CATEGORY_NAME, "add");
        });
    }
    createDefaultGroup() {
        return __awaiter(this, void 0, void 0, function* () {
            const context = yield this.createDefaultContext();
            const category = yield this.createDefaultCategory();
            return spinal_env_viewer_plugin_group_manager_service_1.groupManagerService.addGroup(context.getId().get(), category.getId().get(), constants_1.NOTE_GROUP_NAME, "#FFF000");
        });
    }
    createAttribute(spinalNode, spinalNote) {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryName = "default";
            const service = window.spinal.serviceDocumentation;
            if (service) {
                const category = yield service.addCategoryAttribute(spinalNode, categoryName);
                const promises = spinalNote._attribute_names.map(key => {
                    return service.addAttributeByCategory(spinalNode, category, key, spinalNote[key]);
                });
                return Promise.all(promises);
            }
        });
    }
    _getOrCreateFileDirectory(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let directory = yield FileExplorer_1.FileExplorer.getDirectory(node);
            if (!directory) {
                directory = yield FileExplorer_1.FileExplorer.createDirectory(node);
            }
            return directory;
        });
    }
}
exports.default = NoteService;
//# sourceMappingURL=NoteService.js.map
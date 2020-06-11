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
class NoteService {
    constructor() {
    }
    addNote(node, userInfo, note) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(node instanceof spinal_env_viewer_graph_service_1.SpinalNode))
                return;
            const spinalNote = new spinal_models_documentation_1.SpinalNote(userInfo.username, note, userInfo.userId);
            const spinalNode = yield node.addChild(spinalNote, constants_1.NOTE_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            if (spinalNode && spinalNode.info) {
                spinalNode.info.name.set(`message-${Date.now()}`);
                spinalNode.info.type.set(constants_1.NOTE_TYPE);
            }
            yield this.createAttribute(spinalNode, spinalNote);
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(spinalNode);
            return spinalNode;
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
}
exports.default = NoteService;
//# sourceMappingURL=NoteService.js.map
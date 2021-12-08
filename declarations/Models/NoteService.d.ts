import { SpinalNode } from "spinal-env-viewer-graph-service";
import { SpinalNote, ViewStateInterface } from "spinal-models-documentation";
declare class NoteService {
    constructor();
    addNote(node: SpinalNode<any>, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: spinal.Model, noteContextId?: string, noteGroupId?: string, viewPoint?: ViewStateInterface): Promise<SpinalNode<any>>;
    addFileAsNote(node: SpinalNode<any>, files: any, userInfo: {
        username: string;
        userId: number;
    }, noteContextId?: string, noteGroupId?: string): Promise<SpinalNode<any>[]>;
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
    twinAddNote(node: SpinalNode<any>, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: spinal.Model, viewPoint?: ViewStateInterface, noteContextId?: string, noteGroupId?: string): Promise<SpinalNode<any>>;
    getNotes(node: SpinalNode<any>): Promise<{
        element: SpinalNote;
        selectedNode: SpinalNode<any>;
    }[]>;
    editNote(element: SpinalNote, note: string): SpinalNote;
    addNoteToContext(noteNode: SpinalNode<any>, contextId?: string, groupId?: string): Promise<any>;
    getNotesInNoteContext(noteContext: SpinalNode<any>, startNode: SpinalNode<any>): Promise<SpinalNode<any>[]>;
    getNotesReferencesNodes(notes: SpinalNode<any> | SpinalNode<any>[]): Promise<{
        [key: string]: SpinalNode<any>[];
    }>;
    /**
     * Deletes a note from a node
     *
     * @param {SpinalNode<any>} node node to delete from
     * @param {SpinalNode<any>} note note to delete
     * @memberof NoteService
     */
    delNote(node: SpinalNode<any>, note: SpinalNode<any>): Promise<void>;
    linkNoteToGroup(contextId: string, groupId: string, noteId: string): any;
    createDefaultContext(): Promise<any>;
    createDefaultCategory(): Promise<any>;
    createDefaultGroup(): Promise<any>;
    createAttribute(spinalNode: SpinalNode<any>, spinalNote: SpinalNote): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    private _getOrCreateFileDirectory;
    private addFilesInDirectory;
}
declare const noteService: NoteService;
export { NoteService, noteService };
export default NoteService;

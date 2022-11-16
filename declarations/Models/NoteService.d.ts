import type { SpinalContext } from 'spinal-env-viewer-graph-service';
import { SpinalNode } from 'spinal-env-viewer-graph-service';
import { SpinalNote } from 'spinal-models-documentation';
import type { ViewStateInterface, SpinalAttribute } from 'spinal-models-documentation';
declare class NoteService {
    constructor();
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
    addNote(node: SpinalNode<any>, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: spinal.File<spinal.Model>, noteContextId?: string, noteGroupId?: string, viewPoint?: ViewStateInterface): Promise<SpinalNode<any>>;
    /**
     * @param {SpinalNode<any>} node
     * @param {*} files
     * @param {{ username: string; userId: number }} userInfo
     * @param {string} [noteContextId]
     * @param {string} [noteGroupId]
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof NoteService
     */
    addFileAsNote(node: SpinalNode<any>, files: File | File[] | FileList | any, userInfo: {
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
     * @param {File} [file] file to add to the node
     * @param {ViewStateInterface} [viewPoint] viewpoint to save in the note
     * @param {string} [noteContextId] contextID of the note
     * @param {string} [noteGroupId] groupID of the note
     * @return {*} {Promise<SpinalNode<any>>} note as a node
     * @memberof NoteService
     */
    twinAddNote(node: SpinalNode<any>, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: File, viewPoint?: ViewStateInterface, noteContextId?: string, noteGroupId?: string): Promise<SpinalNode<any>>;
    /**
     * @param {SpinalNode<any>} node
     * @return {*}  {Promise<{ element: SpinalNote; selectedNode: SpinalNode<any> }[]>}
     * @memberof NoteService
     */
    getNotes(node: SpinalNode<any>): Promise<{
        element: SpinalNote;
        selectedNode: SpinalNode<any>;
    }[]>;
    /**
     * @param {SpinalNote} element
     * @param {string} note
     * @return {*}  {SpinalNote}
     * @memberof NoteService
     */
    editNote(element: SpinalNote, note: string): SpinalNote;
    /**
     * @param {SpinalNode<any>} noteNode
     * @param {string} [contextId]
     * @param {string} [groupId]
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    addNoteToContext(noteNode: SpinalNode<any>, contextId?: string, groupId?: string): Promise<{
        old_group: string;
        newGroup: string;
    }>;
    /**
     * @param {SpinalNode<any>} noteContext
     * @param {SpinalNode<any>} startNode
     * @return {*}  {Promise<SpinalNode<any>[]>}
     * @memberof NoteService
     */
    getNotesInNoteContext(noteContext: SpinalNode<any>, startNode: SpinalNode<any>): Promise<SpinalNode<any>[]>;
    /**
     * @param {(SpinalNode<any> | SpinalNode<any>[])} notes
     * @return {*}  {Promise<{ [key: string]: SpinalNode<any>[] }>}
     * @memberof NoteService
     */
    getNotesReferencesNodes(notes: SpinalNode<any> | SpinalNode<any>[]): Promise<{
        [key: string]: SpinalNode<any>[];
    }>;
    /**
     * Deletes a note from a node
     * @param {SpinalNode<any>} node node to delete from
     * @param {SpinalNode<any>} note note to delete
     * @memberof NoteService
     */
    delNote(node: SpinalNode<any>, note: SpinalNode<any>): Promise<void>;
    /**
     * @param {string} contextId
     * @param {string} groupId
     * @param {string} noteId
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    linkNoteToGroup(contextId: string, groupId: string, noteId: string): Promise<{
        old_group: string;
        newGroup: string;
    }>;
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    createDefaultContext(): Promise<SpinalContext>;
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    createDefaultCategory(): Promise<SpinalNode>;
    /**
     * @return {*}  {Promise<SpinalNodeRef>}
     * @memberof NoteService
     */
    createDefaultGroup(): Promise<SpinalNode>;
    /**
     * @param {SpinalNode<any>} spinalNode
     * @param {SpinalNote} spinalNote
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof NoteService
     */
    createAttribute(spinalNode: SpinalNode<any>, spinalNote: SpinalNote): Promise<SpinalAttribute[]>;
    /**
     * @private
     * @param {SpinalNode<any>} noteNode
     * @param {(any | any[])} files
     * @return {*}  {Promise<IFileNote[]>}
     * @memberof NoteService
     */
    private addFilesInDirectory;
}
declare const noteService: NoteService;
export { NoteService, noteService };
export default NoteService;

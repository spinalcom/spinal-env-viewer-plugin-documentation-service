import { type SpinalContext, SpinalNode } from 'spinal-model-graph';
import { File as SpinalFile } from 'spinal-core-connectorjs';
import { SpinalNote, type ViewStateInterface, type SpinalAttribute } from 'spinal-models-documentation';
declare class NoteService {
    constructor();
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
    addNote(node: SpinalNode, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: SpinalFile, noteContextId?: string, noteGroupId?: string, viewPoint?: ViewStateInterface): Promise<SpinalNode>;
    /**
     * @param {SpinalNode} node
     * @param {*} files
     * @param {{ username: string; userId: number }} userInfo
     * @param {string} [noteContextId]
     * @param {string} [noteGroupId]
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof NoteService
     */
    addFileAsNote(node: SpinalNode, files: File | File[] | FileList | any, userInfo: {
        username: string;
        userId: number;
    }, noteContextId?: string, noteGroupId?: string): Promise<SpinalNode[]>;
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
    twinAddNote(node: SpinalNode, userInfo: {
        username: string;
        userId: number;
    }, note: string, type?: string, file?: File, viewPoint?: ViewStateInterface, noteContextId?: string, noteGroupId?: string): Promise<SpinalNode | undefined>;
    /**
     * @param {SpinalNode} node
     * @return {*}  {Promise<{ element: SpinalNote; selectedNode: SpinalNode }[]>}
     * @memberof NoteService
     */
    getNotes(node: SpinalNode): Promise<{
        element: SpinalNote;
        selectedNode: SpinalNode;
    }[] | undefined>;
    /**
     * @param {SpinalNote} element
     * @param {string} note
     * @return {*}  {SpinalNote}
     * @memberof NoteService
     */
    editNote(element: SpinalNote, note: string): SpinalNote;
    /**
     * @param {SpinalNode} noteNode
     * @param {string} [contextId]
     * @param {string} [groupId]
     * @return {*}  {Promise<{ old_group: string; newGroup: string }>}
     * @memberof NoteService
     */
    addNoteToContext(noteNode: SpinalNode, contextId?: string, groupId?: string): Promise<{
        old_group: string;
        newGroup: string;
    }>;
    /**
     * @param {SpinalNode} noteContext
     * @param {SpinalNode} startNode
     * @return {*}  {Promise<SpinalNode[]>}
     * @memberof NoteService
     */
    getNotesInNoteContext(noteContext: SpinalNode, startNode: SpinalNode): Promise<SpinalNode[]>;
    /**
     * @param {(SpinalNode | SpinalNode[])} notes
     * @return {*}  {Promise<{ [key: string]: SpinalNode[] }>}
     * @memberof NoteService
     */
    getNotesReferencesNodes(notes: SpinalNode | SpinalNode[]): Promise<Record<string, SpinalNode[]>>;
    /**
     * Deletes a note from a node
     * @param {SpinalNode} node node to delete from
     * @param {SpinalNode} note note to delete
     * @memberof NoteService
     */
    delNote(node: SpinalNode, note: SpinalNode): Promise<void>;
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
     * @param {SpinalNode} spinalNode
     * @param {SpinalNote} spinalNote
     * @return {*}  {Promise<SpinalAttribute[]>}
     * @memberof NoteService
     */
    createAttribute(spinalNode: SpinalNode, spinalNote: SpinalNote): Promise<SpinalAttribute[]>;
    /**
     * @private
     * @param {SpinalNode} noteNode
     * @param {(any | any[])} files
     * @return {*}  {Promise<IFileNote[]>}
     * @memberof NoteService
     */
    private prepareFileDirectories;
}
declare const noteService: NoteService;
export { NoteService, noteService };
export default NoteService;

import type { Directory } from 'spinal-core-connectorjs';
export interface IViewState {
    viewState: string;
    objectState: string;
}
export interface IFileNote {
    viewPoint?: IViewState;
    file: File;
    directory: Directory;
}

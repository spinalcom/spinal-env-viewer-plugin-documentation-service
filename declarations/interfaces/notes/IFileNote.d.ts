import { FilesArgType } from "../types";
export interface IViewState {
    viewState: string;
    objectState: string;
}
export interface IFileNote {
    viewPoint?: IViewState;
    file: FilesArgType;
    directory?: spinal.Directory<any>;
    type?: string;
}

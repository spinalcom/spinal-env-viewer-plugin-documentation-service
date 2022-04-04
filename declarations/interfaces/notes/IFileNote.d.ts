export interface IViewState {
    viewState: string;
    objectState: string;
}
export interface IFileNote {
    viewPoint?: IViewState;
    file: File;
    directory: spinal.Directory<any>;
}

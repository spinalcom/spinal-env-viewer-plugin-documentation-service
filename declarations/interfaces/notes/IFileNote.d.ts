export interface IViewState {
    viewState: string;
    objectState: string;
}
export interface IFileNote {
    viewPoint?: IViewState;
    file: any;
    directory: spinal.Directory<any>;
}

import { RouterState } from 'connected-react-router';
import * as moment from 'moment';
import {ActionType} from 'typesafe-actions';

import * as resourcesActions from './actions/resources';
import * as userActions from './actions/user';

export type ResourcesActionTypes = ActionType<typeof resourcesActions>;
export type UserActionTypes = ActionType<typeof userActions>;

/** ---------- Enums ---------- **/

export enum FileOrFolderTypes {
  FOLDER = 'folder',
  FILE = 'file',
}

export const NEW_FILE_OR_FOLDER_TYPES = {
  FOLDER: 'Folder',
  JUPYTER_NOTEBOOK: 'Jupyter Notebook (.ipynb)',
  OTHER_FILE: 'Other File',
};

export const PATH_PREFIXES = {
  HYDROSHARE: 'hs',
  LOCAL: 'local',
}

/** ---------- Redux State ---------- **/

export interface IRootState {
  notifications: INotificationsState
  resources: IResourcesState
  router: RouterState
  user: IUserState
}

export interface INotificationsState {
  current: INotification[]
}

export interface IResourcesState {
  allResources: {
    [resourceId: string]: IResource
  }
  fetchingResources: boolean
  resourceLocalFilesBeingFetched: Set<string>
  resourceHydroShareFilesBeingFetched: Set<string>
  archiveMessage: string
}

export interface IUserState {
  attemptingLogin: boolean
  authenticationFailed: boolean
  credentialsInvalid: boolean
  userInfo?: IUserInfo
}

/** --------- Data Models --------- **/

export interface IFile {
  path: string // If a folder, no trailing forward slash
  lastModified?: moment.Moment
  name: string
  type: FileOrFolderTypes
  sizeBytes: number
}

export interface IFolder extends IFile {
  contents: (IFile | IFolder)[]
}

export interface IResource {
  abstract?: string
  authors: string[]
  creator: string
  created: moment.Moment
  lastUpdated: moment.Moment
  hydroShareFiles: IFolder
  id: string
  localCopyExists: boolean
  localFiles: IFolder
  public: boolean
  published: boolean
  readmeMarkdown?: string
  status: string
  title: string
  resource_title: string
  resource_url: string
  localReadMe: string
  hydroShareReadMe: string
}

export interface INotification {
  message: string
  time: Date
  type: 'error' | 'warning'
}

export interface IResourcesData {
  resources: IResource[]
  archive_message: string
  success: boolean
  error?: IServerError
}

export interface IResourceFilesData {
  rootDir: IFolder
  readMe: string
  error?: IServerError
}

export interface IUserInfo {
  email: string
  id: number
  name: string
  organization: string
  title: string
  username: string
}

/** --------- Backend Server Communication ---------- **/

export interface IAttemptHydroShareLoginResponse {
  success: boolean
  userInfo: IUserInfo
}

export interface ICreateFileOrFolderRequestResponse {
  success: boolean
  error?: IServerError
}

export interface ICreateResourceRequest {
  abstract: string
  title: string
  privacy: string
}

export interface ICreateResourceRequestResponse {
  success: boolean
  error?: IServerError
}

export interface IFileOperationsRequestResponse {
  failureCount: number
  results: [{
    success: boolean
    error?: IServerError
    message?: string
  }]
  successCount: number
}

export interface IUserInfoDataResponse {
  data: {
    email: string
    first_name: string
    id: number
    last_name: string
    organization: string
    title: string
    username: string
    zip: {
      fire: string
    }
  }
  error?: IServerError
  success: boolean
}

export interface IDeleteResourceRequestResponse{
  success: boolean
  error?: IServerError
}

export interface IServerError {
  type: string
  message: string
}

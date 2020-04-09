import {ChangeEvent} from "react";
import * as React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ResourceList.scss';

import {
  IJupyterResource,
  SortByOptions,
} from '../store/types';
import Modal from "./modals/Modal";

import NewResourceModal from './modals/NewResourceModal';
import { ICreateResourceRequest } from '../store/types';

interface IResourceListProps {
  className?: string
  deleteResources: (resources: IJupyterResource[]) => any
  viewResource: any
  resources: {
      [resourceId: string]: IJupyterResource
  }
  newResource: (newResource: ICreateResourceRequest) => any
}

interface ITableResourceInfo {
  Name: string,
  // Status: string,
  Id: string,
  Location: string,
}

interface IStateTypes {
  allResourcesSelected: boolean
  filterBy: string
  modal: MODAL_TYPES
  selectedResources: Set<string>
  sortBy?: SortByOptions
}

export default class ResourceList extends React.Component<IResourceListProps, IStateTypes> {

    state = {
      allResourcesSelected: false,
      filterBy: '',
      resourceToMaybeDelete: undefined,
      modal: MODAL_TYPES.NONE,
      selectedResources: new Set<string>(),
    };

    deleteSelectedResource = () => {
      this.props.deleteResources(Array.from(this.state.selectedResources).map(r => this.props.resources[r]));
      this.setState({modal: MODAL_TYPES.NONE});
    };

    showConfirmResourceDeletionModal = () => this.setState({ modal: MODAL_TYPES.CONFIRM_RESOURCE_DELETION });
    showNewResourceModal = () => this.setState({ modal: MODAL_TYPES.NEW_RESOURCE });

    closeModal = () => this.setState({ modal: MODAL_TYPES.NONE });

  public convertToTableStructure(resources: {[resourceId: string]: IJupyterResource}): ITableResourceInfo[] {
    const tableList: ITableResourceInfo[] = [];
    Object.values(resources).map((resource: IJupyterResource, i: number) => {
        const locations = ['HydroShare'];
        const {
          id,
          // hydroShareResource,
          localCopyExists,
          title,
        } = resource;
        if (localCopyExists) {
            locations.push('JupyterHub');
        }
        let locationString;
        if (locations.length > 1) {
            const lastLocation = locations.splice(locations.length - 1, 1);
            locationString = locations.join(', ') + ' & ' + lastLocation;
        } else {
            locationString = locations[0];
        }
        tableList.push({
          Name: title,
          // Status: hydroShareResource.status,
          Location: locationString,
          Id: id,
        })
    });
    return tableList;
  }

  toggleAllResourcesSelected = () => {
    let selectedResources;
    if (this.state.allResourcesSelected) {
      selectedResources = new Set<string>();
    } else {
      selectedResources = new Set(Object.keys(this.props.resources));
    }
    this.setState({
      allResourcesSelected: !this.state.allResourcesSelected,
      selectedResources,
    });
  };

  toggleSingleResourceSelected = (resource: IJupyterResource) => {
    let selectedResources = new Set(this.state.selectedResources);
    if (selectedResources.has(resource.id)) {
      selectedResources.delete(resource.id);
    } else {
      selectedResources.add(resource.id);
    }
    this.setState({
      allResourcesSelected: selectedResources.size === Object.keys(this.props.resources).length,
      selectedResources,
    });
  };

  getFilteredResources = () => Object.values(this.props.resources).filter(r => r.title.toLowerCase().includes(this.state.filterBy.toLowerCase()));

  filterTextChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({filterBy: e.target.value});

  public render() {
    const {
      allResourcesSelected,
      selectedResources,
    } = this.state;

    const rowElements = this.getFilteredResources().map(resource => (
      <div className="table-row">
        <input
          type="checkbox"
          checked={selectedResources.has(resource.id)}
          onChange={() => this.toggleSingleResourceSelected(resource)}
        />
        <span onClick={() => this.props.viewResource(resource)} className="clickable">{resource.title}</span>
        <span>{resource.hydroShareResource.author || 'Unknown'}</span>
        <span>Unknown</span>
        <span>Unknown</span>
      </div>
      )
    );

    let modal;
    switch (this.state.modal) {
      case MODAL_TYPES.NEW_RESOURCE:
        modal = <NewResourceModal
          show={true}
          onHide={this.closeModal}
          newResource={this.props.newResource}
        />;
        break;
      case MODAL_TYPES.CONFIRM_RESOURCE_DELETION:
        const selectedResources = Array.from(this.state.selectedResources).map(r => this.props.resources[r]);
        modal = <ResourceDeleteConfirmationModal
          close={this.closeModal}
          resources={selectedResources}
          submit={this.deleteSelectedResource}
        />
    }

    const classNames = ['ResourceList', 'table'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    return (
      <div className={classNames.join(' ')}>
        <div className="ResourceList-header">
          <h2>My Resources</h2>
          <span>Here is a list of your HydroShare resources. To open one, simply click on its name.</span>
        </div>
        <div className="actions-row">
          <input type="text" placeholder="Search" onChange={this.filterTextChanged}/>
          <button onClick={this.showNewResourceModal}><span>New Resource</span></button>
          <button
            disabled={selectedResources.size === 0}
            onClick={this.showConfirmResourceDeletionModal}>
            <span>Delete</span>
          </button>
        </div>
        <div className="table-header table-row">
          <span className="checkbox">
            <input type="checkbox" checked={allResourcesSelected} onChange={this.toggleAllResourcesSelected}/>
          </span>
          <span className="clickable">Name</span>
          <span className="clickable">Owner</span>
          <span className="clickable">Size</span>
          <span className="clickable">Last Modified</span>
        </div>
        {rowElements}
        {modal}
        </div>
    );
  }
}

type RDCModalProps = {
  close: () => any
  resources: IJupyterResource[]
  submit: () => any
};

const ResourceDeleteConfirmationModal: React.FC<RDCModalProps> = (props: RDCModalProps) => {
  return (
    <Modal close={props.close} title="Confirm Deletion" submit={props.submit} isValid={true} submitText="Delete" isWarning={true}>
      <p>Are you sure you want to delete the following resources?</p>
      {props.resources.map(r => <p>{r.title}</p>)}
    </Modal>
  )
};

enum MODAL_TYPES {
  NONE,
  NEW_RESOURCE,
  CONFIRM_RESOURCE_DELETION,
}
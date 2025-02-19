// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import {trackEvent} from 'actions/telemetry_actions';

import BrowseChannels from 'components/browse_channels';
import CreateUserGroupsModal from 'components/create_user_groups_modal';
import DataPrefetch from 'components/data_prefetch';
import EditCategoryModal from 'components/edit_category_modal';
import InvitationModal from 'components/invitation_modal';
import KeyboardShortcutsModal from 'components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import NewChannelModal from 'components/new_channel_modal/new_channel_modal';
import ResizableLhs from 'components/resizable_sidebar/resizable_lhs';
import UserSettingsModal from 'components/user_settings/modal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pluggable from 'plugins/pluggable';
import Constants, {ModalIdentifiers, RHSStates} from 'utils/constants';
import * as Keyboard from 'utils/keyboard';
import * as Utils from 'utils/utils';

import type {ModalData} from 'types/actions';
import type {RhsState} from 'types/store/rhs';

import {ConnectedSidebarList1} from './sidebar_list';

import './sidebaerchat.scss';

// eslint-disable-next-line import/order

// eslint-disable-next-line import/order
// import Sidebar2 from './sidebar2';

type Props = {
    teamId: string;
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
    canJoinPublicChannel: boolean;
    isOpen: boolean;
    actions: {
        fetchMyCategories: (teamId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        clearChannelSelection: () => void;
        closeRightHandSide: () => void;
    };
    unreadFilterEnabled: boolean;
    isMobileView: boolean;
    isKeyBoardShortcutModalOpen: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
    rhsState?: RhsState;
    rhsOpen?: boolean;
};

type State = {
    showDirectChannelsModal: boolean;
    isDragging: boolean;
    showConnectedSidebar2: boolean; // أضف هذا السطر لتتبع حالة ظهور ConnectedSidebar2
};

export default class Sidebar2 extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            isDragging: false,
            showConnectedSidebar2: false, // أضف هذا السطر لتعيين الحالة الابتدائية
        };
    }

    componentDidMount() {
        if (this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }

        window.addEventListener('click', this.handleClickClearChannelSelection);
        window.addEventListener('keydown', this.handleKeyDownEvent);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.teamId && prevProps.teamId !== this.props.teamId) {
            this.props.actions.fetchMyCategories(this.props.teamId);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClickClearChannelSelection);
        window.removeEventListener('keydown', this.handleKeyDownEvent);
    }

    handleClickClearChannelSelection = (event: MouseEvent) => {
        if (event.defaultPrevented) {
            return;
        }

        this.props.actions.clearChannelSelection();
    };

    handleKeyDownEvent = (event: KeyboardEvent) => {
        if (Keyboard.isKeyPressed(event, Constants.KeyCodes.ESCAPE)) {
            this.props.actions.clearChannelSelection();
            return;
        }

        const ctrlOrMetaKeyPressed = Keyboard.cmdOrCtrlPressed(event, true);

        if (ctrlOrMetaKeyPressed) {
            if (Keyboard.isKeyPressed(event, Constants.KeyCodes.FORWARD_SLASH)) {
                event.preventDefault();
                if (this.props.isKeyBoardShortcutModalOpen) {
                    this.props.actions.closeModal(ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL);
                } else {
                    this.props.actions.openModal({
                        modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
                        dialogType: KeyboardShortcutsModal,
                    });
                }
            } else if (Keyboard.isKeyPressed(event, Constants.KeyCodes.A) && event.shiftKey) {
                event.preventDefault();

                this.props.actions.openModal({
                    modalId: ModalIdentifiers.USER_SETTINGS,
                    dialogType: UserSettingsModal,
                    dialogProps: {
                        isContentProductSettings: true,
                    },
                });
            }
        }
    };

    showMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_direct_v2');
    };

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    };

    showCreateCategoryModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.EDIT_CATEGORY,
            dialogType: EditCategoryModal,
            dialogProps: {},
        });
        trackEvent('ui', 'ui_sidebar_menu_createCategory');
    };

    showMoreChannelsModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.MORE_CHANNELS,
            dialogType: BrowseChannels,
        });
        trackEvent('ui', 'ui_channels_more_public_v2');
    };

    invitePeopleModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.INVITATION,
            dialogType: InvitationModal,
        });
        trackEvent('ui', 'ui_channels_dropdown_invite_people');
    };

    showNewChannelModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.NEW_CHANNEL_MODAL,
            dialogType: NewChannelModal,
        });
        this.closeEditRHS();
        trackEvent('ui', 'ui_channels_create_channel_v2');
    };

    showCreateUserGroupModal = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS_CREATE,
            dialogType: CreateUserGroupsModal,
        });
        trackEvent('ui', 'ui_channels_create_user_group');
    };

    handleOpenMoreDirectChannelsModal = (e: Event) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
            this.closeEditRHS();
        }
    };

    toggleConnectedSidebar2 = () => {
        this.setState((prevState) => ({
            showConnectedSidebar2: !prevState.showConnectedSidebar2,
        }));
    };

    onDragStart = () => {
        this.setState({isDragging: true});
    };

    onDragEnd = () => {
        this.setState({isDragging: false});
    };

    renderModals = () => {
        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    isExistingChannel={false}
                />
            );
        }

        return (
            <React.Fragment>
                {moreDirectChannelsModal}
            </React.Fragment>
        );
    };

    closeEditRHS = () => {
        if (this.props.rhsOpen && this.props.rhsState === RHSStates.EDIT_HISTORY) {
            this.props.actions.closeRightHandSide();
        }
    };

    render() {
        if (!this.props.teamId) {
            return (<div/>);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ariaLabel = Utils.localizeMessage('accessibility.sections.lhsNavigator', 'channel navigator region');

        return (
            <div className='sidbaercard'>
                <ResizableLhs
                    id='SidebarContainer'
                    className={classNames({
                        'move--right': this.props.isOpen && this.props.isMobileView,
                        dragging: this.state.isDragging,
                    })}
                >
                    {/* <div className='sidebar--left__icons'>
                        <Pluggable pluggableName='LeftSidebarHeader'/>
                    </div> */}
                    <ConnectedSidebarList1
                        handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}
                        onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                    />
                    <DataPrefetch/>
                    {this.renderModals()}
                </ResizableLhs>
            </div>
        );
    }
}

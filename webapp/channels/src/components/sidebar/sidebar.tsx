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

import ChannelNavigator from './channel_navigator';
import MobileSidebarHeader from './mobile_sidebar_header';
import SidebarHeader from './sidebar_header';
import {ConnectedSidebarList} from './sidebar_list';

import './sidebaerchat.scss';

// eslint-disable-next-line import/order
import {ConnectedSidebar2} from 'components/sidebar';
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

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            isDragging: false,
            showConnectedSidebar2: true, // أضف هذا السطر لتعيين الحالة الابتدائية
        };
    }
    toggleConnectedSidebar2 = () => {
        this.setState((prevState) => ({
            showConnectedSidebar2: !prevState.showConnectedSidebar2,
        }));
    };
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

    // eslint-disable-next-line @typescript-eslint/no-dupe-class-members
    // toggleConnectedSidebar2 = () => {
    //     this.setState((prevState) => ({
    //         showConnectedSidebar2: !prevState.showConnectedSidebar2,
    //     }));
    // };

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
                    {this.props.isMobileView ? <MobileSidebarHeader/> : (
                        <SidebarHeader
                            showNewChannelModal={this.showNewChannelModal}
                            showMoreChannelsModal={this.showMoreChannelsModal}
                            showCreateUserGroupModal={this.showCreateUserGroupModal}
                            invitePeopleModal={this.invitePeopleModal}
                            showCreateCategoryModal={this.showCreateCategoryModal}
                            canCreateChannel={this.props.canCreatePrivateChannel || this.props.canCreatePublicChannel}
                            canJoinPublicChannel={this.props.canJoinPublicChannel}
                            handleOpenDirectMessagesModal={this.handleOpenMoreDirectChannelsModal}
                            unreadFilterEnabled={this.props.unreadFilterEnabled}
                            userGroupsEnabled={this.props.userGroupsEnabled}
                            canCreateCustomGroups={this.props.canCreateCustomGroups}
                        />
                    )}
                    <div
                        id='lhsNavigator'
                        role='application'
                        aria-label={ariaLabel}
                        className='a11y__region'
                        data-a11y-sort-order='6'
                    >
                        <ChannelNavigator/>
                    </div>
                    {/* <div className='sidebar--left__icons'>
                        <Pluggable pluggableName='LeftSidebarHeader'/>
                    </div> */}
                    <div
                        className='Buttonhover'
                        onClick={this.toggleConnectedSidebar2}
                    >
                        <span>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                version='1.1'
                                width='24'
                                height='24'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    d='M6,7.75c0.69,0,1.25,0.56,1.25,1.25S6.69,10.25,6,10.25S4.75,9.69,4.75,9S5.31,7.75,6,7.75z M10.5,7.75c0.69,0,1.25,0.56,1.25,1.25s-0.56,1.25-1.25,1.25c-0.69,0-1.25-0.56-1.25-1.25S9.81,7.75,10.5,7.75z M16.25,9
	c0-0.69-0.56-1.25-1.25-1.25S13.75,8.31,13.75,9s0.56,1.25,1.25,1.25S16.25,9.69,16.25,9z M4,3C2.895,3,2,3.895,2,5v8
	c0,1.105,0.895,2,2,2h2v4l3.636-4H17c1.105,0,2-0.895,2-2V5c0-1.105-0.895-2-2-2H4z M11,13.5H9.318l-1.818,2v-2H6H4.5
	c-0.552,0-1-0.448-1-1v-7c0-0.552,0.448-1,1-1h12c0.552,0,1,0.448,1,1v7c0,0.552-0.448,1-1,1H11z M10.063,16.5
	C10.285,17.363,11.068,18,12,18h2.364L18,22v-4h2c1.104,0,2-0.896,2-2V8c0-0.932-0.637-1.715-1.5-1.937V8.5v7c0,0.552-0.448,1-1,1
	H18h-1.5v2l-1.818-2H13h-0.5H10.063z'
                                />
                            </svg>

                        </span>
                        <button
                            className=''

                        >
                            <div
                                className='SidebarChannelGroupHeader_text'
                                style={{width: '100%'}}
                            >
                                <p className='ar'>{'الرسائل المباشرة'}
                                </p>
                                <p className='en'>{'DIRECT MESSAGES'}</p>
                            </div>
                            <i
                                style={{transform: this.state.showConnectedSidebar2 ? 'rotate(90deg)' : 'rotate(270deg)'}}
                                className='icon icon-chevron-down iconstyls'
                            />
                        </button>
                    </div>

                    <ConnectedSidebarList
                        handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}
                        onDragStart={this.onDragStart}
                        onDragEnd={this.onDragEnd}
                    />
                    <DataPrefetch/>
                    {this.renderModals()}
                </ResizableLhs>
                {this.state.showConnectedSidebar2 && <ConnectedSidebar2/>}
            </div>
        );
    }
}

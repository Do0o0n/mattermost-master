// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import Heading from '@mattermost/compass-components/components/heading'; // eslint-disable-line no-restricted-imports
import Flex from '@mattermost/compass-components/utilities/layout/Flex'; // eslint-disable-line no-restricted-imports

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {setAddChannelDropdown} from 'actions/views/add_channel_dropdown';
import {isAddChannelDropdownOpen} from 'selectors/views/add_channel_dropdown';

import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';
import MainMenu from 'components/main_menu';
import OverlayTrigger from 'components/overlay_trigger';
import AddChannelDropdown from 'components/sidebar/add_channel_dropdown';
import Tooltip from 'components/tooltip';
import {OnboardingTourSteps} from 'components/tours';
import {useShowOnboardingTutorialStep} from 'components/tours/onboarding_tour';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Constants from 'utils/constants';

import type {GlobalState} from 'types/store';

type SidebarHeaderContainerProps = {
    id?: string;
}

type SidebarHeaderProps = Record<string, unknown>;

const SidebarHeaderContainer = styled(Flex).attrs(() => ({
    element: 'header',
    row: true,
    justify: 'space-between',
    alignment: 'center',
}))<SidebarHeaderContainerProps>`
    height: 55px;
    padding: 0 16px;
    gap: 8px;

    .dropdown-menu {
        position: absolute;
        transform: translate(0, 0);
        margin-left: 0;
        min-width: 210px;
    }

    #SidebarContainer & .AddChannelDropdown_dropdownButton {
        // border-radius: 16px;
        // font-size: 18px;
    }
`;

const SidebarHeading = styled(Heading).attrs(() => ({
    element: 'h1',
    margin: 'none',
    size: 200,
}))<SidebarHeaderProps>`
    color: var(--sidebar-text);
    cursor: pointer;
    display: flex;

    .title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
    }

    .icon-chevron-down {
        margin-left: -3px;
        margin-right: -1px;
    }

    #SidebarContainer & {
        font-family: 'Graphik Arabic';
    }
`;

export type Props = {
    showNewChannelModal: () => void;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showCreateCategoryModal: () => void;
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
}

const SidebarHeader = (props: Props) => {
    const dispatch = useDispatch();
    const currentTeam = useSelector((state: GlobalState) => getCurrentTeam(state));
    const showCreateTutorialTip = useShowOnboardingTutorialStep(OnboardingTourSteps.CREATE_AND_JOIN_CHANNELS);
    const showInviteTutorialTip = useShowOnboardingTutorialStep(OnboardingTourSteps.INVITE_PEOPLE);
    const usageDeltas = useGetUsageDeltas();
    const isAddChannelOpen = useSelector(isAddChannelDropdownOpen);
    const theme = useSelector(getTheme);
    const openAddChannelOpen = useCallback((open: boolean) => {
        dispatch(setAddChannelDropdown(open));
    }, []);

    const [menuToggled, setMenuToggled] = useState(false);

    const handleMenuToggle = () => {
        setMenuToggled(!menuToggled);
    };

    if (!currentTeam) {
        return null;
    }

    return (
        <CompassThemeProvider theme={theme}>
            <div
                id={'sidebar-header-container'}
            >
                <div className='sidbaer-card'>
                    <div className='sova'>
                        <div className='sidbaer-imgi'/>
                        <label className='text-sidbaer'>
                            {'شركة سوفا للحلول الرقمية'}
                        </label>
                    </div>
                </div>
            </div>
            <SidebarHeaderContainer
                id={'sidebar-header-container'}
            >
                <OverlayTrigger

                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='bottom'
                    overlay={currentTeam.description?.length ? (
                        <Tooltip id='team-name__tooltip'>{currentTeam.description}</Tooltip>
                    ) : <></>}
                >
                    <MenuWrapper
                        onToggle={handleMenuToggle}
                        className='SidebarHeaderMenuWrapper test-team-header'
                    >
                        <SidebarHeading>
                            <button className='style--none sidebar-header'>
                                <span className='title'>{currentTeam.display_name}</span>
                                <i className='icon icon-chevron-down'/>
                            </button>
                        </SidebarHeading>
                        <MainMenu
                            id='sidebarDropdownMenu'
                            usageDeltaTeams={usageDeltas.teams.active}
                        />
                    </MenuWrapper>
                </OverlayTrigger>
                <AddChannelDropdown
                    showNewChannelModal={props.showNewChannelModal}
                    showMoreChannelsModal={props.showMoreChannelsModal}
                    invitePeopleModal={props.invitePeopleModal}
                    showCreateCategoryModal={props.showCreateCategoryModal}
                    canCreateChannel={props.canCreateChannel}
                    canJoinPublicChannel={props.canJoinPublicChannel}
                    handleOpenDirectMessagesModal={props.handleOpenDirectMessagesModal}
                    unreadFilterEnabled={props.unreadFilterEnabled}
                    showCreateTutorialTip={showCreateTutorialTip}
                    showInviteTutorialTip={showInviteTutorialTip}
                    isAddChannelOpen={isAddChannelOpen}
                    openAddChannelOpen={openAddChannelOpen}
                    canCreateCustomGroups={props.canCreateCustomGroups}
                    showCreateUserGroupModal={props.showCreateUserGroupModal}
                    userGroupsEnabled={props.userGroupsEnabled}
                />
            </SidebarHeaderContainer>

        </CompassThemeProvider>
    );
};

export default SidebarHeader;

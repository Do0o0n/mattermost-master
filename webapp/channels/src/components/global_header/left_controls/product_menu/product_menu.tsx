// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import IconButton from '@mattermost/compass-components/components/icon-button'; // eslint-disable-line no-restricted-imports

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {isSwitcherOpen} from 'selectors/views/product_menu';

import {
    GenericTaskSteps,
    OnboardingTaskCategory,
    OnboardingTasksName,
    TaskNameMapToSteps,
    useHandleOnBoardingTaskData,
} from 'components/onboarding_tasks';
import {FINISHED, TutorialTourName} from 'components/tours';
import {PlaybooksTourTip} from 'components/tours/onboarding_explore_tools_tour';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {useGetPluginsActivationState} from 'plugins/useGetPluginsActivationState';
import {ExploreOtherToolsTourSteps, suitePluginIds} from 'utils/constants';
import {useCurrentProductId, useProducts, isChannels} from 'utils/products';

import type {GlobalState} from 'types/store';

import ProductBranding from './product_branding';
import ProductBrandingTeamEdition from './product_branding_team_edition';
import ProductMenuItem from './product_menu_item';
import ProductMenuList from './product_menu_list';

import {useClickOutsideRef} from '../../hooks';

export const ProductMenuContainer = styled.nav`
    display: flex;
    align-items: center;
    cursor: pointer;
    margin:2%;

    > * + * {
        margin-left: 12px;
         display: none;
    }
`;

export const ProductMenuButton = styled(IconButton).attrs(() => ({
    id: 'product_switch_menu',
    icon: 'products',
    size: 'sm',

    // we currently need this, since not passing a onClick handler is disabling the IconButton
    // this is a known issue and is being tracked by UI platform team

    onClick: () => {},
    inverted: true,
    compact: true,
}))`
    > i::before {
        font-size: 20px;
        letter-spacing: 20px;
    }
`;

const ProductMenu = (): JSX.Element => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {formatMessage} = useIntl();
    const products = useProducts();
    const dispatch = useDispatch();
    const switcherOpen = useSelector(isSwitcherOpen);
    const menuRef = useRef<HTMLDivElement>(null);
    const currentProductID = useCurrentProductId();
    const license = useSelector(getLicense);

    const enableTutorial = useSelector(getConfig).EnableTutorial === 'true';
    const currentUserId = useSelector(getCurrentUserId);
    const tutorialStep = useSelector((state: GlobalState) => getInt(state, TutorialTourName.EXPLORE_OTHER_TOOLS, currentUserId, 0));
    const triggerStep = useSelector((state: GlobalState) => getInt(state, OnboardingTaskCategory, OnboardingTasksName.EXPLORE_OTHER_TOOLS, FINISHED));
    const exploreToolsTourTriggered = triggerStep === GenericTaskSteps.STARTED;

    const {playbooksPlugin} = useGetPluginsActivationState();

    const showPlaybooksTour = enableTutorial && tutorialStep === ExploreOtherToolsTourSteps.PLAYBOOKS_TOUR && exploreToolsTourTriggered && playbooksPlugin;

    const handleClick = () => dispatch(setProductMenuSwitcherOpen(!switcherOpen));

    const handleOnBoardingTaskData = useHandleOnBoardingTaskData();

    const visitSystemConsoleTaskName = OnboardingTasksName.VISIT_SYSTEM_CONSOLE;
    const handleVisitConsoleClick = () => {
        const steps = TaskNameMapToSteps[visitSystemConsoleTaskName];
        handleOnBoardingTaskData(visitSystemConsoleTaskName, steps.FINISHED, true, 'finish');
        localStorage.setItem(OnboardingTaskCategory, 'true');
    };

    useClickOutsideRef(menuRef, () => {
        if (exploreToolsTourTriggered || !switcherOpen) {
            return;
        }
        dispatch(setProductMenuSwitcherOpen(false));
    });

    const productItems = products?.map((product) => {
        let tourTip;

        // playbooks
        if (product.pluginId === suitePluginIds.playbooks && showPlaybooksTour) {
            tourTip = (<PlaybooksTourTip singleTip={true}/>);
        }

        return (
            <ProductMenuItem
                key={product.id}
                destination={product.switcherLinkURL}
                icon={product.switcherIcon}
                text={product.switcherText}
                active={product.id === currentProductID}
                onClick={handleClick}
                tourTip={tourTip}
                id={`product-menu-item-${product.pluginId || product.id}`}
            />
        );
    });

    return (
        <div ref={menuRef}>
            <MenuWrapper
                className='MenuWrapper1'
                open={switcherOpen}
            >
                <ProductMenuContainer
                    onClick={handleClick}
                    className='MenuWrapper1'
                >
                    <svg
                        width='20'
                        height='20'
                        viewBox='0 0 20 20'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M3.125 5C3.125 3.96447 3.96447 3.125 5 3.125H6.875C7.91053 3.125 8.75 3.96447 8.75 5V6.875C8.75 7.91053 7.91053 8.75 6.875 8.75H5C3.96447 8.75 3.125 7.91053 3.125 6.875V5Z'
                            stroke='#808887'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M3.125 13.125C3.125 12.0895 3.96447 11.25 5 11.25H6.875C7.91053 11.25 8.75 12.0895 8.75 13.125V15C8.75 16.0355 7.91053 16.875 6.875 16.875H5C3.96447 16.875 3.125 16.0355 3.125 15V13.125Z'
                            stroke='#808887'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M11.25 5C11.25 3.96447 12.0895 3.125 13.125 3.125H15C16.0355 3.125 16.875 3.96447 16.875 5V6.875C16.875 7.91053 16.0355 8.75 15 8.75H13.125C12.0895 8.75 11.25 7.91053 11.25 6.875V5Z'
                            stroke='#808887'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M11.25 13.125C11.25 12.0895 12.0895 11.25 13.125 11.25H15C16.0355 11.25 16.875 12.0895 16.875 13.125V15C16.875 16.0355 16.0355 16.875 15 16.875H13.125C12.0895 16.875 11.25 16.0355 11.25 15V13.125Z'
                            stroke='#808887'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>

                    {license.IsLicensed === 'false' && <ProductBrandingTeamEdition/>}
                    {license.IsLicensed === 'true' && <ProductBranding/>}
                </ProductMenuContainer>
                <Menu
                    listId={'product-switcher-menu-dropdown menu-right'}
                    className={'product-switcher-menu menu-right'}
                    id={'product-switcher-menu'}
                    ariaLabel={'switcherOpen'}
                >
                    <ProductMenuItem
                        destination={'/'}
                        icon={'product-channels'}
                        text={'Channels'}
                        active={isChannels(currentProductID)}
                        onClick={handleClick}
                    />
                    {productItems}
                    <ProductMenuList
                        isMessaging={isChannels(currentProductID)}
                        onClick={handleClick}
                        handleVisitConsoleClick={handleVisitConsoleClick}
                    />
                    <Menu.Group>
                        <Menu.StartTrial
                            id='startTrial'
                        />
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export default ProductMenu;

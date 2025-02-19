// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import partition from 'lodash/partition';
import React from 'react';
import type {ReactNode} from 'react';
import {useSelector} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import {Permissions} from 'mattermost-redux/constants';
import {getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';
import {isMarketplaceEnabled} from 'mattermost-redux/selectors/entities/general';
import {haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';

import {getAppBarPluginComponents, getChannelHeaderPluginComponents, shouldShowAppBar} from 'selectors/plugins';

import {suitePluginIds} from 'utils/constants';
import {useCurrentProduct, useCurrentProductId, inScope} from 'utils/products';

// eslint-disable-next-line import/order
import AppBarBinding, {isAppBinding} from './app_bar_binding';

// import AppBarMarketplace from './app_bar_marketplace';
import AppBarPluginComponent, {isAppBarPluginComponent} from './app_bar_plugin_component';

import './app_bar.scss';

export default function Videoicon() {
    const channelHeaderComponents = useSelector(getChannelHeaderPluginComponents);
    const appBarPluginComponents = useSelector(getAppBarPluginComponents);
    const appBarBindings = useSelector(getAppBarAppBindings);
    const currentProduct = useCurrentProduct();
    const currentProductId = useCurrentProductId();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const enabled = useSelector(shouldShowAppBar);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const canOpenMarketplace = useSelector((state: GlobalState) => (
        isMarketplaceEnabled(state) &&
        haveICurrentTeamPermission(state, Permissions.SYSCONSOLE_WRITE_PLUGINS)
    ));

    // if (
    //     !enabled ||
    //     (currentProduct && !currentProduct.showAppBar)
    // ) {
    //     return null;
    // }

    const coreProductsPluginIds = [suitePluginIds.focalboard, suitePluginIds.playbooks];

    const [coreProductComponents, pluginComponents] = partition(
        appBarPluginComponents.filter(({pluginId}) => pluginId === 'jitsi'),
        ({pluginId}) => coreProductsPluginIds.includes(pluginId),
    );

    const items: ReactNode[] = [
        ...coreProductComponents,
        getDivider(coreProductComponents.length, (pluginComponents.length + channelHeaderComponents.length + appBarBindings.length)),
        ...pluginComponents,
        // eslint-disable-next-line lines-around-comment
        // ...channelHeaderComponents,
        // ...appBarBindings,
    ].map((x) => {
        if (!x) {
            return x;
        }

        if (isAppBarPluginComponent(x)) {
            if (!inScope(x.supportedProductIds ?? null, currentProductId, currentProduct?.pluginId)) {
                return null;
            }
            return (
                <AppBarPluginComponent
                    key={x.id}
                    component={x}
                />
            );
        } else if (isAppBinding(x)) {
            if (!inScope(x.supported_product_ids ?? null, currentProductId, currentProduct?.pluginId)) {
                return null;
            }
            return (
                <AppBarBinding
                    key={`${x.app_id}_${x.label}`}
                    binding={x}
                />
            );
        }
        return x;
    });

    return (
        <div className='noAnimation'>
            {pluginComponents.length > 0 && (
                <button
                    className='VoicePluginComponent'
                    style={{color: '#00987e', border: 'none', width: '0'}}
                >
                    {items}
                </button>
            )}
        </div>
    );
}

const getDivider = (beforeCount: number, afterCount: number) => (beforeCount && afterCount ? (
    <hr/>
) : null);

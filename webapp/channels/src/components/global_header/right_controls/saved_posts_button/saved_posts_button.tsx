// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames'; // للتعامل مع الكلاسات بشكل ديناميكي
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '@mattermost/compass-components/components/icon-button'; // eslint-disable-line no-restricted-imports

import {closeRightHandSide, showFlaggedPosts} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {RHSStates} from 'utils/constants';

import type {GlobalState} from 'types/store';

const SavedPostsButton = (): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));

    const savedPostsButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (rhsState === RHSStates.FLAG) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showFlaggedPosts());
        }
    };

    const tooltip = (
        <Tooltip id='recentMentions'>
            <FormattedMessage
                id='channel_header.flagged'
                defaultMessage='Saved messages'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >
            <IconButton
                size={'sm'}
                icon={'bookmark-outline'}
                toggled={rhsState === RHSStates.FLAG}
                onClick={savedPostsButtonClick}
                inverted={true}
                compact={true}
                aria-expanded={rhsState === RHSStates.FLAG}
                aria-controls='searchContainer'
                aria-label={formatMessage({id: 'channel_header.flagged', defaultMessage: 'Saved messages'})}
                className={classNames({
                    'icon-button-active': rhsState === RHSStates.FLAG,
                })}
            />
        </OverlayTrigger>
    );
};

export default SavedPostsButton;

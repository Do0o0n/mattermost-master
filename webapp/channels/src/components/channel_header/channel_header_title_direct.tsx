// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {displayUsername, isGuest} from 'mattermost-redux/utils/user_utils';

import GuestTag from 'components/widgets/tag/guest_tag';

type Props = {
    dmUser?: UserProfile;
}

const ChannelHeaderTitleDirect = ({
    dmUser,
}: Props) => {
    const currentUser = useSelector(getCurrentUser);
    const teammateNameDisplaySetting = useSelector(getTeammateNameDisplaySetting);
    const displayName = displayUsername(dmUser, teammateNameDisplaySetting);
    const [word, setWord] = useState('');

    useEffect(() => {
        const dir = document.documentElement.getAttribute('dir');

        setWord(dir === 'rtl' ? '(أنت)' : '(you)');
    }, []);

    return (
        <React.Fragment>
            {currentUser.id !== dmUser?.id && displayName + ' '}
            {currentUser.id === dmUser?.id &&
                <FormattedMessage
                    id='channel_header.directchannel.you'
                    defaultMessage={`${displayName} ${(word)}`}
                    values={{displayName}}
                />}
            {isGuest(dmUser?.roles ?? '') && <GuestTag/>}
        </React.Fragment>
    );
};

export default memo(ChannelHeaderTitleDirect);

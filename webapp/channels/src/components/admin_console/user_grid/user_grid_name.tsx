// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';

import ProfilePicture from 'components/profile_picture';

type Props = {
    user: UserProfile;
}

const UserGridName = ({
    user,
}: Props) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim(); // Trim any extra spaces

    return (
        <div className='UserGrid_nameRow'>
            <ProfilePicture
                src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                status={user.status}
                size='md'
            />

            <div className='UserGrid_name'>
                <span>
                    {fullName || user.username} {/* Display username if fullName is empty */}
                </span>
                <span className='ug-email'>
                    {user.email}
                </span>
            </div>
        </div>
    );
};

export default UserGridName;

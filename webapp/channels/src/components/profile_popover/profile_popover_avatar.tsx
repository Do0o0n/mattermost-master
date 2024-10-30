// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import StatusIcon from 'components/status_icon';
import Avatar from 'components/widgets/users/avatar';

type Props = {
    username?: string;
    hideStatus?: boolean;
    status?: string;
    urlSrc: string;
}

const ProfilePopoverAvatar = ({
    username,
    hideStatus,
    status,
    urlSrc,
}: Props) => {
    const [isZoomed, setIsZoomed] = useState(false); // حالة التكبير

    // دالة لتبديل حالة التكبير عند النقر أو تركيز المؤشر
    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    return (
        <div
            className={`user-popover-image ${isZoomed ? 'zoomed' : ''}`}
            onClick={toggleZoom}
        >
            <Avatar
                id='userAvatar'
                size='xxl'
                username={username}
                url={urlSrc}
                tabIndex={-1}
                className={isZoomed ? 'zoomed' : ''}
            />
            <StatusIcon
                className='status user-popover-status'
                status={hideStatus ? undefined : status}
                button={true}
            />
        </div>
    );
};

export default ProfilePopoverAvatar;

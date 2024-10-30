// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {names} from 'tinycolor2';

type DirectMessagesViewProps = {
    channelIds: string[];
};

const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({channelIds}) => {
    return (
        <div className='DirectMessagesView'>
            <ul>
                {channelIds.map((id) => (
                    <li key={id}>{names}</li> // استبدل هذا بما يلزم لعرض محتوى الرسائل المباشرة
                ))}
            </ul>
        </div>
    );
};

export default DirectMessagesView;

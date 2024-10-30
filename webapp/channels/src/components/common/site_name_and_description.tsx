// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    customDescriptionText?: string;
    siteName: string | undefined;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SiteNameAndDescription = ({customDescriptionText, siteName = 'Sofa'}: Props) => {
    const description = customDescriptionText || (
        <FormattedMessage
            id='web.root.signup_info'
            defaultMessage='All team communication in one place, searchable and accessible anywhere'
        />
    );

    return (
        <>
            <h1 id='site_name'>{'سوفا'}</h1>
            <span
                id='site_description'
                className='color--light'
            >
                {description}
            </span>
        </>
    );
};

export default React.memo(SiteNameAndDescription);

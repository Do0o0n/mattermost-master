// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Link} from 'react-router-dom';

type Props = {

    /**
     * URL to return to
     */
    url: string;

    className?: string;

    /**
     * onClick handler when user clicks back button
     */
    onClick?: React.EventHandler<React.MouseEvent>;
}

const BackButton = ({url, className, onClick}: Props): JSX.Element => {
    const {formatMessage} = useIntl();

    return (

        <div className={classNames('signup-header', className)}>
            <Link
                style={{color: 'white'}}
                data-testid='back_button'
                onClick={onClick}
                to={url}
            >
                <button
                    id='teamNameNextButton'
                    type='submit'
                    className='btn btn-primary mt-8 '
                    onClick={onClick}
                >

                    <span
                        id='back_button_icon'
                        className='fa  fa-angle-left'
                        title={formatMessage({id: 'generic_icons.back', defaultMessage: 'Back Icon'})}
                    />
                    <FormattedMessage
                        id='web.header.back'
                        defaultMessage='Back'
                    />

                </button>
            </Link>
        </div>

    );
};
BackButton.defaultProps = {
    url: '/',
};

export default BackButton;

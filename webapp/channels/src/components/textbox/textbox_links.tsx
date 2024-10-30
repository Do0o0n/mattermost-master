// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MouseEvent, ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    showPreview?: boolean;
    previewMessageLink?: ReactNode;
    // eslint-disable-next-line react/no-unused-prop-types
    hasText?: boolean;
    hasExceededCharacterLimit?: boolean;
    isMarkdownPreviewEnabled: boolean;
    updatePreview?: (showPreview: boolean) => void;
};

function TextboxLinks({
    showPreview,
    previewMessageLink,
    hasExceededCharacterLimit = false,
    isMarkdownPreviewEnabled,
    updatePreview,
}: Props) {
    const togglePreview = (e: MouseEvent) => {
        e.preventDefault();
        updatePreview?.(!showPreview);
    };

    let editHeader;

    let helpTextClass = '';

    if (hasExceededCharacterLimit) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        helpTextClass = 'hidden';
    }

    if (previewMessageLink) {
        editHeader = previewMessageLink;
    } else {
        editHeader = (
            <FormattedMessage
                id='textbox.edit'
                defaultMessage='Edit message'
            />
        );
    }

    let previewLink = null;
    if (isMarkdownPreviewEnabled) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        previewLink = (
            <button
                id='previewLink'
                onClick={togglePreview}
                className='style--none textbox-preview-link color--link'
            >
                {showPreview ? (
                    editHeader
                ) : (
                    <FormattedMessage
                        id='textbox.preview'
                        defaultMessage='Preview'
                    />
                )}
            </button>
        );
    }

    return (

        // <div className={'help__text ' + helpTextClass}>
        //     {helpText}
        //     {previewLink}
        //     <ExternalLink
        //         location='textbox_links'
        //         href={'https://docs.mattermost.com/collaborate/format-messages.html'}
        //         className='textbox-help-link'
        //     >
        //         <FormattedMessage
        //             id='textbox.help'
        //             defaultMessage='Help'
        //         />
        //     </ExternalLink>
        // </div>
        <></>
    );
}

export default TextboxLinks;

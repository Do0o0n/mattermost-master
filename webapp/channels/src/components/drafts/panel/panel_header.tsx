// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import cn from 'classnames';
import React, {useState, useEffect} from 'react';
import type {ComponentProps} from 'react';
import {FormattedMessage} from 'react-intl';

import {SyncIcon} from '@mattermost/compass-icons/components';

import OverlayTrigger from 'components/overlay_trigger';
import Timestamp from 'components/timestamp';
import Tooltip from 'components/tooltip';
import Tag from 'components/widgets/tag/tag';

import Constants from 'utils/constants';

import './panel_header.scss';

const TIMESTAMP_PROPS: Partial<ComponentProps<typeof Timestamp>> = {
    day: 'numeric',
    useSemanticOutput: false,
    useTime: false,
    units: [
        'now',
        'minute',
        'hour',
        'day',
        'week',
        'month',
        'year',
    ],
};

type Props = {
    actions: React.ReactNode;
    hover: boolean;
    timestamp: number;
    remote: boolean;
    title: React.ReactNode;
}

function PanelHeader({
    actions,
    hover,
    timestamp,
    remote,
    title,
}: Props) {
    const [displayText, setDisplayText] = useState<string>('');

    useEffect(() => {
        const updateText = () => {
            const dir = document.documentElement.getAttribute('dir') || 'ltr';
            const newText = dir === 'rtl' ? 'مسوده' : 'DRAFT';
            setDisplayText(newText);
        };

        // تعيين النص عند تحميل المكون
        updateText();

        // إضافة مستمع لتغيير اتجاه النص
        window.addEventListener('directionChange', updateText);

        // إزالة المستمع عند تفكيك المكون
        return () => {
            window.removeEventListener('directionChange', updateText);
        };
    }, []);

    const syncTooltip = (
        <Tooltip id='drafts-sync-tooltip'>
            <FormattedMessage
                id='drafts.info.sync'
                defaultMessage='Updated from another device'
            />
        </Tooltip>
    );

    return (
        <header className='PanelHeader'>
            <div className='PanelHeader__left'>
                {title}
            </div>
            <div className='PanelHeader__right'>
                <div className={cn('PanelHeader__actions', {show: hover})}>
                    {actions}
                </div>
                <div className={cn('PanelHeader__info', {hide: hover})}>
                    {remote && <div className='PanelHeader__sync-icon'>
                        <OverlayTrigger
                            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={syncTooltip}
                        >
                            <SyncIcon size={18}/>
                        </OverlayTrigger>
                    </div>}
                    <div className='PanelHeader__timestamp'>
                        {Boolean(timestamp) && (
                            <Timestamp
                                value={new Date(timestamp)}
                                {...TIMESTAMP_PROPS}
                            />
                        )}
                    </div>
                    <Tag
                        variant={'danger'}
                        uppercase={true}
                        text={displayText}
                    />
                </div>
            </div>
        </header>
    );
}

export default PanelHeader;

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState, useEffect, memo} from 'react'; // أضف useEffect هنا
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {AlertOutlineIcon, AlertCircleOutlineIcon, MessageTextOutlineIcon, BellRingOutlineIcon, CheckCircleOutlineIcon} from '@mattermost/compass-icons/components';
import type {PostPriorityMetadata} from '@mattermost/types/posts';
import {PostPriority} from '@mattermost/types/posts';

import {getPersistentNotificationIntervalMinutes, isPersistentNotificationsEnabled, isPostAcknowledgementsEnabled} from 'mattermost-redux/selectors/entities/posts';

import Menu, {MenuGroup, MenuItem, ToggleItem} from './post_priority_picker_item';

import './post_priority_picker.scss';

type Props = {
    settings?: PostPriorityMetadata;
    onClose: () => void;
    onApply: (props: PostPriorityMetadata) => void;
}

const UrgentIcon = styled(AlertOutlineIcon)`
    fill: rgb(var(--semantic-color-danger));
`;

const ImportantIcon = styled(AlertCircleOutlineIcon)`
    fill: rgb(var(--semantic-color-info));
`;

const StandardIcon = styled(MessageTextOutlineIcon)`
    fill: rgba(var(--center-channel-color-rgb), 0.75);
`;

const PersistentNotificationsIcon = styled(BellRingOutlineIcon)`
    fill: rgba(var(--center-channel-color-rgb), 0.75);
`;

const Header = styled.h4`
    align-items: center;
    display: flex;
    gap: 8px;
    font-family: 'GraphikArabic';
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0;
    line-height: 20px;
    padding: 14px 16px 6px;
    text-align: left;
`;

const Footer = styled.div`
    align-items: center;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    display: flex;
    font-family: Open Sans;
    justify-content: flex-end;
    padding: 16px;
    gap: 8px;
`;
const AcknowledgementIcon = styled(CheckCircleOutlineIcon)`
    fill: rgba(var(--center-channel-color-rgb), 0.75);
`;
const Picker = styled.div`
    *zoom: 1;
    background: var(--center-channel-bg);
    border-radius: 4px;
    border: solid 1px rgba(var(--center-channel-color-rgb), 0.16);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    left: 0;
    margin-right: 3px;
    min-width: 0;
    overflow: hidden;
    user-select: none;
    width: max-content;
`;

function PostPriorityPicker({
    onApply,
    onClose,
    settings,
}: Props) {
    const {formatMessage} = useIntl();
    const [priority, setPriority] = useState<PostPriority|''>(settings?.priority || '');
    const [persistentNotifications, setPersistentNotifications] = useState<boolean>(settings?.persistent_notifications || false);

    const postAcknowledgementsEnabled = useSelector(isPostAcknowledgementsEnabled);
    const persistentNotificationsEnabled = useSelector(isPersistentNotificationsEnabled) && postAcknowledgementsEnabled;
    const interval = useSelector(getPersistentNotificationIntervalMinutes);
    const [requestedAck, setRequestedAck] = useState<boolean>(settings?.requested_ack || true);
    const makeOnSelectPriority = useCallback((type?: PostPriority) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();

        setPriority(type || '');

        if (!postAcknowledgementsEnabled) {
            onApply({
                priority: type || '',
                requested_ack: true, // يتم تعيين requested_ack إلى true دائمًا
                persistent_notifications: false,
            });
            onClose();
        } else if (type !== PostPriority.URGENT) {
            setPersistentNotifications(false);
        }
    }, [onApply, onClose, postAcknowledgementsEnabled]);

    const handlePersistentNotifications = useCallback(() => {
        setPersistentNotifications(!persistentNotifications);
    }, [persistentNotifications]);

    useEffect(() => {
        // إذا لم تكن هناك إعدادات، فقم بتطبيق الإعدادات الافتراضية فورًا
        // eslint-disable-next-line no-negated-condition
        if (!settings) {
            handleApply();
        } else {
            // إذا كانت هناك إعدادات موجودة، فقم بتطبيقها عند فتح المكون لأول مرة
            setPriority(settings.priority || '');
            setPersistentNotifications(settings.persistent_notifications || false);
        }
    }, [settings]); // يستدعي التأثير في كل مرة تتغير فيها الإعدادات
    // eslint-disable-next-line no-trailing-spaces
  
    const handleApply = () => {
        onApply({
            priority,
            requested_ack: true, // يتم تعيين requested_ack إلى true دائمًا
            persistent_notifications: persistentNotifications,
        });
        onClose();
    };
    // eslint-disable-next-line lines-around-comment
    // إضافة useEffect لاستدعاء handleApply عند تشغيل المكون لأول مرة
    useEffect(() => {
        if (!settings) {
            handleApply();
        }
    }, [settings]); // يستدعي التأثير فقط إذا لم تكن هناك إعدادات
    const handleAck = useCallback(() => {
        setRequestedAck(!requestedAck);

        // يتم استدعاء handleApply بعد تغيير قيمة requestedAck
        handleApply();
    }, [requestedAck]);
    return (
        <Picker className='PostPriorityPicker'>
            <Header className='modal-title'>
                {formatMessage({
                    id: 'post_priority.picker.header',
                    defaultMessage: 'Message priority',
                })}
            </Header>
            <div role='application'>
                <Menu className='Menu'>
                    <MenuGroup>
                        <MenuItem
                            id='menu-item-priority-standard'
                            onClick={makeOnSelectPriority()}
                            isSelected={!priority}
                            icon={<StandardIcon size={18}/>}
                            text={formatMessage({
                                id: 'post_priority.priority.standard',
                                defaultMessage: 'Standard',
                            })}
                        />
                        <MenuItem
                            id='menu-item-priority-important'
                            onClick={makeOnSelectPriority(PostPriority.IMPORTANT)}
                            isSelected={priority === PostPriority.IMPORTANT}
                            icon={<ImportantIcon size={18}/>}
                            text={formatMessage({
                                id: 'post_priority.priority.important',
                                defaultMessage: 'Important',
                            })}
                        />
                        <MenuItem
                            id='menu-item-priority-urgent'
                            onClick={makeOnSelectPriority(PostPriority.URGENT)}
                            isSelected={priority === PostPriority.URGENT}
                            icon={<UrgentIcon size={18}/>}
                            text={formatMessage({
                                id: 'post_priority.priority.urgent',
                                defaultMessage: 'Urgent',
                            })}
                        />
                    </MenuGroup>
                    {(postAcknowledgementsEnabled || persistentNotificationsEnabled) && (
                        <MenuGroup>
                            {postAcknowledgementsEnabled && (
                                <ToggleItem
                                    disabled={false}
                                    onClick={handleAck}
                                    toggled={requestedAck}
                                    icon={<AcknowledgementIcon size={18}/>}
                                    text={formatMessage({
                                        id: 'post_priority.requested_ack.text',
                                        defaultMessage: 'Request acknowledgement',
                                    })}
                                    description={formatMessage({
                                        id: 'post_priority.requested_ack.description',
                                        defaultMessage: 'An acknowledgement button will appear with your message',
                                    })}
                                />
                            )}
                            {priority === PostPriority.URGENT && persistentNotificationsEnabled && (
                                <ToggleItem
                                    disabled={priority !== PostPriority.URGENT}
                                    onClick={handlePersistentNotifications}
                                    toggled={persistentNotifications}
                                    icon={<PersistentNotificationsIcon size={18}/>}
                                    text={formatMessage({
                                        id: 'post_priority.persistent_notifications.text',
                                        defaultMessage: 'Send persistent notifications',
                                    })}
                                    description={formatMessage(
                                        {
                                            id: 'post_priority.persistent_notifications.description',
                                            defaultMessage: 'Recipients will be notified every {interval, plural, one {1 minute} other {{interval} minutes}} until they acknowledge or reply',
                                        }, {
                                            interval,
                                        },
                                    )}
                                />
                            )}
                        </MenuGroup>
                    )}
                </Menu>
            </div>
            {postAcknowledgementsEnabled && (
                <Footer>
                    <button
                        type='button'
                        className='PostPriorityPicker__cancel'
                        onClick={onClose}
                    >
                        <FormattedMessage
                            id={'post_priority.picker.cancel'}
                            defaultMessage={'Cancel'}
                        />
                    </button>
                    <button
                        type='button'
                        className='PostPriorityPicker__apply'
                        onClick={handleApply}
                    >
                        <FormattedMessage
                            id={'post_priority.picker.apply'}
                            defaultMessage={'Apply'}
                        />
                    </button>
                </Footer>
            )}
        </Picker>
    );
}

export default memo(PostPriorityPicker);

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    FloatingFocusManager,
    autoUpdate,
    flip,
    offset,
    safePolygon,
    shift,
    useFloating,
    useHover,
    useInteractions,
    useRole,
} from '@floating-ui/react';
import classNames from 'classnames';
import React, {memo, useState, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

// import {CheckCircleOutlineIcon, CheckCircleIcon} from '@mattermost/compass-icons/components';
import type {Post, PostAcknowledgement} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {acknowledgePost} from 'mattermost-redux/actions/posts';

import PostAcknowledgementsUserPopover from './post_acknowledgements_users_popover';

import './post_acknowledgements.scss';

type Props = {
    authorId: UserProfile['id'];
    currentUserId: UserProfile['id'];
    hasReactions: boolean;
    isDeleted: boolean;
    list?: Array<{user: UserProfile; acknowledgedAt: PostAcknowledgement['acknowledged_at']}>;
    postId: Post['id'];
    showDivider?: boolean;
}

function moreThan5minAgo(time: number) {
    const now = new Date().getTime();
    return now - time > 5 * 60 * 1000;
}

function PostAcknowledgements({
    authorId,
    currentUserId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasReactions,
    isDeleted,
    list,
    postId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showDivider = true,
}: Props) {
    let acknowledgedAt = 0;
    const isCurrentAuthor = authorId === currentUserId;
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    if (list && list.length) {
        const ack = list.find((ack) => ack.user.id === currentUserId);
        if (ack) {
            acknowledgedAt = ack.acknowledgedAt;
        }
    }
    const buttonDisabled = (Boolean(acknowledgedAt) && moreThan5minAgo(acknowledgedAt)) || isCurrentAuthor;

    // Automatically acknowledge the post if not already acknowledged
    useEffect(() => {
        if (!buttonDisabled && !acknowledgedAt) {
            dispatch(acknowledgePost(postId));
        }
    }, [acknowledgedAt, buttonDisabled, dispatch, postId]);

    const {x, y, strategy, context, refs: {setReference, setFloating}} = useFloating({
        open,
        onOpenChange: setOpen,
        placement: 'top-start',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({
                fallbackPlacements: ['bottom-start', 'right'],
                padding: 12,
            }),
            shift({
                padding: 12,
            }),
        ],
    });

    const {getReferenceProps, getFloatingProps} = useInteractions([
        useHover(context, {
            enabled: list && list.length > 0,
            mouseOnly: true,
            delay: {
                open: 300,
                close: 0,
            },
            restMs: 100,
            handleClose: safePolygon({
                blockPointerEvents: false,
            }),
        }),
        useRole(context),
    ]);

    if (isDeleted) {
        return null;
    }

    let buttonText: React.ReactNode = (
        <FormattedMessage
            id={'post_priority.button.acknowledge'}
            defaultMessage={'Acknowledge'}
        />
    );

    // Choose the icon based on the list length
    const icon = (list && list.length > 0) ? (
        <svg
            fill='none'
            height='20'
            viewBox='0 0 24 24'
            width='20'
            xmlns='http://www.w3.org/2000/svg'
            style={{margin: '2px'}}
            className='svg1'
        >
            <path
                clipRule='evenodd'
                d='m16.6795 6.26636c.4052.3753.4294 1.00801.0541 1.41318l-9.00624 9.72336c-.73748.7962-1.96723.7962-2.70471 0l-3.75629-4.0554c-.375294-.4052-.351072-1.0379.05411-1.4132.40517-.3753 1.03788-.351 1.41317.0541l3.64136 3.9313 8.8914-9.59923c.3753-.40518 1.008-.4294 1.4131-.05411zm5.0005 0c.4051.3753.4294 1.008.0541 1.41318l-9.0063 9.72336c-.3753.4051-1.008.4294-1.4132.0541s-.4294-1.008-.0541-1.4132l9.0063-9.72333c.3753-.40518 1.008-.4294 1.4132-.05411z'

                fillRule='evenodd'
            />
        </svg>
    ) : (
        <svg
            height='23'
            width='23'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
            fill='#B0B0B0'
            className='svg2'

        >
            <path
                d='M9 16.2l-4.2-4.2c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0L9 14.6l8.9-8.9c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1L10 16.2c-.3.3-.8.3-1.1 0z'

            />
        </svg>

    );

    // Only show the number if more than one person acknowledged, or if the current user is the author
    if (list && list.length > 1) {
        buttonText = list.length;
    } else if (isCurrentAuthor) {
        buttonText = list?.length ? list.length : null;
    }
    // eslint-disable-next-line no-negated-condition
    const textbutton = buttonText !== 1 ? buttonText : null;
    const button = (
        <div className='cardButton'>
            <button
                ref={setReference}
                className={classNames({
                    AcknowledgementButton: true,
                    'AcknowledgementButton--acked': Boolean(acknowledgedAt),
                    'AcknowledgementButton--disabled': buttonDisabled,
                    'AcknowledgementButton--default': !list || list.length === 1,
                })}
                {...getReferenceProps()}
            >
                {icon} {/* Render the selected icon */}
                {textbutton}
            </button>
        </div>
    );

    if (!list || !list.length) {
        return button;
    }

    return (
        <>
            {button}
            {open && (
                <FloatingFocusManager
                    context={context}
                    modal={true}
                >
                    <div
                        ref={setFloating}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            width: 248,
                            zIndex: 999,
                        }}
                        {...getFloatingProps()}
                    >
                        <PostAcknowledgementsUserPopover
                            currentUserId={currentUserId}
                            list={list}
                        />
                    </div>
                </FloatingFocusManager>
            )}
        </>
    );
}

export default memo(PostAcknowledgements);

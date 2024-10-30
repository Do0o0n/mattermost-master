// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import type {MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';

import type {Emoji} from '@mattermost/types/emojis';
import type {Post} from '@mattermost/types/posts';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import {Posts} from 'mattermost-redux/constants/index';
import {
    isMeMessage as checkIsMeMessage,
    isPostPendingOrFailed} from 'mattermost-redux/utils/post_utils';

import {trackEvent} from 'actions/telemetry_actions';

import AutoHeightSwitcher, {AutoHeightSlots} from 'components/common/auto_height_switcher';
import EditPost from 'components/edit_post';
import FileAttachmentListContainer from 'components/file_attachment_list';
import MessageWithAdditionalContent from 'components/message_with_additional_content';
import OverlayTrigger from 'components/overlay_trigger';
import PriorityLabel from 'components/post_priority/post_priority_label';
import PostProfilePicture from 'components/post_profile_picture';
import PostAcknowledgements from 'components/post_view/acknowledgements';
import CommentedOn from 'components/post_view/commented_on/commented_on';
import DateSeparator from 'components/post_view/date_separator';
import FailedPostOptions from 'components/post_view/failed_post_options';
import PostAriaLabelDiv from 'components/post_view/post_aria_label_div';
import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageContainer from 'components/post_view/post_message_view';
import PostPreHeader from 'components/post_view/post_pre_header';
import PostTime from 'components/post_view/post_time';
import ReactionList from 'components/post_view/reaction_list';
import ThreadFooter from 'components/threading/channel_threads/thread_footer';
import type {Props as TimestampProps} from 'components/timestamp/timestamp';
import Tooltip from 'components/tooltip';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import InfoSmallIcon from 'components/widgets/icons/info_small_icon';

import {getHistory} from 'utils/browser_history';
import Constants, {A11yCustomEventTypes, AppEvents, Locations} from 'utils/constants';
import type {A11yFocusEventDetail} from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';
import * as PostUtils from 'utils/post_utils';
import {getDateForUnixTicks, makeIsEligibleForClick} from 'utils/utils';

import type {PostPluginComponent, PluginComponent} from 'types/store/plugins';

import PostOptions from './post_options';
import PostUserProfile from './user_profile';

import './custom.scss';
import {trace} from 'console';

export type Props = {
    post: Post;
    currentTeam?: Team;
    team?: Team;
    currentUserId: string;
    compactDisplay?: boolean;
    colorizeUsernames?: boolean;
    isFlagged: boolean;
    previewCollapsed?: string;
    previewEnabled?: boolean;
    isEmbedVisible?: boolean;
    enableEmojiPicker?: boolean;
    enablePostUsernameOverride?: boolean;
    isReadOnly?: boolean;
    pluginPostTypes?: {[postType: string]: PostPluginComponent};
    channelIsArchived?: boolean;
    isConsecutivePost?: boolean;
    isLastPost?: boolean;
    recentEmojis: Emoji[];
    center: boolean;
    handleCardClick?: (post: Post) => void;
    togglePostMenu?: (opened: boolean) => void;
    channelName?: string;
    displayName: string;
    teamDisplayName?: string;
    teamName?: string;
    channelType?: string;
    a11yIndex?: number;
    isBot: boolean;
    hasReplies: boolean;
    isFirstReply?: boolean;
    previousPostIsComment?: boolean;
    matches?: string[];
    term?: string;
    isMentionSearch?: boolean;
    location: keyof typeof Locations;
    actions: {
        markPostAsUnread: (post: Post, location: string) => void;
        emitShortcutReactToLastPostFrom: (emittedFrom: 'CENTER' | 'RHS_ROOT' | 'NO_WHERE') => void;
        setActionsMenuInitialisationState: (viewed: Record<string, boolean>) => void;
        selectPost: (post: Post) => void;
        selectPostFromRightHandSideSearch: (post: Post) => void;
        removePost: (post: Post) => void;
        closeRightHandSide: () => void;
        selectPostCard: (post: Post) => void;
        setRhsExpanded: (rhsExpanded: boolean) => void;
    };
    timestampProps?: Partial<TimestampProps>;
    shouldHighlight?: boolean;
    isPostBeingEdited?: boolean;
    isCollapsedThreadsEnabled?: boolean;
    isMobileView: boolean;
    canReply?: boolean;
    replyCount?: number;
    isFlaggedPosts?: boolean;
    isPinnedPosts?: boolean;
    clickToReply?: boolean;
    isCommentMention?: boolean;
    parentPost?: Post;
    parentPostUser?: UserProfile | null;
    shortcutReactToLastPostEmittedFrom?: string;
    isPostAcknowledgementsEnabled: boolean;
    isPostPriorityEnabled: boolean;
    isCardOpen?: boolean;
    canDelete?: boolean;
    pluginActions: PluginComponent[];
};

const PostComponent = (props: Props): JSX.Element => {
    const {post, shouldHighlight, togglePostMenu} = props;

    const isSearchResultItem = (props.matches && props.matches.length > 0) || props.isMentionSearch || (props.term && props.term.length > 0);
    const isRHS = props.location === Locations.RHS_ROOT || props.location === Locations.RHS_COMMENT || props.location === Locations.SEARCH;
    const postRef = useRef<HTMLDivElement>(null);
    const postHeaderRef = useRef<HTMLDivElement>(null);
    const teamId = props.team?.id ?? props.currentTeam?.id ?? '';

    const [hover, setHover] = useState(false);

    // const [hovers, setHovers] = useState(true);
    const [a11yActive, setA11y] = useState(false);
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const [fileDropdownOpened, setFileDropdownOpened] = useState(false);
    const [fadeOutHighlight, setFadeOutHighlight] = useState(false);
    const [alt, setAlt] = useState(false);
    const [hasReceivedA11yFocus, setHasReceivedA11yFocus] = useState(false);

    const isSystemMessage = PostUtils.isSystemMessage(post);
    const fromAutoResponder = PostUtils.fromAutoResponder(post);

    useEffect(() => {
        if (shouldHighlight) {
            const timer = setTimeout(() => setFadeOutHighlight(true), Constants.PERMALINK_FADEOUT);
            return () => {
                clearTimeout(timer);
            };
        }
        return undefined;
    }, [shouldHighlight]);

    const handleA11yActivateEvent = () => setA11y(true);
    const handleA11yDeactivateEvent = () => setA11y(false);
    const handleAlt = (e: KeyboardEvent) => setAlt(e.altKey);

    // const handleReplyClick = (post: Post) => {
    //     setReplyingPost(post); // قم بتعيين الرسالة في المخزن المشترك
    // };
    const handleA11yKeyboardFocus = useCallback((e: KeyboardEvent) => {
        if (!hasReceivedA11yFocus && shouldHighlight && isKeyPressed(e, Constants.KeyCodes.TAB) && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();

            setHasReceivedA11yFocus(true);

            document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
                A11yCustomEventTypes.FOCUS, {
                    detail: {
                        target: postRef.current,
                        keyboardOnly: true,
                    },
                },
            ));
        }
    }, [hasReceivedA11yFocus, shouldHighlight]);

    useEffect(() => {
        if (a11yActive) {
            postRef.current?.dispatchEvent(new Event(A11yCustomEventTypes.UPDATE));
        }
    }, [a11yActive]);

    useEffect(() => {
        let removeEventListener: (type: string, listener: EventListener) => void;

        if (postRef.current) {
            postRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, handleA11yActivateEvent);
            postRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, handleA11yDeactivateEvent);
            removeEventListener = postRef.current.removeEventListener;
        }

        return () => {
            if (removeEventListener) {
                removeEventListener(A11yCustomEventTypes.ACTIVATE, handleA11yActivateEvent);
                removeEventListener(A11yCustomEventTypes.DEACTIVATE, handleA11yDeactivateEvent);
            }
        };
    }, []);

    useEffect(() => {
        if (hover) {
            document.addEventListener('keydown', handleAlt);
            document.addEventListener('keyup', handleAlt);
        }

        return () => {
            document.removeEventListener('keydown', handleAlt);
            document.removeEventListener('keyup', handleAlt);
        };
    }, [hover]);

    useEffect(() => {
        document.addEventListener('keyup', handleA11yKeyboardFocus);

        return () => {
            document.removeEventListener('keyup', handleA11yKeyboardFocus);
        };
    }, [handleA11yKeyboardFocus]);

    const hasSameRoot = (props: Props) => {
        if (props.isFirstReply) {
            return false;
        } else if (!post.root_id && !props.previousPostIsComment && props.isConsecutivePost) {
            return true;
        } else if (post.root_id) {
            return true;
        }
        return false;
    };

    const getChannelName = () => {
        let name: React.ReactNode = props.channelName;

        const isDirectMessage = props.channelType === Constants.DM_CHANNEL;
        const isPartOfThread = props.isCollapsedThreadsEnabled && (post.reply_count > 0 || post.is_following);

        if (isDirectMessage && isPartOfThread) {
            name = (
                <FormattedMessage
                    id='search_item.thread_direct'
                    defaultMessage='Thread in Direct Message (with {username})'
                    values={{
                        username: props.displayName,
                    }}
                />
            );
        } else if (isPartOfThread) {
            name = (
                <FormattedMessage
                    id='search_item.thread'
                    defaultMessage='Thread in {channel}'
                    values={{
                        channel: props.channelName,
                    }}
                />
            );
        } else if (isDirectMessage) {
            name = (
                <FormattedMessage
                    id='search_item.direct'
                    defaultMessage='Direct Message (with {username})'
                    values={{
                        username: props.displayName,
                    }}
                />
            );
        }

        return name;
    };

    const getPostHeaderVisible = (): boolean | null => {
        const boundingRectOfPostInfo: DOMRect | undefined = postHeaderRef.current?.getBoundingClientRect();

        let isPostHeaderVisibleToUser: boolean | null = null;
        if (boundingRectOfPostInfo) {
            isPostHeaderVisibleToUser = (boundingRectOfPostInfo.top - 65) > 0 &&
                boundingRectOfPostInfo.bottom < (window.innerHeight - 85);
        }

        return isPostHeaderVisibleToUser;
    };

    const getClassName = () => {
        const isMeMessage = checkIsMeMessage(post);
        const hovered =
            hover || fileDropdownOpened || dropdownOpened || a11yActive || props.isPostBeingEdited;
        return classNames('a11y__section post', {
            'post--highlight': shouldHighlight && !fadeOutHighlight,
            'same--root': hasSameRoot(props),
            'other--root': !hasSameRoot(props) && !isSystemMessage,
            'post--bot': PostUtils.isFromBot(post),
            'post--editing': props.isPostBeingEdited,
            'current--user': props.currentUserId === post.user_id && !isSystemMessage,
            'post--system': isSystemMessage || isMeMessage,
            'post--root': props.hasReplies && !(post.root_id && post.root_id.length > 0),
            'post--comment': (post.root_id && post.root_id.length > 0 && !props.isCollapsedThreadsEnabled) || (props.location === Locations.RHS_COMMENT),
            'post--compact': props.compactDisplay,
            'post--hovered': hovered,
            'same--user': props.isConsecutivePost && (!props.compactDisplay || props.location === Locations.RHS_COMMENT),
            'cursor--pointer': alt && !props.channelIsArchived,
            'post--hide-controls': post.failed || post.state === Posts.POST_DELETED,
            'post--comment same--root': fromAutoResponder,
            'post--pinned-or-flagged': (post.is_pinned || props.isFlagged) && props.location === Locations.CENTER,
            'mention-comment': props.isCommentMention,
            'post--thread': isRHS,
        });
    };

    const handleFileDropdownOpened = useCallback((open: boolean) => setFileDropdownOpened(open), []);

    const handleDropdownOpened = useCallback((opened: boolean) => {
        if (togglePostMenu) {
            togglePostMenu(opened);
        }
        setDropdownOpened(opened);
    }, [togglePostMenu]);

    const handleMouseOver = useCallback((e: MouseEvent<HTMLDivElement>) => {
        setHover(true);
        setAlt(e.altKey);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHover(false);
        setAlt(false);
    }, []);

    const handleCardClick = (post?: Post) => {
        if (!post) {
            return;
        }
        if (props.handleCardClick) {
            props.handleCardClick(post);
        }
        props.actions.selectPostCard(post);
    };

    // When adding clickable targets within a root post to exclude from post's on click to open thread,
    // please add to/maintain the selector below
    const isEligibleForClick = useMemo(() => makeIsEligibleForClick('.post-image__column, .embed-responsive-item, .attachment, .hljs, code'), []);

    const handlePostClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!post || props.channelIsArchived) {
            return;
        }

        if (
            !e.altKey &&
            props.clickToReply &&
            (fromAutoResponder || !isSystemMessage) &&
            isEligibleForClick(e) &&
            props.location === Locations.CENTER &&
            !props.isPostBeingEdited
        ) {
            trackEvent('crt', 'clicked_to_reply');
            props.actions.selectPost(post);
        }

        if (e.altKey) {
            props.actions.markPostAsUnread(post, props.location);
        }
    }, [
        post,
        fromAutoResponder,
        isEligibleForClick,
        isSystemMessage,
        props.channelIsArchived,
        props.clickToReply,
        props.actions,
        props.location,
        props.isPostBeingEdited,
    ]);

    const handleJumpClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (props.isMobileView) {
            props.actions.closeRightHandSide();
        }

        props.actions.setRhsExpanded(false);
        getHistory().push(`/${props.teamName}/pl/${post.id}`);
    }, [props.isMobileView, props.actions, props.teamName, post?.id]);

    const handleCommentClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();

        if (!post) {
            return;
        }
        props.actions.selectPostFromRightHandSideSearch(post);
    }, [post, props.actions, props.actions.selectPostFromRightHandSideSearch]);

    const handleThreadClick = useCallback((e: React.MouseEvent) => {
        if (props.currentTeam?.id === teamId) {
            handleCommentClick(e);
        } else {
            handleJumpClick(e);
        }
    }, [handleCommentClick, handleJumpClick, props.currentTeam?.id, teamId]);

    const postClass = classNames('post__body', {'post--edited': PostUtils.isEdited(post), 'search-item-snippet': isSearchResultItem});

    let comment;
    if (props.isFirstReply && props.parentPost && props.parentPostUser && post.type !== Constants.PostTypes.EPHEMERAL) {
        comment = (
            <CommentedOn
                post={props.parentPost}
                parentPostUser={props.parentPostUser}
                onCommentClick={handleCommentClick}
            />
        );
    }

    let visibleMessage = null;
    if (post.type === Constants.PostTypes.EPHEMERAL && !props.compactDisplay && post.state !== Posts.POST_DELETED) {
        visibleMessage = (
            <span className='post__visibility'>
                <FormattedMessage
                    id='post_info.message.visible'
                    defaultMessage='(Only visible to you)'
                />
            </span>
        );
    }

    let profilePic;
    const hideProfilePicture = hasSameRoot(props) && (!post.root_id && !props.hasReplies) && !PostUtils.isFromBot(post);
    const hideProfileCase = !(props.location === Locations.RHS_COMMENT && props.compactDisplay && props.isConsecutivePost);
    if (!hideProfilePicture && hideProfileCase) {
        profilePic = (
            <PostProfilePicture
                compactDisplay={props.compactDisplay}
                post={post}
                userId={post.user_id}
            />
        );

        if (fromAutoResponder) {
            profilePic = (
                <span className='auto-responder'>
                    {profilePic}
                </span>
            );
        }
    }

    const messageContent = post.message === 'BUZZMESSAGE' ? (
        <p
            style={{color: '#d24b4e',
                fontFamily: 'Graphik Arabic',
                fontWeight: '600'}}
        >
            <svg
                version='1.0'
                xmlns='http://www.w3.org/2000/svg'
                width='68.000000pt'
                height='68.000000pt'
                viewBox='0 0 512.000000 512.000000'
                preserveAspectRatio='xMidYMid meet'
            >

                <g
                    transform='translate(0.000000,512.000000) scale(0.100000,-0.100000)'
                    fill='red'
                    stroke='#f1f9f8'
                >
                    <path

                        d='M2296 4649 c-33 -11 -61 -21 -64 -23 -2 -3 47 -147 109 -320 62 -174
114 -314 116 -313 2 2 -13 150 -32 328 -19 178 -35 330 -35 337 0 16 -23 14
-94 -9z'
                    />
                    <path

                        d='M1724 4495 c73 -272 99 -432 100 -610 1 -173 -14 -242 -67 -302 -107
-122 -321 -103 -652 57 -66 32 -160 84 -209 115 -49 30 -83 47 -75 38 7 -10
30 -38 50 -63 57 -70 166 -234 198 -299 l30 -58 -117 -6 c-64 -3 -180 -17
-257 -31 -182 -34 -185 -37 -209 -197 -36 -239 -117 -754 -120 -765 -4 -10
-113 -42 -291 -83 l-80 -19 173 -1 c169 -1 172 -1 172 -22 0 -28 -43 -221 -82
-371 -19 -73 -28 -127 -24 -144 4 -14 29 -47 55 -74 43 -43 55 -49 106 -55 91
-12 311 1 398 23 42 10 77 16 77 12 0 -14 -212 -210 -299 -277 -47 -37 -90
-70 -95 -74 -5 -5 20 1 55 12 228 70 531 97 716 65 114 -20 235 -63 305 -109
150 -100 247 -348 286 -732 l7 -70 19 50 c35 94 124 270 176 350 74 113 198
233 283 275 84 41 184 51 268 27 171 -51 381 -255 557 -544 53 -86 57 -91 63
-65 4 15 7 46 8 69 2 64 37 259 66 358 14 50 48 136 76 193 58 119 132 202
219 248 50 27 64 29 155 29 86 -1 113 -6 195 -33 181 -62 433 -196 670 -356
58 -39 109 -73 115 -75 5 -2 -19 27 -54 65 -132 144 -296 358 -380 496 l-22
37 38 20 c84 43 156 146 169 243 5 39 -8 97 -40 169 -6 13 7 20 64 38 138 44
362 80 512 82 73 1 62 5 -97 35 -148 27 -415 109 -415 128 0 9 143 418 197
564 l57 153 101 64 c95 62 118 83 55 50 -15 -8 -51 -24 -79 -35 l-51 -20 21
53 c38 93 41 107 34 135 -3 15 -29 48 -56 75 -44 41 -55 47 -93 47 -44 0 -375
-45 -408 -56 -27 -8 -56 -51 -63 -94 -4 -22 -8 -40 -10 -40 -2 0 -27 25 -56
55 l-52 55 -63 0 c-37 0 -64 4 -64 10 0 19 57 124 120 220 95 145 244 331 379
474 65 68 56 65 -54 -20 -212 -163 -436 -293 -547 -316 -49 -10 -59 -9 -89 8
-79 46 -120 187 -122 416 -1 81 -5 144 -8 140 -3 -4 -39 -52 -79 -107 -106
-144 -250 -284 -333 -325 -115 -57 -191 -30 -236 84 -44 110 -73 281 -87 496
l-7 115 -28 -110 c-75 -300 -197 -513 -330 -581 -65 -32 -152 -33 -231 0 -176
72 -367 280 -561 611 -32 55 -56 91 -53 80z m2976 -1221 c0 -4 -33 -90 -74
-193 -41 -102 -120 -319 -176 -481 -55 -162 -106 -309 -112 -326 l-11 -32
-114 -7 c-63 -4 -116 -5 -118 -3 -2 2 18 91 44 198 27 107 81 328 121 490 40
162 76 299 81 305 5 5 78 19 162 31 168 24 197 27 197 18z m-3470 -28 c68 -25
118 -64 148 -115 24 -42 27 -55 27 -147 0 -96 -1 -103 -39 -180 -44 -89 -126
-178 -195 -213 l-43 -22 42 -36 c119 -102 153 -282 80 -429 -76 -154 -298
-291 -553 -339 -85 -16 -322 -21 -331 -6 -3 4 5 48 18 97 74 278 156 733 232
1279 11 81 10 80 151 103 184 31 177 30 303 27 77 -1 130 -8 160 -19z m616
-23 c-3 -10 -46 -216 -96 -458 -50 -242 -100 -479 -111 -527 -35 -158 -22
-228 42 -228 35 0 72 42 93 107 17 52 111 516 176 873 23 123 43 227 46 229 7
8 294 24 301 18 14 -15 -191 -1051 -232 -1170 -73 -213 -260 -348 -481 -347
-112 1 -204 47 -249 124 -34 60 -37 102 -20 238 30 231 185 1111 198 1124 5 5
241 31 300 33 32 1 38 -2 33 -16z m1340 -40 c-2 -10 -14 -73 -27 -141 l-22
-122 -278 -397 c-154 -218 -278 -397 -276 -399 1 -1 72 1 157 6 85 5 174 9
198 10 l42 0 0 -153 0 -154 -182 -6 c-193 -7 -537 -32 -625 -46 l-53 -8 0 152
0 152 285 387 c157 213 285 389 285 391 0 11 -112 4 -240 -14 -74 -11 -136
-19 -137 -18 -3 4 38 311 43 316 2 3 150 15 327 27 177 13 342 24 367 27 117
10 142 8 136 -10z m884 5 c0 -7 -11 -71 -25 -141 l-25 -129 -270 -384 c-149
-212 -274 -392 -277 -401 -5 -13 1 -14 43 -9 27 3 118 8 202 12 l153 6 -3
-153 -3 -154 -160 -7 c-285 -12 -642 -40 -687 -54 -17 -5 -18 6 -18 148 l1
153 288 390 289 390 -52 3 c-28 1 -112 -6 -186 -17 -74 -10 -137 -17 -139 -15
-2 2 4 73 14 159 l19 155 30 5 c36 5 688 52 759 54 32 1 47 -3 47 -11z m137
-1103 c90 -27 153 -123 134 -205 -11 -50 -25 -72 -70 -113 -47 -42 -93 -57
-182 -57 -80 0 -122 24 -159 90 -61 110 -6 256 108 290 44 13 115 11 169 -5z'
                    />
                    <path

                        d='M890 2865 c-12 -63 -20 -119 -16 -122 10 -10 146 36 189 63 98 64 48
150 -99 169 l-51 6 -23 -116z'
                    />
                    <path

                        d='M820 2475 c0 -6 -48 -260 -56 -293 -5 -24 -4 -24 48 -17 148 21 238
91 238 187 0 46 -24 76 -84 104 -45 21 -146 34 -146 19z'
                    />
                    <path

                        d='M4019 4149 c-217 -321 -206 -305 -188 -294 23 14 508 395 513 404 3
4 -28 43 -68 86 l-72 79 -185 -275z'
                    />
                    <path

                        d='M1165 4270 c-49 -38 -91 -73 -92 -77 -2 -5 76 -87 173 -183 97 -96
174 -167 170 -157 -3 10 -40 123 -82 252 -41 129 -76 235 -77 235 -1 0 -42
-32 -92 -70z'
                    />
                    <path

                        d='M3750 1156 c0 -5 338 -605 346 -615 5 -5 194 150 194 159 0 4 -121
110 -270 234 -148 125 -270 224 -270 222z'
                    />
                    <path

                        d='M1058 952 c-163 -87 -300 -160 -303 -163 -5 -6 151 -191 166 -197 4
-2 107 114 228 257 122 144 218 261 214 261 -5 0 -142 -71 -305 -158z'
                    />
                    <path

                        d='M2480 754 c0 -94 2 -173 5 -176 7 -6 118 12 128 21 7 7 -106 296
-124 316 -5 5 -9 -66 -9 -161z'
                    />
                </g>
            </svg>
        </p>
    ) : (
        <MessageWithAdditionalContent
            post={post}
            isEmbedVisible={props.isEmbedVisible}
            pluginPostTypes={props.pluginPostTypes}
            isRHS={isRHS}
            compactDisplay={props.compactDisplay}
        />
    );

    const message = isSearchResultItem ? (
        <PostBodyAdditionalContent
            post={post}
            options={{
                searchTerm: props.term,
                searchMatches: props.matches,
            }}
        >
            <PostMessageContainer
                post={post}
                options={{
                    searchTerm: props.term,
                    searchMatches: props.matches,
                    mentionHighlight: props.isMentionSearch,
                }}
                isRHS={isRHS}
            />
        </PostBodyAdditionalContent>
    ) : messageContent;

    const showSlot = props.isPostBeingEdited ? AutoHeightSlots.SLOT2 : AutoHeightSlots.SLOT1;
    const threadFooter = props.location !== Locations.RHS_ROOT && props.isCollapsedThreadsEnabled && !post.root_id && (props.hasReplies || post.is_following) ? (
        <ThreadFooter
            threadId={post.id}
            replyClick={handleThreadClick}
        />
    ) : null;
    const currentPostDay = getDateForUnixTicks(post.create_at);
    const channelDisplayName = getChannelName();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const showReactions = props.location !== Locations.SEARCH || props.isPinnedPosts || props.isFlaggedPosts;

    const getTestId = () => {
        let idPrefix: string;
        switch (props.location) {
        case 'CENTER':
            idPrefix = 'post';
            break;
        case 'RHS_ROOT':
        case 'RHS_COMMENT':
            idPrefix = 'rhsPost';
            break;
        case 'SEARCH':
            idPrefix = 'searchResult';
            break;

        default:
            idPrefix = 'post';
        }

        return idPrefix + `_${post.id}`;
    };

    let priority;
    if (post.metadata?.priority && props.isPostPriorityEnabled) {
        priority = <span className='d-flex mr-2 ml-1'><PriorityLabel priority={post.metadata.priority.priority}/></span>;
    }

    let postAriaLabelDivTestId = '';
    if (props.location === Locations.CENTER) {
        postAriaLabelDivTestId = 'postView';
    } else if (props.location === Locations.RHS_ROOT || props.location === Locations.RHS_COMMENT) {
        postAriaLabelDivTestId = 'rhsPostView';
    }

    return (
        <>
            {(isSearchResultItem || (props.location !== Locations.CENTER && (props.isPinnedPosts || props.isFlaggedPosts))) && <DateSeparator date={currentPostDay}/>}
            <PostAriaLabelDiv
                ref={postRef}
                id={getTestId()}
                data-testid={postAriaLabelDivTestId}
                tabIndex={0}
                post={post}
                className={getClassName()}
                onClick={handlePostClick}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
            >
                {(Boolean(isSearchResultItem) || (props.location !== Locations.CENTER && props.isFlagged)) &&
                    <div
                        className='search-channel__name__container'
                        aria-hidden='true'
                    >
                        {(Boolean(isSearchResultItem) || props.isFlaggedPosts) &&
                        <span className='search-channel__name'>
                            {channelDisplayName}
                        </span>
                        }
                        {props.channelIsArchived &&
                        <span className='search-channel__archived'>
                            <ArchiveIcon className='icon icon__archive channel-header-archived-icon svg-text-color'/>
                            <FormattedMessage
                                id='search_item.channelArchived'
                                defaultMessage='Archived'
                            />
                        </span>
                        }
                        {(Boolean(isSearchResultItem) || props.isFlaggedPosts) && Boolean(props.teamDisplayName) &&
                        <span className='search-team__name'>
                            {props.teamDisplayName}
                        </span>
                        }
                    </div>
                }
                <PostPreHeader
                    isFlagged={props.isFlagged}
                    isPinned={post.is_pinned}
                    skipPinned={props.location === Locations.SEARCH && props.isPinnedPosts}
                    skipFlagged={props.location === Locations.SEARCH && props.isFlaggedPosts}
                    channelId={post.channel_id}
                />
                <div
                    role='application'
                    className={`post__content ${props.center ? 'center' : ''} ${
                        props.currentUserId === post.user_id ? 'post--left' : 'post--right'
                    }`}
                    data-testid='postContent'
                >
                    <div className='post__img'>{profilePic}</div>
                    <div >
                        <div
                            className='post__header'
                            ref={postHeaderRef}
                        >
                            <PostUserProfile
                                {...props}
                                isSystemMessage={isSystemMessage}
                            />
                            <div className='col d-flex align-items-center'>
                                {((!hideProfilePicture &&
                                    props.location === Locations.CENTER) ||
                                    hover ||
                                    props.location !== Locations.CENTER) && (
                                    <PostTime
                                        isPermalink={
                                            !(
                                                Posts.POST_DELETED ===
                                                    post.state ||
                                                isPostPendingOrFailed(post)
                                            )
                                        }
                                        teamName={props.team?.name}
                                        eventTime={post.create_at}
                                        postId={post.id}
                                        location={props.location}
                                        timestampProps={{
                                            ...props.timestampProps,
                                            style:
                                                props.isConsecutivePost &&
                                                !props.compactDisplay ? 'narrow' : undefined,
                                        }}
                                    />
                                )}
                                {priority}
                                {post.props && post.props.card && (
                                    <OverlayTrigger
                                        delayShow={Constants.OVERLAY_TIME_DELAY}
                                        placement='top'
                                        overlay={
                                            <Tooltip>
                                                <FormattedMessage
                                                    id='post_info.info.view_additional_info'
                                                    defaultMessage='View additional info'
                                                />
                                            </Tooltip>
                                        }
                                    >
                                        <button
                                            className={
                                                'card-icon__container icon--show style--none ' +
                                                (props.isCardOpen ? 'active' : '')
                                            }
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleCardClick(post);
                                            }}
                                        >
                                            <InfoSmallIcon
                                                className='icon icon__info'
                                                aria-hidden='true'
                                            />
                                        </button>
                                    </OverlayTrigger>
                                )}
                                {visibleMessage}
                            </div>
                            {!props.isPostBeingEdited && (
                                <PostOptions
                                    {...props}
                                    teamId={teamId}
                                    handleDropdownOpened={handleDropdownOpened}
                                    handleCommentClick={handleCommentClick}
                                    hover={hover || a11yActive}
                                    removePost={props.actions.removePost}
                                    handleJumpClick={handleJumpClick}
                                    isPostHeaderVisible={getPostHeaderVisible()}
                                />
                            )}
                        </div>
                        {comment}
                        <div
                            className={postClass}
                            id={isRHS ? undefined : `${post.id}_message`}
                        >
                            {post.failed && <FailedPostOptions post={post}/>}
                            <AutoHeightSwitcher
                                showSlot={showSlot}
                                shouldScrollIntoView={props.isPostBeingEdited}
                                slot1={
                                    <div
                                        className={`${
                                            // eslint-disable-next-line no-nested-ternary
                                            post.message === 'BUZZMESSAGE' ? 'post--right1' :
                                            // eslint-disable-next-line no-nested-ternary
                                                props.currentUserId === post.user_id ? post.file_ids && post.file_ids.length > 0 ? '' : 'post--left1' : 'post--right1'
                                        }`}
                                        style={{
                                            display: 'inline-flex', alignItems: 'end'}}
                                    >
                                        <div style={{display: 'inline'}} >
                                            {message}
                                        </div>

                                        <div
                                            className={`${
                                                props.currentUserId === post.user_id ? 'post--requested_ack' : 'post--requested_ack1'
                                            }`}
                                        >
                                            {props.isPostAcknowledgementsEnabled &&
                                              post.message !== 'BUZZMESSAGE' &&
                                          post.metadata?.priority?.requested_ack && (
                                            // eslint-disable-next-line @typescript-eslint/indent
                                          <PostAcknowledgements
                                                    // eslint-disable-next-line react/jsx-indent-props
                                                    authorId={post.user_id}
                                                    // eslint-disable-next-line react/jsx-indent-props
                                                    isDeleted={post.state === Posts.POST_DELETED}
                                                    // eslint-disable-next-line react/jsx-indent-props
                                                    postId={post.id}
                                                // eslint-disable-next-line react/jsx-closing-bracket-location
                                                />
                                            )}

                                        </div>
                                    </div>
                                }
                                slot2={<EditPost/>}
                                onTransitionEnd={() =>
                                    document.dispatchEvent(
                                        new Event(AppEvents.FOCUS_EDIT_TEXTBOX),
                                    )
                                }
                            />
                            {post.file_ids && post.file_ids.length > 0 && (
                                <FileAttachmentListContainer
                                    post={post}
                                    compactDisplay={props.compactDisplay}
                                    handleFileDropdownOpened={
                                        handleFileDropdownOpened
                                    }
                                />
                            )}
                        </div>
                        {/* {!props.isPostBeingEdited && (
                            <a onClick={() => handleReplyClick(post)}>
                                <i className='icon-reply-outline'/>
                            </a>
                        )} */}
                        <div >
                            {/* {props.isPostAcknowledgementsEnabled &&
                                post.metadata?.priority?.requested_ack && (
                                <PostAcknowledgements
                                    authorId={post.user_id}
                                    isDeleted={
                                        post.state === Posts.POST_DELETED
                                    }
                                    postId={post.id}
                                />
                            )} */}
                            {showReactions && <ReactionList post={post}/>}
                        </div>
                        {threadFooter}
                    </div>
                </div>
            </PostAriaLabelDiv>
        </>
    );
};

export default PostComponent;

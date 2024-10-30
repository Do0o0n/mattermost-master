// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {memo} from 'react';
import {useIntl} from 'react-intl';

import {EyeOutlineIcon} from '@mattermost/compass-icons/components';

import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';

import {IconContainer} from '../formatting_bar/formatting_icon';

interface ShowFormatProps {
    onClick: (event: React.MouseEvent) => void;
    active: boolean;
}

const ShowFormatting = (props: ShowFormatProps): JSX.Element => {
    const {formatMessage} = useIntl();
    const {onClick, active} = props;
    const buttonAriaLabel = formatMessage({id: 'accessibility.button.preview', defaultMessage: 'preview'});
    const iconAriaLabel = formatMessage({id: 'generic_icons.preview', defaultMessage: 'Eye Icon'});

    const tooltip = (
        <Tooltip id='PreviewInputTextButtonTooltip'>
            <KeyboardShortcutSequence
                shortcut={KEYBOARD_SHORTCUTS.msgMarkdownPreview}
                hoistDescription={true}
                isInsideTooltip={true}
            />
        </Tooltip>
    );

    return (
        <div

        >
            <IconContainer
                type='button'
                id='PreviewInputTextButton'
                onClick={onClick}
                aria-label={buttonAriaLabel}
                className={classNames({active})}
            >
                <svg
                    version='1.0'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 1200.000000 1200.000000'
                    preserveAspectRatio='xMidYMid meet'
                    aria-label={iconAriaLabel}
                    width={'20'}
                    height={'20'}
                >

                    <g
                        transform='translate(0.000000,1200.000000) scale(0.100000,-0.100000)'
                        fill={'currentColor'}
                        stroke='none'
                    >
                        <path
                            d='M5815 11494 c-16 -2 -73 -9 -125 -15 -623 -71 -1231 -409 -1634 -909
-249 -309 -431 -694 -505 -1070 -43 -220 -44 -240 -48 -877 l-4 -621 -327 -4
c-313 -4 -331 -5 -423 -30 -177 -48 -325 -133 -454 -263 -129 -129 -214 -275
-264 -454 l-26 -96 0 -2655 0 -2655 26 -96 c50 -179 135 -325 264 -454 152
-153 325 -242 540 -280 77 -13 455 -15 3165 -15 2710 0 3088 2 3165 15 406 71
717 366 811 770 18 77 19 178 19 2715 0 2537 -1 2638 -19 2715 -94 404 -405
699 -811 770 -65 11 -163 15 -376 15 l-288 0 -4 623 c-3 507 -7 640 -20 722
-66 416 -204 765 -428 1085 -394 563 -996 937 -1674 1041 -123 19 -483 34
-560 23z m388 -959 c620 -82 1126 -526 1293 -1132 48 -177 54 -264 54 -855 l0
-548 -1550 0 -1550 0 0 548 c0 418 4 572 15 655 49 373 229 709 513 960 239
210 533 338 877 380 74 9 249 5 348 -8z m32 -5064 c375 -94 653 -377 741 -756
14 -57 19 -118 19 -215 0 -150 -17 -243 -67 -369 -214 -541 -853 -786 -1371
-525 -108 54 -175 103 -262 189 -130 128 -215 276 -263 454 -22 84 -25 116
-25 251 0 135 3 167 25 251 48 178 133 326 263 454 153 153 319 239 539 281
97 19 297 11 401 -15z'
                        />
                    </g>
                </svg>
            </IconContainer>
        </div>
    );
};

export default memo(ShowFormatting);

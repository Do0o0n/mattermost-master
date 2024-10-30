// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import MuiMenuItem from '@mui/material/MenuItem';
import type {MenuItemProps as MuiMenuItemProps} from '@mui/material/MenuItem';
import {styled} from '@mui/material/styles';
import cloneDeep from 'lodash/cloneDeep';
import React, {Children, useContext, useEffect, useRef} from 'react';
import type {ReactElement, ReactNode, KeyboardEvent, MouseEvent, AriaRole} from 'react';
import {useSelector} from 'react-redux';

import {getIsMobileView} from 'selectors/views/browser';

import Constants, {EventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';

import {MenuContext, SubMenuContext} from './menu_context';

export interface Props extends MuiMenuItemProps {
    leadingElement?: ReactNode;
    labels: ReactElement;
    isLabelsRowLayout?: boolean;
    trailingElements?: ReactNode;
    isDestructive?: boolean;
    onClick?: (event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) => void;
    role?: AriaRole;
    children?: ReactNode;
}

export function MenuItem(props: Props) {
    const {
        leadingElement,
        labels,
        trailingElements,
        isDestructive,
        isLabelsRowLayout,
        children,
        onClick,
        role = 'menuitem',
        ...otherProps
    } = props;

    const menuContext = useContext(MenuContext);
    const subMenuContext = useContext(SubMenuContext);
    const isMobileView = useSelector(getIsMobileView);
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

    const trailingElementsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const checkSvgSize = () => {
            if (trailingElementsRef.current) {
                const svgElements = trailingElementsRef.current.querySelectorAll('svg');
                svgElements.forEach((svg) => {
                    if (svg.clientWidth > 17) {
                        svg.parentElement?.classList.add('large-svg');
                    } else {
                        svg.parentElement?.classList.remove('large-svg');
                    }
                });
            }
        };

        checkSvgSize();
        window.addEventListener('resize', checkSvgSize);
        return () => window.removeEventListener('resize', checkSvgSize);
    }, [trailingElements]);

    function handleClick(event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) {
        if (isCorrectKeyPressedOnMenuItem(event)) {
            if (isRoleCheckboxOrRadio(role)) {
                event.stopPropagation();
            } else {
                if (subMenuContext.close) {
                    subMenuContext.close();
                }
                if (menuContext.close) {
                    menuContext.close();
                }
            }

            if (onClick) {
                if (isMobileView || isRoleCheckboxOrRadio(role)) {
                    onClick(event);
                } else {
                    const clonedEvent = cloneDeep(event);
                    menuContext.addOnClosedListener(() => {
                        onClick(clonedEvent);
                    });
                }
            }
        }
    }

    const hasSecondaryLabel = labels && labels.props && labels.props.children && Children.count(labels.props.children) === 2;

    return (
        <MenuItemStyled
            disableRipple={true}
            disableTouchRipple={true}
            isDestructive={isDestructive}
            hasSecondaryLabel={hasSecondaryLabel}
            isLabelsRowLayout={isLabelsRowLayout}
            onClick={handleClick}
            onKeyDown={handleClick}
            role={role}
            isRTL={isRTL}
            {...otherProps}
        >
            {leadingElement && <div className='leading-element'>{leadingElement}</div>}
            <div className='label-elements'>{labels}</div>
            <div
                className='trailing-elements'
                ref={trailingElementsRef}
            >
                {trailingElements}
            </div>
            {children}
        </MenuItemStyled>
    );
}

interface MenuItemStyledProps extends MuiMenuItemProps {
    isDestructive?: boolean;
    hasSecondaryLabel?: boolean;
    isLabelsRowLayout?: boolean;
    isRTL?: boolean;
}

export const MenuItemStyled = styled(MuiMenuItem, {
    shouldForwardProp: (prop) => prop !== 'isDestructive' &&
        prop !== 'hasSecondaryLabel' && prop !== 'isLabelsRowLayout' && prop !== 'isRTL',
})<MenuItemStyledProps>(
    ({isDestructive = false, hasSecondaryLabel = false, isLabelsRowLayout = false, isRTL = false}) => {
        const hasOnlyPrimaryLabel = !hasSecondaryLabel;
        const isRegular = !isDestructive;

        return ({
            '&.MuiMenuItem-root': {
                fontFamily: 'GraphikArabic',
                color: isRegular ? 'var(--center-channel-color)' : 'var(--error-text)',
                padding: '6px 20px',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: hasOnlyPrimaryLabel || isLabelsRowLayout ? 'center' : 'flex-start',
                minHeight: '36px',
                maxHeight: '56px',

                '&.Mui-active, &[aria-expanded="true"]': {
                    'background-color': isRegular ? 'rgba(var(--button-bg-rgb), 0.08)' : 'background-color: rgba(var(--error-text-color-rgb), 0.16)',
                },

                '&:hover': {
                    backgroundColor: isRegular ? 'rgba(var(--center-channel-color-rgb), 0.06)' : 'var(--error-text)',
                    color: isDestructive && 'var(--button-color)',
                },

                '&.Mui-disabled': {
                    color: 'rgba(var(--center-channel-color-rgb), 0.32)',
                },

                '&.Mui-focusVisible': {
                    boxShadow: isRegular ? '0 0 0 2px var(--sidebar-text-active-border) inset' : '0 0 0 2px rgba(var(--button-color-rgb), 0.16) inset',
                    backgroundColor: isRegular ? 'var(--center-channel-bg)' : 'var(--error-text)',
                    color: isDestructive && 'var(--button-color)',
                },
                '&.Mui-focusVisible .label-elements>:last-child, &.Mui-focusVisible .label-elements>:first-child, &.Mui-focusVisible .label-elements>:only-child': {
                    color: isDestructive && 'var(--button-color)',
                },
                '&.Mui-focusVisible .leading-element, &.Mui-focusVisible .trailing-elements': {
                    color: isDestructive && 'var(--button-color)',
                },

                '&>.leading-element': {
                    width: '18px',
                    height: '18px',
                    marginInlineEnd: '10px',
                    color: isRegular ? 'rgba(var(--center-channel-color-rgb), 0.64)' : 'var(--error-text)',
                },
                '&:hover .leading-element': {
                    color: isRegular ? 'rgba(var(--center-channel-color-rgb), 0.8)' : 'var(--button-color)',
                },

                '&>.label-elements': {
                    display: 'flex',
                    flex: '1 0 auto',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flexWrap: 'nowrap',
                    alignSelf: 'stretch',
                    fontWeight: 'normal',
                    textAlign: 'start',
                    gap: '4px',
                    lineHeight: '16px',
                },

                '&>.label-elements>:last-child': {
                    fontSize: '12px',
                    color: isRegular ? 'rgba(var(--center-channel-color-rgb), 0.75)' : 'var(--error-text)',
                },
                '&:hover .label-elements>:last-child': {
                    color: isDestructive && 'var(--button-color)',
                },

                '&>.label-elements>:first-child, &>.label-elements>:only-child': {
                    fontSize: '14px',
                    color: isRegular ? 'var(--center-channel-color)' : 'var(--error-text)',
                },
                '&:hover .label-elements>:first-child, &:hover .label-elements>:only-child': {
                    color: isDestructive && 'var(--button-color)',
                },

                '&>.trailing-elements': {
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    justifyContent: 'flex-end',
                    color: isRegular ? 'rgba(var(--center-channel-color-rgb), 0.75)' : 'var(--error-text)',
                    gap: '4px',
                    marginInlineStart: '24px',
                    fontWeight: 'normal',
                    lineHeight: '16px',
                    alignItems: 'center',
                    fontFamily: 'GraphikArabic',
                    '&> svg': {
                        transform: isRTL ? 'rotate(-180deg)' : 'rotate(0deg)', // تدوير بناءً على اتجاه النص
                    },
                    '&.large-svg > svg': {
                        transform: isRTL ? 'rotate(0deg)' : 'rotate(0deg)', // تدوير بناءً على اتجاه النص فقط إذا كانت الأيقونة كبيرة
                    },
                },
                '&:hover .trailing-elements': {
                    color: isRegular ? 'rgba(var(--center-channel-color-rgb), 0.75)' : 'var(--button-color)',
                },
            },
        });
    },
);

function isCorrectKeyPressedOnMenuItem(event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) {
    if (event.type === EventTypes.KEY_DOWN) {
        const keyboardEvent = event as KeyboardEvent<HTMLLIElement>;
        if (isKeyPressed(keyboardEvent, Constants.KeyCodes.ENTER) || isKeyPressed(keyboardEvent, Constants.KeyCodes.SPACE)) {
            return true;
        }
        return false;
    } else if (event.type === EventTypes.CLICK) {
        const mouseEvent = event as MouseEvent<HTMLLIElement>;
        if (mouseEvent.button === 0) {
            return true;
        }
        return false;
    }
    return false;
}

function isRoleCheckboxOrRadio(role: AriaRole) {
    return role === 'menuitemcheckbox' || role === 'menuitemradio';
}

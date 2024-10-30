// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useFloating, offset, useClick, useDismiss, useInteractions} from '@floating-ui/react';
import classNames from 'classnames';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import {CSSTransition} from 'react-transition-group';
import styled from 'styled-components';

import {DotsHorizontalIcon} from '@mattermost/compass-icons/components';

import Videoicon from 'components/app_bar/app_bar1';
import {VoicePluginComponent} from 'components/file_upload';

import CallButton from 'plugins/call_button';
import type {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';

import FormattingIcon, {IconContainer} from './formatting_icon';
import {useFormattingBarControls} from './hooks';
export const Separator = styled.div`
    display: block;
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.16);
`;

export const FormattingBarSpacer = styled.div`
    display: flex;
    height: 48px;
    transition: height 0.25s ease;
    align-items: end;
`;

const FormattingBarContainer = styled.div`
    display: flex;
    height: 48px;
    padding-left: 7px;
    background: transparent;
    align-items: center;
    gap: 2px;
    transform-origin: top;
    transition: height 0.25s ease;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    margin-right: 14px;
    margin-left: 14px;
`;

const HiddenControlsContainer = styled.div`
    padding: 5px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;

    &.scale-enter {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-enter-active {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-enter-done {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit-active {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-exit-done {
        transform: scale(0);
        opacity: 0;
        z-index: -1;
    }
`;

interface FormattingBarProps {
    getCurrentMessage: () => string;
    getCurrentSelection: () => { start: number; end: number };
    applyMarkdown: (options: ApplyMarkdownOptions) => void;
    disableControls: boolean;
    location: string;
    additionalControls?: React.ReactNodeArray;
    inputValue?: string;
}

const FormattingBar = (props: FormattingBarProps): JSX.Element => {
    const {
        applyMarkdown,
        getCurrentSelection,
        getCurrentMessage,
        disableControls,
        location,
        additionalControls,
        inputValue,
    } = props;

    const [showHiddenControls, setShowHiddenControls] = useState(false);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, hiddenControls, wideMode} = useFormattingBarControls(formattingBarRef);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    const {y, strategy, update, context, refs: {setReference, setFloating}} = useFloating<HTMLButtonElement>({
        open: showHiddenControls,
        onOpenChange: setShowHiddenControls,
        placement: 'top',
        middleware: [offset({mainAxis: 4})],
    });

    const click = useClick(context);
    const {getReferenceProps: getClickReferenceProps, getFloatingProps: getClickFloatingProps} = useInteractions([
        click,
    ]);

    const dismiss = useDismiss(context);
    const {getReferenceProps: getDismissReferenceProps, getFloatingProps: getDismissFloatingProps} = useInteractions([
        dismiss,
    ]);

    useEffect(() => {
        update?.();
    }, [wideMode, update, showHiddenControls]);

    const hasHiddenControls = wideMode !== 'wide' || controls.length > 0 || hiddenControls.length > 0;

    // Define someVariable based on your condition
    const [yourBooleanVariable, setYourBooleanVariable] = useState(true);
    const someVariable = (yourBooleanVariable && inputValue?.trim()) ? 'Animation' : 'noAnimation';
    const makeFormattingHandler = useCallback((mode) => () => {
        if (disableControls) {
            return;
        }

        const {start, end} = getCurrentSelection();

        if (start === null || end === null) {
            return;
        }

        const value = getCurrentMessage();

        applyMarkdown({
            markdownMode: mode,
            selectionStart: start,
            selectionEnd: end,
            message: value,
        });

        if (showHiddenControls) {
            setShowHiddenControls(true);
        }
    }, [getCurrentSelection, getCurrentMessage, applyMarkdown, showHiddenControls, disableControls]);

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
    };

    return (
        <FormattingBarContainer ref={formattingBarRef}>

            {hasHiddenControls && (
                <>
                    <IconContainer
                        id={'HiddenControlsButton' + location}
                        ref={setReference}
                        className={classNames({active: showHiddenControls})}
                        aria-label={HiddenControlsButtonAriaLabel}
                        type='button'
                        {...getClickReferenceProps()}
                        {...getDismissReferenceProps()}
                    >
                        <DotsHorizontalIcon
                            color={'currentColor'}
                            size={18}
                        />
                    </IconContainer>
                </>
            )}

            <CSSTransition
                timeout={250}
                classNames='scale'
                in={showHiddenControls}
            >
                <HiddenControlsContainer
                    ref={setFloating}
                    style={hiddenControlsContainerStyles}
                    {...getClickFloatingProps()}
                    {...getDismissFloatingProps()}
                >
                    {[...controls, ...hiddenControls].map((mode) => {
                        return (
                            <FormattingIcon
                                key={mode}
                                mode={mode}
                                className='control'
                                onClick={makeFormattingHandler(mode)}
                                disabled={disableControls}
                            />
                        );
                    })}
                </HiddenControlsContainer>
            </CSSTransition>

            <>
                <div
                    className={someVariable}
                    onClick={() => setYourBooleanVariable(true)}
                >
                    {additionalControls}
                </div>
            </>
            <VoicePluginComponent/>
            <Videoicon/>
            <CallButton/>

        </FormattingBarContainer>
    );
};

export default memo(FormattingBar);

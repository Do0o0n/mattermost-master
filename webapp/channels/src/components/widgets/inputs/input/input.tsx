// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useState, useEffect} from 'react';
import {useIntl} from 'react-intl';

import {CloseCircleIcon} from '@mattermost/compass-icons/components';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants, {ItemStatus} from 'utils/constants';

import './input.scss';

export enum SIZE {
    MEDIUM = 'medium',
    LARGE = 'large',
}

export type CustomMessageInputType = {type: 'info' | 'error' | 'warning' | 'success'; value: React.ReactNode} | null;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    required?: boolean;
    hasError?: boolean;
    addon?: React.ReactElement;
    textPrefix?: string;
    inputPrefix?: JSX.Element;
    inputSuffix?: JSX.Element;
    label?: string;
    containerClassName?: string;
    wrapperClassName?: string;
    inputClassName?: string;
    limit?: number;
    useLegend?: boolean;
    customMessage?: CustomMessageInputType;
    inputSize?: SIZE;
    clearable?: boolean;
    clearableTooltipText?: string;
    onClear?: () => void;
}

const Input = React.forwardRef((
    {
        name,
        value,
        label,
        placeholder,
        useLegend = true,
        className,
        hasError,
        required,
        addon,
        textPrefix,
        inputPrefix,
        inputSuffix,
        containerClassName,
        wrapperClassName,
        inputClassName,
        limit,
        customMessage,
        maxLength,
        inputSize = SIZE.MEDIUM,
        disabled,
        clearable,
        clearableTooltipText,
        onFocus,
        onBlur,
        onChange,
        onClear,
        ...otherProps
    }: InputProps,
    ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>,
) => {
    const {formatMessage} = useIntl();

    const [focused, setFocused] = useState(false);
    const [customInputLabel, setCustomInputLabel] = useState<CustomMessageInputType>(null);

    useEffect(() => {
        if (customMessage === undefined || customMessage === null) {
            if (customInputLabel !== null) {
                // edge-use case: a consumer of this component may have its input updated
                // from more than one place, such as by a network fetching data after load
                // in that case, we need to remove the error according to the response
                setCustomInputLabel(customMessage || null);
            }
            return;
        }

        if (customMessage !== undefined && customMessage !== null && Boolean(customMessage.value)) {
            setCustomInputLabel(customMessage);
        }
    }, [customMessage]);

    const handleOnFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFocused(true);

        if (onFocus) {
            onFocus(event);
        }
    };

    const handleOnBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFocused(false);
        validateInput();

        if (onBlur) {
            onBlur(event);
        }
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCustomInputLabel(null);

        if (onChange) {
            onChange(event);
        }
    };

    const handleOnClear = () => {
        if (onClear) {
            onClear();
        }
    };

    const validateInput = () => {
        if (!required || (value !== null && value !== '')) {
            return;
        }
        const validationErrorMsg = formatMessage({id: 'widget.input.required', defaultMessage: 'This field is required'});
        setCustomInputLabel({type: ItemStatus.ERROR, value: validationErrorMsg});
    };

    const showLegend = Boolean(focused || value);
    const error = customInputLabel?.type === 'error';
    const limitExceeded = limit && value && !Array.isArray(value) ? value.toString().length - limit : 0;

    const clearButton = value && clearable ? (
        <div
            className='Input__clear'
            onMouseDown={handleOnClear}
            onTouchEnd={handleOnClear}
        >
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={(
                    <Tooltip id={'InputClearTooltip'}>
                        {clearableTooltipText || formatMessage({id: 'widget.input.clear', defaultMessage: 'Clear'})}
                    </Tooltip>
                )}
            >
                <CloseCircleIcon size={18}/>
            </OverlayTrigger>
        </div>
    ) : null;

    const generateInput = () => {
        if (otherProps.type === 'textarea') {
            return (
                <textarea
                    ref={ref as React.RefObject<HTMLTextAreaElement>}
                    id={`input_${name || ''}`}
                    className={classNames('Input form-control', inputSize, inputClassName, {Input__focus: showLegend})}
                    value={value}
                    placeholder={focused ? (label && placeholder) || label : label || placeholder}
                    aria-label={label || placeholder}
                    rows={3}
                    name={name}
                    disabled={disabled}
                    {...otherProps}
                    maxLength={limit ? undefined : maxLength}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    onChange={handleOnChange}
                />);
        }
        return (
            <input
                ref={ref as React.RefObject<HTMLInputElement>}
                id={`input_${name || ''}`}
                className={classNames('Input form-control', inputSize, inputClassName, {Input__focus: showLegend})}
                value={value}
                placeholder={focused ? (label && placeholder) || label : label || placeholder}
                aria-label={label || placeholder}
                name={name}
                disabled={disabled}
                {...otherProps}
                maxLength={limit ? undefined : maxLength}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                onChange={handleOnChange}
            />
        );
    };

    return (
        <div className={classNames('Input_container', containerClassName, {disabled})}>
            <fieldset
                className={classNames('Input_fieldset', className, {
                    Input_fieldset___error: error || hasError || limitExceeded > 0,
                    Input_fieldset___legend: showLegend,
                })}
            >
                {useLegend && (
                    <legend className={classNames('Input_legend', {Input_legend___focus: showLegend})}>
                        {showLegend ? label || placeholder : null}
                    </legend>
                )}
                <div className={classNames('Input_wrapper', wrapperClassName)}>
                    {inputPrefix}
                    {textPrefix && <span>{textPrefix}</span>}
                    {generateInput()}
                    {limitExceeded > 0 && (
                        <span className='Input_limit-exceeded'>
                            {'-'}{limitExceeded}
                        </span>
                    )}
                    {inputSuffix}
                    {clearButton}
                </div>
                {addon}
            </fieldset>
            {customInputLabel && (
                <div className={`Input___customMessage Input___${customInputLabel.type}`}>
                    <span>{customInputLabel.value}</span>
                </div>
            )}
        </div>
    );
});

export default Input;

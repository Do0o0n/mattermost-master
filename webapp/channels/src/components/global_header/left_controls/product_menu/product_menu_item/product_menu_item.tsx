// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import glyphMap, {CheckIcon} from '@mattermost/compass-icons/components';
import type {IconGlyphTypes} from '@mattermost/compass-icons/IconGlyphs';
import './index1.scss';
export interface ProductMenuItemProps {
    destination: string;
    icon: IconGlyphTypes;
    text: React.ReactNode;
    active: boolean;
    onClick: () => void;

    tourTip?: React.ReactNode;
    id?: string;
}

const MenuItem = styled(Link)`
    && {
        text-decoration: none;
        color: inherit;
       text-align: start;
         html[dir="rtl"] & {
                margin-right: 5px;
            }
      
    }

    height: 40px;
    padding-left: 16px;
     html[dir="ltr"] & {
        padding-right: 20px;
        }
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    /* direction: ltr; */

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        text-decoration: none;
        color: inherit;
        text-align: start;
    }

    button {
        padding: 0 6px;
    }
`;

const MenuItemTextContainer = styled.div`
    margin-left: 8px;
    flex-grow: 1;
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
`;

const ProductMenuItem = ({icon, destination, text, active, onClick, tourTip, id}: ProductMenuItemProps): JSX.Element => {
    const ProductIcon = glyphMap[icon];
    return (
        <MenuItem
            to={destination}
            onClick={onClick}
            id={id}
        >
            <ProductIcon
                size={24}
                color={'var(--button-bg)'}
            />
            <MenuItemTextContainer>
                <>
                    <div className='disblayy'>{text}</div>
                    <div className='disblay'>{text === 'Channels' ? 'الدردشة' : text}</div>
                </>
            </MenuItemTextContainer>
            {active && <CheckIcon
                size={18}
                color={'var(--button-bg)'}
            // eslint-disable-next-line react/jsx-closing-bracket-location
            />}
            {tourTip || null}
        </MenuItem>
    );
};

export default ProductMenuItem;

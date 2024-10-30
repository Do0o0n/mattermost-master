// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {FilterVariantIcon} from '@mattermost/compass-icons/components';

import {IconContainer} from 'components/advanced_text_editor/formatting_bar/formatting_icon';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Menu from 'components/widgets/menu/menu';
// eslint-disable-next-line import/order
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './files_filter_menu.scss';
// eslint-disable-next-line import/order
import type {SearchFilterType} from 'components/search/types';

type Props = {
    selectedFilter: string;
    onFilter: (filter: SearchFilterType) => void;
};

const FilesFilterMenu = (props: Props): JSX.Element => {
    // Determine the current text direction
    const dir = document.documentElement.getAttribute('dir') || 'ltr';

    // Define the messages based on text direction
    const messages = {
        all: dir === 'rtl' ? 'جميع أنواع الملفات' : 'All file types',
        documents: dir === 'rtl' ? 'مستندات' : 'Documents',
        spreadsheets: dir === 'rtl' ? 'جداول بيانات' : 'Spreadsheets',
        presentations: dir === 'rtl' ? 'عروض تقديمية' : 'Presentations',
        code: dir === 'rtl' ? ' كود رمز' : 'Code',
        images: dir === 'rtl' ? 'صور' : 'Images',
        audio: dir === 'rtl' ? 'صوت' : 'Audio',
        video: dir === 'rtl' ? 'فيديوهات' : 'Videos',
    };

    const toolTip = (
        <Tooltip
            id='files-filter-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='channel_info_rhs.menu.files.filter'
                defaultMessage={dir === 'rtl' ? 'تصفية' : 'Filter'}
            />
        </Tooltip>
    );

    return (
        <div className='FilesFilterMenu'>
            <MenuWrapper>
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={500}
                    placement='top'
                    overlay={toolTip}
                    rootClose={true}
                >
                    <IconContainer
                        id='filesFilterButton'
                        className='action-icon dots-icon'
                        type='button'
                    >
                        {props.selectedFilter !== 'all' && <i className='icon-dot'/>}
                        <FilterVariantIcon
                            size={18}
                            color='currentColor'
                        />
                    </IconContainer>
                </OverlayTrigger>
                <Menu
                    ariaLabel={'file menu'}
                    openLeft={true}
                >
                    <Menu.ItemAction
                        ariaLabel={'All file types'}
                        text={messages.all}
                        onClick={() => props.onFilter('all')}
                        icon={props.selectedFilter === 'all' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Documents'}
                        text={messages.documents}
                        onClick={() => props.onFilter('documents')}
                        icon={props.selectedFilter === 'documents' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Spreadsheets'}
                        text={messages.spreadsheets}
                        onClick={() => props.onFilter('spreadsheets')}
                        icon={props.selectedFilter === 'spreadsheets' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Presentations'}
                        text={messages.presentations}
                        onClick={() => props.onFilter('presentations')}
                        icon={props.selectedFilter === 'presentations' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Code'}
                        text={messages.code}
                        onClick={() => props.onFilter('code')}
                        icon={props.selectedFilter === 'code' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Images'}
                        text={messages.images}
                        onClick={() => props.onFilter('images')}
                        icon={props.selectedFilter === 'images' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Audio'}
                        text={messages.audio}
                        onClick={() => props.onFilter('audio')}
                        icon={props.selectedFilter === 'audio' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={'Videos'}
                        text={messages.video}
                        onClick={() => props.onFilter('video')}
                        icon={props.selectedFilter === 'video' ? <i className='icon icon-check'/> : null}
                    />
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export default FilesFilterMenu;

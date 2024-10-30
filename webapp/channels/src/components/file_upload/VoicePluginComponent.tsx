// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {RefObject} from 'react';
import React, {PureComponent} from 'react';
import type {WrappedComponentProps} from 'react-intl';
import {injectIntl} from 'react-intl';

import type {PluginComponent} from 'types/store/plugins';

type Props = {
    pluginFileUploadMethods: PluginComponent[];
} & WrappedComponentProps;

type State = {
    menuOpen: boolean;
};

class VoicePluginComponent extends PureComponent<Props, State> {
    fileInput: RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.state = {
            menuOpen: false,
        };
        this.fileInput = React.createRef();
    }

    componentDidMount() {
        const {pluginFileUploadMethods} = this.props;
        // eslint-disable-next-line no-console
        console.log('pluginFileUploadMethods:', pluginFileUploadMethods);

        if (!pluginFileUploadMethods) {
            // eslint-disable-next-line no-console
            console.warn('pluginFileUploadMethods is undefined or null');
        }
    }

    // التحقق من وجود "voice" وإظهار الأيقونة ذات الصلة فقط
    render() {
        // تعيين قيمة افتراضية فارغة في حالة عدم وجود خاصية pluginFileUploadMethods
        const {pluginFileUploadMethods = []} = this.props;

        // التحقق من وجود عنصر مع pluginId يساوي 'voice'
        const voiceMethod = pluginFileUploadMethods.find((item) => item.pluginId === 'voice');

        // إذا لم يتم العثور على عنصر بـ pluginId يساوي 'voice'
        if (!voiceMethod) {
            return null;
        }

        // إنشاء زر رفع الملف
        const voiceButton = (
            <div
                className='noAnimation'
                key={voiceMethod.pluginId + '_fileuploadpluginmenuitem'}
                onClick={() => {
                    if (voiceMethod.action) {
                        voiceMethod.action(() => {});
                    }
                    this.setState({menuOpen: false});
                }}
            >
                <button
                    className='VoicePluginComponent'
                    style={{color: '#00987e', border: 'none'}}
                >
                    {voiceMethod.icon}
                </button>
            </div>
        );

        return <div>{voiceButton}</div>;
    }
}

export default injectIntl(VoicePluginComponent, {forwardRef: true});

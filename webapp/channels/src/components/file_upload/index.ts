// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {uploadFile} from 'actions/file_actions';
import {getCurrentLocale} from 'selectors/i18n';

import {canUploadFiles} from 'utils/file_utils';

import type {GlobalState} from 'types/store';
import type {FilesWillUploadHook} from 'types/store/plugins';

import FileUploads from './file_upload';
import VoicePluginComponents from './VoicePluginComponent';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const maxFileSize = parseInt(config.MaxFileSize || '', 10);

    return {
        maxFileSize,
        canUploadFiles: canUploadFiles(config),
        locale: getCurrentLocale(state),
        pluginFileUploadMethods: state.plugins.components.FileUploadMethod,
        pluginFilesWillUploadHooks: state.plugins.components.FilesWillUploadHook as unknown as FilesWillUploadHook[],
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            uploadFile,
        }, dispatch),
    };
}

const FileUpload = connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(FileUploads);
const VoicePluginComponent = connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(VoicePluginComponents);

export {FileUpload, VoicePluginComponent};

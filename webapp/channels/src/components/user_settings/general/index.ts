// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {clearErrors, logError} from 'mattermost-redux/actions/errors';
import {
    updateMe,
    sendVerificationEmail,
    setDefaultProfileImage,
    uploadProfileImage,
} from 'mattermost-redux/actions/users';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general'; // إضافة getLicense هنا

import {getIsMobileView} from 'selectors/views/browser';

import type {GlobalState} from 'types/store';

import UserSettingsGeneralTab from './user_settings_general';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const license = getLicense(state); // الحصول على الترخيص

    const requireEmailVerification = config.RequireEmailVerification === 'true';
    const maxFileSize = parseInt(config.MaxFileSize!, 10);
    const ldapFirstNameAttributeSet = config.LdapFirstNameAttributeSet === 'true';
    const ldapLastNameAttributeSet = config.LdapLastNameAttributeSet === 'true';
    const samlFirstNameAttributeSet = config.SamlFirstNameAttributeSet === 'true';
    const samlLastNameAttributeSet = config.SamlLastNameAttributeSet === 'true';
    const ldapNicknameAttributeSet = config.LdapNicknameAttributeSet === 'true';
    const samlNicknameAttributeSet = config.SamlNicknameAttributeSet === 'true';
    const samlPositionAttributeSet = config.SamlPositionAttributeSet === 'true';
    const ldapPositionAttributeSet = config.LdapPositionAttributeSet === 'true';
    const ldapPictureAttributeSet = config.LdapPictureAttributeSet === 'true';

    // إضافة قيمة lockTeammateNameDisplay
    const lockTeammateNameDisplay = license.LockTeammateNameDisplay === 'true' && config.LockTeammateNameDisplay === 'true';

    return {
        isMobileView: getIsMobileView(state),
        requireEmailVerification,
        maxFileSize,
        ldapFirstNameAttributeSet,
        ldapLastNameAttributeSet,
        samlFirstNameAttributeSet,
        samlLastNameAttributeSet,
        ldapNicknameAttributeSet,
        samlNicknameAttributeSet,
        samlPositionAttributeSet,
        ldapPositionAttributeSet,
        ldapPictureAttributeSet,
        lockTeammateNameDisplay, // إضافة القيمة هنا
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            logError,
            clearErrors,
            updateMe,
            sendVerificationEmail,
            setDefaultProfileImage,
            uploadProfileImage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsGeneralTab);

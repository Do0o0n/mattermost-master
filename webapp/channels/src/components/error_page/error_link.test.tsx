// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import ErrorLink from 'components/error_page/error_link';

describe('components/error_page/ErrorLink', () => {
    const baseProps = {
        url: '',
        messageId: 'error.oauth_missing_code.gitlab.link',
        defaultMessage: 'GitLab',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ErrorLink {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});

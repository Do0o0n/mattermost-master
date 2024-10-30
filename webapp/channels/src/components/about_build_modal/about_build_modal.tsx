// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import type {ClientConfig, ClientLicense} from '@mattermost/types/config';

import Nbsp from 'components/html_entities/nbsp';
import MattermostLogo from 'components/widgets/icons/mattermost_logo';

import AboutBuildModalCloud from './about_build_modal_cloud/about_build_modal_cloud';

type Props = {

    /**
     * Function called after the modal has been hidden
     */
    onExited: () => void;

    /**
     * Global config object
     */
    config: Partial<ClientConfig>;

    /**
     * Global license object
     */
    license: ClientLicense;
};

type State = {
    show: boolean;
};

export default class AboutBuildModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    doHide = () => {
        this.setState({show: false});
        this.props.onExited();
    };

    render() {
        const config = this.props.config;
        const license = this.props.license;

        if (license.Cloud === 'true') {
            return (
                <AboutBuildModalCloud
                    {...this.props}
                    {...this.state}
                    doHide={this.doHide}
                />
            );
        }

        const subTitle = (
            <FormattedMessage
                id='about.teamEditionSt'
                defaultMessage='All your team communication in one place, instantly searchable and accessible anywhere.'
            />
        );
        let licensee;

        const buildnumber: JSX.Element | null = (
            <div data-testid='aboutModalBuildNumber'>
                <FormattedMessage
                    id='about.buildnumber'
                    defaultMessage='Build Number:'
                />
                <span id='buildnumberString'>{'\u00a0' + (config.BuildNumber === 'dev' ? 'n/a' : config.BuildNumber)}</span>
            </div>
        );

        const mmversion: string | undefined = config.BuildNumber === 'dev' ? config.BuildNumber : config.Version;

        return (
            <Modal
                dialogClassName='a11y__modal about-modal'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='aboutModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='aboutModalLabel'
                    >
                        <FormattedMessage
                            id='about.title'
                            values={{
                                appTitle: config.SiteName || 'Mattermost',
                            }}
                            defaultMessage='About {appTitle}'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='about-modal__content'>
                        <div className='about-modal__logo'>
                            <MattermostLogo/>
                        </div>
                        <div>
                            <h3 className='about-modal__title'>
                                <strong>
                                    {'Sofa'}
                                </strong>
                            </h3>
                            <p className='about-modal__subtitle pb-2'>
                                {subTitle}
                            </p>
                            <div className='form-group less'>
                                <div data-testid='aboutModalVersion'>
                                    <FormattedMessage
                                        id='about.version'
                                        defaultMessage='Mattermost Version:'
                                    />
                                    <span id='versionString'>
                                        {'\u00a0' + mmversion}
                                    </span>
                                </div>
                                <div data-testid='aboutModalDBVersionString'>
                                    <FormattedMessage
                                        id='about.dbversion'
                                        defaultMessage='Database Schema Version:'
                                    />
                                    <span id='dbversionString'>
                                        {'\u00a0' + config.SchemaVersion}
                                    </span>
                                </div>
                                {buildnumber}
                                <div>
                                    <FormattedMessage
                                        id='about.database'
                                        defaultMessage='Database:'
                                    />
                                    {'\u00a0' + config.SQLDriverName}
                                </div>
                            </div>
                            {licensee}
                        </div>
                    </div>
                    <div className='about-modal__hash'>
                        <p>
                            <FormattedMessage
                                id='about.hash'
                                defaultMessage='Build Hash:'
                            />
                            <Nbsp/>
                            {config.BuildHash}
                            <br/>
                            <FormattedMessage
                                id='about.hashee'
                                defaultMessage='EE Build Hash:'
                            />
                            <Nbsp/>
                            {config.BuildHashEnterprise}
                        </p>
                        <p>
                            <FormattedMessage
                                id='about.date'
                                defaultMessage='Build Date:'
                            />
                            <Nbsp/>
                            {config.BuildDate}
                        </p>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

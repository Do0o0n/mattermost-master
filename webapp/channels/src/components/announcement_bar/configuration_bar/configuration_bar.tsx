// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {ReactNode} from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import type {IntlShape} from 'react-intl';
import {Link} from 'react-router-dom';

import type {ClientConfig, WarnMetricStatus} from '@mattermost/types/config';
import type {PreferenceType} from '@mattermost/types/preferences';

import type {ActionResult} from 'mattermost-redux/types/actions';

import {trackEvent} from 'actions/telemetry_actions';

import ExternalLink from 'components/external_link';

import alertIcon from 'images/icons/round-white-info-icon.svg';
import warningIcon from 'images/icons/warning-icon.svg';
import {AnnouncementBarTypes, AnnouncementBarMessages, Preferences, ConfigurationBanners, TELEMETRY_CATEGORIES} from 'utils/constants';
import {t} from 'utils/i18n';
import {isLicenseExpired, isLicenseExpiring, isLicensePastGracePeriod, isTrialLicense} from 'utils/license_utils';
import {getSkuDisplayName} from 'utils/subscription';

import AnnouncementBar from '../default_announcement_bar';
import RenewalLink from '../renewal_link/';
import TextDismissableBar from '../text_dismissable_bar';

type Props = {
    config?: Partial<ClientConfig>;
    intl: IntlShape;
    license?: any;
    canViewSystemErrors: boolean;
    dismissedExpiringTrialLicense?: boolean;
    dismissedExpiringLicense?: boolean;
    dismissedExpiredLicense?: boolean;
    dismissedNumberOfActiveUsersWarnMetricStatus?: boolean;
    dismissedNumberOfActiveUsersWarnMetricStatusAck?: boolean;
    dismissedNumberOfPostsWarnMetricStatus?: boolean;
    dismissedNumberOfPostsWarnMetricStatusAck?: boolean;
    siteURL: string;
    currentUserId: string;
    warnMetricsStatus?: Record<string, WarnMetricStatus>;
    actions: {
        dismissNotice: (notice: string) => void;
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    };
};

const ConfigurationAnnouncementBar = (props: Props) => {
    const {formatMessage} = props.intl;

    const dismissExpiringLicense = () => {
        props.actions.dismissNotice(AnnouncementBarMessages.LICENSE_EXPIRING);
    };

    const dismissExpiredLicense = () => {
        trackEvent(
            TELEMETRY_CATEGORIES.SELF_HOSTED_LICENSE_EXPIRED,
            'dismissed_license_expired_banner',
        );

        props.actions.savePreferences(props.currentUserId, [{
            category: Preferences.CONFIGURATION_BANNERS,
            user_id: props.currentUserId,
            name: ConfigurationBanners.LICENSE_EXPIRED,
            value: 'true',
        }]);
    };

    const renewLinkTelemetry = {success: 'renew_license_banner_success', error: 'renew_license_banner_fail'};

    // System administrators
    if (props.canViewSystemErrors) {
        if ((isLicensePastGracePeriod(props.license) || isLicenseExpired(props.license)) && !props.dismissedExpiredLicense) {
            const message = (<>
                <img
                    className='advisor-icon'
                    src={warningIcon}
                />
                <FormattedMessage
                    id='announcement_bar.error.license_expired'
                    defaultMessage='{licenseSku} license is expired and some features may be disabled.'
                    values={{
                        licenseSku: getSkuDisplayName(props.license.SkuShortName, props.license.IsGovSku === 'true'),
                    }}
                />
            </>);
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <div className='announcement-bar__configuration'>
                            {message}
                            <RenewalLink telemetryInfo={renewLinkTelemetry}/>
                        </div>
                    }
                    tooltipMsg={message}
                    handleClose={dismissExpiredLicense}
                    showCloseButton={true}
                />
            );
        }

        if (!isTrialLicense(props.license) && isLicenseExpiring(props.license) && !props.dismissedExpiringLicense) {
            const message = (<>
                <img
                    className='advisor-icon'
                    src={alertIcon}
                />
                <FormattedMessage
                    id='announcement_bar.error.license_expiring'
                    defaultMessage='{licenseSku} license expires on {date, date, long}.'
                    values={{
                        date: new Date(parseInt(props.license?.ExpiresAt, 10)),
                        licenseSku: getSkuDisplayName(props.license.SkuShortName, props.license.IsGovSku === 'true'),
                    }}
                />
            </>);
            return (
                <AnnouncementBar
                    showCloseButton={true}
                    handleClose={dismissExpiringLicense}
                    type={AnnouncementBarTypes.ANNOUNCEMENT}
                    message={
                        <div className='announcement-bar__configuration'>
                            {message}
                            <RenewalLink telemetryInfo={renewLinkTelemetry}/>
                        </div>
                    }
                    tooltipMsg={message}
                />
            );
        }
    } else {
        // Regular users
        if (isLicensePastGracePeriod(props.license)) { //eslint-disable-line no-lonely-if
            return (
                <AnnouncementBar
                    type={AnnouncementBarTypes.CRITICAL}
                    message={
                        <>
                            <img
                                className='advisor-icon'
                                src={warningIcon}
                            />
                            <FormattedMessage
                                id={AnnouncementBarMessages.LICENSE_PAST_GRACE}
                                defaultMessage='{licenseSku} license is expired and some features may be disabled. Please contact your System Administrator for details.'
                                values={{
                                    licenseSku: getSkuDisplayName(props.license.SkuShortName, props.license.IsGovSku === 'true'),
                                }}
                            />
                        </>
                    }
                />
            );
        }
    }

    if (props.config?.SendEmailNotifications !== 'true' &&
            props.config?.EnablePreviewModeBanner === 'true'
    ) {
        const emailMessage = formatMessage({
            id: AnnouncementBarMessages.PREVIEW_MODE,
            defaultMessage: 'Preview Mode: Email notifications have not been configured',
        });

        return (
            <TextDismissableBar
                allowDismissal={true}
                text={emailMessage}
                type={AnnouncementBarTypes.SUCCESS}
            />
        );
    }

    if (props.canViewSystemErrors && props.config?.SiteURL === '') {
        let id;
        let defaultMessage;
        if (props.config?.EnableSignUpWithGitLab === 'true') {
            id = t('announcement_bar.error.site_url_gitlab.full');
            defaultMessage = 'Please configure your <linkSite>site URL</linkSite> either on the <linkConsole>System Console<linkConsole> or, if you\'re using GitLab Mattermost, in gitlab.rb.';
        } else {
            id = t('announcement_bar.error.site_url.full');
            defaultMessage = 'Please configure your <linkSite>site URL</linkSite> on the <linkConsole>System Console</linkConsole>.';
        }

        const values: Record<string, ReactNode> = {
            linkSite: (msg: string) => (
                <ExternalLink
                    href={props.siteURL}
                    location='configuration_announcement_bar'
                >
                    {msg}
                </ExternalLink>
            ),
            linkConsole: (msg: string) => (
                <Link to='/admin_console/environment/web_server'>
                    {msg}
                </Link>
            ),
        };
        const siteURLMessage = formatMessage({id, defaultMessage}, values);

        return (
            <TextDismissableBar
                allowDismissal={true}
                text={siteURLMessage}
                type={AnnouncementBarTypes.ANNOUNCEMENT}
            />
        );
    }

    return null;
};

export default injectIntl(ConfigurationAnnouncementBar);

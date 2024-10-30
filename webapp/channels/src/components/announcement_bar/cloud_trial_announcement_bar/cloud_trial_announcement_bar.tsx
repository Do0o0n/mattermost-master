// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import isEmpty from 'lodash/isEmpty';
import React from 'react';

import type {Subscription} from '@mattermost/types/cloud';
import type {PreferenceType} from '@mattermost/types/preferences';
import type {UserProfile} from '@mattermost/types/users';

import {trackEvent} from 'actions/telemetry_actions';

import PricingModal from 'components/pricing_modal';

import {
    Preferences,
    CloudBanners,
    ModalIdentifiers,
    TELEMETRY_CATEGORIES,
    TrialPeriodDays,
} from 'utils/constants';

import type {ModalData} from 'types/actions';

type Props = {
    userIsAdmin: boolean;
    isFreeTrial: boolean;
    currentUser: UserProfile;
    preferences: PreferenceType[];
    daysLeftOnTrial: number;
    isCloud: boolean;
    subscription?: Subscription;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        getCloudSubscription: () => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
};

const MAX_DAYS_BANNER = 'max_days_banner';
const THREE_DAYS_BANNER = '3_days_banner';
class CloudTrialAnnouncementBar extends React.PureComponent<Props> {
    async componentDidMount() {
        if (!isEmpty(this.props.subscription) && this.shouldShowBanner()) {
            const {daysLeftOnTrial} = this.props;
            if (this.isDismissable()) {
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                    `bannerview_trial_${daysLeftOnTrial}_days`,
                );
            } else {
                trackEvent(
                    TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                    'bannerview_trial_limit_ended',
                );
            }
        }
    }

    handleClose = async () => {
        const {daysLeftOnTrial} = this.props;
        let dismissValue = '';
        if (daysLeftOnTrial > TrialPeriodDays.TRIAL_WARNING_THRESHOLD) {
            dismissValue = MAX_DAYS_BANNER;
        } else if (daysLeftOnTrial <= TrialPeriodDays.TRIAL_WARNING_THRESHOLD && daysLeftOnTrial >= TrialPeriodDays.TRIAL_1_DAY) {
            dismissValue = THREE_DAYS_BANNER;
        }
        trackEvent(
            TELEMETRY_CATEGORIES.CLOUD_ADMIN,
            `dismissed_banner_trial_${daysLeftOnTrial}_days`,
        );
        await this.props.actions.savePreferences(this.props.currentUser.id, [{
            category: Preferences.CLOUD_TRIAL_BANNER,
            user_id: this.props.currentUser.id,
            name: CloudBanners.TRIAL,
            value: `${dismissValue}`,
        }]);
    };

    shouldShowBanner = () => {
        const {isFreeTrial, userIsAdmin, isCloud} = this.props;
        return isFreeTrial && userIsAdmin && isCloud;
    };

    isDismissable = () => {
        const {daysLeftOnTrial} = this.props;
        let dismissable = true;

        if (daysLeftOnTrial <= TrialPeriodDays.TRIAL_1_DAY) {
            dismissable = false;
        }
        return dismissable;
    };

    showModal = () => {
        const {daysLeftOnTrial} = this.props;
        if (this.isDismissable()) {
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                `click_subscribe_from_trial_banner_${daysLeftOnTrial}_days`,
            );
        } else {
            trackEvent(
                TELEMETRY_CATEGORIES.CLOUD_ADMIN,
                'click_subscribe_from_banner_trial_ended',
            );
        }
        this.props.actions.openModal({
            modalId: ModalIdentifiers.PRICING_MODAL,
            dialogType: PricingModal,
        });
    };

    render() {
        return (
            <></>
        );
    }
}
export default CloudTrialAnnouncementBar;

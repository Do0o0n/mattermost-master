// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @typedef {} Language
 */

/* eslint-disable import/order */
import enAU from './en-AU.json';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

// should match the values in server/public/shared/i18n/i18n.go
const languages = {
    ar: {
        value: 'ar',
        name: ' العربية (🇾🇪)',
        order: 1,
        url: '',
    },
    'en-AU': {
        value: 'en-AU',
        name: 'English (US)',
        order: 2,
        url: enAU,
    },
};

export function getAllLanguages() {
    return languages;
}

/**
 * @param {import('types/store').GlobalState} state
 * @returns {Record<string, Language>}
 */
export function getLanguages(state) {
    const config = getConfig(state);
    if (!config.AvailableLocales) {
        return getAllLanguages();
    }
    return config.AvailableLocales.split(',').reduce((result, l) => {
        if (languages[l]) {
            result[l] = languages[l];
        }
        return result;
    }, {});
}

export function getLanguageInfo(locale) {
    return getAllLanguages()[locale];
}

/**
 * @param {import('types/store').GlobalState} state
 * @param {string} locale
 * @returns {boolean}
 */
export function isLanguageAvailable(state, locale) {
    return Boolean(getLanguages(state)[locale]);
}

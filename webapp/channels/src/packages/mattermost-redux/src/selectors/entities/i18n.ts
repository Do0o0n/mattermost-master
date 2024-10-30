// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from '@mattermost/types/store';

import {General} from 'mattermost-redux/constants';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

export function getCurrentUserLocale(
    state: GlobalState,
    defaultLocale = General.DEFAULT_LOCALE,
): string {
    try {
        // الحصول على المستخدم الحالي من الحالة
        const currentUser = getCurrentUser(state);

        // التحقق مباشرة إذا ما كان هناك مستخدم متواجد
        if (!currentUser || !currentUser.locale) {
            // في حالة عدم وجود مستخدم أو لغة للمستخدم، نستخدم اللغة المحفوظة مسبقاً في localStorage
            const preferredLocale = localStorage.getItem('preferredLocale');
            if (preferredLocale) {
                setUserLocale(preferredLocale, state);
                return preferredLocale;
                // eslint-disable-next-line no-else-return
            } else {
                // إذا لم يكن هناك لغة مفضلة مخزنة، نعيد اللغة الافتراضية
                setUserLocale(defaultLocale, state);
                document.documentElement.dir = 'rtl';
                // eslint-disable-next-line no-param-reassign
                defaultLocale = 'ar';
                return defaultLocale;
            }
        }

        // إذا كان هناك مستخدم متواجد ولديه لغة محددة، نقوم بتعيين اتجاه الصفحة بناءً على اللغة
        setUserLocale(currentUser.locale, state);
        return currentUser.locale;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching current user locale:', error);

        // في حالة حدوث خطأ، نعيد اللغة الافتراضية
        setUserLocale(defaultLocale, state);
        document.documentElement.dir = 'rtl';
        // eslint-disable-next-line no-param-reassign
        defaultLocale = 'ar';
        return defaultLocale;
    }
}

function setUserLocale(locale: string, state: GlobalState): string {
    // تعيين اتجاه الصفحة بناءً على اللغة المحددة
    if (
        locale === 'en-AU'

    ) {
        document.documentElement.dir = 'ltr';

        // تغيير اتجاه الصفحة إلى اليمين لليسار
    } else {
        document.documentElement.dir = 'rtl'; // استخدام الاتجاه الافتراضي للصفحة (اليسار لليمين)
    }

    // حفظ اللغة المحددة كلغة مفضلة في localStorage إذا كان هناك مستخدم مسجل
    const currentUser = getCurrentUser(state);
    if (currentUser) {
        localStorage.setItem('preferredLocale', locale);
    }

    return locale;
}

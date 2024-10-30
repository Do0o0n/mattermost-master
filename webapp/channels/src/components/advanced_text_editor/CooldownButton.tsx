// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';

// eslint-disable-next-line import/order
import Buzz from './buzz_svg';

import './advanced_text_editor.scss';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip'; // استيراد مكون التلميح

type CooldownButtonProps = {
    onMessageChange: (message: string, callback?: () => void) => void;
    handleSubmit: (e: React.SyntheticEvent) => void;
    channelId: string; // تمرير معرف القناة
};

const CooldownButton = ({onMessageChange, handleSubmit, channelId}: CooldownButtonProps) => {
    const [isCooldown, setIsCooldown] = useState(false); // حالة التبريد
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // حالة لتتبع الوقت المتبقي

    // eslint-disable-next-line consistent-return
    useEffect(() => {
        const lastSentTime = localStorage.getItem(`lastSentTime_${channelId}`);
        if (lastSentTime) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - parseInt(lastSentTime, 10);
            const remainingCooldown = 180000 - timeElapsed;

            if (remainingCooldown > 0) { // إذا كان الوقت المتبقي أكبر من صفر
                setIsCooldown(true);
                setTimeLeft(Math.ceil(remainingCooldown / 1000)); // حساب الوقت المتبقي بالثواني

                // تحديث الوقت المتبقي كل ثانية
                const interval = setInterval(() => {
                    const newTimeLeft = Math.ceil((180000 - (Date.now() - parseInt(lastSentTime, 10))) / 1000);
                    if (newTimeLeft <= 0) {
                        setIsCooldown(false);
                        setTimeLeft(null); // إعادة تعيين الوقت المتبقي إلى null عند انتهاء التبريد
                        clearInterval(interval);
                    } else {
                        setTimeLeft(newTimeLeft);
                    }
                }, 1000);

                // تنظيف الـ interval عند إزالة المكون
                return () => clearInterval(interval);
            }
            setIsCooldown(false);
            setTimeLeft(null);
        } else {
            setIsCooldown(false);
            setTimeLeft(null);
        }
    }, [channelId]); // إعادة التحقق عند تغيير القناة

    const sendHahaMessage = () => {
        const lastSentTime = localStorage.getItem(`lastSentTime_${channelId}`);
        const currentTime = Date.now();

        if (lastSentTime && (currentTime - parseInt(lastSentTime, 10) < 180000)) {
            return; // إذا كانت فترة التبريد لم تنتهِ، لا ترسل الرسالة
        }

        // تنفيذ عملية الإرسال
        const buzzMessage = 'BUZZMESSAGE';
        onMessageChange(buzzMessage, () => {
            const event: React.SyntheticEvent = {preventDefault: () => {}} as React.SyntheticEvent;
            handleSubmit(event);
        });

        // حفظ وقت الإرسال الحالي بناءً على `channelId`
        localStorage.setItem(`lastSentTime_${channelId}`, currentTime.toString());
        setIsCooldown(true);
        setTimeLeft(180); // إعادة تعيين الوقت المتبقي للتبريد إلى 3 دقائق (180 ثانية)

        setTimeout(() => {
            setIsCooldown(false);
            setTimeLeft(null);
        }, 180000); // تحديد فترة التبريد لمدة 3 دقائق
    };

    return (
        <OverlayTrigger
            delayShow={500} // تأخير ظهور التلميح
            placement='top' // مكان التلميح
            overlay={
                <Tooltip id='cooldown-tooltip'>
                    {isCooldown && timeLeft !== null ? `الوقت المتبقي: ${timeLeft} ` : 'أنقر لعمل Buzz'}
                </Tooltip>
            }
        >
            <button
                className={`send-button ${isCooldown ? 'cooldown' : ''}`}
                onClick={sendHahaMessage} // استدعاء الإرسال مباشرة عند النقر
                disabled={isCooldown}
            >
                <Buzz/>
            </button>
        </OverlayTrigger>
    );
};

export default CooldownButton;

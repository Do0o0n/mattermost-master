// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect, useRef} from 'react';

import type {FileInfo} from '@mattermost/types/files';

import {getFilePreviewUrl, getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import './image_preview.scss';

interface Props {
    fileInfo: FileInfo;
    canDownloadFiles: boolean;
    scale: number; // استخدام خاصية التكبير كما هي
}

export default function ImagePreview({fileInfo, canDownloadFiles, scale}: Props) {
    const isExternalFile = !fileInfo.id;

    let fileUrl;
    let previewUrl;
    if (isExternalFile) {
        fileUrl = fileInfo.link;
        previewUrl = fileInfo.link;
    } else {
        fileUrl = getFileDownloadUrl(fileInfo.id);
        previewUrl = fileInfo.has_preview_image ? getFilePreviewUrl(fileInfo.id) : fileUrl;
    }

    // استخدام حالة محلية للاحتفاظ بقيمة التكبير الحالية مع البدء بالقيمة الممررة عبر props
    const [currentScale, setCurrentScale] = useState(scale);
    const [imageSize, setImageSize] = useState({width: 0, height: 0});
    const containerRef = useRef<HTMLDivElement>(null);

    // تحديث currentScale إذا تغيرت الخاصية scale من الخارج
    useEffect(() => {
        setCurrentScale(scale);
    }, [scale]);

    // التعامل مع عجلة الفأرة لتكبير أو تصغير الصورة
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            // إذا كانت العجلة تتحرك لأعلى (تكبير)
            setCurrentScale((prevScale) => Math.min(prevScale + 0.1, 5)); // تحديد الحد الأقصى للتكبير
        } else {
            // إذا كانت العجلة تتحرك لأسفل (تصغير)
            setCurrentScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // تحديد الحد الأدنى للتصغير
        }
    };

    // التعامل مع تحميل الصورة للحصول على أبعادها الطبيعية
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        setImageSize({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
    };

    // حساب الأبعاد الجديدة بناءً على scale
    const scaledWidth = imageSize.width ? imageSize.width * currentScale : 'auto';
    const scaledHeight = imageSize.height ? imageSize.height * currentScale : 'auto';

    // تطبيق نمط الحاوية بناءً على الأبعاد الجديدة
    const containerStyle = {
        width: scaledWidth,
        height: scaledHeight,
        transition: 'width 0.3s, height 0.3s', // لإضافة تأثير سلس عند التكبير/التصغير
        overflow: 'auto',
        background: 'transparent',
    };

    // نمط الصورة
    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        cursor: canDownloadFiles ? 'pointer' : 'default', // تغيير شكل المؤشر إذا كانت الصورة قابلة للتنزيل
    };

    const imageElement = (
        <img
            src={previewUrl}
            style={imageStyle}
            alt='preview'

            // ربط حدث عجلة الفأرة
            onLoad={handleImageLoad} // ربط حدث تحميل الصورة
        />
    );

    if (!canDownloadFiles) {
        return (
            <div
                className='file-preview-modal__content' // الحاوية الأب
                ref={containerRef}

                onWheel={handleWheel}
            >
                {imageElement}
            </div>
        );
    }

    return (
        <div
            className='file-preview-modal__content'
            style={{background: 'transparent', overflow: 'visible'}} // الحاوية الأب
            ref={containerRef}

            onWheel={handleWheel}
        >

            <div
                className='file-preview-modal__content ' // الحاوية الأب
                ref={containerRef}
                style={containerStyle} // تطبيق نمط الحاوية
            >
                <img
                    className='image_preview__image'
                    style={imageStyle}
                    loading='lazy'
                    data-testid='imagePreview'
                    alt={'preview url image'}
                    src={previewUrl}
                    onWheel={handleWheel}
                    onLoad={handleImageLoad}
                />
            </div>

        </div>
    );
}

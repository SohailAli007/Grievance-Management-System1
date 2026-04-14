import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FaTimes, FaCheck, FaMinus, FaPlus } from 'react-icons/fa';

/**
 * Image Cropper Modal
 * @param {string} imageSrc - The source image URL
 * @param {function} onCancel - Function to close modal
 * @param {function} onCropComplete - Function receiving the cropped blob
 */
function ImageCropper({ imageSrc, onCancel, onCropComplete }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col h-[500px]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-semibold text-slate-800">Adjust Photo</h3>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">
                        <FaTimes />
                    </button>
                </div>

                <div className="relative flex-1 bg-slate-100">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="p-4 bg-white border-t space-y-4">
                    <div className="flex items-center gap-4">
                        <FaMinus className="text-slate-400 text-xs" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <FaPlus className="text-slate-400 text-xs" />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={createCroppedImage}
                            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            <FaCheck /> Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Utility to crop image ---
async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    // set canvas size to match the bounding box
    canvas.width = image.width;
    canvas.height = image.height;

    // draw image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are relative to the image size/position
    // We extract the cropped area from the canvas
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image to the top left of new canvas
    ctx.putImageData(data, 0, 0);

    // As Base64 string
    return new Promise((resolve) => {
        // resolve(canvas.toDataURL('image/jpeg')); // if returning base64

        // As Blob (better for upload) - but our API expects Base64 string currently
        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
}

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid CORS issues on CodeSandbox
        image.src = url;
    });

export default ImageCropper;

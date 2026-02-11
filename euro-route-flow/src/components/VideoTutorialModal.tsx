import { useState, useEffect } from "react";
import { X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoTutorialModalProps {
    videoUrl: string;
    title: string;
    description: string;
    autoShowDelay?: number; // milliseconds before showing popup
    onClose?: () => void;
}

export function VideoTutorialModal({
    videoUrl,
    title,
    description,
    autoShowDelay = 1500,
    onClose,
}: VideoTutorialModalProps) {
    const [showPopup, setShowPopup] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [hasSeenVideo, setHasSeenVideo] = useState(false);

    useEffect(() => {
        // Check if user has already seen this video (store in localStorage)
        const videoKey = `video_seen_${title}`;
        const seen = localStorage.getItem(videoKey);

        if (!seen) {
            const timer = setTimeout(() => {
                setShowPopup(true);
            }, autoShowDelay);
            return () => clearTimeout(timer);
        } else {
            setHasSeenVideo(true);
        }
    }, [title, autoShowDelay]);

    const handleWatchVideo = () => {
        setShowPopup(false);
        setShowVideo(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        const videoKey = `video_seen_${title}`;
        localStorage.setItem(videoKey, "true");
        onClose?.();
    };

    const handleCloseVideo = () => {
        setShowVideo(false);
        const videoKey = `video_seen_${title}`;
        localStorage.setItem(videoKey, "true");
        onClose?.();
    };

    return (
        <>
            {/* Circular Popup */}
            {showPopup && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
                    <div className="pointer-events-auto animate-in fade-in zoom-in duration-500">
                        {/* Background blur overlay */}
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm -z-10 pointer-events-auto"
                            onClick={handleClosePopup}
                        />

                        {/* Circular Popup Card */}
                        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-1 shadow-2xl w-80 h-80 flex items-center justify-center">
                            {/* Inner circle with content */}
                            <div className="bg-white rounded-full w-72 h-72 flex flex-col items-center justify-center p-8 text-center shadow-inner">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                                        <Play className="w-8 h-8 text-blue-600" fill="currentColor" />
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {title}
                                </h3>

                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                    {description}
                                </p>

                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClosePopup}
                                        className="flex-1"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Plus tard
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleWatchVideo}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Play className="w-4 h-4 mr-1" fill="white" />
                                        Regarder
                                    </Button>
                                </div>
                            </div>

                            {/* Close button - top right */}
                            <button
                                onClick={handleClosePopup}
                                className="absolute top-4 right-4 z-50 bg-white rounded-full p-1 hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5 text-blue-600" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {showVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="animate-in fade-in zoom-in duration-500 w-full max-w-4xl">
                        {/* Close button */}
                        <button
                            onClick={handleCloseVideo}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition z-50"
                        >
                            <X className="w-6 h-6 text-gray-900" />
                        </button>

                        {/* Video Container */}
                        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
                            <div className="relative w-full pt-[56.25%]">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`${videoUrl}?autoplay=1`}
                                    title={title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>

                        {/* Video Title and Info */}
                        <div className="mt-4 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                            <p className="text-gray-300 text-sm">{description}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

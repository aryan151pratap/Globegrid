import React, { useEffect, useRef, useState } from "react";

const ViewCode = ({ code }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            const scaleX = width / 1280;
            const scaleY = height / 710;

            setScale(Math.min(scaleX, scaleY));
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-fit overflow-hidden bg-zinc-950"
        >
            <iframe
                srcDoc={code}
                title="Code Preview"
                className="overflow-auto dark-scrollbar"
                style={{
                    width: "1280px",
                    height: "710px",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                }}
            />
        </div>
    );
};

export default ViewCode;
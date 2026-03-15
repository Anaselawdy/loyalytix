import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

export default function FloatingCouponElements() {
    const { scrollY } = useScroll();

    // Parallax effects tied to scroll
    const yFar = useTransform(scrollY, [0, 1000], [0, -100]);
    const yMid = useTransform(scrollY, [0, 1000], [0, -200]);
    const yClose = useTransform(scrollY, [0, 1000], [0, -350]);

    // Mouse position tracker
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse movement using spring
    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Get the viewport center
            const { innerWidth, innerHeight } = window;
            // Calculate cursor position from center (creates opposite parallax effect)
            const x = e.clientX - innerWidth / 2;
            const y = e.clientY - innerHeight / 2;

            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Mouse Parallax Transforms
    // Close elements move MORE (5%)
    const mXClose = useTransform(smoothMouseX, v => v * -0.05);
    const mYClose = useTransform(smoothMouseY, v => v * -0.05);

    // Mid elements move MODERATELY (3.5%)
    const mXMid = useTransform(smoothMouseX, v => v * -0.035);
    const mYMid = useTransform(smoothMouseY, v => v * -0.035);

    // Far elements move LESS (1.5%)
    const mXFar = useTransform(smoothMouseX, v => v * -0.015);
    const mYFar = useTransform(smoothMouseY, v => v * -0.015);

    return (
        <div className="absolute inset-0 pointer-events-none z-0">

            {/* 1. Element 1 (Top Left) - CLOSE */}
            <motion.div style={{ top: '10%', left: '5%', x: mXClose, y: mYClose }} className="absolute">
                <motion.div style={{ y: yClose }}>
                    <motion.img
                        src="/discount-coupons-in-purple-gift-boxes.png"
                        alt=""
                        animate={{ y: [0, -25, 0], rotate: [0, 3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                        className="w-[100px] h-auto object-contain drop-shadow-lg opacity-80"
                    />
                </motion.div>
            </motion.div>

            {/* 2. Element 2 (Top Right) - MID */}
            <motion.div style={{ top: '15%', right: '8%', x: mXMid, y: mYMid }} className="absolute">
                <motion.div style={{ y: yMid }}>
                    <motion.img
                        src="/coupons (2).png"
                        alt=""
                        animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="w-[80px] h-auto object-contain drop-shadow-xl opacity-70 blur-[2px]"
                    />
                </motion.div>
            </motion.div>

            {/* 3. Element 3 (Left Side, Large) - FAR */}
            <motion.div style={{ top: '40%', left: '-5%', x: mXFar, y: mYFar }} className="absolute -z-10 hidden sm:block">
                <motion.div style={{ y: yFar }}>
                    <motion.img
                        src="/discount.png"
                        alt=""
                        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="w-[140px] h-auto object-contain drop-shadow-2xl opacity-60"
                    />
                </motion.div>
            </motion.div>

            {/* 4. Element 4 (Right Side) - MID */}
            <motion.div style={{ top: '45%', right: '5%', x: mXMid, y: mYMid }} className="absolute">
                <motion.div style={{ y: yMid }}>
                    <motion.img
                        src="/coupons (1).png"
                        alt=""
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                        className="w-[90px] h-auto object-contain drop-shadow-md opacity-90"
                    />
                </motion.div>
            </motion.div>

            {/* 5. Element 5 (Bottom Left) - CLOSE */}
            <motion.div style={{ bottom: '15%', left: '10%', x: mXClose, y: mYClose }} className="absolute">
                <motion.div style={{ y: yClose }}>
                    <motion.img
                        src="/black-friday-sale-coupons.png"
                        alt=""
                        animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                        className="w-[70px] h-auto object-contain drop-shadow-xl opacity-75"
                    />
                </motion.div>
            </motion.div>

            {/* 6. Element 6 (Bottom Right) - MID */}
            <motion.div style={{ bottom: '20%', right: '12%', x: mXMid, y: mYMid }} className="absolute hidden sm:block">
                <motion.div style={{ y: yMid }}>
                    <motion.img
                        src="/coupons.png"
                        alt=""
                        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        className="w-[60px] h-auto object-contain drop-shadow-lg opacity-65 blur-[1px]"
                    />
                </motion.div>
            </motion.div>

            {/* 7. Element 7 (Far Top Right) - FAR */}
            <motion.div style={{ top: '8%', right: '20%', x: mXFar, y: mYFar }} className="absolute hidden sm:block">
                <motion.div style={{ y: yFar }}>
                    <motion.img
                        src="/discount.png"
                        alt=""
                        animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
                        className="w-[50px] h-auto object-contain drop-shadow-sm opacity-50 blur-[3px]"
                    />
                </motion.div>
            </motion.div>

        </div>
    );
}

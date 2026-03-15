import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function FloatingElements() {
    const { scrollY } = useScroll();

    // Parallax effects tied to scroll
    const yFar = useTransform(scrollY, [0, 1000], [0, -100]);
    const yMid = useTransform(scrollY, [0, 1000], [0, -200]);
    const yClose = useTransform(scrollY, [0, 1000], [0, -350]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

            {/* 1. Top left: Small coin (size: 40px) - slightly blurred for depth */}
            <motion.div
                style={{ y: yMid }}
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-[15%] left-[10%] text-[40px] drop-shadow-lg opacity-80 blur-[2px]"
            >
                🪙
            </motion.div>

            {/* 2. Top right: Medium gift box (size: 80px) */}
            <motion.div
                style={{ y: yClose }}
                animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-[20%] right-[15%] text-[80px] drop-shadow-xl opacity-90"
            >
                🎁
            </motion.div>

            {/* 3. Left side: Large star (size: 100px) - behind the content */}
            <motion.div
                style={{ y: yFar }}
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="absolute top-[45%] left-[5%] text-[100px] drop-shadow-2xl opacity-60 -z-10 hidden sm:block"
            >
                ⭐
            </motion.div>

            {/* 4. Right side: Small crown (size: 50px) - with subtle rotation */}
            <motion.div
                style={{ y: yMid }}
                animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute top-[50%] right-[8%] text-[50px] drop-shadow-md opacity-80 hidden sm:block"
            >
                👑
            </motion.div>

            {/* 5. Bottom left: Medium heart (size: 60px) */}
            <motion.div
                style={{ y: yClose }}
                animate={{ y: [0, -25, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute bottom-[20%] left-[15%] text-[60px] drop-shadow-xl opacity-80 hidden md:block"
            >
                ❤️
            </motion.div>

            {/* 6. Bottom right: Small coins stack (size: 45px) - slightly blurred */}
            <motion.div
                style={{ y: yMid }}
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute bottom-[15%] right-[20%] text-[45px] drop-shadow-lg opacity-70 blur-[1px] hidden sm:block"
            >
                🪙
            </motion.div>

            {/* 7. Far top right: Tiny star (size: 30px) - very blurred */}
            <motion.div
                style={{ y: yFar }}
                animate={{ y: [0, 10, 0], rotate: [0, 20, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
                className="absolute top-[10%] right-[30%] text-[30px] drop-shadow-sm opacity-50 blur-[3px]"
            >
                ⭐
            </motion.div>

            {/* 8. Far bottom left: Tiny gift (size: 35px) - very blurred */}
            <motion.div
                style={{ y: yFar }}
                animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                className="absolute bottom-[10%] left-[30%] text-[35px] drop-shadow-md opacity-50 blur-[2px] hidden sm:block"
            >
                🎁
            </motion.div>
        </div>
    );
}

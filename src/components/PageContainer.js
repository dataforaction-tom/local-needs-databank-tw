import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function PageContainer({ children }) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, enter: { opacity: 1 }, exit: { opacity: 0 } }
    : { hidden: { opacity: 0, y: 12 }, enter: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.div>
  );
}

export default PageContainer;



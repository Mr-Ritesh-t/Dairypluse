'use client';

import React, { useState } from 'react';
import { Star, X, ThumbsUp, Sparkles, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DriverRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverId?: string;
  deliveryId?: string;
  customerId?: string;
  customerName: string;
  currentRating?: number;
  currentFeedback?: string;
  onSubmitRating: (payload: {
    driverName: string;
    driverId?: string;
    deliveryId?: string;
    customerId?: string;
    customerName: string;
    rating: number;
    tags?: string[];
    feedback?: string;
  }) => Promise<boolean>;
  onSuccess?: () => void;
}

export function DriverRatingModal({
  isOpen,
  onClose,
  driverName,
  driverId,
  deliveryId,
  customerId,
  customerName,
  currentRating = 5,
  currentFeedback = '',
  onSubmitRating,
  onSuccess,
}: DriverRatingModalProps) {
  const [rating, setRating] = useState<number>(currentRating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 1:
        return 'Needs Significant Improvement';
      case 2:
        return 'Fair - Service was okay';
      case 3:
        return 'Good Doorstep Service';
      case 4:
        return 'Very Good & Prompt';
      case 5:
        return 'Outstanding & Exceptional!';
      default:
        return 'Select a rating';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmitRating({
        driverName,
        driverId,
        deliveryId,
        customerId,
        customerName,
        rating,
        feedback: feedback.trim(),
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Header with Rider Identity */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-3.5">
                <motion.div
                  initial={{ scale: 0.8, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner"
                >
                  🛵
                </motion.div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Rate Delivery Partner
                  </span>
                  <h3 className="text-xl font-extrabold text-white leading-tight">
                    {driverName}
                  </h3>
                  <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified DairyPulse Fleet Partner</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs"
                >
                  <Heart className="w-8 h-8 fill-emerald-600" />
                </motion.div>
                <h4 className="font-extrabold text-lg text-slate-900">Thank You for Rating!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your feedback helps {driverName} maintain top-tier morning delivery standards for your doorstep.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Interactive Star Rating */}
                <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-600 block">
                    How was your doorstep delivery experience?
                  </span>

                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating !== null ? hoverRating : rating) >= star;
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          whileHover={{ scale: 1.25, rotate: 6 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                          className="p-1 focus:outline-hidden cursor-pointer"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              isActive
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                : 'text-slate-300 hover:text-amber-200'
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="text-xs font-extrabold text-emerald-800 tracking-tight">
                    {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
                  </div>
                </div>

                {/* Feedback Note Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Feedback for {driverName} (Optional)</span>
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Always delivers fresh milk early and keeps the pouch clean!"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition focus:outline-hidden"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useState } from 'react';
import { Star, X, Check, ThumbsUp, Sparkles, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

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

const COMPLIMENT_TAGS = [
  '⚡ Always On Time',
  '🥛 Handled with Care',
  '😊 Polite & Courteous',
  '🚪 Quiet Doorstep Drop',
  '❄️ Cold & Fresh Milk',
  '📍 Perfect GPS Location',
];

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState(currentFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
        tags: selectedTags,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header with Rider Identity */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🛵
            </div>
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
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <Heart className="w-8 h-8 fill-emerald-600" />
            </div>
            <h4 className="font-extrabold text-lg text-slate-900">Thank You for Rating!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your feedback helps {driverName} maintain top-tier morning delivery standards for your doorstep.
            </p>
          </div>
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
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-120 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isActive
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-extrabold text-emerald-800 tracking-tight">
                {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
              </div>
            </div>

            {/* Compliment Tag Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                What did {driverName} do well?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMPLIMENT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Written Review */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Always delivers quietly before 6:30 AM without ringing bell. Very polite!"
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


'use client';

import React, { useEffect } from 'react';

interface PageHeadProps {
  title: string;
  description?: string;
}

export function PageHead({ title, description }: PageHeadProps) {
  const fullTitle = title.includes('DairyPulse') ? title : `${title} | DairyPulse`;

  useEffect(() => {
    document.title = fullTitle;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [fullTitle, description]);

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </>
  );
}

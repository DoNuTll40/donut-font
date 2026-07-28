'use client';

import React, { useState } from 'react';
import ApiDocsView from '../../components/ApiDocsView';
import { fontCatalog } from '../../data/fontCatalog';

export default function DocsPage() {
  return (
    <main className="min-h-screen pb-20">
      <ApiDocsView fontCatalog={fontCatalog} />
    </main>
  );
}

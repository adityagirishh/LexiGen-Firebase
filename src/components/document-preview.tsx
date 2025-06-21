import React from 'react';
import type { MemoResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentPreviewProps {
  analysis: MemoResult;
}

const keywords = [
  'patent infringement',
  'intellectual property dispute',
  'trade secret misappropriation',
  'claim construction',
  'U.S. Patent No. 9,876,543',
  'DataFlow Inc. v. Syncer',
  'Tectron Corp. v. InfoSys',
  'substantial likelihood of success',
];

const highlightText = (text: string) => {
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/70 rounded px-1 py-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ analysis }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{analysis.memo.title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none text-muted-foreground flex-1 overflow-y-auto">
        <div className="space-y-4">
          {analysis.memo.sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
              <p className="mt-0">{highlightText(section.content)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;

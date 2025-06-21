import type { Analysis, CaseDocument, MemoResult } from './types';

export const mockAnalyses: Analysis[] = [
  {
    id: 'case-001',
    caseName: 'Innovate Corp vs. Tech Solutions',
    date: '2023-10-26',
    status: 'Completed',
  },
  {
    id: 'case-002',
    caseName: 'Quantum Dynamics Patent Dispute',
    date: '2023-10-24',
    status: 'Completed',
  },
  {
    id: 'case-003',
    caseName: 'Greenfield Real Estate Zoning',
    date: '2023-10-22',
    status: 'Completed',
  },
  {
    id: 'case-004',
    caseName: 'Apex Logistics Contract Breach',
    date: '2023-10-21',
    status: 'Failed',
  },
];

export const mockMemoResult: MemoResult = {
  memo: {
    title: 'Innovate Corp vs. Tech Solutions - Preliminary Memo',
    sections: [
      {
        title: 'I. Introduction',
        content:
          'This memorandum outlines the preliminary findings in the intellectual property dispute between Innovate Corp ("Plaintiff") and Tech Solutions ("Defendant"). The core of the dispute revolves around the alleged infringement of Plaintiff\'s patented "Dynamic Data Syncing" technology (U.S. Patent No. 9,876,543).',
      },
      {
        title: 'II. Statement of Facts',
        content:
          'On June 1, 2022, Tech Solutions launched a new software suite, "SyncMaster," which incorporates a data synchronization feature. Innovate Corp alleges that this feature is a direct implementation of their patented technology. Our initial analysis of SyncMaster\'s public documentation and performance suggests a strong similarity in functionality and methodology to the patented technology.',
      },
      {
        title: 'III. Legal Analysis & Key Issues',
        content:
          'The primary legal issue is patent infringement under 35 U.S.C. § 271. The analysis will hinge on claim construction of U.S. Patent No. 9,876,543 and a subsequent infringement analysis. A secondary issue involves potential trade secret misappropriation under the Defend Trade Secrets Act, given that three former Innovate Corp engineers were hired by Tech Solutions in January 2022.',
      },
      {
        title: 'IV. Relevant Precedents',
        content:
          'The case of "DataFlow Inc. v. Syncer" (2019) provides a strong precedent for a broad interpretation of claims related to real-time data synchronization. Additionally, "Tectron Corp. v. InfoSys" (2021) established a low bar for proving access to trade secrets when employee migration is involved. These cases suggest a favorable legal environment for Innovate Corp\'s claims.',
      },
      {
        title: 'V. Preliminary Conclusion & Recommendations',
        content:
          'Based on the initial evidence, there is a substantial likelihood of success on the merits for Innovate Corp\'s patent infringement claim. The trade secret claim requires further investigation into the activities of the former employees. We recommend proceeding with a formal complaint and initiating the discovery process to obtain SyncMaster\'s source code and internal development documents.',
      },
    ],
  },
  summary:
    'The case involves a patent infringement claim by Innovate Corp against Tech Solutions regarding "Dynamic Data Syncing" technology. A secondary claim of trade secret misappropriation exists due to recent employee migration. Precedents are favorable, and legal action is recommended.',
  identifiedLaws: [
    { name: '35 U.S.C. § 271 - Infringement of patent', url: '#' },
    { name: 'Defend Trade Secrets Act of 2016', url: '#' },
    { name: 'Lanham Act - Trademark Infringement', url: '#' },
    { name: 'Copyright Act of 1976', url: '#' },
  ],
  similarCases: [
    {
      id: 'sc-01',
      name: 'DataFlow Inc. v. Syncer (2019)',
      summary:
        'Established a broad interpretation for claims related to real-time data synchronization technologies, favoring the patent holder.',
    },
    {
      id: 'sc-02',
      name: 'Tectron Corp. v. InfoSys (2021)',
      summary:
        'Lowered the evidentiary standard for proving access to trade secrets in cases involving the hiring of a competitor\'s former employees.',
    },
    {
      id: 'sc-03',
      name: 'Connective v. NetLink (2018)',
      summary:
        'A case where the court ruled against the plaintiff due to overly broad and non-specific patent claims, highlighting the importance of clear claim construction.',
    },
     {
      id: 'sc-04',
      name: 'ByteCorp v. LogicWare (2020)',
      summary:
        'This case addressed the "doctrine of equivalents" in software patent law, providing a framework for how functionally similar but non-identical code can still be found to be infringing.',
    },
  ],
};

export const mockDocuments: CaseDocument[] = [
    { id: 'doc-001', name: 'InnovateCorp_Complaint.pdf', uploadDate: '2023-10-15', type: 'PDF', size: '2.3 MB' },
    { id: 'doc-002', name: 'TechSolutions_Response.docx', uploadDate: '2023-10-20', type: 'DOCX', size: '850 KB' },
    { id: 'doc-003', name: 'Expert_Witness_Report.pdf', uploadDate: '2023-11-02', type: 'PDF', size: '5.1 MB' },
    { id: 'doc-004', name: 'Meeting_Notes.txt', uploadDate: '2023-09-28', type: 'TXT', size: '15 KB' },
    { id: 'doc-005', name: 'Patent_US9876543.pdf', uploadDate: '2023-09-01', type: 'PDF', size: '1.8 MB' },
];

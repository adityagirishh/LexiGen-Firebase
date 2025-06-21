export type Analysis = {
  id: string;
  caseName: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Failed';
};

export type MemoResult = {
  memo: {
    title: string;
    sections: { title:string; content: string }[];
  };
  summary: string;
  identifiedLaws: { name: string; url: string }[];
  similarCases: { id: string; name: string; summary: string }[];
};

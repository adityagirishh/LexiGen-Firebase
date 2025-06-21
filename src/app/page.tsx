"use client";

import * as React from "react";
import {
  ChevronRight,
  FileDown,
  PlusCircle,
  Search,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { Analysis, MemoResult } from "@/lib/types";
import { mockAnalyses, mockMemoResult } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import DocumentPreview from "@/components/document-preview";
import { generateDocumentEmbedding } from "@/ai/flows/generate-document-embedding";
import { retrieveSimilarCases } from "@/ai/flows/retrieve-similar-cases";
import { generatePreliminaryMemo } from "@/ai/flows/generate-preliminary-memo";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const loadingSteps = [
  { text: "Uploading document securely..." },
  { text: "Embedding document..." },
  { text: "Retrieving similar cases..." },
  { text: "Generating preliminary memo..." },
  { text: "Finalizing analysis..." },
];

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [analysisResult, setAnalysisResult] =
    React.useState<MemoResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] =
    React.useState<Analysis[]>(mockAnalyses);
  const [similarCases, setSimilarCases] = React.useState(mockMemoResult.similarCases);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [userInstructions, setUserInstructions] = React.useState("");
  const [isFirebaseConfigured, setIsFirebaseConfigured] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    // Check if storage object is not empty, indicating Firebase has been configured.
    setIsFirebaseConfigured(Object.keys(storage).length > 0);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a document to start the analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setProgress(0);
    setAnalysisResult(null);

    const newAnalysis: Analysis = {
      id: `case-00${recentAnalyses.length + 1}`,
      caseName: selectedFile.name,
      date: new Date().toLocaleDateString(),
      status: "In Progress",
    };
    setRecentAnalyses([newAnalysis, ...recentAnalyses]);

    try {
      // Step 1: Upload file to Firebase Storage
      setLoadingStep(0);
      const storageRef = ref(storage, `documents/${Date.now()}-${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const documentUrl = await getDownloadURL(storageRef);
      setProgress(20);

      // Step 2: Generate embedding from the uploaded file's URL
      setLoadingStep(1);
      const documentText = await selectedFile.text();
      const embeddingResponse = await generateDocumentEmbedding({ documentUrl });
      setProgress(40);

      // Step 3: Retrieve similar cases
      setLoadingStep(2);
      await retrieveSimilarCases({ documentEmbedding: embeddingResponse.embedding });
      const similarCaseSummaries = mockMemoResult.similarCases.slice(0, 3).map(c => `${c.name}: ${c.summary}`);
      setProgress(60);

      // Step 4: Generate preliminary memo
      setLoadingStep(3);
      const memoResponse = await generatePreliminaryMemo({
        documentText,
        similarCases: similarCaseSummaries,
        userInstructions: userInstructions,
      });
      setProgress(80);

      // Step 5: Finalize and display
      setLoadingStep(4);
      const finalResult: MemoResult = {
        memo: {
          title: `Preliminary Memo for ${selectedFile.name}`,
          sections: [{ title: 'Preliminary Memorandum', content: memoResponse.preliminaryMemo }],
        },
        summary: memoResponse.summary,
        identifiedLaws: memoResponse.identifiedLaws.map((law) => ({
          name: law,
          url: '#',
        })),
        similarCases: mockMemoResult.similarCases,
      };
      
      setAnalysisResult(finalResult);
      setProgress(100);
      
      setRecentAnalyses((prev) =>
        prev.map((a) =>
          a.id === newAnalysis.id ? { ...a, status: "Completed" } : a
        )
      );

      toast({
        title: "Analysis Complete",
        description: "Your preliminary case memorandum is ready for review.",
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      let errorMessage = "Something went wrong during the analysis.";
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
            errorMessage = "Upload failed: Check your Firebase Storage security rules."
        } else if (error.message.includes('storage/object-not-found')) {
            errorMessage = "Upload failed: File not found.";
        }
      }

      setRecentAnalyses((prev) =>
        prev.map((a) =>
          a.id === newAnalysis.id ? { ...a, status: "Failed" } : a
        )
      );
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setAnalysisResult(null);
    setSelectedFile(null);
    setUserInstructions("");
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      const filteredCases = mockMemoResult.similarCases.filter(c => 
          c.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          c.summary.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSimilarCases(filteredCases);
  };

  const handleViewAnalysis = (analysis: Analysis) => {
    if (analysis.status === 'Completed') {
      // In a real app, you would fetch the specific analysis result.
      // Here, we'll just use the mock result.
      setAnalysisResult(mockMemoResult);
       toast({
        title: `Loading analysis: ${analysis.caseName}`,
        description: "The analysis details are now being displayed.",
      });
    } else {
        toast({
            title: "Analysis Not Ready",
            description: "This analysis is not yet complete.",
            variant: "destructive"
        });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Generating Analysis
            </CardTitle>
            <CardDescription>
              Please wait while we process your documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {loadingSteps[loadingStep]?.text || "Finalizing..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold font-headline truncate" title={analysisResult.memo.title}>
              {analysisResult.memo.title}
            </h1>
            <p className="text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleBackToDashboard} size="sm">Back to Dashboard</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-2 h-full">
            <DocumentPreview analysis={analysisResult} />
          </div>
          <div className="space-y-6 flex flex-col">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.summary}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Identified Laws
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.identifiedLaws.map((law, index) => (
                    <li key={`${law.name}-${index}`}>
                      <a
                        href={law.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center group"
                      >
                        {law.name}
                        <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader>
                <CardTitle className="font-headline">
                  Similar Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                 <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search cases..." className="pl-10" value={searchTerm} onChange={handleSearch} />
                  </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {similarCases.map((c) => (
                    <div key={c.id}>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.summary}</p>
                    </div>
                  ))}
                   {similarCases.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No cases found.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <Card className="bg-primary-foreground/5 dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">
                Start New Analysis
              </CardTitle>
              <CardDescription>
                Upload documents to generate a preliminary case memo.
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* The button is wrapped in a span to allow the tooltip to show even when disabled */}
                <span>
                  <Button onClick={handleStartAnalysis} disabled={!selectedFile || loading || !isFirebaseConfigured}>
                    <PlusCircle className="mr-2" />
                    Generate Memo with AI
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {!isFirebaseConfigured
                    ? "Firebase is not configured. Please update src/lib/firebase.ts."
                    : !selectedFile
                    ? "Upload a document to start the AI pipeline analysis."
                    : "Generate a preliminary case memorandum with AI."}
                </p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label htmlFor="file-upload" className="block text-sm font-medium">Upload Documents</label>
              <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          {selectedFile ? (
                            <p className="font-semibold text-sm px-2 truncate">{selectedFile.name}</p>
                          ) : (
                            <>
                              <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 10MB)</p>
                            </>
                          )}
                      </div>
                      <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                  </label>
              </div>
            </div>
            <div className="space-y-4">
               <label htmlFor="instructions" className="block text-sm font-medium">User Instructions (Optional)</label>
              <Textarea
                id="instructions"
                placeholder="e.g., Focus on contract law aspects..."
                className="h-32"
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAnalyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">
                      {analysis.caseName}
                    </TableCell>
                    <TableCell>{analysis.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          analysis.status === "Completed"
                            ? "default"
                            : analysis.status === "In Progress"
                            ? "secondary"
                            : "destructive"
                        }
                        className={cn(
                          analysis.status === 'Completed' && 'bg-green-600/20 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-600/20',
                          analysis.status === 'In Progress' && 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
                          analysis.status === 'Failed' && 'bg-red-600/20 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20'
                        )}
                      >
                        {analysis.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewAnalysis(analysis)} disabled={analysis.status !== 'Completed'}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

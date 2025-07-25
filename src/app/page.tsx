
"use client";

import * as React from "react";
import {
  ChevronRight,
  FileDown,
  PlusCircle,
  Search,
  Upload,
  Terminal,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { initializeFirebase } from "@/lib/firebase";
import { ref, uploadBytes } from "firebase/storage";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  const [firebaseConfigState, setFirebaseConfigState] = React.useState<{isConfigured: boolean | null}>({ isConfigured: null });


  const { toast } = useToast();

  React.useEffect(() => {
    const { isConfigured } = initializeFirebase();
    setFirebaseConfigState({ isConfigured });
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
    
    const { storage, isConfigured } = initializeFirebase();
    if (!isConfigured || !storage) {
      const errorMessage = "Your Firebase credentials are not loading correctly. Open the developer console for details and ensure all NEXT_PUBLIC_ variables are set in your .env file before RESTARTING your server.";
      toast({
        title: "Firebase Configuration Error",
        description: errorMessage,
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
      setProgress(20);

      // Step 2: Generate embedding from the file's data URI
      setLoadingStep(1);
      const documentText = await selectedFile.text();
      const documentDataUri = await fileToDataUri(selectedFile);
      const embeddingResponse = await generateDocumentEmbedding({ documentDataUri });
      setProgress(40);

      // Step 3: Retrieve similar cases
      setLoadingStep(2);
      const retrievedCasesResponse = await retrieveSimilarCases({ documentEmbedding: embeddingResponse.embedding });
      const similarCaseSummaries = retrievedCasesResponse.similarCases.map(c => `${c.name}: ${c.summary}`);
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
          name: law
        })),
        similarCases: retrievedCasesResponse.similarCases,
      };
      
      setAnalysisResult(finalResult);
      setSimilarCases(retrievedCasesResponse.similarCases);
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
      let errorMessage = "An unexpected error occurred during the analysis.";
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
            errorMessage = "Upload failed: Permission denied. Please check your Firebase Storage security rules in the Firebase Console to ensure you have write access."
        } else if (error.message.includes('storage/object-not-found')) {
            errorMessage = "Upload failed: The file could not be found after upload.";
        } else if (error.message.includes('network')) {
          errorMessage = "A network error occurred. Please check your internet connection and try again."
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
      const currentCases = analysisResult ? analysisResult.similarCases : mockMemoResult.similarCases;
      const filteredCases = currentCases.filter(c => 
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
      setSimilarCases(mockMemoResult.similarCases);
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
                        href="#"
                        onClick={(e) => e.preventDefault()}
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

        {firebaseConfigState.isConfigured === false && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Action Required: Configure Firebase</AlertTitle>
              <AlertDescription>
                <p>Your application is not connected to Firebase because the required environment variables are missing.</p>
                <p className="mt-2">Please create a <strong>.env</strong> file in your project's root directory (the same folder that contains `package.json`), paste the following content into it, and replace the placeholder values with your actual Firebase project credentials:</p>
                <pre className="mt-2 p-3 bg-muted/50 rounded-md font-mono text-xs overflow-x-auto">
                  {`NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_APP_ID=your_app_id`}
                </pre>
                 <div className="mt-4 p-3 rounded-md bg-background border border-destructive/50">
                  <p className="font-bold text-destructive">
                    <strong className="uppercase">Important:</strong> You must restart the server!
                  </p>
                  <p className="text-destructive/90 mt-1">
                    After creating or updating the <code>.env</code> file, you have to completely stop and restart the development server for it to load your credentials.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
        )}
        
        <Card className={cn("bg-primary-foreground/5 dark:bg-card", firebaseConfigState.isConfigured === false && "opacity-50 pointer-events-none")}>
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
                  <Button onClick={handleStartAnalysis} disabled={!selectedFile || loading}>
                    <PlusCircle className="mr-2" />
                    Generate Memo with AI
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {!selectedFile
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

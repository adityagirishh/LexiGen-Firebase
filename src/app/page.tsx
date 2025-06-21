"use client";

import * as React from "react";
import {
  Briefcase,
  ChevronRight,
  Copy,
  FileDown,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Search,
  Settings,
  Upload,
  User,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/logo";
import type { Analysis, MemoResult } from "@/lib/types";
import { mockAnalyses, mockMemoResult } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const loadingSteps = [
  { text: "Embedding document...", duration: 2000 },
  { text: "Retrieving similar cases...", duration: 3000 },
  { text: "Generating preliminary memo...", duration: 4000 },
  { text: "Finalizing analysis...", duration: 1000 },
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

  const { toast } = useToast();

  const handleStartAnalysis = async () => {
    setLoading(true);
    setLoadingStep(0);
    setProgress(0);

    const newAnalysis: Analysis = {
      id: `case-00${recentAnalyses.length + 1}`,
      caseName: `New Case Analysis #${recentAnalyses.length + 1}`,
      date: new Date().toLocaleDateString(),
      status: "In Progress",
    };
    setRecentAnalyses([newAnalysis, ...recentAnalyses]);

    let cumulativeDuration = 0;
    const totalDuration = loadingSteps.reduce(
      (acc, step) => acc + step.duration,
      0
    );

    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      const step = loadingSteps[i];
      const start = Date.now();
      while (Date.now() - start < step.duration) {
        const elapsed = Date.now() - start;
        const stepProgress = (elapsed / step.duration) * (step.duration / totalDuration) * 100;
        const overallProgress = (cumulativeDuration / totalDuration) * 100 + stepProgress;
        setProgress(overallProgress);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      cumulativeDuration += step.duration;
    }

    setRecentAnalyses((prev) =>
      prev.map((a) =>
        a.id === newAnalysis.id ? { ...a, status: "Completed" } : a
      )
    );
    setLoading(false);
    setAnalysisResult(mockMemoResult);
    toast({
      title: "Analysis Complete",
      description: "Your preliminary case memorandum is ready for review.",
    });
  };

  const handleBackToDashboard = () => {
    setAnalysisResult(null);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      const filteredCases = mockMemoResult.similarCases.filter(c => 
          c.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          c.summary.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSimilarCases(filteredCases);
  };

  const renderContent = () => {
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
                  {loadingSteps[loadingStep]?.text}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (analysisResult) {
      return (
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-headline">
                {analysisResult.memo.title}
              </h1>
              <p className="text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileDown className="mr-2" />
                Export
              </Button>
              <Button onClick={handleBackToDashboard} size="sm">Back to Dashboard</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Preliminary Case Memorandum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible defaultValue="item-0">
                    {analysisResult.memo.sections.map((section, index) => (
                      <AccordionItem
                        value={`item-${index}`}
                        key={index}
                      >
                        <AccordionTrigger className="font-semibold text-left">
                          {section.title}
                        </AccordionTrigger>
                        <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                          <p>{section.content}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Refine Memorandum
                  </CardTitle>
                  <CardDescription>
                    Provide feedback to improve the generated memo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="e.g., 'Expand on the precedent set by Smith v. Jones...'"/>
                </CardContent>
                <CardFooter>
                  <Button>Refine with AI</Button>
                </CardFooter>
              </Card>
            </div>
            <div className="space-y-6">
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
                    {analysisResult.identifiedLaws.map((law) => (
                      <li key={law.name}>
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

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Similar Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search cases..." className="pl-10" value={searchTerm} onChange={handleSearch} />
                    </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
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
                <Button onClick={handleStartAnalysis}>
                  <PlusCircle className="mr-2" />
                  Generate Memo with AI
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  This will start the AI pipeline to analyze your documents.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label htmlFor="file-upload" className="block text-sm font-medium">Upload Documents</label>
              <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 10MB)</p>
                      </div>
                      <Input id="file-upload" type="file" className="hidden" />
                  </label>
              </div>
            </div>
            <div className="space-y-4">
               <label htmlFor="instructions" className="block text-sm font-medium">User Instructions (Optional)</label>
              <Textarea
                id="instructions"
                placeholder="e.g., Focus on contract law aspects..."
                className="h-32"
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
                          analysis.status === 'In Progress' && 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20'
                        )}
                      >
                        {analysis.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled={analysis.status !== 'Completed'}>
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
    );
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
                <Logo className="w-8 h-8 text-primary" />
                <h1 className="font-headline text-xl font-bold">LexiGen</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Briefcase />
                  Cases
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText />
                  Documents
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <Separator className="my-2"/>
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="professional headshot"/>
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">Jane Doe</span>
                    <span className="text-xs text-muted-foreground">jane.doe@lawfirm.com</span>
                </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{renderContent()}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}

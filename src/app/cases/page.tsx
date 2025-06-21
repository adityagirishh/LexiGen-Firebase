import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { mockAnalyses } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function CasesPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Cases</h1>
        <p className="text-muted-foreground mt-2">
          Manage and review your cases here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
          <CardDescription>A complete list of your cases.</CardDescription>
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
              {mockAnalyses.map((analysis) => (
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
                    <Button variant="outline" size="sm">
                      View Details
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
}

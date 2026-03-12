"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Check, X, FileText, Download, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getApplications, updateApplication, type Application } from "@/lib/storage"

interface ApplicationsTableProps {
  limit?: number
}

export function ApplicationsTable({ limit }: ApplicationsTableProps) {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    setLoading(true)
    const allApplications = getApplications()

    const sortedApplications = allApplications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    const limitedApplications = limit ? sortedApplications.slice(0, limit) : sortedApplications

    setApplications(limitedApplications)
    setLoading(false)
  }, [limit])

  const handleViewApplication = (applicationId: string) => {
    toast({
      title: "Viewing application",
      description: `Opening application ${applicationId} for review.`,
    })
  }

  const handleViewDocuments = (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId)
    if (application) {
      setSelectedApplication(application)
      setDocumentsModalOpen(true)
    }
  }

  const handleApproveApplication = (applicationId: string) => {
    const updatedApplication = updateApplication(applicationId, { status: "approved" })

    if (updatedApplication) {
      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: "approved" } : app)))

      toast({
        title: "Application approved",
        description: `Application ${applicationId} has been approved.`,
        variant: "success",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectApplication = (applicationId: string) => {
    const updatedApplication = updateApplication(applicationId, { status: "rejected" })

    if (updatedApplication) {
      setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: "rejected" } : app)))

      toast({
        title: "Application rejected",
        description: `Application ${applicationId} has been rejected.`,
        variant: "default",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Application ID</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[250px]">Course</TableHead>
              <TableHead className="w-[200px]">School</TableHead>
              <TableHead className="w-[120px]">Year Level</TableHead>
              <TableHead className="w-[150px]">Location</TableHead>
              <TableHead className="w-[140px]">Date Applied</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No applications found. Students need to apply for scholarships to see them here.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium w-[120px] font-mono text-sm">{application.id}</TableCell>
                  <TableCell className="w-[200px] font-medium">{application.fullName}</TableCell>
                  <TableCell className="w-[250px] text-sm">{application.course}</TableCell>
                  <TableCell className="w-[200px] text-sm">{application.school}</TableCell>
                  <TableCell className="w-[120px] text-sm">{application.yearLevel}</TableCell>
                  <TableCell className="w-[150px] text-sm text-muted-foreground">{application.barangay}</TableCell>
                  <TableCell className="w-[140px] text-sm">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <Badge
                      variant={
                        application.status === "approved"
                          ? "success"
                          : application.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[80px] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDocuments(application.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleApproveApplication(application.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRejectApplication(application.id)}>
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={documentsModalOpen} onOpenChange={setDocumentsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Student Documents - {selectedApplication?.fullName}
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-emerald-800">Application ID:</span>
                    <p className="text-emerald-700">{selectedApplication.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-800">Course:</span>
                    <p className="text-emerald-700">{selectedApplication.course}</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-800">School:</span>
                    <p className="text-emerald-700">{selectedApplication.school}</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-800">Date Applied:</span>
                    <p className="text-emerald-700">{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Academic Records
                    </h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Official transcript and grades</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: <span className="text-green-600 font-medium">Verified</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Financial Documents
                    </h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Income statements and tax documents</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: <span className="text-green-600 font-medium">Verified</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Identification
                    </h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Valid government-issued ID</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: <span className="text-green-600 font-medium">Verified</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      Enrollment Certificate
                    </h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Current enrollment verification</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: <span className="text-green-600 font-medium">Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setDocumentsModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    toast({
                      title: "Documents verified",
                      description: `All documents for ${selectedApplication.fullName} have been verified.`,
                    })
                  }}
                >
                  Mark as Verified
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

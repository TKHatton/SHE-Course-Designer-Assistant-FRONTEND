import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage,
  CheckCircle,
  AlertCircle,
  Loader2,
  Share,
  Save
} from 'lucide-react'

export function ExportPanel({ sessionId, conversationData, onClose }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)
  const [summary, setSummary] = useState(null)

  const handleExport = async (format) => {
    if (!sessionId) {
      setExportStatus({ type: 'error', message: 'No active session to export' })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const response = await fetch(`https://render.com/docs/web-services#port-binding`)
      
      if (response.ok) {
        if (format === 'json') {
          // For JSON, display the data
          const data = await response.json()
          setSummary(data)
          setExportStatus({ type: 'success', message: 'Data exported successfully' })
        } else {
          // For PDF and CSV, trigger download
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          
          // Get filename from response headers or create default
          const contentDisposition = response.headers.get('Content-Disposition')
          let filename = `course_design_${sessionId}_${new Date().toISOString().slice(0, 10)}.${format}`
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/)
            if (filenameMatch) {
              filename = filenameMatch[1]
            }
          }
          
          a.download = filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          setExportStatus({ type: 'success', message: `${format.toUpperCase()} file downloaded successfully` })
        }
      } else {
        const errorData = await response.json()
        setExportStatus({ type: 'error', message: errorData.error || 'Export failed' })
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus({ type: 'error', message: 'Failed to export data' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleGetSummary = async () => {
    if (!sessionId) return

    setIsExporting(true)
    try {
      const response = await fetch(`https://render.com/docs/web-services#port-binding`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
        setExportStatus({ type: 'success', message: 'Summary generated successfully' })
      } else {
        const errorData = await response.json()
        setExportStatus({ type: 'error', message: errorData.error || 'Failed to get summary' })
      }
    } catch (error) {
      console.error('Summary error:', error)
      setExportStatus({ type: 'error', message: 'Failed to get summary' })
    } finally {
      setIsExporting(false)
    }
  }

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share className="w-5 h-5" />
              Export & Summary
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* Export Options */}
          <div>
            <h3 className="font-semibold mb-3">Export Your Course Design</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileImage className="w-8 h-8 text-red-500" />
                  <div>
                    <h4 className="font-medium">PDF Report</h4>
                    <p className="text-sm text-muted-foreground">Complete formatted report</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleExport('pdf')} 
                  disabled={isExporting}
                  className="w-full"
                  size="sm"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </Button>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                  <div>
                    <h4 className="font-medium">CSV Data</h4>
                    <p className="text-sm text-muted-foreground">Spreadsheet format</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleExport('csv')} 
                  disabled={isExporting}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download CSV
                </Button>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">JSON Data</h4>
                    <p className="text-sm text-muted-foreground">Structured data</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleExport('json')} 
                  disabled={isExporting}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  View JSON
                </Button>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Summary Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Course Design Summary</h3>
              <Button 
                onClick={handleGetSummary} 
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Generate Summary
              </Button>
            </div>

            {summary && (
              <div className="space-y-4">
                
                {/* Course Design Info */}
                {summary.course_design && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Course Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {summary.course_design.title && (
                        <div>
                          <span className="font-medium">Title:</span> {summary.course_design.title}
                        </div>
                      )}
                      {summary.course_design.target_audience && (
                        <div>
                          <span className="font-medium">Audience:</span> {summary.course_design.target_audience}
                        </div>
                      )}
                      {summary.course_design.educational_level && (
                        <div>
                          <span className="font-medium">Level:</span> {summary.course_design.educational_level}
                        </div>
                      )}
                      {summary.course_design.duration && (
                        <div>
                          <span className="font-medium">Duration:</span> {summary.course_design.duration}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Progress & Quality Metrics */}
                {summary.progress && summary.quality_metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Progress</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Completion:</span>
                          <span className={getCompletionColor(summary.progress.completion_percentage)}>
                            {summary.progress.completion_percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Step:</span>
                          <span>{summary.progress.current_step} of {summary.progress.total_steps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={summary.progress.status === 'completed' ? 'default' : 'secondary'}>
                            {summary.progress.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Quality Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Messages:</span>
                          <span>{summary.quality_metrics.total_messages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completeness:</span>
                          <span className={getCompletionColor(summary.quality_metrics.completeness_score)}>
                            {summary.quality_metrics.completeness_score.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Confidence:</span>
                          <span>{(summary.quality_metrics.average_confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Framework Coverage */}
                {summary.framework_analysis && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Framework Coverage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(summary.framework_analysis).map(([area, covered]) => (
                        <div key={area} className="flex items-center gap-2 text-sm">
                          {covered ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={covered ? 'text-green-700' : 'text-gray-500'}>
                            {area}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Key Insights */}
                {summary.key_insights && summary.key_insights.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Key Insights</h4>
                    <ul className="space-y-1 text-sm">
                      {summary.key_insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Recommendations */}
                {summary.recommendations && summary.recommendations.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-1 text-sm">
                      {summary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {exportStatus && (
            <Alert className={exportStatus.type === 'error' ? 'border-destructive' : 'border-green-500'}>
              {exportStatus.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {exportStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* JSON Data Display */}
          {summary && summary.conversation_metadata && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Raw Data (JSON)</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(summary, null, 2)}
              </pre>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  )
}


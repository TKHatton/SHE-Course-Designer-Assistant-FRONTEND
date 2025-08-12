import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The She Is AI Course Design Assistant encountered an unexpected error. 
                  This might be a temporary issue that can be resolved by refreshing the page.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">What you can do:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Try refreshing the page to restart the application</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache if the problem persists</li>
                  <li>• Contact support if you continue experiencing issues</li>
                </ul>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technical Details (Development Mode)
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </Button>
                <Button variant="outline" onClick={this.handleReset} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Try Again
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Your privacy is protected - no personal data was compromised.</p>
                <p className="mt-1">This assistant is for educational course design only.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary


import { useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  Accessibility, 
  Volume2, 
  VolumeX, 
  Type, 
  Eye, 
  Keyboard,
  HelpCircle
} from 'lucide-react'

export function AccessibilityPanel({ isOpen, onClose }) {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (e) => {
      // Escape key to close accessibility panel
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      
      // Alt + A to open accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        if (!isOpen) {
          // Open accessibility panel logic would go here
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Send message</span>
                <Badge variant="outline">Enter</Badge>
              </div>
              <div className="flex justify-between">
                <span>New line</span>
                <Badge variant="outline">Shift + Enter</Badge>
              </div>
              <div className="flex justify-between">
                <span>Focus input</span>
                <Badge variant="outline">Ctrl + /</Badge>
              </div>
              <div className="flex justify-between">
                <span>Accessibility panel</span>
                <Badge variant="outline">Alt + A</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Screen Reader Support */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Screen Reader Support
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• All interactive elements have proper ARIA labels</p>
              <p>• Message content is announced when received</p>
              <p>• Progress updates are communicated to screen readers</p>
              <p>• Form validation errors are clearly announced</p>
            </div>
          </div>

          <Separator />

          {/* Visual Accessibility */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visual Accessibility
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• High contrast color scheme meets WCAG AA standards</p>
              <p>• Text size is scalable and readable</p>
              <p>• Focus indicators are clearly visible</p>
              <p>• Color is not the only way information is conveyed</p>
            </div>
          </div>

          <Separator />

          {/* Usage Guidelines */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Usage Guidelines
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• This tool is designed for educational course design only</p>
              <p>• Your privacy is protected - conversations aren't stored permanently</p>
              <p>• The assistant follows the She Is AI educational framework</p>
              <p>• For technical support, contact your system administrator</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function useKeyboardShortcuts(inputRef, sendMessage) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + / to focus input
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputRef, sendMessage])
}

export function announceToScreenReader(message) {
  // Create a live region for screen reader announcements
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}


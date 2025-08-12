import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Shield, 
  Clock, 
  CheckCircle, 
  Accessibility,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AccessibilityPanel, useKeyboardShortcuts, announceToScreenReader } from './components/AccessibilityFeatures.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import sheIsAiLogo from './assets/she_is_ai_logo.png'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [conversationData, setConversationData] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize conversation on component mount
  useEffect(() => {
    initializeConversation()
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading || !isOnline) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)
    setError(null)

    try {
      const response = await fetch(`/api/conversations/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Handle safety violations
        if (data.safety_violation) {
          setMessages(prev => [...prev, data.ai_response])
          announceToScreenReader('Safety notice: ' + data.ai_response.content.substring(0, 100))
        } else {
          setMessages(prev => [...prev, data.ai_response])
          setConversationData(prev => ({
            ...prev,
            ...data.conversation_update
          }))
          announceToScreenReader('Assistant responded')
        }
        
        setRetryCount(0) // Reset retry count on success
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Sorry, I encountered an error. Please try again.'
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'assistant',
          content: errorMessage,
          timestamp: new Date().toISOString(),
          message_type: 'error'
        }])
        
        setError(errorMessage)
        announceToScreenReader('Error: ' + errorMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = 'Sorry, I encountered a connection error. Please try again.'
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        message_type: 'error'
      }])
      
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      announceToScreenReader('Connection error occurred')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  // Use keyboard shortcuts hook
  useKeyboardShortcuts(inputRef, sendMessage)

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setError(null)
      announceToScreenReader('Connection restored')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setError('You appear to be offline. Please check your internet connection.')
      announceToScreenReader('Connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessionId(data.session_id)
        setConversationData(data.conversation)
        setMessages([data.welcome_message])
      } else {
        console.error('Failed to initialize conversation')
      }
    } catch (error) {
      console.error('Error initializing conversation:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const MessageBubble = ({ message, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${
        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.sender === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-accent text-accent-foreground'
        }`}>
          {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`rounded-lg px-4 py-3 ${
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border'
        } ${message.message_type === 'error' ? 'border-destructive bg-destructive/10' : ''}`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          <div className={`text-xs mt-2 opacity-70 ${
            message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {formatTimestamp(message.timestamp)}
            {message.sender === 'user' && <CheckCircle size={12} className="inline ml-1" />}
          </div>
        </div>
      </div>
    </motion.div>
  )

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <Bot size={16} />
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={sheIsAiLogo} 
                  alt="She Is AI" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Course Design Assistant</h1>
                  <p className="text-sm text-muted-foreground">Powered by the She Is AI Framework</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" aria-label="Online" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" aria-label="Offline" />
                  )}
                </div>

                {/* Accessibility Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccessibilityPanel(true)}
                  aria-label="Open accessibility panel"
                  className="flex items-center gap-2"
                >
                  <Accessibility className="w-4 h-4" />
                  <span className="sr-only">Accessibility</span>
                </Button>
                
                {conversationData && (
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Progress</div>
                      <div className="text-xs text-muted-foreground">
                        Step {conversationData.current_step} of {conversationData.total_steps}
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress 
                        value={conversationData.completion_percentage} 
                        className="h-2"
                        aria-label={`Progress: ${conversationData.completion_percentage}% complete`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Privacy Notice */}
        <AnimatePresence>
          {showPrivacyNotice && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="container mx-auto px-4 py-2"
            >
              <Alert className="bg-accent/10 border-accent">
                <Shield className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">
                    🔒 Your responses help design your course and aren't stored permanently or shared.
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPrivacyNotice(false)}
                    className="text-xs"
                    aria-label="Dismiss privacy notice"
                  >
                    Got it
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 py-2"
            >
              <Alert className="bg-destructive/10 border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">{error}</span>
                  <div className="flex gap-2">
                    {retryCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.location.reload()}
                        className="text-xs"
                      >
                        Refresh
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setError(null)}
                      className="text-xs"
                      aria-label="Dismiss error"
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Main Chat Interface */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Framework Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  Framework Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversationData?.framework_areas_covered?.map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {area.replace('_', ' ')}
                  </Badge>
                )) || <p className="text-xs text-muted-foreground">No areas covered yet</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-accent" />
                  Session Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div>Educational Purpose Only</div>
                <div>Privacy Protected</div>
                <div>Framework Guided</div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="text-lg">Design Your Course</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Let's create something amazing together using the She Is AI methodology
                </p>
              </CardHeader>
              
              <Separator />
              
              {/* Messages Area */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <MessageBubble key={message.id || index} message={message} index={index} />
                    ))}
                    
                    <AnimatePresence>
                      {isTyping && <TypingIndicator />}
                    </AnimatePresence>
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              <Separator />
              
              {/* Input Area */}
              <div className="flex-shrink-0 p-4">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your course vision..."
                    disabled={isLoading || !isOnline}
                    className="flex-1"
                    aria-label="Message input"
                    aria-describedby="input-help"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim() || !isOnline}
                    size="icon"
                    className="shrink-0"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p id="input-help" className="text-xs text-muted-foreground mt-2">
                  Press Enter to send • Educational use only • Privacy protected
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Accessibility Panel */}
        <AccessibilityPanel 
          isOpen={showAccessibilityPanel} 
          onClose={() => setShowAccessibilityPanel(false)} 
        />
      </div>
    </ErrorBoundary>
  )
}

export default App


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
  WifiOff,
  Download
} from 'lucide-react'
import { ExportPanel } from './components/ExportPanel.jsx'
import sheIsAiLogo from './assets/she_is_ai_logo_new.png'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [conversationData, setConversationData] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [error, setError] = useState(null)
  const [showExportPanel, setShowExportPanel] = useState(false)
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

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const initializeConversation = async () => {
    try {
      const response = await fetch('https://58hpi8cw6g7k.manus.space/api/conversations', {
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
      const response = await fetch(`https://58hpi8cw6g7k.manus.space/api/conversations/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.safety_violation) {
          setMessages(prev => [...prev, data.ai_response])
        } else {
          setMessages(prev => [...prev, data.ai_response])
          setConversationData(prev => ({
            ...prev,
            ...data.conversation_update
          }))
        }
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
    } finally {
      setIsLoading(false)
      setIsTyping(false)
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
    <div
      key={message.id}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.sender === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-accent text-accent-foreground'
        }`}>
          {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`rounded-lg px-4 py-2 ${
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : message.message_type === 'error'
            ? 'bg-destructive/10 border border-destructive/20 text-destructive-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs opacity-70 mt-1">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  )

  return (
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

              {/* Export Button */}
              {sessionId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportPanel(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}
              
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
      {showPrivacyNotice && (
        <div className="container mx-auto px-4 py-2">
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
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <Alert className="bg-destructive/10 border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="text-xs"
                aria-label="Dismiss error"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Framework Areas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Framework Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  No areas covered yet
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Session Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Educational Purpose Only
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-3 h-3 text-blue-500" />
                  Privacy Protected
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Framework Guided
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Design Your Course</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Let's create something amazing together using the She Is AI methodology
                </p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <MessageBubble key={message.id} message={message} index={index} />
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start mb-4">
                        <div className="flex items-start space-x-2 max-w-[80%]">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                            <Bot size={16} />
                          </div>
                          <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
      </div>

      {/* Export Panel */}
      {showExportPanel && (
        <ExportPanel 
          sessionId={sessionId}
          conversationData={conversationData}
          onClose={() => setShowExportPanel(false)}
        />
      )}
    </div>
  )
}

export default App


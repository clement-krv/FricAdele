import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Send,
  Bot,
  User,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import type { ChatMessage, AIResponse } from '../types';

interface AIAssistantProps {
  isModal?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isModal = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModal) {
      loadSuggestions();
    }
  }, [isModal]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await aiAPI.getSuggestions();
      if (response.success) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSendMessage = async (message: string = currentMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await aiAPI.askQuestion(message.trim(), sessionId || undefined);
      
      if (response.success) {
        const aiResponse: AIResponse = response.data;
        
        if (!sessionId) {
          setSessionId(aiResponse.sessionId);
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    handleSendMessage(suggestion);
  };

  const handleSyncData = async () => {
    try {
      setIsLoading(true);
      const response = await aiAPI.syncData();
      if (response.success) {
        toast.success('Données synchronisées avec succès');
      }
    } catch (error: any) {
      console.error('Error syncing data:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => (
        <p key={index} className="mb-2 last:mb-0">
          {line}
        </p>
      ));
  };

  return (
    <div className={isModal ? "h-full flex flex-col" : "min-h-screen bg-gray-50"}>
      {!isModal && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Assistant IA</h1>
                  <p className="text-gray-600 mt-1">
                    Votre conseiller personnel en gestion de budget
                  </p>
                </div>
              </div>
              <button
                onClick={handleSyncData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Synchroniser</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className={isModal ? "flex-1 flex flex-col" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${isModal ? 'h-full flex flex-col' : 'h-[600px] flex flex-col'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showSuggestions && messages.length === 0 && !isModal && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Questions suggérées
                  </h3>
                  <p className="text-gray-600">
                    Voici quelques questions pour commencer :
                  </p>
                </div>
                <div className="grid gap-3 max-w-2xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length === 0 && isModal && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Assistant IA
                </h3>
                <p className="text-gray-600 text-sm">
                  Posez-moi une question sur votre budget !
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    {formatMessage(message.content)}
                  </div>
                  <div className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex space-x-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question sur la gestion de budget..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !currentMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {!isModal && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 L'assistant analyse vos données de dépenses pour vous donner des conseils personnalisés
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
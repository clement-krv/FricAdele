import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Trash2,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clés pour localStorage
  const MESSAGES_STORAGE_KEY = 'ai_assistant_messages';
  const SESSION_STORAGE_KEY = 'ai_assistant_session_id';

  // Sauvegarder les messages dans localStorage
  const saveMessagesToStorage = (messages: ChatMessage[]) => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  // Charger les messages depuis localStorage
  const loadMessagesFromStorage = (): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
      return [];
    }
  };

  // Sauvegarder le sessionId dans localStorage
  const saveSessionIdToStorage = (sessionId: string) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch (error) {
      console.error('Error saving sessionId to localStorage:', error);
    }
  };

  // Charger le sessionId depuis localStorage
  const loadSessionIdFromStorage = (): string | null => {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error loading sessionId from localStorage:', error);
      return null;
    }
  };

  // Effacer la conversation
  const clearConversation = () => {
    setMessages([]);
    setSessionId(null);
    try {
      localStorage.removeItem(MESSAGES_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing conversation from localStorage:', error);
    }
  };

  useEffect(() => {
    // Charger la conversation précédente au démarrage
    const savedMessages = loadMessagesFromStorage();
    const savedSessionId = loadSessionIdFromStorage();
    
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: string = currentMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessagesToStorage([...messages, userMessage]); // Sauvegarder immédiatement
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.askQuestion(message.trim(), sessionId || undefined);
      
      if (response.success) {
        const aiResponse: AIResponse = response.data;
        
        if (!sessionId) {
          setSessionId(aiResponse.sessionId);
          saveSessionIdToStorage(aiResponse.sessionId);
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);
        saveMessagesToStorage(updatedMessages);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.',
        timestamp: new Date().toISOString(),
      };
      
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
      saveMessagesToStorage(updatedMessages);
    } finally {
      setIsLoading(false);
    }
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

  const formatMessage = (content: string, isUserMessage: boolean = false) => {
    return content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        
        // Pour les messages utilisateur, affichage simple en blanc
        if (isUserMessage) {
          if (trimmedLine === '') {
            return <div key={index} className="h-2" />;
          }
          return (
            <p key={index} className="mb-2 last:mb-0 text-white leading-relaxed">
              {line}
            </p>
          );
        }
        
        // Pour les messages de l'assistant, formatage avancé
        
        // Titres avec **
        if (trimmedLine.match(/^\*\*(.+?)\*\*/)) {
          const titleText = trimmedLine.replace(/^\*\*(.+?)\*\*(.*)/, '$1$2');
          return (
            <h4 key={index} className="font-semibold text-gray-900 mt-3 mb-1 first:mt-0">
              {titleText}
            </h4>
          );
        }
        
        // Listes numérotées (1., 2., etc.)
        if (trimmedLine.match(/^\d+\.\s+\*\*/)) {
          const listText = trimmedLine.replace(/^\d+\.\s+\*\*(.+?)\*\*(.*)/, '$1$2');
          return (
            <div key={index} className="mb-2">
              <span className="font-medium text-gray-800">{listText}</span>
            </div>
          );
        }
        
        // Listes avec puces (- ou *)
        if (trimmedLine.match(/^[-*]\s+\*\*/)) {
          const listText = trimmedLine.replace(/^[-*]\s+\*\*(.+?)\*\*(.*)/, '$1$2');
          return (
            <div key={index} className="flex items-start mb-1 ml-2">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <span className="font-medium text-gray-800">{listText}</span>
            </div>
          );
        }
        
        // Listes simples (- ou *)
        if (trimmedLine.match(/^[-*]\s+/)) {
          const listText = trimmedLine.replace(/^[-*]\s+/, '');
          return (
            <div key={index} className="flex items-start mb-1 ml-2">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <span className="text-gray-700">{listText}</span>
            </div>
          );
        }
        
        // Texte en gras **texte**
        if (trimmedLine.includes('**')) {
          const formattedText = trimmedLine.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
          return (
            <p key={index} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedText }} />
          );
        }
        
        // Lignes vides
        if (trimmedLine === '') {
          return <div key={index} className="h-2" />;
        }
        
        // Texte normal
        return (
          <p key={index} className="mb-2 last:mb-0 text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      });
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
      <div className={isModal ? "flex-1 flex flex-col min-h-0" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${isModal ? 'flex-1 flex flex-col min-h-0' : 'h-[600px] flex flex-col'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}>
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

            {messages.length > 0 && isModal && (
              <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {messages.length} message{messages.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={clearConversation}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Effacer</span>
                </button>
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
                  className={`${isModal ? 'max-w-xs' : 'max-w-sm lg:max-w-md xl:max-w-lg'} px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-900 shadow-sm'
                  }`}
                >
                  <div className="text-sm break-words">
                    {formatMessage(message.content, message.role === 'user')}
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
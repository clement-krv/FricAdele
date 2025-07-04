import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import AIAssistant from './AIAssistant';

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <Bot className="w-8 h-8" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Assistant IA
          </div>
        </button>
      )}

      {/* Modal de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header de la modal */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Assistant IA</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenu du chat */}
          <div className="flex-1 overflow-hidden">
            <AIAssistant isModal={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIButton;

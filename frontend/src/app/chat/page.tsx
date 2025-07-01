"use client";

import React, { useState, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Initialiser les messages côté client pour éviter l'erreur d'hydratation
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider avec la recherche de lycées professionnels ?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1,
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulation d'une réponse de l'IA
    setTimeout(() => {
      const botResponse: Message = {
        id: userMessage.id + 1,
        text: generateBotResponse(userMessage.text),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("lycée") || input.includes("formation")) {
      return "Je peux vous aider à trouver des lycées professionnels correspondant à vos critères. Quel secteur d'activité vous intéresse ? (Informatique, Commerce, Industrie, etc.)";
    }

    if (input.includes("informatique") || input.includes("numérique")) {
      return "Parfait ! Pour le secteur informatique, nous avons plusieurs lycées partenaires proposant des formations en développement, réseaux et cybersécurité. Dans quelle région cherchez-vous ?";
    }

    if (input.includes("commerce") || input.includes("vente")) {
      return "Le secteur commerce offre de nombreuses opportunités ! Nos lycées partenaires proposent des formations en vente, marketing et gestion commerciale. Préférez-vous une formation en alternance ?";
    }

    if (input.includes("industrie") || input.includes("mécanique")) {
      return "L'industrie est un secteur porteur ! Nous travaillons avec des lycées proposant des formations en maintenance industrielle, mécanique et automatismes. Quel niveau de formation recherchez-vous ?";
    }

    if (input.includes("aide") || input.includes("help")) {
      return "Je peux vous aider à : \n• Trouver des lycées par secteur d'activité\n• Comprendre les formations disponibles\n• Mettre en relation avec des établissements\n• Répondre à vos questions sur l'alternance\n\nQue souhaitez-vous faire ?";
    }

    return "C'est une excellente question ! Pour vous donner une réponse plus précise, pourriez-vous me dire dans quel domaine vous recherchez des formations ou des partenariats ?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const suggestedQuestions = [
    "Quels lycées proposent des formations en informatique ?",
    "Comment fonctionne l'alternance ?",
    "Quels sont vos partenaires entreprises ?",
    "Comment candidater dans un lycée ?",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
            Assistant virtuel
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Posez vos questions sur les lycées professionnels
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Notre assistant est là pour vous accompagner dans votre recherche de
            formations et partenariats
          </p>
        </div>

        {/* Interface de chat */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Zone des messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start max-w-xs lg:max-w-md space-x-3">
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm"></span>
                      </div>
                    )}

                    <div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">
                          {message.text}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-sm">👤</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Indicateur de frappe */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start max-w-xs lg:max-w-md space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm"></span>
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="border-t border-gray-100 p-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre message..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={1}
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>

              {/* Questions suggérées */}
              {messages.length === 1 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Questions fréquentes :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputText(question)}
                        className="text-left p-3 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations utiles */}
          <div className="mt-8 bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Besoin d&apos;aide ?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <span className="text-blue-600"></span>
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <span className="text-green-600"></span>
                <span>contact@lyceeconnect.gouv.fr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Send, Paperclip, Mic, Bot, User } from "lucide-react";
import type { Conversation, Message } from "@shared/schema";

interface LegalResponse {
  response: string;
  disclaimer?: string;
  suggestedActions?: string[];
  legalReferences?: string[];
}

export function ChatInterface() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "New Conversation"
      });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!currentConversationId) {
        throw new Error("No conversation selected");
      }
      
      const response = await apiRequest("POST", `/api/conversations/${currentConversationId}/messages`, {
        role: "user",
        content: message
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", currentConversationId, "messages"] 
      });
      setInputMessage("");
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!currentConversationId && conversations && conversations.length === 0) {
      createConversationMutation.mutate();
    } else if (!currentConversationId && conversations && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setIsLoading(true);
    sendMessageMutation.mutate(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    
    if (isUser) {
      return (
        <div key={message.id} className="flex justify-end mb-4">
          <div className="mr-3 flex-1 max-w-xs">
            <div className="bg-legal-blue rounded-lg px-4 py-2">
              <p className="text-sm text-white">{message.content}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
          </div>
        </div>
      );
    }

    // Parse AI response
    let legalResponse: LegalResponse;
    try {
      legalResponse = JSON.parse(message.content);
    } catch {
      legalResponse = { response: message.content };
    }

    return (
      <div key={message.id} className="flex mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <div className="bg-gray-100 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {legalResponse.response}
            </p>
            
            {legalResponse.suggestedActions && legalResponse.suggestedActions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Suggested Actions:</p>
                <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                  {legalResponse.suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {legalResponse.legalReferences && legalResponse.legalReferences.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Legal References:</p>
                <div className="flex flex-wrap gap-1">
                  {legalResponse.legalReferences.map((reference, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reference}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {legalResponse.disclaimer && (
              <p className="mt-3 text-xs text-blue-600 font-medium">
                {legalResponse.disclaimer}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="lg:col-span-2 h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{t("legal_ai_assistant")}</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              {t("online")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4 custom-scrollbar">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-800">{t("hello_lexibot")}</p>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>{t("legal_terminology")}</li>
                    <li>{t("basic_legal_procedures")}</li>
                    <li>{t("document_drafting")}</li>
                    <li>{t("case_law_references")}</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">{t("how_can_i_assist")}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {messagesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              messages?.map(renderMessage)
            )}

            {isLoading && (
              <div className="flex mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white animate-pulse" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("type_your_legal_question")}
              className="flex-1 focus:ring-legal-accent focus:border-legal-accent"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-legal-blue hover:bg-legal-blue-dark focus:ring-legal-accent"
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="flex mt-2 space-x-4">
            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center focus-legal">
              <Paperclip size={12} className="mr-1" />
              {t("attach_document")}
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center focus-legal">
              <Mic size={12} className="mr-1" />
              {t("voice_input")}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

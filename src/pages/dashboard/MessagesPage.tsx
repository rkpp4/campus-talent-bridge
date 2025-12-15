import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Send, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  mentor_id: string;
  student_id: string;
  created_at: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message?: {
    message: string;
    created_at: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  file_url: string | null;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      
      // Subscribe to new messages
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${selectedConversation}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_messages (
            message,
            created_at
          )
        `)
        .or(`mentor_id.eq.${profile?.id},student_id.eq.${profile?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherId = conv.mentor_id === profile?.id ? conv.student_id : conv.mentor_id;
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherId)
            .single();

          return {
            ...conv,
            other_user: userData,
            last_message: conv.chat_messages?.[0],
          };
        })
      );

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', profile?.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile?.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || !profile) return;

    try {
      setUploading(true);
      let fileUrl: string | null = null;

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: selectedConversation,
        sender_id: profile.id,
        message: newMessage.trim() || (selectedFile ? `Sent a file: ${selectedFile.name}` : ''),
        file_url: fileUrl,
      });

      if (error) throw error;

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      // Create notification for recipient
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation) {
        const recipientId = conversation.mentor_id === profile.id 
          ? conversation.student_id 
          : conversation.mentor_id;
        
        const notifMessage = selectedFile 
          ? `${profile.full_name} sent you a file`
          : `${profile.full_name} sent you a message: "${newMessage.trim().substring(0, 50)}${newMessage.length > 50 ? '...' : ''}"`;
        
        await supabase.from('notifications').insert({
          user_id: recipientId,
          title: 'New Message',
          message: notifMessage,
        });
      }

      setNewMessage('');
      clearFileSelection();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <div className="w-80 border rounded-lg bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {conv.other_user?.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.other_user?.full_name}</p>
                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border rounded-lg bg-card flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {selectedConv?.other_user?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Avatar>
              <div>
                <p className="font-medium">{selectedConv?.other_user?.full_name}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === profile?.id;
                  const isImage = message.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.file_url && (
                          <div className="mb-2">
                            {isImage ? (
                              <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={message.file_url} 
                                  alt="Shared image" 
                                  className="max-w-full rounded-md max-h-60 object-cover"
                                />
                              </a>
                            ) : (
                              <a 
                                href={message.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded ${isOwn ? 'bg-primary-foreground/20' : 'bg-background'}`}
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm underline">Download File</span>
                              </a>
                            )}
                          </div>
                        )}
                        {message.message && !message.message.startsWith('Sent a file:') && (
                          <p className="break-words">{message.message}</p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-2 bg-muted rounded-lg flex items-center gap-3">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFileSelection}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !uploading && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={uploading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={(!newMessage.trim() && !selectedFile) || uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

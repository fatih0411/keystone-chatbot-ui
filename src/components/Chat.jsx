import { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    TextField, 
    IconButton, 
    Paper, 
    Typography, 
    CircularProgress, 
    Fab, 
    useMediaQuery, 
    useTheme,
    Avatar,
    Tooltip,
    Rating,
    Switch,
    FormControlLabel
} from '@mui/material';
import { 
    Send as SendIcon, 
    Chat as ChatIcon, 
    Close as CloseIcon, 
    DeleteOutline as DeleteOutlineIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    AccessibilityNew as AccessibilityIcon,
    SmartToy as BotIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axios from 'axios';
import { config } from '../config';

// Styled components for enhanced design
const MessageBubble = styled(Paper)(({ theme, type }) => ({
    padding: '12px 16px',
    borderRadius: type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    backgroundColor: type === 'user' ? theme.palette.primary.main : '#f5f5f5',
    color: type === 'user' ? '#fff' : theme.palette.text.primary,
    maxWidth: '80%',
    wordWrap: 'break-word',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #6B8DE6 0%, #5E76CC 100%)',
    color: '#fff',
    padding: '16px',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#fff',
        borderRadius: '24px',
        '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    borderRadius: '50%',
    padding: 12,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
}));

const TimeStamp = styled('div')({
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: '4px',
    marginLeft: '4px',
});

const MessageContainer = styled(Box)({
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
    },
});

const ChatButton = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: 20,
    right: 20,
    background: 'linear-gradient(135deg, #6B8DE6 0%, #5E76CC 100%)',
    color: '#fff',
    '&:hover': {
        background: 'linear-gradient(135deg, #5E76CC 0%, #4A63B8 100%)',
    },
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '10px',
    '& .dot': {
        width: '8px',
        height: '8px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '50%',
        animation: 'bounce 1.4s infinite ease-in-out both',
        '&:nth-of-type(1)': {
            animationDelay: '-0.32s',
        },
        '&:nth-of-type(2)': {
            animationDelay: '-0.16s',
        },
    },
    '@keyframes bounce': {
        '0%, 80%, 100%': {
            transform: 'scale(0)',
        },
        '40%': {
            transform: 'scale(1)',
        },
    },
}));

const Chat = () => {
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        const initialMessage = {
            text: "こんにちは、きぃすとんについて質問どうぞ",
            type: 'bot',
            timestamp: new Date().toISOString()
        };
        return savedMessages ? JSON.parse(savedMessages) : [initialMessage];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(() => {
        const savedIsOpen = localStorage.getItem('chatIsOpen');
        return savedIsOpen ? JSON.parse(savedIsOpen) : false;
    });
    const [highContrast, setHighContrast] = useState(false);
    const [messageRatings, setMessageRatings] = useState({});
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('chatDarkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });
    
    const messagesEndRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    // Save isOpen state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('chatIsOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    useEffect(() => {
        localStorage.setItem('chatDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Prevent body scrolling when chat is open on mobile
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, isOpen]);

    useEffect(() => {
        // Send height updates to parent window if in iframe
        if (window.self !== window.top) {
            window.parent.postMessage({
                type: 'resize',
                height: document.body.scrollHeight
            }, '*');
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userMessage, type: 'user' }]);
        setIsLoading(true);

        try {
            console.log('Sending request to:', config.apiEndpoint);
            const response = await axios.post(config.apiEndpoint, {
                question: userMessage
            });
            
            console.log('Raw response:', response);
            console.log('Response data:', response.data);

            // Check if response.data is a string or has a specific property
            const botResponse = typeof response.data === 'string' 
                ? response.data 
                : response.data.answer || response.data.response || response.data.text || JSON.stringify(response.data);
            
            console.log('Processed bot response:', botResponse);

            setMessages(prev => {
                const newMessages = [...prev, { 
                    text: botResponse,
                    type: 'bot',
                    timestamp: new Date().toISOString()
                }];
                console.log('Updated messages:', newMessages);
                return newMessages;
            });
        } catch (error) {
            console.error('Error details:', error);
            setMessages(prev => [...prev, { 
                text: 'Sorry, I encountered an error. Please try again.',
                type: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const clearChat = () => {
        setMessages([{
            text: "こんにちは、きぃすとんについて質問どうぞ",
            type: 'bot',
            timestamp: new Date().toISOString()
        }]);
        localStorage.removeItem('chatMessages');
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleRating = (messageId, rating) => {
        setMessageRatings(prev => ({
            ...prev,
            [messageId]: rating
        }));
    };

    // Add dark mode styles
    const darkModeStyles = {
        chatWindow: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa',
            color: isDarkMode ? '#fff' : 'inherit',
        },
        header: {
            background: isDarkMode 
                ? 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
                : 'linear-gradient(135deg, #6B8DE6 0%, #5E76CC 100%)',
        },
        messageBubble: {
            user: {
                backgroundColor: isDarkMode ? '#0d47a1' : theme.palette.primary.main,
                color: '#fff',
            },
            bot: {
                backgroundColor: isDarkMode ? '#424242' : '#f5f5f5',
                color: isDarkMode ? '#fff' : theme.palette.text.primary,
            },
        },
        inputArea: {
            background: isDarkMode 
                ? 'linear-gradient(to right, #2c3e50, #3498db)'
                : 'linear-gradient(to right, #F8F9FB, #F0F2F5)',
        },
        textField: {
            backgroundColor: isDarkMode ? '#424242' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit',
        },
    };

    return (
        <>
            {!isOpen && (
                <Tooltip title="Open Chat" arrow>
                    <ChatButton
                        color="primary"
                        onClick={toggleChat}
                        sx={{ 
                            zIndex: 1000,
                            background: isDarkMode 
                                ? 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
                                : 'linear-gradient(135deg, #6B8DE6 0%, #5E76CC 100%)',
                        }}
                    >
                        <ChatIcon />
                    </ChatButton>
                </Tooltip>
            )}

            {isOpen && (
                <Box sx={{
                    position: 'fixed',
                    bottom: window.self === window.top ? 20 : 0,
                    right: window.self === window.top ? 20 : 0,
                    width: '100%',
                    maxWidth: window.self === window.top ? 400 : '100%',
                    height: window.self === window.top ? 600 : '100%',
                    bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
                    borderRadius: window.self === window.top ? '12px' : 0,
                    boxShadow: window.self === window.top ? '0 8px 32px rgba(0,0,0,0.1)' : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease-out',
                    '@keyframes slideIn': {
                        from: { transform: 'translateY(20px)', opacity: 0 },
                        to: { transform: 'translateY(0)', opacity: 1 },
                    },
                }}>
                    <Box sx={{
                        ...darkModeStyles.header,
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: isDarkMode ? '#0d47a1' : 'primary.dark', width: 32, height: 32 }}>
                                <BotIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
                                Keystone Assistant
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}
                            >
                                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                            <IconButton 
                                onClick={toggleChat}
                                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        ...darkModeStyles.chatWindow,
                        backgroundImage: isDarkMode 
                            ? 'radial-gradient(circle at 50% 50%, #2c3e50 0%, transparent 100%)'
                            : 'radial-gradient(circle at 50% 50%, #f5f5f5 0%, transparent 100%)',
                    }}>
                        {messages.map((message, index) => (
                            <MessageContainer key={index} sx={{
                                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                {message.type === 'bot' && (
                                    <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        mr: 1,
                                        bgcolor: isDarkMode ? '#0d47a1' : 'primary.main',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}>
                                        <BotIcon fontSize="small" />
                                    </Avatar>
                                )}
                                <Box>
                                    <MessageBubble 
                                        type={message.type} 
                                        elevation={0}
                                        sx={{
                                            ...(message.type === 'user' 
                                                ? darkModeStyles.messageBubble.user 
                                                : darkModeStyles.messageBubble.bot)
                                        }}
                                    >
                                        <Typography sx={{ color: 'inherit' }}>{message.text}</Typography>
                                    </MessageBubble>
                                    <TimeStamp sx={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                        {formatTimestamp(message.timestamp)}
                                    </TimeStamp>
                                </Box>
                                {message.type === 'user' && (
                                    <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        ml: 1,
                                        bgcolor: isDarkMode ? '#00838f' : '#00acc1', 
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}>
                                        U
                                    </Avatar>
                                )}
                            </MessageContainer>
                        ))}
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} sx={{ color: isDarkMode ? '#fff' : 'primary.main' }} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{
                        p: 2,
                        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                        ...darkModeStyles.inputArea,
                    }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <StyledTextField
                                fullWidth
                                variant="outlined"
                                placeholder="ここに入力してください"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                size="small"
                                multiline
                                maxRows={4}
                                sx={{ 
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        ...darkModeStyles.textField,
                                        '& fieldset': {
                                            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: isDarkMode ? '#fff' : 'inherit',
                                    },
                                }}
                            />
                            <SendButton
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                size="large"
                                sx={{
                                    bgcolor: isDarkMode ? '#0d47a1' : 'primary.main',
                                    '&:hover': {
                                        bgcolor: isDarkMode ? '#1565c0' : 'primary.dark',
                                    },
                                }}
                            >
                                <SendIcon />
                            </SendButton>
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Chat;

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
    SmartToy as BotIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axios from 'axios';
import { config } from '../config';

// Styled components with enhanced design
const MessageContainer = styled(Box)(({ theme, type }) => ({
    display: 'flex',
    justifyContent: type === 'user' ? 'flex-end' : 'flex-start',
    marginBottom: '1rem',
    opacity: 0,
    animation: 'fadeIn 0.3s ease-in forwards',
    '@keyframes fadeIn': {
        '0%': {
            opacity: 0,
            transform: type === 'user' ? 'translateX(20px)' : 'translateX(-20px)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateX(0)',
        },
    },
}));

const MessageBubble = styled(Paper)(({ theme, type }) => ({
    padding: '1rem 1.2rem',
    maxWidth: '70%',
    borderRadius: type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
    background: type === 'user' 
        ? 'linear-gradient(135deg, #4B6CB7 0%, #182848 100%)'  // Deep blue gradient
        : 'linear-gradient(135deg, #E6E9EF 0%, #F5F7FA 100%)', // Soft gray gradient
    color: type === 'user' ? '#fff' : theme.palette.text.primary,
    boxShadow: type === 'user'
        ? '0 4px 15px rgba(75, 108, 183, 0.25), 0 2px 5px rgba(75, 108, 183, 0.15)'
        : '0 4px 15px rgba(0, 0, 0, 0.05), 0 2px 5px rgba(0, 0, 0, 0.03)',
    wordBreak: 'break-word',
    position: 'relative',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: type === 'user'
            ? '0 6px 20px rgba(75, 108, 183, 0.3), 0 3px 8px rgba(75, 108, 183, 0.2)'
            : '0 6px 20px rgba(0, 0, 0, 0.08), 0 3px 8px rgba(0, 0, 0, 0.05)',
    },
}));

const ChatWindow = styled(Box)(({ theme, isMobile }) => ({
    position: 'fixed',
    bottom: isMobile ? 0 : '80px',
    right: isMobile ? 0 : '20px',
    height: isMobile ? '100vh' : config.chatWindow.height,
    width: isMobile ? '100vw' : config.chatWindow.width,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom, #F8F9FB, #F0F2F5)',  // Subtle gradient background
    borderRadius: isMobile ? 0 : '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 3px 15px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease-in-out',
    zIndex: 1000,
}));

const ChatButton = styled(Fab)(({ theme, isMobile }) => ({
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    background: 'linear-gradient(135deg, #4B6CB7 0%, #182848 100%)',  // Matching gradient
    boxShadow: '0 4px 15px rgba(75, 108, 183, 0.25), 0 2px 5px rgba(75, 108, 183, 0.15)',
    '&:hover': {
        background: 'linear-gradient(135deg, #405FA0 0%, #142238 100%)',
        boxShadow: '0 6px 20px rgba(75, 108, 183, 0.3), 0 3px 8px rgba(75, 108, 183, 0.2)',
    },
    '@media (max-width: 600px)': {
        bottom: '10px',
        right: '10px',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '20px',
        backgroundColor: '#fff',
        '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
            },
        },
    },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
    background: 'linear-gradient(135deg, #4B6CB7 0%, #182848 100%)',  // Matching gradient
    color: '#fff',
    borderRadius: '50%',
    padding: '8px',
    boxShadow: '0 2px 8px rgba(75, 108, 183, 0.2)',
    '&:hover': {
        background: 'linear-gradient(135deg, #405FA0 0%, #142238 100%)',
        boxShadow: '0 4px 12px rgba(75, 108, 183, 0.25)',
    },
    '&.Mui-disabled': {
        background: '#E9ECEF',
        color: '#ADB5BD',
    },
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

const TimeStamp = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: alpha(theme.palette.text.primary, 0.6),
    marginTop: '4px',
    textAlign: 'center',
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

    return (
        <>
            {(!isOpen || !isMobile) && (
                <Tooltip title="Open chat" arrow>
                    <ChatButton 
                        color="primary" 
                        onClick={toggleChat}
                        aria-label="chat"
                        isMobile={isMobile}
                    >
                        {isOpen ? <CloseIcon /> : <ChatIcon />}
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
                    bgcolor: 'background.paper',
                    borderRadius: window.self === window.top ? 2 : 0,
                    boxShadow: window.self === window.top ? 3 : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        background: 'linear-gradient(to right, #F8F9FB, #F0F2F5)',
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ 
                                    bgcolor: 'primary.main',
                                    width: 40,
                                    height: 40,
                                    boxShadow: '0 2px 8px rgba(75, 108, 183, 0.25)'
                                }}>
                                    <BotIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ 
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: '#2D3748'
                                    }}>
                                        Keystone AI
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'success.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Box 
                                            component="span" 
                                            sx={{ 
                                                width: 6,
                                                height: 6,
                                                bgcolor: 'success.main',
                                                borderRadius: '50%',
                                                display: 'inline-block'
                                            }} 
                                        />
                                        オンライン
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="ハイコントラストモード" arrow>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={highContrast}
                                                onChange={(e) => setHighContrast(e.target.checked)}
                                            />
                                        }
                                        label={<AccessibilityIcon fontSize="small" />}
                                    />
                                </Tooltip>
                                {messages.length > 0 && (
                                    <Tooltip title="チャットをクリア" arrow>
                                        <IconButton 
                                            onClick={clearChat} 
                                            size="small"
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {isMobile && (
                                    <Tooltip title="閉じる" arrow>
                                        <IconButton 
                                            onClick={toggleChat} 
                                            size="small"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        backgroundColor: highContrast ? '#FFFFFF' : '#F8F9FB',  // Warmer background
                        backgroundImage: highContrast ? 'none' : 'linear-gradient(120deg, #fdfbfb 0%, #f5f7fa 100%)',  // Subtle pattern
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0, 0, 0, 0.03)',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(0, 0, 0, 0.15)',
                            borderRadius: '4px',
                            '&:hover': {
                                background: 'rgba(0, 0, 0, 0.25)',
                            },
                        },
                    }}>
                        {messages.length === 0 && (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: 'text.secondary',
                                gap: 2,
                            }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                    <BotIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Typography variant="h6">
                                    Welcome! 👋
                                </Typography>
                                <Typography variant="body2" textAlign="center" color="text.secondary">
                                    I'm here to help. Ask me anything!
                                </Typography>
                            </Box>
                        )}
                        {messages.map((message, index) => (
                            <MessageContainer key={index} type={message.type}>
                                {message.type === 'bot' && (
                                    <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        mr: 1,
                                        bgcolor: 'primary.main',
                                    }}>
                                        <BotIcon fontSize="small" />
                                    </Avatar>
                                )}
                                <Box>
                                    <MessageBubble type={message.type} elevation={1}>
                                        <Typography>{message.text}</Typography>
                                    </MessageBubble>
                                    <TimeStamp>
                                        {formatTimestamp(message.timestamp)}
                                    </TimeStamp>
                                    {message.type === 'bot' && (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            mt: 1,
                                            justifyContent: 'flex-start'
                                        }}>
                                            <Tooltip title="Helpful" arrow>
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleRating(index, 'helpful')}
                                                    color={messageRatings[index] === 'helpful' ? 'primary' : 'default'}
                                                >
                                                    <ThumbUpIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Not helpful" arrow>
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleRating(index, 'not_helpful')}
                                                    color={messageRatings[index] === 'not_helpful' ? 'error' : 'default'}
                                                >
                                                    <ThumbDownIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                {message.type === 'user' && (
                                    <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        ml: 1,
                                        bgcolor: 'primary.main',
                                    }}>
                                        U
                                    </Avatar>
                                )}
                            </MessageContainer>
                        ))}
                        {isLoading && (
                            <TypingIndicator>
                                <div className="dot" />
                                <div className="dot" />
                                <div className="dot" />
                            </TypingIndicator>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{
                        p: 2,
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        background: 'linear-gradient(to right, #F8F9FB, #F0F2F5)',  // Subtle gradient footer
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
                            />
                            <SendButton
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                size="large"
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

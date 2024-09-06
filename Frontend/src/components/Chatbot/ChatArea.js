import React, { useState, useEffect, useRef } from 'react';
import './ChatArea.css';

const ChatArea = ({ isDarkMode }) => {
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! How can I assist you?' }
    ]);
    const [input, setInput] = useState('');
    const [showLanguageOptions, setShowLanguageOptions] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [recognition, setRecognition] = useState(null);
    const [loading, setLoading] = useState(false); // Loader state

    const chatListRef = useRef(null);

    const languages = {
        Hindi: 'hi',
        Bengali: 'bn',
        Telugu: 'te',
        Marathi: 'mr',
        Tamil: 'ta',
        Gujarati: 'gu',
        Urdu: 'ur',
        Kannada: 'kn',
        Malayalam: 'ml',
        Odia: 'or'
    };

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.lang = 'en-US';
            recognitionInstance.interimResults = false;
            recognitionInstance.maxAlternatives = 1;
            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                handleSendMessageFromVoice(transcript);
            };
            recognitionInstance.onerror = (error) => {
                console.error('Speech recognition error:', error);
            };
            setRecognition(recognitionInstance);
        } else {
            console.warn('SpeechRecognition is not supported in this browser.');
        }
    }, []);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (input.trim() !== '') {
            const userMessage = { type: 'user', text: input };
            setMessages([...messages, userMessage]);

            try {
                // Show the loader while waiting for the bot's response
                setLoading(true);

                // Send the user input to the backend
                const response = await fetch('https://5fbe-104-197-181-22.ngrok-free.app/chatbot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: input.trim() }),
                });

                const data = await response.json();
                let botResponseText = data.response;

                // Trim the question if repeated in the response
                if (botResponseText.toLowerCase().includes(input.toLowerCase())) {
                    botResponseText = botResponseText.replace(new RegExp(input, 'i'), '').trim();
                }

                const botResponse = { type: 'bot', text: botResponseText };

                setMessages([...messages, userMessage, botResponse]);
                setInput('');
                setLoading(false);
                

                
                /* const utterance = new SpeechSynthesisUtterance(botResponseText);
                window.speechSynthesis.speak(utterance); */
            } catch (error) {
                console.error('Error fetching response:', error);
                const botResponse = { type: 'bot', text: 'Sorry, something went wrong. Please try again later.' };
                setMessages([...messages, userMessage, botResponse]);
                setLoading(false); // Hide the loader on error
            }
        }
    };

    const handleSendMessageFromVoice = async (text) => {
        const userMessage = { type: 'user', text };
        setMessages([...messages, userMessage]);

        try {
            const response = await fetch('/your-backend-endpoint-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text.trim(), language: selectedLanguage }),
            });

            const data = await response.json();
            let botResponseText = data.response;

            // Trim the question if repeated in the response
        

            const botResponse = { type: 'bot', text: botResponseText };

            setMessages([...messages, userMessage, botResponse]);

            // Optionally speak the response
            /* const utterance = new SpeechSynthesisUtterance(botResponseText);
            window.speechSynthesis.speak(utterance); */
        } catch (error) {
            console.error('Error fetching response:', error);
            const botResponse = { type: 'bot', text: 'Sorry, something went wrong. Please try again later.' };
            setMessages([...messages, userMessage, botResponse]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const toggleLanguageOptions = () => {
        setShowLanguageOptions(!showLanguageOptions);
    };

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(languages[lang]);
        setShowLanguageOptions(false);
    };

    const handleVoiceInput = () => {
        if (recognition) {
            recognition.start();
        }
    };

    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={`chat-area ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="chat-list" ref={chatListRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.type}`}>
                        {msg.text}
                    </div>
                ))}
                {loading && (
                    <div className="chat-message bot">
                        <i>Generating response...</i> {/* Loader while waiting for response */}
                    </div>
                )}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
                <div className="icon-container">
                    <button className="attachment-icon">
                        <i className="fas fa-paperclip"></i>
                    </button>
                    <button className="voice-icon" onClick={handleVoiceInput}>
                        <i className="fas fa-microphone"></i>
                    </button>
                    <button className="translate-icon" onClick={toggleLanguageOptions}>
                        <i className="fas fa-globe"></i>
                    </button>
                    <button className="send-icon" onClick={handleSendMessage}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
                {showLanguageOptions && (
                    <div className="language-options">
                        {Object.keys(languages).map((lang) => (
                            <button key={lang} onClick={() => handleLanguageChange(lang)}>
                                {lang}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatArea;




/* import React, { useState } from 'react';

const ChatArea = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = async () => {
        
            try {
                const res = await fetch('https://78ae-34-70-235-165.ngrok-free.app/chatbot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({message: input}),
                });

                const data = await res.json();
                setResponse(data.response);
            } catch (error) {
                console.error('Error:', error);
                setResponse('Sorry, something went wrong. Please try again later.');
            }

            setInput('');
        
    };

    return (
        <div>
            <h1>Chatbot</h1>
            <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message here..."
            />
            <button onClick={handleSendMessage}>Send</button>
            {response && <p>Bot: {response}</p>}
        </div>
    );
};

export default ChatArea;
 */
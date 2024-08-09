"use client"
import React, { useState } from "react";
import { Box, TextField, Stack, Button } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to Headstarter! How can I help you today?" },
    // { role: "user", content: "Welcome to Headstarter! How can I help you today?" },
    // { role: "assistant", content: "Welcome to Headstarter! How can I help you today?" },
  ])

  const [message, setMessage] = useState("")

  const sendMessage = async () => {
    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' }  // Add a placeholder for the assistant's response
    ])

    // Send the message to the server
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text

      while (true) {
        // Read the next chunk of the response
        const { done, value } = await reader.read()

        if (done) break

        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages, { role: 'assistant', content: "I'm sorry but i encountered an error." }
      ])
    }
  }

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column"
      justifyContent="center" alignItems="center" >
      {/* //** History of chat */}
      <Stack direction="column" p={4}

        justifyContent="space-between" width="50vw" display="flex"
        flexGrow={1}
        overflow="auto"
        maxHeight="60vh"
        border="1px solid #001"
        borderRadius="20px"
      >

        {/* //**Messages */}
        <Stack direction="column" justifyContent="center"
          gap={3} 
          marginBottom={4}>
          {messages.map((msg, index) => (
            <Box key={index}
              display="flex"
              spacing={4}
              gap={10}
              justifyContent={msg.role === "assistant" ? "flex-start" : "flex-end"}>
              <Box
                px={5} py={2} borderRadius={16}
                color={"#ffe"}
                bgcolor={msg.role === "assistant" ? "primary.main" : "secondary.main"}
              >
                {msg.content}
              </Box>

            </Box>
          ))}
        </Stack>
        {/* //**Input field */}
        <Stack borderRadius={16} direction="row" spacing={4} display="flex" width="100%">
          <TextField label="Message" fullWidth
            value={message || ""}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" color="primary"
            onClick={sendMessage}
          >Send</Button>
        </Stack>

      </Stack>
    </Box >
  );
}

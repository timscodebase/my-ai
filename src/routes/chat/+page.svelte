<script lang="ts">
  type Message = { role: "user" | "assistant"; content: string };

  let messages = $state<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am Qwen 2.5 Coder. How can I help you build today?",
    },
  ]);
  let input = $state("");
  let isLoading = $state(false);
  let chatContainer: HTMLElement | undefined = $state();

  // Auto-scroll effect using Svelte 5 runes
  $effect(() => {
    // Read messages length to trigger effect when it changes
    messages.length;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    input = ""; // Clear input immediately
    isLoading = true;

    // Add user message to state
    messages = [...messages, { role: "user", content: userMessage }];

    // Add an empty assistant message that we will stream into
    messages = [...messages, { role: "assistant", content: "" }];

    try {
      // We only send the history up to the user's last message
      const historyToSend = messages.slice(0, -1);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              // Mutate the last message's content directly
              messages[messages.length - 1].content += data.message.content;
            }
          } catch (e) {
            console.warn("Error parsing JSON chunk:", e);
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      messages[messages.length - 1].content =
        "**Error:** Failed to connect to Ollama. Ensure it is running on your Mac via `ollama serve`.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="chat-wrapper">
  <header>
    <h1>Qwen2.5-Coder</h1>
    <span class="status">● Local Model</span>
  </header>

  <main bind:this={chatContainer} class="chat-container">
    {#each messages as msg}
      <div class="message {msg.role}">
        <div class="avatar">
          {msg.role === "user" ? "U" : "Q"}
        </div>
        <div class="content">
          <pre>{msg.content}</pre>
        </div>
      </div>
    {/each}
    {#if isLoading && messages[messages.length - 1].content === ""}
      <div class="message assistant thinking">
        <div class="avatar">Q</div>
        <div class="content">Thinking...</div>
      </div>
    {/if}
  </main>

  <form onsubmit={handleSubmit} class="input-area">
    <input
      type="text"
      bind:value={input}
      placeholder="Ask a coding question..."
      disabled={isLoading}
      autocomplete="off"
    />
    <button type="submit" disabled={isLoading || !input.trim()}> Send </button>
  </form>
</div>

<style>
  .chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 900px;
    margin: 0 auto;
    background-color: #1a1d27;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }

  header {
    padding: 1.5rem;
    background-color: #12141c;
    border-bottom: 1px solid #2d313f;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header h1 {
    margin: 0;
    font-size: 1.25rem;
    color: #fff;
  }

  .status {
    font-size: 0.85rem;
    color: #10b981;
    font-weight: 600;
  }

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .message {
    display: flex;
    gap: 1rem;
    max-width: 85%;
  }

  .message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .user .avatar {
    background-color: #3b82f6;
    color: #fff;
  }

  .assistant .avatar {
    background-color: #8b5cf6;
    color: #fff;
  }

  .content {
    background-color: #262a36;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #363b4a;
    line-height: 1.5;
    overflow-x: auto;
  }

  .user .content {
    background-color: #1e3a8a;
    border-color: #1e40af;
  }

  .content pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: inherit;
  }

  .thinking .content {
    color: #94a3b8;
    font-style: italic;
    animation: pulse 1.5s infinite;
  }

  .input-area {
    padding: 1.5rem;
    background-color: #12141c;
    border-top: 1px solid #2d313f;
    display: flex;
    gap: 1rem;
  }

  input {
    flex: 1;
    padding: 1rem;
    background-color: #0f111a;
    border: 1px solid #363b4a;
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus {
    border-color: #3b82f6;
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button {
    padding: 0 2rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  button:disabled {
    background-color: #475569;
    cursor: not-allowed;
  }

  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
</style>

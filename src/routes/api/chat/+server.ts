import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { messages } = await request.json();

    if (!env.OLLAMA_URL) {
      throw error(500, "OLLAMA_URL environment variable is not configured");
    }

    // Call Ollama instance
    const response = await fetch(`${env.OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5-coder:7b",
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw error(500, "Failed to communicate with Ollama");
    }

    // Return the readable stream directly to the Svelte client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (err) {
    console.error("Chat API Error:", err);
    throw error(500, "Internal Server Error");
  }
};

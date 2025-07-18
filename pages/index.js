import { useState, useEffect, useRef } from "react";

const MODELS = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (ucuz ve hızlı)" },
  { value: "gpt-4o", label: "GPT-4o (hızlı GPT-4, düşük fiyat)" }
];

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [messages, setMessages] = useState([
    { role: "system", content: "Sen yardımsever bir asistansın." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || apiKey.trim().length < 20) {
      alert("API anahtarını ve mesajı doldur!");
      return;
    }

    const updatedMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: updatedMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert("API Hatası: " + (data?.error?.message || "Bilinmeyen hata"));
      } else {
        setMessages([...updatedMessages, data.choices[0].message]);
      }
    } catch (e) {
      alert("Bağlantı hatası: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#1976d2" }}>GPT Sohbet (Frontend API Key)</h1>

      <div style={{ marginBottom: "10px" }}>
        <label>API Anahtarınız:</label>
        <input
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "5px"
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Model Seçimi:</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "5px"
          }}
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div style={{
        minHeight: "400px",
        maxHeight: "500px",
        overflowY: "auto",
        background: "#f9f9f9",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        marginBottom: "15px"
      }}>
        {messages.filter(m => m.role !== "system").map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "10px" }}>
            <div style={{
              display: "inline-block",
              background: msg.role === "user" ? "#1976d2" : "#eee",
              color: msg.role === "user" ? "white" : "black",
              padding: "10px 15px",
              borderRadius: "16px",
              maxWidth: "80%",
              whiteSpace: "pre-wrap"
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <textarea
        rows="3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Mesajınızı yazın, Enter ile gönderin..."
        disabled={loading}
        style={{
          width: "100%",
          fontSize: "16px",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          resize: "vertical"
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          marginTop: "10px",
          width: "100%",
          background: "#1976d2",
          color: "white",
          fontSize: "18px",
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Gönderiliyor..." : "Gönder"}
      </button>
    </div>
  );
            }

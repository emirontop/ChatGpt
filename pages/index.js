import { useState, useEffect, useRef } from "react";

const MODELS = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (4k token)" },
  { value: "gpt-4", label: "GPT-4 (8k token)" },
  { value: "gpt-4-32k", label: "GPT-4 32k (32k token)" },
];

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [messages, setMessages] = useState([
    { role: "system", content: "Sen yardımsever bir asistansın." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    if (apiKey.trim().length < 20) {
      alert("Lütfen geçerli OpenAI API anahtarınızı girin.");
      return;
    }

    const newMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: newMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("API Hatası: " + (data.error?.message || "Bilinmeyen hata"));
      } else {
        setMessages([...newMessages, data.choices[0].message]);
      }
    } catch (e) {
      alert("İstek gönderilirken hata oluştu.");
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
    <div
      style={{
        maxWidth: 700,
        margin: "20px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>GPT Sohbet (API Key Frontend)</h2>

      <label style={{ display: "block", marginBottom: 10 }}>
        API Anahtarınızı Girin:
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            marginTop: 5,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
          placeholder="sk-xxxxxxx..."
        />
      </label>

      <label style={{ display: "block", marginBottom: 15 }}>
        Model Seçin:
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ marginLeft: 10, padding: 5, fontSize: 16 }}
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <div
        style={{
          minHeight: 400,
          maxHeight: 500,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 10,
          borderRadius: 6,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.role === "user" ? "right" : "left",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: msg.role === "user" ? "#1976d2" : "#eee",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 16,
                  maxWidth: "80%",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Mesajınızı yazın, Enter ile gönderin, Shift+Enter yeni satır"
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          fontSize: 16,
          borderRadius: 6,
          border: "1px solid #ccc",
          resize: "vertical",
        }}
        disabled={loading}
      />

      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          fontSize: 16,
          borderRadius: 6,
          border: "none",
          backgroundColor: "#1976d2",
          color: "white",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Gönderiliyor..." : "Gönder"}
      </button>
    </div>
  );
}

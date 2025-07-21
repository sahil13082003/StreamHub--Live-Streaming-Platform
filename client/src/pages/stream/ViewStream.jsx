"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { RiLiveLine } from "react-icons/ri";
import axios from "@/services/api";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const ViewStream = () => {
  const { streamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const connectWebSocket = () => {
    const wsProtocol = process.env.NODE_ENV === "development" ? "ws" : "wss";
    ws.current = new WebSocket(`${wsProtocol}://localhost:5000/ws/view/${streamId}`);
    console.log('Attempting WebSocket connection to:', `${wsProtocol}://localhost:5000/ws/view/${streamId}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected for streamId:', streamId);
      reconnectAttempts.current = 0;
      const token = localStorage.getItem("token");
      if (token) {
        console.log('Sending AUTH message with token');
        ws.current.send(JSON.stringify({ type: "AUTH", token }));
      } else {
        console.error("No token found for WebSocket authentication");
        toast.error("Authentication required for WebSocket");
        ws.current.close();
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        if (data.type === "VIEWER_COUNT") {
          setViewerCount(data.count);
        } else if (data.type === "CHAT_MESSAGE") {
          setMessages((prev) => [...prev, { user: data.user, message: data.message }]);
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error("WebSocket connection failed");
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket closed:', { code: event.code, reason: event.reason });
      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`Reconnecting WebSocket, attempt ${reconnectAttempts.current + 1}`);
        reconnectAttempts.current += 1;
        setTimeout(connectWebSocket, 3000);
      } else {
        console.error('Max WebSocket reconnect attempts reached');
        toast.error("Unable to connect to WebSocket server");
      }
    };
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to view this stream");
      navigate("/login");
      return;
    }

    if (!streamId) {
      console.error("Stream ID is undefined");
      toast.error("Invalid stream ID");
      navigate("/stream");
      return;
    }

    const fetchStream = async () => {
      try {
        const response = await axios.get(`/stream/${streamId}`);
        console.log("Stream data:", response.data);
        if (!response.data.isLive) {
          toast.error("This stream is not live");
          navigate("/stream/setup");
          return;
        }
        setStream(response.data);
      } catch (error) {
        console.error("Error response:", error.response);
        console.error("Error message:", error.message);
        toast.error(error.response?.data?.message || "Failed to load stream");
        navigate("/stream/setup");
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
      if (playerRef.current) playerRef.current.dispose();
    };
  }, [streamId, user, navigate]);

  useEffect(() => {
    if (stream && videoRef.current) {
      // Initialize video.js player with HLS stream
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        muted: true,
        sources: [{
          src: `http://localhost:5000/stream/${streamId}/hls/master.m3u8`, // Adjust based on your streaming server
          type: 'application/x-mpegURL',
        }],
      });
    }
  }, [stream, streamId]);

  const sendChatMessage = () => {
    if (chatMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "CHAT_MESSAGE", message: chatMessage }));
      setChatMessage("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Stream */}
          <div className="flex-1">
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={videoRef}
                className="video-js vjs-default-skin w-full h-full"
                playsInline
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h1 className="text-xl font-bold">{stream?.title}</h1>
                <p className="text-sm text-gray-300">{stream?.description}</p>
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded-full flex items-center gap-1">
                <RiLiveLine className="text-red-500 animate-pulse" />
                <span className="text-sm">{viewerCount} viewers</span>
              </div>
            </div>
          </div>
          {/* Chat */}
          <div className="lg:w-80 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">Stream Chat</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <span className="font-bold text-blue-400">{msg.user}:</span> {msg.message}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send a message..."
                className="bg-gray-700 border-gray-600"
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <Button onClick={sendChatMessage}>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStream;
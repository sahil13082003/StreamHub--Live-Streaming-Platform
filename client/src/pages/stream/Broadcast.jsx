"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added missing import
import { toast } from "react-toastify";
import { RiLiveLine, RiMicLine, RiMicOffLine, RiVideoLine, RiVideoOffLine } from "react-icons/ri";
import axios from "@/services/api";

const Broadcast = () => {
  const { streamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const ws = useRef(null);

  useEffect(() => {
    // Check if user and streamId are valid
    if (!user) {
      toast.error("Please log in to access this stream");
      navigate("/login");
      return;
    }

    if (!streamId) {
      console.error("Stream ID is undefined");
      toast.error("Invalid stream ID");
      navigate("/stream/setup");
      return;
    }

    const fetchStream = async () => {
      try {
        const response = await axios.get(`/stream/${streamId}`);
        console.log("Stream data:", response.data);
        if (response.data.streamer._id !== user._id) {
          toast.error("You are not authorized to broadcast this stream");
          navigate("/");
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

    // Setup WebSocket
    const wsProtocol = process.env.NODE_ENV === "development" ? "ws" : "wss";
    // Use backend port (5000) instead of frontend port (5173)
    ws.current = new WebSocket(`${wsProtocol}://localhost:5000/ws/broadcast/${streamId}`);

    ws.current.onopen = () => {
      const token = localStorage.getItem("token");
      if (token) {
        ws.current.send(JSON.stringify({ type: "AUTH", token }));
      } else {
        console.error("No token found for WebSocket authentication");
        toast.error("Authentication required for WebSocket");
        ws.current.close();
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "VIEWER_COUNT") {
        setViewerCount(data.count);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket connection failed");
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (ws.current) ws.current.close();
      stopStreaming();
    };
  }, [streamId, user, navigate]);

  const startStreaming = async () => {
    try {
      const constraints = {
        video: { width: 1280, height: 720 },
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      videoRef.current.srcObject = stream;
      setIsLive(true);

      await axios.patch(`/stream/${streamId}/status`, { isLive: true });
      toast.success("You're now live!");
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access camera/microphone");
    }
  };

  const stopStreaming = async () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setIsLive(false);

      if (streamId) {
        try {
          await axios.patch(`/stream/${streamId}/status`, { isLive: false });
        } catch (error) {
          console.error("Error updating stream status:", error);
        }
      }
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !micMuted));
      setMicMuted(!micMuted);
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !cameraOff));
      setCameraOff(!cameraOff);
    }
  };

  const endStream = async () => {
    try {
      setLoading(true);
      stopStreaming();
      await axios.delete(`/stream/${streamId}`);
      navigate("/stream/setup");
      toast.success("Stream ended successfully");
    } catch (error) {
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      toast.error(error.response?.data?.message || "Failed to end stream");
    } finally {
      setLoading(false);
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
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!isLive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <Button onClick={startStreaming} className="bg-red-500 hover:bg-red-600 gap-2">
                    <RiLiveLine /> Go Live
                  </Button>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h1 className="text-xl font-bold">{stream?.title}</h1>
                <p className="text-sm text-gray-300">{stream?.description}</p>
              </div>
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded-full flex items-center gap-1">
                <RiLiveLine className="text-red-500 animate-pulse" />
                <span className="text-sm">{viewerCount} viewers</span>
              </div>
            </div>
            {isLive && (
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  variant={micMuted ? "destructive" : "outline"}
                  onClick={toggleMic}
                  className="gap-2"
                >
                  {micMuted ? <RiMicOffLine /> : <RiMicLine />}
                  {micMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant={cameraOff ? "destructive" : "outline"}
                  onClick={toggleCamera}
                  className="gap-2"
                >
                  {cameraOff ? <RiVideoOffLine /> : <RiVideoLine />}
                  {cameraOff ? "Show Camera" : "Hide Camera"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={endStream}
                  className="gap-2"
                  disabled={loading}
                >
                  <RiLiveLine /> End Stream
                </Button>
              </div>
            )}
          </div>
          <div className="lg:w-80 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">Stream Chat</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-center text-gray-400 mt-10">
                Chat will appear here when viewers join
              </p>
            </div>
            <div className="p-4 border-t border-gray-700">
              <Input placeholder="Send a message..." className="bg-gray-700 border-gray-600" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Broadcast;
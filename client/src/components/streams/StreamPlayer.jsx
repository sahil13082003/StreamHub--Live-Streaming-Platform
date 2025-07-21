"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { RiLiveLine } from "react-icons/ri";
import axios from "@/services/api";

const Stream = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [tab, setTab] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await axios.get("/stream");
        setStreams(response.data);
      } catch (error) {
        console.error("Error fetching streams:", error);
        toast.error("Failed to load streams");
      }
    };

    const fetchLiveStreams = async () => {
      try {
        const response = await axios.get("/stream/live");
        setLiveStreams(response.data);
      } catch (error) {
        console.error("Error fetching live streams:", error);
        toast.error("Failed to load live streams");
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
    fetchLiveStreams();
  }, []);

  const createStream = async () => {
    try {
      const response = await axios.post("/stream", { title, description, category });
      toast.success(response.data.message);
      navigate(`/stream/broadcast/${response.data.streamId}`);
    } catch (error) {
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      toast.error(error.response?.data?.message || "Failed to create stream");
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
        <h1 className="text-3xl font-bold mb-6">Streams</h1>
        {user && (
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create a Stream</h2>
            <Input
              placeholder="Stream Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2 bg-gray-700 border-gray-600"
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-2 bg-gray-700 border-gray-600"
            />
            <Input
              placeholder="Category ID"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mb-2 bg-gray-700 border-gray-600"
            />
            <Button onClick={createStream} className="bg-blue-500 hover:bg-blue-600">
              Create Stream
            </Button>
          </div>
        )}
        <div className="mb-4">
          <Button
            variant={tab === "all" ? "default" : "outline"}
            onClick={() => setTab("all")}
            className="mr-2"
          >
            All Streams
          </Button>
          <Button
            variant={tab === "live" ? "default" : "outline"}
            onClick={() => setTab("live")}
            className="flex items-center gap-2"
          >
            <RiLiveLine /> Live Streams
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tab === "all" ? streams : liveStreams).map((stream) => (
            <div key={stream._id} className="bg-gray-800 rounded-lg p-4">
              <div className="aspect-video bg-black rounded-lg mb-2 flex items-center justify-center">
                {stream.isLive ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <RiLiveLine className="animate-pulse" /> Live
                  </div>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )}
              </div>
              <h3 className="text-lg font-semibold">{stream.title}</h3>
              <p className="text-sm text-gray-300">{stream.description}</p>
              <p className="text-sm">Streamer: {stream.streamer.username}</p>
              <Button
                onClick={() => navigate(stream.isLive ? `/stream/view/${stream._id}` : `/stream/broadcast/${stream._id}`)}
                className="mt-2"
                disabled={!stream.isLive && stream.streamer._id !== user?._id}
              >
                {stream.isLive ? "Watch Now" : stream.streamer._id === user?._id ? "Broadcast" : "Offline"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stream;
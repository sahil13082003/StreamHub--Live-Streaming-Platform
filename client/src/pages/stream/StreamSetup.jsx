"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import axios from "@/services/api";
import { useNavigate } from "react-router-dom";
import { RiLiveLine, RiSettings3Line } from "react-icons/ri";

const StreamSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isPrivate: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/videos/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load streaming categories");
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startStream = async () => {
    if (!formData.title || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/stream/start", {
        ...formData,
        streamer: user._id,
      });
      console.log("Start stream response:", response.data);
      navigate(`/stream/broadcast/${response.data.streamId}`);
    } catch (error) {
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      toast.error(error.response?.data?.message || "Failed to start stream");
      navigate("/stream/setup");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    toast.error("Please log in to start streaming");
    navigate("/login");
    return null;
  }

  if (user?.role !== "streamer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Streamer Account Required</h2>
          <p className="text-gray-600 mb-6">
            You need a streamer account to go live. Please update your account settings.
          </p>
          <Button onClick={() => navigate("/settings")} className="gap-2">
            <RiSettings3Line /> Account Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-red-100 text-red-600">
            <RiLiveLine size={24} />
          </div>
          <h1 className="text-2xl font-bold">Go Live</h1>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Stream Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="What are you streaming today?"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-2"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell viewers about your stream..."
              value={formData.description}
              onChange={handleInputChange}
              className="mt-2"
              rows={4}
              maxLength={500}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPrivate: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <Label htmlFor="isPrivate">Private Stream (Only followers can join)</Label>
          </div>

          <div className="pt-4">
            <Button
              onClick={startStream}
              className="w-full bg-red-500 hover:bg-red-600 gap-2"
              disabled={loading}
            >
              <RiLiveLine size={18} />
              {loading ? "Starting..." : "Start Streaming"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamSetup;
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RiSearchLine, RiUserFollowLine, RiUserUnfollowLine, RiLiveLine, RiUserHeartLine, RiUserStarLine } from "react-icons/ri";
import axios from "@/services/api";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const StreamersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streamers, setStreamers] = useState([]);
  const [filteredStreamers, setFilteredStreamers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const [streamersResponse, liveStreamsResponse] = await Promise.all([
          axios.get("/streamers"),
          axios.get("/stream/live"),
        ]);

        // Map live streams to streamer IDs
        const liveStreamMap = new Map(
          liveStreamsResponse.data.map((stream) => [stream.streamer._id, stream._id])
        );

        // Update streamers with isLive and streamId
        const updatedStreamers = streamersResponse.data.map((streamer) => ({
          ...streamer,
          isLive: liveStreamMap.has(streamer._id),
          streamId: liveStreamMap.get(streamer._id),
        }));

        // Filter out the logged-in user if they're a streamer
        const filteredData = user?.role === 'streamer'
          ? updatedStreamers.filter((streamer) => streamer._id !== user._id)
          : updatedStreamers;

        setStreamers(filteredData);
        setFilteredStreamers(
          tab === "live"
            ? filteredData.filter((streamer) => streamer.isLive)
            : filteredData
        );
      } catch (error) {
        console.error("Failed to fetch streamers or live streams:", error);
        toast.error("Failed to load streamers");
      } finally {
        setLoading(false);
      }
    };
    fetchStreamers();
  }, [user, tab]);

  useEffect(() => {
    const filtered = streamers.filter(
      (streamer) =>
        streamer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (streamer.displayName &&
          streamer.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredStreamers(
      tab === "live" ? filtered.filter((streamer) => streamer.isLive) : filtered
    );
  }, [searchQuery, streamers, tab]);

  const handleFollow = async (streamerId) => {
    if (!user) {
      toast.info("Please login to follow streamers");
      return navigate("/login");
    }

    try {
      await axios.post(`/streamers/${streamerId}/follow`);
      setStreamers((prev) =>
        prev.map((streamer) =>
          streamer._id === streamerId
            ? { ...streamer, followers: [...streamer.followers, user._id] }
            : streamer
        )
      );
      toast.success("Followed successfully!");
    } catch (error) {
      console.error("Follow error:", error);
      toast.error(error.response?.data?.message || "Failed to follow streamer");
    }
  };

  const handleUnfollow = async (streamerId) => {
    try {
      await axios.post(`/streamers/${streamerId}/unfollow`);
      setStreamers((prev) =>
        prev.map((streamer) =>
          streamer._id === streamerId
            ? {
                ...streamer,
                followers: streamer.followers.filter((id) => id !== user._id),
              }
            : streamer
        )
      );
      toast.success("Unfollowed successfully!");
    } catch (error) {
      console.error("Unfollow error:", error);
      toast.error(error.response?.data?.message || "Failed to unfollow streamer");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Discover Streamers</h1>
            <p className="text-gray-600">Find and follow your favorite content creators</p>
          </div>
          <div className="relative w-full md:w-80">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search streamers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>
        <div className="mb-4">
          <Button
            variant={tab === "all" ? "default" : "outline"}
            onClick={() => setTab("all")}
            className="mr-2"
          >
            All Streamers
          </Button>
          <Button
            variant={tab === "live" ? "default" : "outline"}
            onClick={() => setTab("live")}
            className="flex items-center gap-2"
          >
            <RiLiveLine className="animate-pulse text-red-500" />
            Live Streamers
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreamers.length > 0 ? (
            filteredStreamers.map((streamer) => (
              <div
                key={streamer._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <div className="h-32 bg-gradient-to-r from-purple-400 to-indigo-500">
                    {streamer.bannerImage && (
                      <img
                        src={streamer.bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-4">
                    <Avatar className="h-16 w-16 border-4 border-white">
                      <AvatarImage src={streamer.profilePhoto} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {streamer.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="pt-10 px-4 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link
                        to={`/streamer/${streamer._id}`}
                        className="font-bold hover:text-purple-600"
                      >
                        {streamer.displayName || streamer.username}
                      </Link>
                      <p className="text-sm text-gray-500">@{streamer.username}</p>
                    </div>
                    {streamer.isLive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <RiLiveLine className="mr-1 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {streamer.bio || "No bio available"}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <RiUserHeartLine className="mr-1 text-purple-500" />
                      <span>{streamer.followers.length} followers</span>
                    </div>
                    <div className="flex items-center">
                      <RiUserStarLine className="mr-1 text-purple-500" />
                      <span>{streamer.following.length} following</span>
                    </div>
                  </div>
                  {user?._id !== streamer._id && (
                    <div className="mt-2 flex gap-2">
                      {streamer.isLive && (
                        <Button
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => navigate(`/stream/view/${streamer.streamId}`)}
                        >
                          <RiLiveLine className="mr-2" />
                          Watch Now
                        </Button>
                      )}
                      {user?.following?.includes(streamer._id) ? (
                        <Button
                          variant="outline"
                          className="w-full gap-2 border-purple-500 text-purple-500 hover:bg-purple-50"
                          onClick={() => handleUnfollow(streamer._id)}
                        >
                          <RiUserUnfollowLine />
                          Following
                        </Button>
                      ) : (
                        <Button
                          className="w-full gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={() => handleFollow(streamer._id)}
                        >
                          <RiUserFollowLine />
                          Follow
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <RiUserStarLine className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No streamers found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery ? "Try adjusting your search" : "No streamers available at the moment"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamersPage;
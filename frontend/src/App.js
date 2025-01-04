import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Image, BarChart2, Settings, Plus, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import './index.css';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('calendar');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSchedulePost = async (content, scheduledTime, platforms) => {
    try {
      const response = await fetch('http://localhost:5000/api/schedule-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          scheduled_time: scheduledTime,
          platforms: JSON.stringify(platforms),
          media_urls: '[]'
        }),
      });
      
      if (response.ok) {
        setShowNewPost(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  // Sample scheduled posts data
  const scheduledPosts = [
    {
      id: 1,
      content: "Exciting news coming soon! Stay tuned for our latest product launch 🚀",
      platforms: ['twitter', 'linkedin'],
      scheduledTime: "2025-01-10T09:00:00",
      status: 'pending'
    },
    {
      id: 2,
      content: "Check out our new blog post on social media strategies!",
      platforms: ['facebook', 'linkedin'],
      scheduledTime: "2025-01-11T15:30:00",
      status: 'published'
    }
  ];

  const PlatformIcon = ({ platform }) => {
    const icons = {
      twitter: <Twitter className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      facebook: <Facebook className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />
    };
    return icons[platform] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r shadow-sm flex flex-col items-center py-4 space-y-6">
        <button
          className={`p-2 rounded-lg ${selectedTab === 'calendar' ? 'bg-blue-100' : ''} hover:bg-gray-100`}
          onClick={() => setSelectedTab('calendar')}
        >
          <Calendar className="w-6 h-6" />
        </button>
        <button
          className={`p-2 rounded-lg ${selectedTab === 'analytics' ? 'bg-blue-100' : ''} hover:bg-gray-100`}
          onClick={() => setSelectedTab('analytics')}
        >
          <BarChart2 className="w-6 h-6" />
        </button>
        <button
          className={`p-2 rounded-lg ${selectedTab === 'settings' ? 'bg-blue-100' : ''} hover:bg-gray-100`}
          onClick={() => setSelectedTab('settings')}
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Social Media Scheduler</h1>
          <button
            onClick={() => setShowNewPost(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </div>

        {/* Scheduled Posts */}
        <div className="grid gap-4">
          {scheduledPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-4">
              <div className="flex flex-row items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Scheduled Post</h2>
                <div className="flex space-x-2">
                  {post.platforms.map(platform => (
                    <div key={platform} className="bg-gray-100 p-2 rounded-full">
                      <PlatformIcon platform={platform} />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(post.scheduledTime).toLocaleString()}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Create New Post</h2>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full p-3 border rounded-lg mb-4 h-32"
                  placeholder="What would you like to share?"
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="border rounded-lg px-4 py-2 flex items-center">
                      <Image className="w-4 h-4 mr-2" />
                      Add Media
                    </button>
                    <button className="border rounded-lg px-4 py-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule
                    </button>
                  </div>
                  <div>
                    <button
                      className="border rounded-lg px-4 py-2 mr-2"
                      onClick={() => setShowNewPost(false)}
                    >
                      Cancel
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
                      Schedule Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {selectedTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Engagement Overview</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                Analytics data will appear here once you start publishing posts.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
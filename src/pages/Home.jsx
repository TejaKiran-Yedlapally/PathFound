import Button from '../components/Button';
import Input from '../components/Input';
import Text from '../components/Text';
import ErrorPage from './ErrorPage';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [url, setUrl] = useState('');
  const [courseName, setCourseName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [storedApiKey, setStoredApiKey] = useState(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showUpdateApiKey, setShowUpdateApiKey] = useState(false);
  const [courses, setCourses] = useState([]);

  const extractId = () => {
    const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const loadCourses = useCallback(() => {
    const stored = localStorage.getItem("pathfound_courses");
    setCourses(stored ? JSON.parse(stored) : []);

    const savedKey = localStorage.getItem("pathfound_api_key");
    if (savedKey) {
      setStoredApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleDeleteCourse = (title) => {
    setCourses((prev) => {
      const updated = prev.filter((c) => c.courseName !== title);
      localStorage.setItem('pathfound_courses', JSON.stringify(updated));
      return updated;
    });
  };

  const createCourse = async () => {
    const id = extractId();
    if (!storedApiKey) {
      alert("Please enter and save your API Key first.");
      return;
    }

    try {
      if (id !== null) {
        let allVideos = [];
        let nextPageToken = '';
        do {
          const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
              part: 'snippet',
              maxResults: 50,
              playlistId: id,
              pageToken: nextPageToken,
              key: storedApiKey,
            }
          });

          const items = response.data.items.map((video) => ({
            videoId: video.snippet.resourceId.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            complete: false,
          }));

          allVideos = [...allVideos, ...items];
          nextPageToken = response.data.nextPageToken || '';
        } while (nextPageToken);

        setCourses((prev) => {
          const updated = [...prev, { courseName: courseName.trim(), playList: allVideos }];
          localStorage.setItem("pathfound_courses", JSON.stringify(updated));
          return updated;
        });

        setShowCreateCourse(false);
        setCourseName('');
        setUrl('');
      } else {
        throw new Error('Invalid Playlist URL');
      }
    } catch (error) {
      alert('Enter a correct Playlist URL');
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("pathfound_api_key", apiKey.trim());
      setStoredApiKey(apiKey.trim());
      setApiKey('');
      alert("API Key saved!");
      setShowUpdateApiKey(false);
    } else {
      alert("API key cannot be empty.");
    }
  };

  const handleResetApiKey = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the API key?");
    if (confirmReset) {
      localStorage.removeItem("pathfound_api_key");
      setStoredApiKey(null);
      setShowUpdateApiKey(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-blue-100 py-10 px-4">
      <div className="w-full max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <Text as="h1" className="text-4xl font-extrabold text-gray-800" text="PathFound" />
          </div>
          <div className="flex items-center gap-4">
            {storedApiKey && (
              <Button
                onClick={() => setShowUpdateApiKey(true)}
                name="Change API Key"
                className="bg-yellow-500 text-white px-5 py-2 rounded-xl hover:bg-yellow-600 transition"
              />
            )}
            <Button
              onClick={() => setShowCreateCourse(!showCreateCourse)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl shadow hover:bg-indigo-700 transition-all"
              name={showCreateCourse ? 'Close Form' : 'Create Course'}
            />
          </div>
        </div>

        {/* API Key Form (if first time or updating) */}
        {(showUpdateApiKey || !storedApiKey) && (
          <div className="mt-6 mb-8 bg-white p-6 rounded-2xl shadow border max-w-5xl mx-auto">
            <Text as="h2" className="text-xl font-bold text-gray-800 mb-2" text="YouTube API Key" />
            <Text as="p" className="text-gray-600 mb-4" text="Enter your YouTube API key to fetch playlists" />

            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300">
              <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <Input
                value={apiKey}
                placeHolder="Enter your YouTube API key"
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Button
                name="Save API Key"
                onClick={handleSaveApiKey}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
              />

              {storedApiKey && (
                <Button
                  name="Reset API Key"
                  onClick={handleResetApiKey}
                  className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition"
                />
              )}

              <Button
                name="Cancel"
                onClick={() => {
                  setShowUpdateApiKey(false);
                  setApiKey('');
                }}
                className="bg-gray-400 text-white px-5 py-2 rounded-xl hover:bg-gray-500 transition"
              />
            </div>


          </div>
        )}

        {/* Course Form */}
        {showCreateCourse && (
          <div className="mt-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-5xl mx-auto">
            <div className="mb-6 text-center">
              <Text as="h2" className="text-2xl font-bold text-gray-800 mb-2" text="Add Learning Course" />
              <Text as="p" className="text-gray-600" text="Enter a YouTube playlist URL to get started with your learning journey" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row mb-4">
              <div className="flex items-center w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  value={url}
                  placeHolder="https://youtube.com/playlist?list=..."
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </div>

              <div className="flex items-center w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
                </svg>
                <Input
                  value={courseName}
                  placeHolder="Course Name"
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={createCourse}
                name="Add Course"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
              />
            </div>
          </div>
        )}

        {/* Courses Section */}
        <div className="mt-14">
          <Text as="h2" className="text-3xl font-semibold text-gray-800 mb-6" text="Your Courses" />
          <div className="flex flex-wrap gap-6">
            {courses.length > 0 ? (
              courses.map((values, index) => (
                <CourseCard
                  key={index}
                  title={values.courseName}
                  playList={values.playList}
                  onDelete={handleDeleteCourse}
                />
              ))
            ) : (
              <ErrorPage text="No Courses" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

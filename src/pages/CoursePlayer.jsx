import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CoursePlayer.css';

const CoursePlayer = () => {
  const [currentVideo, setCurrentVideo] = useState('');
  const [description, setDescription] = useState('');
  const [completedVideos, setCompletedVideos] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { state } = useLocation();
  const { playList = [], title = '' } = state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (playList.length > 0 && !currentVideo) {
      setCurrentVideo(playList[0].videoId);
      setDescription(playList[0].description);
    }
  }, [playList, currentVideo]);

  useEffect(() => {
    const raw = localStorage.getItem('pathfound_courses');
    if (!raw) {
      const init = playList.reduce((acc, v) => ({ ...acc, [v.videoId]: false }), {});
      setCompletedVideos(init);
      return;
    }

    try {
      const courses = JSON.parse(raw);
      const presentCourse = courses.find((c) => c.courseName === title);
      if (!presentCourse) {
        const init = playList.reduce((acc, v) => ({ ...acc, [v.videoId]: false }), {});
        setCompletedVideos(init);
        return;
      }
      const map = presentCourse.playList.reduce((acc, v) => {
        acc[v.videoId] = !!v.complete;
        return acc;
      }, {});
      setCompletedVideos(map);
    } catch (e) {
      console.error('Failed to parse pathfound_courses', e);
    }
  }, [title, playList]);

  const onClick = (videoId, videoDescription) => {
    setCurrentVideo(videoId);
    setDescription(videoDescription);
    setExpanded(false);
  };

  const toggleCompleted = (videoId) => {
    setCompletedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));

    const raw = localStorage.getItem('pathfound_courses');
    if (!raw) return;

    try {
      const courses = JSON.parse(raw);
      const presentCourse = courses.find((c) => c.courseName === title);
      if (!presentCourse) return;

      presentCourse.playList.forEach((video) => {
        if (video.videoId === videoId) {
          video.complete = !video.complete;
        }
      });

      localStorage.setItem('pathfound_courses', JSON.stringify(courses));
    } catch (e) {
      console.error('Error updating localStorage:', e);
    }
  };

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const completedCount = Object.values(completedVideos).filter(Boolean).length;
  const progress = Math.round((completedCount / playList.length) * 100);

  const filteredVideos = playList.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-sans">
      {/* Sidebar */}
      <aside className="md:w-2/5 w-full bg-white shadow-lg border-r border-blue-200 flex flex-col overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-blue-100">
          <button
            onClick={() => navigate('/PathFound')}
            className="mb-4 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 transition text-sm"
          >
            ← Back To Home
          </button>

          <h2 className="text-lg font-semibold text-blue-600 mb-2">{title}</h2>
          <p className="text-sm text-gray-600">Progress: {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-green-400 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {progress === 100 && (
            <div className="text-green-600 text-sm font-semibold mb-2">🎉 Course Completed!</div>
          )}

          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Scrollable Video List */}
        <div className="p-6 space-y-4">
          {filteredVideos.map((video, index) => (
            <div
              key={video.videoId || index}
              className={`video-card flex items-center justify-between p-4 rounded-lg shadow hover:shadow-md transition-all cursor-pointer ${
                completedVideos[video.videoId]
                  ? 'bg-green-100 border border-green-400'
                  : 'bg-white'
              }`}
              onClick={() => onClick(video.videoId, video.description)}
            >
              <div className="flex items-center gap-4">
                <img
                  src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                  alt="Thumbnail"
                  className="w-16 h-10 rounded object-cover"
                />
                <div>
                  <h4 className="text-base font-semibold">{video.title}</h4>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompleted(video.videoId);
                }}
                className="focus:outline-none"
              >
                {completedVideos[video.videoId] ? (
                  <lord-icon
                    src="https://cdn.lordicon.com/aupkjxuw.json"
                    trigger="in"
                    delay="100"
                    state="in-check"
                    colors="primary:#16c72e"
                    style={{ height: '24px', width: '24px' }}
                  ></lord-icon>
                ) : (
                  <lord-icon
                    src="https://cdn.lordicon.com/aupkjxuw.json"
                    trigger="hover"
                    style={{ height: '24px', width: '24px' }}
                  ></lord-icon>
                )}
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:w-3/5 w-full p-6 flex flex-col">
        {currentVideo ? (
          <>
            {/* Fixed Video Player */}
            <div className="relative pb-[56.25%] h-0 rounded-xl shadow-lg overflow-hidden mb-6">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentVideo}?rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                allowFullScreen
              ></iframe>
            </div>

            {/* Scrollable Description */}
            <div className="bg-white rounded-lg p-4 shadow-inner overflow-y-auto max-h-[calc(100vh-400px)]">
              <p className="text-sm whitespace-pre-line">
                {expanded
                  ? description
                  : description.length > 300
                  ? description.slice(0, 300) + '...'
                  : description}
              </p>
              {description.length > 300 && (
                <button
                  onClick={toggleExpanded}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  {expanded ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-lg">Select a video to play</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursePlayer;

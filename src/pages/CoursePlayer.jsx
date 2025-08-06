import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import '../CoursePlayer.css';

const CoursePlayer = () => {
  const [currentVideo, setCurrentVideo] = useState('');
  const [description, setDescription] = useState('');
  const [completedVideos, setCompletedVideos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('notes');
  const [fileName, setFileName] = useState('MyNotes');

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

  useEffect(() => {
    if (currentVideo) {
      const savedNotes = localStorage.getItem(`notes_${currentVideo}`);
      setNotes(savedNotes || '');
    }
  }, [currentVideo]);

  useEffect(() => {
    if (currentVideo) {
      localStorage.setItem(`notes_${currentVideo}`, notes);
    }
  }, [notes, currentVideo]);

  const onClick = (videoId, videoDescription) => {
    setCurrentVideo(videoId);
    setDescription(videoDescription);
    setView('notes');
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

  const completedCount = Object.values(completedVideos).filter(Boolean).length;
  const progress = Math.round((completedCount / playList.length) * 100);
  const filteredVideos = playList.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const downloadPDF = () => {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(notes, 180); 
  doc.text(lines, 10, 10);
  doc.save(`${fileName || 'notes'}.pdf`);
};


  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-sans transition-all duration-300">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="md:w-2/6 w-full bg-white shadow-lg border-r border-blue-200 flex flex-col overflow-y-auto transition-all duration-300">
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
              <div className="text-green-600 text-sm font-semibold mb-2">
                🎉 Course Completed!
              </div>
            )}
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="p-6 space-y-4">
            {filteredVideos.map((video, index) => (
              <div
                key={video.videoId || index}
                className={`video-card flex items-center justify-between p-4 rounded-lg shadow hover:shadow-md transition-all cursor-pointer ${completedVideos[video.videoId]
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
      )}

      {/* Main + Description/Notes */}
      <main className={`transition-all duration-300 flex-1 p-6 flex flex-col`}>
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sm bg-blue-200 px-3 py-1 rounded-full hover:bg-blue-300 transition"
          >
            {sidebarOpen ? '📕 Close Sidebar' : '📘 Open Sidebar'}
          </button>

          {/* Toggle Tabs */}
          <div className="flex items-center bg-white p-1 rounded-full shadow-md">
            <button
              onClick={() => setView('description')}
              className={`px-4 py-1 rounded-full transition font-medium text-sm ${view === 'description'
                ? 'bg-blue-600 text-white'
                : 'text-blue-600 hover:bg-blue-100'
                }`}
            >
              📄 Description
            </button>
            <button
              onClick={() => setView('notes')}
              className={`px-4 py-1 rounded-full transition font-medium text-sm ${view === 'notes'
                ? 'bg-blue-600 text-white'
                : 'text-blue-600 hover:bg-blue-100'
                }`}
            >
              📝 Notes
            </button>
          </div>
        </div>

        {currentVideo ? (
          <div className={`flex ${sidebarOpen ? 'flex-col' : 'flex-row gap-6'} transition-all duration-300`}>
            {/* Video Player */}
            <div className={`${sidebarOpen ? 'w-full' : 'w-2/3'} relative pb-[56.25%] h-0 rounded-xl shadow-lg overflow-hidden mb-6`}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentVideo}?rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* View Panel */}
            <div className={`${sidebarOpen ? 'w-full max-h-64 mb-4' : 'w-1/3 max-h-[70vh]'} bg-white rounded-lg p-4 shadow-md overflow-y-auto custom-scrollbar transition-all duration-300`}>
              {view === 'description' ? (
                <>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">📄 Description</h3>
                  <p className="text-sm whitespace-pre-line">{description}</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">📝 Your Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={sidebarOpen ? 6 : 12}
                    placeholder="Write your notes here..."
                    className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    type="text"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full mb-2 p-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />

                  <button
                    onClick={downloadPDF}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                  >
                    📥 Download Notes as PDF
                  </button>
                </>
              )}
            </div>
          </div>
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

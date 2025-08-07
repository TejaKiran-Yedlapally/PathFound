import Text from "./Text";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CourseCard = ({ title, playList, onDelete }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem("pathfound_courses");
    if (raw) {
      try {
        const courses = JSON.parse(raw);
        const presentCourse = courses.find((c) => c.courseName === title);
        if (presentCourse) {
          const total = presentCourse.playList.length;
          const completed = presentCourse.playList.filter((v) => v.complete).length;
          setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
        }
      } catch (e) {
        console.error("Error parsing pathfound_courses:", e);
        setProgress(0);
      }
    }
  }, [title, playList]);

  const handleDelete = () => {
    if (window.confirm(`Delete "${title}" course?`)) {
      onDelete?.(title);
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-gray-200 shadow-xl hover:shadow-2xl hover:scale-[1.015] transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Info Section */}
        <div className="flex-1 w-full">
          <Text as="h2" text={title} className="text-2xl font-bold text-gray-800" />
          <Text
            as="p"
            text="Learn with a guided, playlist-based course. Track your progress and stay on path."
            className="text-sm text-gray-600 mt-1"
          />
          <div className="mt-4">
            <Text as="p" text={`${playList.length} Videos`} className="text-sm text-gray-600" />
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="flex flex-col items-center gap-4">
          {/* Progress Circle */}
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 w-full h-full">
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#E5E7EB"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#6366F1"
                strokeWidth="4"
                fill="none"
                strokeDasharray="188.4"
                strokeDashoffset={(188.4 * (100 - progress)) / 100}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-indigo-600">
              {progress}%
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              name="Start"
              onClick={() => navigate("/PathFound/course", { state: { playList, title } })}
              className="relative px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-indigo-400/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] backdrop-blur-md"
            >
              <span className="z-10 relative">Start</span>
            </Button>

            <Button
              name="Delete"
              onClick={handleDelete}
              className="relative px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium shadow-lg hover:shadow-pink-400/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] backdrop-blur-md"
            >
              <span className="z-10 relative">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

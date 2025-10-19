import React, { useState } from "react";
import "./index.css";

const API_KEY = "AIzaSyAVKOSoQYlQ-bgC3jW4lGyTfnePZmwEjPs";

function App() {
  const [topic, setTopic] = useState("");
  const [videos, setVideos] = useState([]);

  const parseDuration = (duration) => {
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = match && match[1] ? parseInt(match[1]) : 0;
    const seconds = match && match[2] ? parseInt(match[2]) : 0;
    return minutes * 60 + seconds;
  };

  const startLearning = async () => {
    if (!topic.trim()) return;
    setVideos([]);

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(topic)}&key=${API_KEY}`;

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${API_KEY}`;

      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      const nonShorts = detailsData.items.filter(
        (v) => parseDuration(v.contentDetails.duration) > 180
      );

      setVideos(nonShorts.slice(0, 3));
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const handleBubbleClick = (bubbleTopic) => {
    setTopic(bubbleTopic);
    setTimeout(startLearning, 100);
  };

  return (
    <div id="app">
      <h1>StudyZen</h1>
      <h3>Information found faster...</h3>

      <div className = "searchBar">
        <input
          id="topic"
          placeholder="Enter a topic to begin searching..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={startLearning}>Learn</button>
      </div>

      <div className="bubbleBar">
        {["Stock Market", "SAT Prep", "Building Resumes", "Stoichiometry"].map(
          (bubble, i) => (
            <div key={i} className="bubble" onClick={() => handleBubbleClick(bubble)}>
              {bubble}
            </div>
          )
        )}
      </div>

      {videos.length > 0 && (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.id}>
              <p>
                <b>{video.snippet.title}</b>
              </p>
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                allowFullScreen
              ></iframe>
              <ul>
                {(video.snippet.description || "")
                  .split(/[.?!]\s+/)
                  .filter((b) => b.trim() !== "")
                  .slice(0, 3)
                  .map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

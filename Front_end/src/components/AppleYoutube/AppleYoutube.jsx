import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../utils/axiosInstance';
import  './AppleYoutube.css'
const AppleYoutube = () => {
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getVideos() {
      try {
        setLoading(true);
        setError(null);
        
        // Use axiosInstance instead of fetch
        const response = await axiosInstance.get('/api/youtube-videos');
        
        setYoutubeVideos(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch videos');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    }
    getVideos();
  }, []);
console.log(youtubeVideos)

  return (
    <section className="youtubeVideosWrapper">
      <div className="allVideosWrapper">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-12">
              <div className="title-wrapper">
                <br />
                <h1>Latest Videos</h1>
                <br />
              </div>
            </div>

            {youtubeVideos.map((singleVideo, i) => (
              <div key={i} className="col-sm-12 col-md-6 col-lg-4">
                <div className="singleVideoWrapper">
                  <div className="videoThumbnail">
                    <a
                      href={`https://www.youtube.com/watch?v=${singleVideo.id.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={singleVideo.snippet.thumbnails.high.url}
                        alt={singleVideo.snippet.title}
                      />
                    </a>
                  </div>
                  <div className="videoInfoWrapper">
                    <div className="videoTitle">
                      <a
                        href={`https://www.youtube.com/watch?v=${singleVideo.id.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {singleVideo.snippet.title}
                      </a>
                    </div>
                    <div className="videoDesc">
                      {singleVideo.snippet.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppleYoutube;
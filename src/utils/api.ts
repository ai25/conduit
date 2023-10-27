import { PipedVideo } from "~/types";

const api = {
  fetchVideo: async (videoId: string | undefined, api_url: string): Promise<PipedVideo> => {
    if (!videoId) throw new Error("videoId is undefined");
    let res = await fetch(
      api_url + "/streams/" + videoId
    )
    if (!res.ok) throw new Error("video not found");
    return res.json();

  },
}

export default api;

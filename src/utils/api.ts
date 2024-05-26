import { PipedVideo } from "~/types";

const api = {
  fetchVideo: async (
    videoId: string | undefined,
    api_url: string
  ): Promise<PipedVideo> => {
    if (!videoId) throw new Error("videoId is undefined");
    let res = await fetch(api_url + "/streams/" + videoId);
    console.log(res, "res");
    if (!res.ok) throw new Error(JSON.stringify(await res.json()));
    return res.json();
  },
};

export default api;

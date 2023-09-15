import { createEffect, createSignal, useContext } from "solid-js";
import { A } from "solid-start";
import { Playlist } from "~/types";
import { useSyncedStore } from "~/stores/syncedStore";
import { generateThumbnailUrl } from "~/utils/helpers";
import { videoId } from "./history";
import { usePreferences } from "~/stores/preferencesStore";

export default function Playlists() {
  const sync = useSyncedStore();
  const [preferences] = usePreferences();
  createEffect(() => {
    let playlist = list;
    if (!preferences.instance) return;
    const l: Record<string, Playlist> = {
      [playlist.id]: {
        bannerUrl: generateThumbnailUrl(
          preferences.instance.image_proxy_url,
          videoId(playlist.videos[0].thumbnail)
        ),
        description: "",
        name: playlist.name,
        nextpage: "",
        relatedStreams: playlist.videos,
        thumbnailUrl: playlist.thumbnail,
        uploader: "You",
        uploaderUrl: "",
        uploaderAvatar: "",
        videos: playlist.videos.length,
      } as unknown as Playlist,
    };
    console.log(l);
    setTimeout(() => {
      sync.setStore("playlists", l);
    }, 0);
  });

  const list = {
    id: "conduit-cl9im1y6n4193v370w67tloir",
    name: "Favorites",
    length: 137,
    thumbnail:
      "https://piped-proxy-de.privacy.com.de/vi_webp/wYyicw6pG2k/mqdefault.webp?host=i.ytimg.com",
    videos: [
      {
        url: "/watch?v=wYyicw6pG2k",
        type: "video",
        title: "Chainsaw Man Ending 7 Full -『Chu, Tayousei』by ano",
        thumbnail:
          "https://piped-proxy-de.privacy.com.de/vi_webp/wYyicw6pG2k/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Melodic Star",
        uploaderUrl: "/channel/UC22lbRS_QoB92Gy4DAIJ-tw",
        uploaderAvatar:
          "https://piped-proxy-de.privacy.com.de/ytc/AOPolaSfX3HduEyRjCrdfvogRIbyfH8MfoR7hXbkjjMneQ=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2022-11-22",
        shortDescription:
          'Chainsaw Man ED/Ending Song "Chu, Tayousei" by ano<br>TV Anime "Chainsaw Man" ED/Ending 7<br>Artist:',
        duration: 224,
        views: 171071,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 6,
      },
      {
        url: "/watch?v=HIRiduzNLzQ",
        type: "video",
        title: "美波「ホロネス」MV",
        thumbnail:
          "https://piped-proxy.hostux.net/vi_webp/HIRiduzNLzQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "美波",
        uploaderUrl: "/channel/UC2JzylaIF8qeowc7-5VwwmA",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/ytc/AOPolaRjHteVnNYrzInpwH8HBbmJ-s4Gc2elnU77OiZKJw=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2018-08-03",
        shortDescription:
          "美波「ホロネス」MV<br><br>Forgive me for my poor English.. but I have lots of things I want to share, delive",
        duration: 320,
        views: 39621599,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 7,
      },
      {
        url: "/watch?v=tsoho0c8WBQ",
        type: "video",
        title: "Nightcore - Lost Control - (Alan Walker / Lyrics)",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/tsoho0c8WBQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Syrex",
        uploaderUrl: "/channel/UCeZje_7vr6CPK9vPQDfV3WA",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/ytc/AOPolaR2ozHywZ9O6ldGt8JJ3clBfdCuQBkSSmtuDiP2RA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-12-29",
        shortDescription:
          'Nightcore - Alan Walker - Lost Control (ft. Sorana) | Lyrics<br>🎧 Download / Stream: <a href="https',
        duration: 202,
        views: 14953241,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 8,
      },
      {
        url: "/watch?v=SqTq1P6y70Q",
        type: "video",
        title:
          "Introducing “VOCALOID Po-uta”, a Porter Robinson VOCALOID6 Voicebank",
        thumbnail:
          "https://piped-proxy.hostux.net/vi_webp/SqTq1P6y70Q/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Porter Robinson",
        uploaderUrl: "/channel/UCKKKYE55BVswHgKihx5YXew",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/h97n6FCo06aQ-TIwW9qzSc5sLwWVdjfCTw8ISj0mUZIAj3iGKxXVdhwXLj2U-tclhSMNEPZhjQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2023-03-06",
        shortDescription:
          "Po-uta - Humansongs (YAMAHA “VOCALOID6 Po-uta” demonstration song)<br><br>Po-uta is available now on",
        duration: 218,
        views: 655463,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 9,
      },
      {
        url: "/watch?v=8wsc673F6h0",
        type: "video",
        title: "GET LEMON 3?? Disciple - How We Roll Megacollab [LYRIC VIDEO]",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/8wsc673F6h0/mqdefault.webp?v=5fa57982&host=i.ytimg.com",
        uploaderName: "Disciple",
        uploaderUrl: "/channel/UCALs6y97IVNeuzPg-j56lOg",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/AYBaMpCUDAFKzRwZD4wRLLuO-36NC6pJU19XQSwHJ9qhSBS8E3kjIb5tLvvc_EHL9Ysf3cUz=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-11-06",
        shortDescription:
          'Thank you to the incredible creators that made this lyric video:<br><br>Angelolz: <a href="https://w',
        duration: 216,
        views: 344255,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 10,
      },
      {
        url: "/watch?v=pKgmhUlOF3k",
        type: "video",
        title: "Eliminate - Them (feat. Virus Syndicate)",
        thumbnail:
          "https://ytproxy.dc09.ru/vi_webp/pKgmhUlOF3k/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "The Dub Rebellion",
        uploaderUrl: "/channel/UCH3V-b6weBfTrDuyJgFioOw",
        uploaderAvatar:
          "https://ytproxy.dc09.ru/ytc/AOPolaTdHVLIQAWoMvvTIE-8HybMld_ITY0DJtTPo2Yj=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-03-12",
        shortDescription:
          '"Cyber Whale" EP available to stream/buy:<br>➘ Store: <a href="https://disc.fanlink.to/cyberwhale">h',
        duration: 173,
        views: 172748,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 11,
      },
      {
        url: "/watch?v=N8nGig78lNs",
        type: "video",
        title: "Snail's House - Hot Milk",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/N8nGig78lNs/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgXyhJMA8=&rs=AOn4CLCYmgppdSdR68RIU-BZSDF-qS5OcQ&host=i.ytimg.com",
        uploaderName: "Ujico*/Snail's House",
        uploaderUrl: "/channel/UCYxBY8mhJ7R2rMIcQ28H_Zw",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/h67vdSJCieoKsUIJ6QWUByjTE1qOpzGRISjVClMBLdJYNZZfLx3VyX9-pFsgdRHaEfU_4ZGg_A=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-09-19",
        shortDescription:
          'Official upload of Snail\'s House - "Hot Milk"<br><br>Listen to this song on Spotify : <a href="https',
        duration: 249,
        views: 26043104,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 12,
      },
      {
        url: "/watch?v=k03sUpjBmoM",
        type: "video",
        title:
          'Attack On Titan Season 4  Part 2 Ending "Akuma no ko/A child Of Evil" (Lyrics Kan|Rom|Eng)',
        thumbnail:
          "https://proxy.piped.yt/vi_webp/k03sUpjBmoM/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "mysticholy",
        uploaderUrl: "/channel/UCwp36w1ZUOvjb2rfMwWSuaQ",
        uploaderAvatar:
          "https://proxy.piped.yt/qnSoA9jIktaJJxnV6qFJibybLOQADjUwyYlsq-hHqNEpM1b70BNHGp3OINw7qSkHvgjxukC3=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2022-01-20",
        shortDescription:
          "H e l l o<br><br>♪Anime - Shingeki no Kyojin S4 Part 2<br>♪Song - Akuma no ko /A child of Evil<br>♪S",
        duration: 223,
        views: 555893,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 13,
      },
      {
        url: "/watch?v=S2AhFrGXa8I",
        type: "video",
        title: "MIMI - みにまむ (feat. わん子) 【OFFICIAL VIDEO】",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/S2AhFrGXa8I/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "MIMI",
        uploaderUrl: "/channel/UCam3IAA-nyfxRL8_wDQ35VA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaSlslj7jud81Nb5cbRUfaUNDqv5841uc9IJLtpyLA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2022-08-22",
        shortDescription:
          "Music: MIMI &nbsp;@mimi_3mi<br>Vocals: わん子 @wanko_sing<br>Illustration: 粟屋やわ子 @awayawa_pic<br>Mix, M",
        duration: 147,
        views: 466169,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 14,
      },
      {
        url: "/watch?v=0kAZq0bMUpQ",
        type: "video",
        title: "「Nightcore」→ Stronger (Omar Varela, Xavi & Gi)",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi_webp/0kAZq0bMUpQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Syrex",
        uploaderUrl: "/channel/UCeZje_7vr6CPK9vPQDfV3WA",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/ytc/AOPolaR2ozHywZ9O6ldGt8JJ3clBfdCuQBkSSmtuDiP2RA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-12-06",
        shortDescription:
          'Enjoy this track and subscribe for more!<br><a href="http://bit.ly/1O3e3ip">http://bit.ly/1O3e3ip</a',
        duration: 178,
        views: 499285,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 15,
      },
      {
        url: "/watch?v=OmX4UPiVS-w",
        type: "video",
        title:
          "100 gecs - ringtone (remix) [feat. Charli XCX, Rico Nasty, Kero Kero Bonito]  {VISUALIZER}",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/OmX4UPiVS-w/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgXyhSMA8=&rs=AOn4CLBVJHioXUM-cwlW6ihnb1JVvvTShA&host=i.ytimg.com",
        uploaderName: "100 gecs",
        uploaderUrl: "/channel/UCVdlcqbM4oh0xJIQAxiaV5Q",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/EyGKIktyH2jeyiidyzEKIC36-VR4xRcsG9g6ugTfgnU8r1-wOo_G-5H1ZQYrZCnMTwBbAySSLw=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-02-24",
        shortDescription:
          "100 gecs - ringtone (remix) [feat. Charli XCX, Rico Nasty, Kero Kero Bonito] &nbsp;{VISUALIZER}<br>S",
        duration: 230,
        views: 3897594,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 16,
      },
      {
        url: "/watch?v=jJzw1h5CR-I",
        type: "video",
        title: "ドラマツルギー - Eve  MV",
        thumbnail:
          "https://proxy.piped.yt/vi_webp/jJzw1h5CR-I/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Eve",
        uploaderUrl: "/channel/UCUXfRsEIJ9xO1DT7TbEWksw",
        uploaderAvatar:
          "https://proxy.piped.yt/QekB6yPL1mIipePMdPR3r0hzabxUowZnO8AwD3xeREPv34uE7BDP7D0EBxXMOQRB-cvTzE73fQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-10-11",
        shortDescription:
          'Eve New Album "Culture" 12.13 IN STORES<br>Special site: http: // eveofficial.com/bunka/<br>"Culture',
        duration: 246,
        views: 160518603,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 17,
      },
      {
        url: "/watch?v=1tk1pqwrOys",
        type: "video",
        title: "廻廻奇譚 - Eve MV",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi/1tk1pqwrOys/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAa4d548fZz_6zUv6-AdAxqR1CW8A&host=i.ytimg.com",
        uploaderName: "Eve",
        uploaderUrl: "/channel/UCUXfRsEIJ9xO1DT7TbEWksw",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/QekB6yPL1mIipePMdPR3r0hzabxUowZnO8AwD3xeREPv34uE7BDP7D0EBxXMOQRB-cvTzE73fQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-11-20",
        shortDescription:
          '廻廻奇譚(kaikaikitan) - Eve Music Video<br>Streaming/DL：<a href="https://tf.lnk.to/kaikaikitan">https://',
        duration: 223,
        views: 316910140,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 18,
      },
      {
        url: "/watch?v=lw51UR6Qoy8",
        type: "video",
        title: "藍才 - Eve MV",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/lw51UR6Qoy8/mqdefault.webp?v=61c44d5d&host=i.ytimg.com",
        uploaderName: "Eve",
        uploaderUrl: "/channel/UCUXfRsEIJ9xO1DT7TbEWksw",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/QekB6yPL1mIipePMdPR3r0hzabxUowZnO8AwD3xeREPv34uE7BDP7D0EBxXMOQRB-cvTzE73fQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-12-24",
        shortDescription:
          '藍才 (Aisai) - Eve Music Video<br><br>▼Streaming / DL <br><a href="https://tf.lnk.to/aisai">https://tf',
        duration: 274,
        views: 13669975,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 0,
      },
      {
        url: "/watch?v=QL-njhsH8ac",
        type: "video",
        title: "Flux Pavilion - Cannot Hold You (feat. Jamie Lidell)",
        thumbnail:
          "https://piped-proxy.hostux.net/vi/QL-njhsH8ac/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgQShIMA8=&rs=AOn4CLC2dsz4Mj6qwskZEICIuapW6Ub8yA&host=i.ytimg.com",
        uploaderName: "MrSuicideSheep",
        uploaderUrl: "/channel/UC5nc_ZtjKW1htCVZVRxlQAQ",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/ANmgv2-dyHCi7tnIuUtJLcKUI9QIk2Rp8Fojl4Gwe4PLxFCxD-S0jvJdO7JvEbHnT3Rk_zaD=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2022-08-04",
        shortDescription:
          '⬙ &nbsp;MrSuicideSheep Links ⬙<br><a href="https://linktr.ee/MrSuicideSheep">https://linktr.ee/MrSui',
        duration: 252,
        views: 151018,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 19,
      },
      {
        url: "/watch?v=eAHwrDYuF2s",
        type: "video",
        title: "Dr. STONE Op - Good Morning World!┃Cover by Raon Lee",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/eAHwrDYuF2s/mqdefault.webp?v=5e61b218&host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-03-06",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 298,
        views: 2628069,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 20,
      },
      {
        url: "/watch?v=YhNvJm2N5TQ",
        type: "video",
        title:
          "『Haikyuu!! Season 3 Op』 HikariAre / BURNOUT SYNDROMES┃Cover by Raon Lee",
        thumbnail:
          "https://proxy.piped.yt/vi/YhNvJm2N5TQ/mqdefault.jpg?v=5fb6feaa&host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://proxy.piped.yt/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-11-20",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 282,
        views: 2358235,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 21,
      },
      {
        url: "/watch?v=e-IWRmpefzE",
        type: "video",
        title: "Knife Party - 'Bonfire'",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/e-IWRmpefzE/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgZShlMA8=&rs=AOn4CLAVm0jHw122nOeB5xXbA63JqLkhJg&host=i.ytimg.com",
        uploaderName: "Knife Party",
        uploaderUrl: "/channel/UCtXRolzmkBDmAkTEJiFXohw",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/ytc/AOPolaTKfBDHukgQH9PSPozqiKmF4L5ZAknu6X5XLh9LDQ=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2012-05-29",
        shortDescription:
          'Subscribe to Knife Party\'s YouTube channel here: <a href="https://bit.ly/KnifePartyInc">https://bit.',
        duration: 272,
        views: 79048656,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 1,
      },
      {
        url: "/watch?v=pb-EwykPTv8",
        type: "video",
        title: "deadmau5 ft Rob Swire - Ghosts 'n' Stuff",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi/pb-EwykPTv8/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARg-IGMoZTAP&rs=AOn4CLBQXhvIBjJRnLOMEixe4iQwNSOfig&host=i.ytimg.com",
        uploaderName: "deadmau5",
        uploaderUrl: "/channel/UCYEK6xds6eo-3tr4xRdflmQ",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/ytc/AOPolaQw3iMOFl8cqLctqV88_i40H0ybv9u3Z0sKIZGtgQ=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2009-07-19",
        shortDescription:
          'Get Professional Griefers ft. Gerard Way instantly when you pre-order new album on iTunes: <a href="',
        duration: 188,
        views: 9609365,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 22,
      },
      {
        url: "/watch?v=eEFVxI9lqjU",
        type: "video",
        title:
          "Everything Goes On - Porter Robinson (Official Music Video) | Star Guardian 2022",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/eEFVxI9lqjU/mqdefault.webp?v=62ccd1a2&host=i.ytimg.com",
        uploaderName: "League of Legends",
        uploaderUrl: "/channel/UC2t5bjwHdUX4vM2g8TRDq5g",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/72mzu20EzAX2EbpMma-yT8oKrYGnfxSEx4V5fNYjmKxuksIFVmfC2XI065qGXNr839wgXa8gCw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2022-07-14",
        shortDescription:
          "Together with some familiar faces, a new generation of Star Guardians ascend to battle a looming thr",
        duration: 159,
        views: 18955877,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 23,
      },
      {
        url: "/watch?v=jX98E5hCJZM",
        type: "video",
        title: "Panda Eyes & Geoxor - Lucid Dream",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi_webp/jX98E5hCJZM/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-10-12",
        shortDescription:
          'Panda Eyes & Geoxor - Lucid Dream<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https:/',
        duration: 327,
        views: 700950,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 24,
      },
      {
        url: "/watch?v=ruq8kgMARbQ",
        type: "video",
        title: "templuv - bleachers",
        thumbnail:
          "https://piped-proxy.hostux.net/vi/ruq8kgMARbQ/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgYChSMA8=&rs=AOn4CLD5mih7iIVqIXDTp8JZ-nQi3Jgi0A&host=i.ytimg.com",
        uploaderName: "technocore :p",
        uploaderUrl: "/channel/UCql6BCpFbbIw5jDJPGHaUPw",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/kBZej3wkaD2EKo47DHfPapn6C21dtkT5cuUQS-HHNe0yqIL1GjepVF_8_MkUPsCagpCZFC0W=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2022-05-19",
        shortDescription: "",
        duration: 130,
        views: 390,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 25,
      },
      {
        url: "/watch?v=jq9GKwhlXKo",
        type: "video",
        title: "RIOT - Dogma Resistance [Monstercat LP Mix]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/jq9GKwhlXKo/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCOiiY4FzbEvsdAVL32PfCklyf5ZQ&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-11-07",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monster.cat/dogmaresistance">https://monster.cat/dogma',
        duration: 2240,
        views: 1645300,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 26,
      },
      {
        url: "/watch?v=U41bONK2V-U",
        type: "video",
        title:
          "Skrillex, Noisia, josh pan & Dylan Brady - Supersonic (My Existence) [Official Audio]",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/U41bONK2V-U/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGFkgWShZMA8=&rs=AOn4CLAseiJqimrqz7Paon-kiZZjKNiaUQ&host=i.ytimg.com",
        uploaderName: "Skrillex",
        uploaderUrl: "/channel/UC_TVqp_SyG6j5hG-xVRy95A",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/NgDCsOjvd9c0Z0zWObIHeFLiyyxWvUq2jQn-aWPu45VOMOWNGDsyA4_a7HYLvUs3QSpK_rIEvvc=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-06-10",
        shortDescription:
          'Skrillex, Noisia, josh pan & Dylan Brady - Supersonic (My Existence)<br>Stream/DL: <a href="https://',
        duration: 165,
        views: 12996225,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 27,
      },
      {
        url: "/watch?v=_9c9VtLeX_c",
        type: "video",
        title: "Nightcore - A Thousand Years (Christina Perri)",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/_9c9VtLeX_c/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgXChNMA8=&rs=AOn4CLBs_GUwXfJ8eHy1nzHveW27lCH5wQ&host=i.ytimg.com",
        uploaderName: "mausal1111",
        uploaderUrl: "/channel/UCaDCFeZ-Xid-lVNr9uZgeQg",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaR5SrpcWgoIzWuGT9ue4OhMP6aPg1pxkYicyI6d=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-03-17",
        shortDescription:
          "♫ INFORMATION ♫<br><br>▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬<br><br>► The song from twilight. Personal",
        duration: 236,
        views: 2379338,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 28,
      },
      {
        url: "/watch?v=9BjkfP4hQPw",
        type: "video",
        title: "Joel Corry - I Wish (Lyrics) ft. Mabel",
        thumbnail:
          "https://piped-proxy.hostux.net/vi/9BjkfP4hQPw/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "The Vibe Guide",
        uploaderUrl: "/channel/UCxH0sQJKG6Aq9-vFIPnDZ2A",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/hkNTjyFsDL8IcLGSoO42-gLDLIrD2sCEUBQ7aLnofzaRqpbtXEjzGtCZZQd4oJ7cLCeOIyb9vQ=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-10-28",
        shortDescription:
          "I Wish (Lyrics) - Joel Corry, Mabel<br>Joel Corry - I Wish (Lyrics) ft. Mabel<br>Joel Corry, Mabel -",
        duration: 183,
        views: 1670410,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 29,
      },
      {
        url: "/watch?v=mD1zCqd82cU",
        type: "video",
        title: "Jaymes Young - Infinity (Lyrics)",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi/mD1zCqd82cU/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "Vibe Music",
        uploaderUrl: "/channel/UChO8h2G8UjOVc081rgYU8XQ",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/ytc/AOPolaT1sRLiZmkMtFIlFouQ9eeAUedYgqTcuMxFFKJT=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-12-04",
        shortDescription:
          '♫Jaymes Young - Infinity<br>Stream/Download: <a href="https://open.spotify.com/track/1SOClU..">https',
        duration: 238,
        views: 5423490,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 30,
      },
      {
        url: "/watch?v=liPu1_aPH5k",
        type: "video",
        title:
          "Sting - What Could Have Been | Arcane League of Legends | Riot Games Music",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi_webp/liPu1_aPH5k/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Riot Games Music",
        uploaderUrl: "/channel/UCltUcam72sZccQxDxlqAllQ",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/wivR3xDydohL2SgiZC347Z8mi_kWYBot7tuX8bl-Uy6SJsD0cV43k5nYAF6llYsG558kkZc8cQ=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-11-20",
        shortDescription:
          "Here's to the new us. Listen to Sting's \"What Could Have Been\" ft. Ray Chen off the Arcane Original ",
        duration: 214,
        views: 13668007,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 31,
      },
      {
        url: "/watch?v=6CfWFw2Uka8",
        type: "video",
        title: "Virtual Riot - Chroma",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/6CfWFw2Uka8/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "Disciple",
        uploaderUrl: "/channel/UCALs6y97IVNeuzPg-j56lOg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/AYBaMpCUDAFKzRwZD4wRLLuO-36NC6pJU19XQSwHJ9qhSBS8E3kjIb5tLvvc_EHL9Ysf3cUz=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-08-13",
        shortDescription:
          'Virtual Riot - Chroma<br>OUT NOW : <a href="http://disc.fanlink.to/CHROMA">http://disc.fanlink.to/CH',
        duration: 274,
        views: 267439,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 32,
      },
      {
        url: "/watch?v=prB1PoOiakA",
        type: "video",
        title: "Panda Eyes - How To Feel",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/prB1PoOiakA/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-12-01",
        shortDescription:
          'SUBSCRIBE for MORE!!!<br><br>● Artwork by xylerarts: <a href="https://www.artstation.com/xylerarts">',
        duration: 275,
        views: 195929,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 33,
      },
      {
        url: "/watch?v=GLNowszQmlw",
        type: "video",
        title: "Spoiled little brat",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/GLNowszQmlw/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AHUBoAC4AOKAgwIABABGEEgUyhyMA8=&rs=AOn4CLA1miHH7YH40-z4r1ivbZdvjK8hGA&host=i.ytimg.com",
        uploaderName: "underscores",
        uploaderUrl: "/channel/UC7Dr19bFdqkkfREMITgY9Vg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/ytc/AOPolaQ5xqbFfl0pFU-fjrVlZitLcvNbohrMwTus6aZB=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2021-03-24",
        shortDescription: "",
        duration: 200,
        views: 412758,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 34,
      },
      {
        url: "/watch?v=a7KdmIAehas",
        type: "video",
        title:
          "Gareth Emery & Standerwick - Saving Light ft. HALIENE (TwoWorldsApart Remix) | EXCLUSIVE",
        thumbnail:
          "https://piped-proxy.hostux.net/vi_webp/a7KdmIAehas/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "AirwaveMusicTV",
        uploaderUrl: "/channel/UCwIgPuUJXuf2nY-nKsEvLOg",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/ytc/AOPolaSUmH-3KMN0AxhynVJ7sYgDoUs-H0Kmy8bCcUDk2A=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-06-14",
        shortDescription:
          "Gareth Emery & Standerwick - Saving Light ft. HALIENE (TwoWorldsApart Remix) | EXCLUSIVE<br><br>Airw",
        duration: 221,
        views: 62446,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 35,
      },
      {
        url: "/watch?v=OrQ0zZArUV8",
        type: "video",
        title:
          "[English Sub] Akatsuki no Requiem MV - Linked Horizon (Attack on Titan)",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/OrQ0zZArUV8/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Skyclad Observer",
        uploaderUrl: "/channel/UC_QS3HZj_9xF2XHnH3ae8_w",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaSW2JMMlYxQGeeAciHtIDeNdHCSBG7xqQMPDt2Vzw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-08-07",
        shortDescription:
          "Read a good ending here: 👑🩸 OpUsurper.com 🩸👑<br><br>This is the full music video for Akatsuki no",
        duration: 248,
        views: 700136,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 36,
      },
      {
        url: "/watch?v=CGsmf_g9kho",
        type: "video",
        title: "Porter Robinson - Blossom (Official Audio)",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/CGsmf_g9kho/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AHUBoAC4AOKAgwIABABGGMgZSg4MA8=&rs=AOn4CLAN5cgULGJ3EsibrptQZHFbJ99p1Q&host=i.ytimg.com",
        uploaderName: "Porter Robinson",
        uploaderUrl: "/channel/UCKKKYE55BVswHgKihx5YXew",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/h97n6FCo06aQ-TIwW9qzSc5sLwWVdjfCTw8ISj0mUZIAj3iGKxXVdhwXLj2U-tclhSMNEPZhjQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-04-22",
        shortDescription:
          'Porter Robinson - Blossom (Official Audio)<br><br>my album "nurture" is out now: <a href="https://po',
        duration: 226,
        views: 708749,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 37,
      },
      {
        url: "/watch?v=q-74HTjRbuY",
        type: "video",
        title: "Porter Robinson - Musician (Official Music Video)",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/q-74HTjRbuY/mqdefault.webp?v=60511ac1&host=i.ytimg.com",
        uploaderName: "Porter Robinson",
        uploaderUrl: "/channel/UCKKKYE55BVswHgKihx5YXew",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/h97n6FCo06aQ-TIwW9qzSc5sLwWVdjfCTw8ISj0mUZIAj3iGKxXVdhwXLj2U-tclhSMNEPZhjQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-03-17",
        shortDescription:
          'Porter Robinson - Musician (Official Music Video)<br><br>my album "nurture" is out now: <a href="htt',
        duration: 241,
        views: 3694741,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 38,
      },
      {
        url: "/watch?v=-mJ7sxF92YQ",
        type: "video",
        title: "Halvorsen - Band-Aid [NCS Release]",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/-mJ7sxF92YQ/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "NoCopyrightSounds",
        uploaderUrl: "/channel/UC_aEa8K-EOJ3D6gOs7HcyNg",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/YIBi8NVC87fMfJHfQ2O0dyzjis7tUlO7VqWLhk1lq1fkIOQTrpX_Ip7G6S_u0IJosXYSe_Z9=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-06-22",
        shortDescription:
          'Subscribe to NoCopyrightSounds &nbsp;👉 <a href="http://ncs.lnk.to/SubscribeYouTube">http://ncs.lnk.',
        duration: 179,
        views: 1303602,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 39,
      },
      {
        url: "/watch?v=SzWk_I304Sg",
        type: "video",
        title:
          "[Indie Dance] - LVTHER - Some Kind Of Magic (feat. MYZICA) [Monstercat Release]",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi/SzWk_I304Sg/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAFn3eF6z1H-jirWNxdI2h7wqLKcA&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-03-30",
        shortDescription:
          'Support on iTunes: <a href="http://monster.cat/22OsHTA">http://monster.cat/22OsHTA</a><br>Support on',
        duration: 194,
        views: 4165002,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 40,
      },
      {
        url: "/watch?v=766qmHTc2ro",
        type: "video",
        title: "美波「アメヲマツ、」MV",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi_webp/766qmHTc2ro/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "美波",
        uploaderUrl: "/channel/UC2JzylaIF8qeowc7-5VwwmA",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/ytc/AOPolaRjHteVnNYrzInpwH8HBbmJ-s4Gc2elnU77OiZKJw=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2020-06-30",
        shortDescription:
          '美波「アメヲマツ、」MV<br>Minami -「 Amewomatsu、」<br>"Waiting for Rain" - 美波 (Minami) MV<br><br>作詞・作曲：美波<br>Wor',
        duration: 314,
        views: 63659527,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 41,
      },
      {
        url: "/watch?v=9uRUPUqH-vU",
        type: "video",
        title: "Virtual Riot - Self Checkout",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/9uRUPUqH-vU/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Disciple",
        uploaderUrl: "/channel/UCALs6y97IVNeuzPg-j56lOg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/AYBaMpCUDAFKzRwZD4wRLLuO-36NC6pJU19XQSwHJ9qhSBS8E3kjIb5tLvvc_EHL9Ysf3cUz=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-09-23",
        shortDescription:
          'Virtual Riot - Self Checkout<br>Save Yourself EP OUT NOW : <a href="https://disc.fanlink.to/SaveYour',
        duration: 212,
        views: 240354,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 42,
      },
      {
        url: "/watch?v=Apq03cedMzI",
        type: "video",
        title: "Virtual Riot - Wallmonger",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/Apq03cedMzI/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Disciple",
        uploaderUrl: "/channel/UCALs6y97IVNeuzPg-j56lOg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/AYBaMpCUDAFKzRwZD4wRLLuO-36NC6pJU19XQSwHJ9qhSBS8E3kjIb5tLvvc_EHL9Ysf3cUz=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-09-19",
        shortDescription:
          'Virtual Riot - Wallmonger<br>Save Yourself EP OUT NOW : <a href="https://disc.fanlink.to/SaveYoursel',
        duration: 289,
        views: 702067,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 2,
      },
      {
        url: "/watch?v=Yu0nrVGmo8w",
        type: "video",
        title: "7 Minutes Dead - Without Chu (feat. Emsi)",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/Yu0nrVGmo8w/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Diversity",
        uploaderUrl: "/channel/UC7tD6Ifrwbiy-BoaAHEinmQ",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/lE2wmejXJG-TlHD8V1r9cmAsKa3UDYrXGbajeAbaDMnEKRR-Kk59wAg8dyATgOivccLlpdV7=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-01-13",
        shortDescription:
          'Stream/Download:<br>➥ <a href="https://monstercat.ffm.to/withoutchu">https://monstercat.ffm.to/witho',
        duration: 196,
        views: 155909,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 43,
      },
      {
        url: "/watch?v=scqQ0jtRuZc",
        type: "video",
        title: "『Jujutsu Kaisen OP』 Kaikai Kitan / Eve┃Cover by Raon Lee",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/scqQ0jtRuZc/mqdefault.webp?v=5fd31a20&host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-12-11",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 259,
        views: 8135488,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 44,
      },
      {
        url: "/watch?v=3ME_zB3DMtk",
        type: "video",
        title: "Dabin - Holding On (Lyrics) feat. Lowell",
        thumbnail:
          "https://ytproxy.dc09.ru/vi_webp/3ME_zB3DMtk/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "WaveMusic",
        uploaderUrl: "/channel/UCbuK8xxu2P_sqoMnDsoBrrg",
        uploaderAvatar:
          "https://ytproxy.dc09.ru/ytc/AOPolaTAGxR8ObgjQ0nRMkMcwpYyQEck7RzlkhRW0JMlig=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-01-19",
        shortDescription:
          "🎧 Your Home For The Best Electronic Music With Lyrics!<br>Dabin - Holding On (feat. Lowell) Lyrics ",
        duration: 218,
        views: 1533767,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 45,
      },
      {
        url: "/watch?v=xhTJ_5g_57k",
        type: "video",
        title: "Aiobahn & Vin - If We Never [Monstercat Release]",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi/xhTJ_5g_57k/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBWMYN_Eg5Rbo6RRbnyb4bzG8mPYQ&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-08-31",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/IfWeNever">https://Monstercat.lnk.to',
        duration: 160,
        views: 349951,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 46,
      },
      {
        url: "/watch?v=ahEovqzpLeU",
        type: "video",
        title: "Porter Robinson - Get your Wish (Official Audio)",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi_webp/ahEovqzpLeU/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Porter Robinson",
        uploaderUrl: "/channel/UCKKKYE55BVswHgKihx5YXew",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/h97n6FCo06aQ-TIwW9qzSc5sLwWVdjfCTw8ISj0mUZIAj3iGKxXVdhwXLj2U-tclhSMNEPZhjQ=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-02-13",
        shortDescription:
          'Porter Robinson - Get your Wish<br><br>my album "nurture" is out now: <a href="https://porterrobinso',
        duration: 218,
        views: 1172842,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 47,
      },
      {
        url: "/watch?v=cABpfUBJYR8",
        type: "video",
        title:
          "Nightcore - On My Way (Alan Walker, Sabrina Carpenter & Farruko) - (Lyrics)",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi_webp/cABpfUBJYR8/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Syrex",
        uploaderUrl: "/channel/UCeZje_7vr6CPK9vPQDfV3WA",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/ytc/AOPolaR2ozHywZ9O6ldGt8JJ3clBfdCuQBkSSmtuDiP2RA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-03-23",
        shortDescription:
          '🎧 Download & Stream "On My Way" – <a href="https://lnk.to/AWOMW">https://lnk.to/AWOMW</a><br><br>⚡️',
        duration: 175,
        views: 13947450,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 48,
      },
      {
        url: "/watch?v=p4QqMKe3rwY",
        type: "video",
        title: "Abba - Chiquitita (Official Music Video)",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi_webp/p4QqMKe3rwY/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "AbbaVEVO",
        uploaderUrl: "/channel/UCa_4DcdTB9QfK0LY9-7qWuQ",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/2mDKN75O5wEGMib80mKaVliIPVVQwISkBgjocS1rraqDROTobXArJ9CmwnlhVe4Wc_iqABNg0g=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2009-10-08",
        shortDescription:
          "REMASTERED IN HD!<br>Official Music Video for Chiquitita performed by ABBA.<br>Listen to the new alb",
        duration: 320,
        views: 231304016,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 49,
      },
      {
        url: "/watch?v=-sHagClUhCI",
        type: "video",
        title: "Slander - Superhuman (feat. Eric Leva) [Monstercat Release]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/-sHagClUhCI/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC7I7qB9uEmcNgOuPZYNdfPFYLYww&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-06-23",
        shortDescription:
          '🎧 &nbsp;Support on all platforms: <a href="https://Monstercat.lnk.to/Superhuman">https://Monstercat',
        duration: 268,
        views: 4418626,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 3,
      },
      {
        url: "/watch?v=YXB8-ORSmME",
        type: "video",
        title:
          "Attack On Titan Season 4 Ending -  [SHOCK] - Yūko Andō / Lyrics (English/Rōmaji/日本語)",
        thumbnail:
          "https://piped-proxy-de.privacy.com.de/vi_webp/YXB8-ORSmME/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "emma•131",
        uploaderUrl: "/channel/UCm7tTiZGtBz1mcO5vdd17GQ",
        uploaderAvatar:
          "https://piped-proxy-de.privacy.com.de/ytc/AOPolaS4UWhS80_JCFdGqvmzzl1TPTzs9Vwf-r5fdShMlw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-12-06",
        shortDescription:
          "[THE ENGLISH TRANSLATION IS NOT 100% CORRECT OPEN CC CAPTIONS PLEASE]<br><br>Attack On Titan Season ",
        duration: 180,
        views: 1039358,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 50,
      },
      {
        url: "/watch?v=JHyNTfqRtmk",
        type: "video",
        title: "Grant - Color (feat. Juneau) [Monstercat Lyric Video]",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/JHyNTfqRtmk/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAjdS6T_qbGa7NWBG4Si_HlRl6Kew&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-05-03",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monstercat.ffm.to/color-bdxe">https://monstercat.ffm.t',
        duration: 218,
        views: 1713941,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 51,
      },
      {
        url: "/watch?v=2GG8xQDH2cI",
        type: "video",
        title: "Nightcore - All Falls Down - (Alan Walker / Lyrics)",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi_webp/2GG8xQDH2cI/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Syrex",
        uploaderUrl: "/channel/UCeZje_7vr6CPK9vPQDfV3WA",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/ytc/AOPolaR2ozHywZ9O6ldGt8JJ3clBfdCuQBkSSmtuDiP2RA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-10-28",
        shortDescription:
          "Nightcore - Alan Walker - All Falls Down (feat. Noah Cyrus with Digital Farm Animals) (Lyrics)<br>✘ ",
        duration: 174,
        views: 25948455,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 52,
      },
      {
        url: "/watch?v=PLrVdrW4DIs",
        type: "video",
        title: "Vexento - Wild",
        thumbnail:
          "https://piped-proxy.hostux.net/vi/PLrVdrW4DIs/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AHUBoAC4AOKAgwIABABGCwgXChyMA8=&rs=AOn4CLB9q-0uDWw_DFR2KIh-Y7K5jY8KMg&host=i.ytimg.com",
        uploaderName: "Vexento",
        uploaderUrl: "/channel/UCYZ9rknEmE4R1J_HBJ2yBlQ",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/ytc/AOPolaRiQTRwObZRz152vPZeSPzjvQs6-tMN2LZyTFFqdQ=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2021-02-05",
        shortDescription:
          'You can listen to Wild on Spotify and other streaming services here - <a href="https://push.fm/fl/nj',
        duration: 205,
        views: 409816,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 53,
      },
      {
        url: "/watch?v=T_rWZgOFfvQ",
        type: "video",
        title: "Sigala, James Arthur - Lasting Lover (Lyrics)",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi_webp/T_rWZgOFfvQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "The Vibe Guide",
        uploaderUrl: "/channel/UCxH0sQJKG6Aq9-vFIPnDZ2A",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/hkNTjyFsDL8IcLGSoO42-gLDLIrD2sCEUBQ7aLnofzaRqpbtXEjzGtCZZQd4oJ7cLCeOIyb9vQ=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-09-03",
        shortDescription:
          "Sigala, James Arthur - Lasting Lover (Lyrics)<br>Sigala x James Arthur - Lasting Lover (Lyrics)<br><",
        duration: 219,
        views: 7080883,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 54,
      },
      {
        url: "/watch?v=oYqsq43WfQs",
        type: "video",
        title: "Nightcore - Riptide (Trivecta, AMIDY & RØRY) - (Lyrics)",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi_webp/oYqsq43WfQs/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Syrex",
        uploaderUrl: "/channel/UCeZje_7vr6CPK9vPQDfV3WA",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/ytc/AOPolaR2ozHywZ9O6ldGt8JJ3clBfdCuQBkSSmtuDiP2RA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-10-14",
        shortDescription:
          "Subscribe and turn on the bell for more! Check out the links below.<br>🔥 Syrex Spotify Playlist: <a",
        duration: 184,
        views: 854393,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 55,
      },
      {
        url: "/watch?v=pEZIYGN5HIo",
        type: "video",
        title:
          "2WEI feat. Edda Hayes - Warriors (Official Imagine Dragons cover from League of Legends trailer)",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi/pEZIYGN5HIo/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgSihKMA8=&rs=AOn4CLCtBtV0jDnHHvN8vWT8_Cht_X-YIQ&host=i.ytimg.com",
        uploaderName: "2WEI",
        uploaderUrl: "/channel/UCotdjDQV_MX5nUvrkkAlbbQ",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/ytc/AOPolaRFinCa0LQ5rZtZfqwkLc-YsCXXnOW2oUuDlfKpUw=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2020-01-10",
        shortDescription:
          'Warriors | League of Legends (with 2WEI & Edda Hayes)<br><br>"Warriors"<br>Original song by: Imagine',
        duration: 205,
        views: 39738592,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 56,
      },
      {
        url: "/watch?v=b5wIzq0LPLg",
        type: "video",
        title: "underscores - TELEPHONE LINE 415",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/b5wIzq0LPLg/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "bitbird",
        uploaderUrl: "/channel/UCIDA4NNU3jL8zqfs5huy0zA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/CuznUNNpwaOrxRw3rzSbNv4kJLmQhLskp-W_Gpi3GujQeyUpXyCNYvRun16kdivoNOBloTDK3w=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-01-14",
        shortDescription:
          "“I believe my first main project ‘skin purifying treatment’ resonated with as many people as it did ",
        duration: 167,
        views: 34663,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 57,
      },
      {
        url: "/watch?v=skeT4WogsZM",
        type: "video",
        title: "underscores - clean!",
        thumbnail:
          "https://proxy.piped.yt/vi/skeT4WogsZM/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "bitbird",
        uploaderUrl: "/channel/UCIDA4NNU3jL8zqfs5huy0zA",
        uploaderAvatar:
          "https://proxy.piped.yt/CuznUNNpwaOrxRw3rzSbNv4kJLmQhLskp-W_Gpi3GujQeyUpXyCNYvRun16kdivoNOBloTDK3w=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-01-14",
        shortDescription:
          "“I believe my first main project ‘skin purifying treatment’ resonated with as many people as it did ",
        duration: 186,
        views: 27262,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 58,
      },
      {
        url: "/watch?v=0AvWV6Mk374",
        type: "video",
        title:
          "The Curse of the Sad Mummy | Amumu Music Video - League of Legends",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/0AvWV6Mk374/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "League of Legends",
        uploaderUrl: "/channel/UC2t5bjwHdUX4vM2g8TRDq5g",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/72mzu20EzAX2EbpMma-yT8oKrYGnfxSEx4V5fNYjmKxuksIFVmfC2XI065qGXNr839wgXa8gCw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-01-26",
        shortDescription:
          "Every child in Valoran has heard the tale before,<br>About the cursed mummy boy who felt his heart n",
        duration: 259,
        views: 29145188,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 59,
      },
      {
        url: "/watch?v=EsZbWAqU8xY",
        type: "video",
        title: "【Rainych】 SAY SO - Doja Cat | Japanese Version (cover)",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/EsZbWAqU8xY/mqdefault.webp?v=5e7a1252&host=i.ytimg.com",
        uploaderName: "Rainych Ran",
        uploaderUrl: "/channel/UCrrfJ_8kX6YyXE7F3pDJzEw",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaSUGvadM-fC__oij9ffxlvf3QKu4yDo53os5kZCrA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-03-24",
        shortDescription:
          "SAY SO (JAPANESE VERSION FAN COVER) - by Rainych<br>This cover is also available to stream and downl",
        duration: 258,
        views: 28981549,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 60,
      },
      {
        url: "/watch?v=JdSpuTi9d8A",
        type: "video",
        title: "Orange by 7!! - Shigatsu wa Kimi no Uso ED 2 - Lyrics",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/JdSpuTi9d8A/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGH8gNSg9MA8=&rs=AOn4CLAEWXUrbKuQRZEdQ-z2VWh1thWR4Q&host=i.ytimg.com",
        uploaderName: "Cytharia",
        uploaderUrl: "/channel/UCR44GBWJ8cFcpM1tGDcnUjQ",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/ytc/AOPolaR0NjiYs36Fy6D3VRYzz5-EMpCHEP2iBNKex-w0mg=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-06-05",
        shortDescription:
          "Thanks for watching :)<br>Sorry if there are some mistakes in the lyrics/translation (・_・;)<br><br>S",
        duration: 350,
        views: 69850943,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 61,
      },
      {
        url: "/watch?v=8N_aay0ddcY",
        type: "video",
        title: "Nightcore - Darkside - (Alan Walker / Lyrics)",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi_webp/8N_aay0ddcY/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Syrex",
        uploaderUrl: "/channel/UCeZje_7vr6CPK9vPQDfV3WA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/ytc/AOPolaR2ozHywZ9O6ldGt8JJ3clBfdCuQBkSSmtuDiP2RA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-07-28",
        shortDescription:
          "Nightcore - Alan Walker - Darkside (feat. Au/Ra and Tomine Harket) | Lyrics<br>» Download / Stream (",
        duration: 185,
        views: 63571648,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 62,
      },
      {
        url: "/watch?v=c0mX-5q3mrY",
        type: "video",
        title: "Nightcore - This Little Girl",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/c0mX-5q3mrY/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGFEgWChlMA8=&rs=AOn4CLCMxhT6_cwmqtrejYCkp3P_vzlF2A&host=i.ytimg.com",
        uploaderName: "NightcoreReality",
        uploaderUrl: "/channel/UCqX8hO4JWM6IJfEabbZmhUw",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/MLzWEQNaglO07puayDOL6KjeeGUJsUn5Lw_jki986y3VGFjBYYX0xXUFcnr8ycThTBL8Xk6kmvs=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-03-13",
        shortDescription:
          "Music: This Little Girl - Cady Groves<br>Lyrics are in the video, enjoy :D<br>Various links are belo",
        duration: 172,
        views: 167888183,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 63,
      },
      {
        url: "/watch?v=M1MQgnHMVuY",
        type: "video",
        title: "Years & Years - Eyes Shut (version from album) [Lyrics]",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/M1MQgnHMVuY/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Years Years",
        uploaderUrl: "/channel/UCtr3cTCyZh0qjq8SNEJW1HQ",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaTCgVncW5B4Rh7Il4SFALh2URfA1As1EEZa2obz=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-07-18",
        shortDescription:
          "Enjoy!<br>Go to my channel and watch more lyrics video with Years & Years songs :)",
        duration: 199,
        views: 3065328,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 64,
      },
      {
        url: "/watch?v=o5CfCNuwKGU",
        type: "video",
        title: "Virtual Riot - With You",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/o5CfCNuwKGU/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "UKF",
        uploaderUrl: "/channel/UC9UTBXS_XpBCUIcOG7fwM8A",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaS8sDjg_E-E7YIe-DMYZgRDwHRR-djVWUbNeJvyuA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-02-24",
        shortDescription:
          '● Follow our Electro & Bass House playlist: <a href="http://ukf.me/BassHouSpPl">http://ukf.me/BassHo',
        duration: 328,
        views: 322089,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 65,
      },
      {
        url: "/watch?v=7egYKkIKqDs",
        type: "video",
        title: "Light - Sleeping at Last (lyrics)",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi/7egYKkIKqDs/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGEgTyhlMA8=&rs=AOn4CLBJOPSmgeWilU5bCOP2hSAHS2xG6w&host=i.ytimg.com",
        uploaderName: "pipedream",
        uploaderUrl: "/channel/UCC9wyQ4HKioIlMfFalPX4iA",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaT7PBlp_P-Z1pv-cai0jPqqs-URCqwvAbeVYo_NJw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-01-02",
        shortDescription:
          "wow so many views thanks<br><br><br><br><br>Copyright Disclaimer Under Section 107 of the Copyright ",
        duration: 259,
        views: 16838127,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 66,
      },
      {
        url: "/watch?v=uPrbFjIfluc",
        type: "video",
        title: "Dirtyphonics & Sullivan King - Vantablack [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/uPrbFjIfluc/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLATPrpFMB48BO3hU7UwOLOMv4pt9Q&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-10-09",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/Vantablack">https://Monstercat.lnk.t',
        duration: 266,
        views: 855751,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 67,
      },
      {
        url: "/watch?v=3fZsb5FJslw",
        type: "video",
        title: "[Future Bass] - Haywyre - I Am You [Monstercat LP Release]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/3fZsb5FJslw/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB5jMKgSuBpU33hhsjFvtF1NEmV1w&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-02-08",
        shortDescription:
          'Haywyre & The OPIUO band on tour! - <a href="http://www.haywyreandtheopiuoband.com/">http://www.hayw',
        duration: 231,
        views: 1333307,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 68,
      },
      {
        url: "/watch?v=riezARcGZtk",
        type: "video",
        title: "[House] - Haywyre - Do You Don't You [Monstercat LP Release]",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi/riezARcGZtk/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAK_PJ_O0Y07sXsA9aqjb2rWgwJ_g&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-02-01",
        shortDescription:
          'Haywyre & The OPIUO band on tour! - <a href="http://www.haywyreandtheopiuoband.com/">http://www.hayw',
        duration: 276,
        views: 3796666,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 69,
      },
      {
        url: "/watch?v=KH0ONooqcVE",
        type: "video",
        title: "Stonebank - Back To Start [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/KH0ONooqcVE/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDBgvZNus4aEHMj9ILyLJKvCDsPVw&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-11-28",
        shortDescription:
          'Support on all platforms 🎧: <a href="https://Monstercat.lnk.to/BackToStart">https://Monstercat.lnk.',
        duration: 293,
        views: 1263975,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 70,
      },
      {
        url: "/watch?v=y91hSD1csl4",
        type: "video",
        title: "MYRNE & Grant - Fault (feat. McCall) [Monstercat Release]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/y91hSD1csl4/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCeeeWllvQc7bkQMko3iLe_VIkMuw&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-07-16",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/Fault">https://Monstercat.lnk.to/Fau',
        duration: 265,
        views: 1184411,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 71,
      },
      {
        url: "/watch?v=Z7TfeqFtSsA",
        type: "video",
        title: "Grant - Wake Up (feat. Jessi Mason) [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/Z7TfeqFtSsA/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBnrskYnRCOa7AtPCbtSMONOFkA_w&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-11-02",
        shortDescription:
          'Listen on Spotify: <a href="http://monster.cat/2eoppSn">http://monster.cat/2eoppSn</a><br>Support on',
        duration: 251,
        views: 985418,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 72,
      },
      {
        url: "/watch?v=-e_3Cg9GZFU",
        type: "video",
        title: "Skrillex - Summit (feat. Ellie Goulding) [Video by Pilerats]",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi/-e_3Cg9GZFU/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "Skrillex",
        uploaderUrl: "/channel/UC_TVqp_SyG6j5hG-xVRy95A",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/NgDCsOjvd9c0Z0zWObIHeFLiyyxWvUq2jQn-aWPu45VOMOWNGDsyA4_a7HYLvUs3QSpK_rIEvvc=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2013-01-02",
        shortDescription:
          "Big up to my friends in Perth for surprising me with this video... LOST BOYS<br><br>Skrillex - Summi",
        duration: 371,
        views: 181727512,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 73,
      },
      {
        url: "/watch?v=srJyjFlXwlI",
        type: "video",
        title:
          "Grant - Constellations (feat. Jessi Mason) [Monstercat Official Music Video]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/srJyjFlXwlI/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLA3Iiaf01WpEU1bSjQWwkk1B0sT8A&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-02-10",
        shortDescription:
          '🎧 &nbsp;Support on all platforms:<br><a href="https://Monstercat.lnk.to/Constellations">https://Mon',
        duration: 251,
        views: 814103,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 4,
      },
      {
        url: "/watch?v=IsFnnTbrOIs",
        type: "video",
        title: "Braken - Wherever You Go [Monstercat Release]",
        thumbnail:
          "https://piped-proxy-de.privacy.com.de/vi/IsFnnTbrOIs/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDvb3ncfrv7kDP7E9Ky4VYWXkBNew&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://piped-proxy-de.privacy.com.de/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-03-19",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monster.cat/whereveryougo">https://monster.cat/whereve',
        duration: 196,
        views: 864984,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 74,
      },
      {
        url: "/watch?v=vl6aFkiJjrs",
        type: "video",
        title: "Virtual Riot - Show Up (ft. Virus Syndicate)",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi_webp/vl6aFkiJjrs/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "UKF Dubstep",
        uploaderUrl: "/channel/UCfLFTP1uTuIizynWsZq2nkQ",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/ytc/AOPolaTOVcKQ1xGka-v4595bgDCtR2vAJbail2a8jfYkXw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-02-01",
        shortDescription:
          '● Follow our Dubstep Top 50 Playlist: <a href="http://ukf.io/DubstepTop50">http://ukf.io/DubstepTop5',
        duration: 260,
        views: 981236,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 75,
      },
      {
        url: "/watch?v=34ECZ1CIexQ",
        type: "video",
        title: "Omar Varela - Until I Die",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/34ECZ1CIexQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-01-20",
        shortDescription:
          'Omar Varela - Until I Die<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https://dubstep',
        duration: 246,
        views: 905279,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 76,
      },
      {
        url: "/watch?v=J-OJA8uDGCg",
        type: "video",
        title:
          "Dirtyphonics & Sullivan King - Sight of Your Soul [Monstercat EP Release]",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/J-OJA8uDGCg/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDdFVf3S5xa-LaOl7K_tMy6WZKVLA&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-11-03",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/Vantablack-EP">https://Monstercat.ln',
        duration: 197,
        views: 1721512,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 77,
      },
      {
        url: "/watch?v=c5rgwNvlrmo",
        type: "video",
        title: "Your Lie in April Opening",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi/c5rgwNvlrmo/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "AnimeNInja9381",
        uploaderUrl: "/channel/UCyUQQJ0fxq--vGjx1G96aJA",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/ytc/AOPolaS57eR6JbVxdhZKVCNXuNZqLP2-XPWgaNGYwbIh=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-10-11",
        shortDescription:
          "Enjoy this opening. &nbsp; <br>Also, please visit my official channels Just Nerds and Just Nerds II ",
        duration: 93,
        views: 7128905,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 78,
      },
      {
        url: "/watch?v=wu5bJEIEXcc",
        type: "video",
        title: "Your Lie In April op 2 full",
        thumbnail:
          "https://piped-proxy.hostux.net/vi_webp/wu5bJEIEXcc/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Sprayz4Dayz",
        uploaderUrl: "/channel/UCUygcekuolSJl4k8iHivpCQ",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/ytc/AOPolaR6r386aMtM9gfXBTt5MxYXvaxucXl64fGbwQ=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-10-01",
        shortDescription:
          "Nanairo Symphony by COALAMODE<br><br>DISCLAIMER: I don't own any of the music. This video was made e",
        duration: 268,
        views: 1384156,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 79,
      },
      {
        url: "/watch?v=J_01PfSjMi8",
        type: "video",
        title: "KUURO & Clockvice - 1000 Cuts [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/J_01PfSjMi8/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCD5aTYafOivDUXdFAjr1HEPrshXQ&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-10-22",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monstercat.ffm.to/1000cuts">https://monstercat.ffm.to/',
        duration: 196,
        views: 550197,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 80,
      },
      {
        url: "/watch?v=DmiGLSG8wYE",
        type: "video",
        title: "Tokyo Machine - JINGLE BELLS [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/DmiGLSG8wYE/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB69MRlKO8Zxsu4IRWhOZG6LgTjrg&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-12-17",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monstercat.ffm.to/holidayhits">https://monstercat.ffm.',
        duration: 154,
        views: 712855,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 81,
      },
      {
        url: "/watch?v=wbQsxWKfTSU",
        type: "video",
        title: "Poppy - X (Official Music Video)",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/wbQsxWKfTSU/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Poppy",
        uploaderUrl: "/channel/UC8JE00xTMBOqKs7o0grFTfQ",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/dptl38n25-rnrorY5aYcL8GPbHMMOMxgm0kpUnd-qqU63oRr87h37xMSSbs859BwXzJNk0gzj2U=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-11-05",
        shortDescription:
          'Stream/Download: <a href="http://maddecent.fm/amiagirl">http://maddecent.fm/amiagirl</a><br>Order Am',
        duration: 176,
        views: 14719583,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 82,
      },
      {
        url: "/watch?v=BK4DZHDGgZI",
        type: "video",
        title: "Getter  - On My Way Out Feat. Joji",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi/BK4DZHDGgZI/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBggQih_MA8=&rs=AOn4CLC2xsS6drCnyeuz-n7vbe1rS9KyUA&host=i.ytimg.com",
        uploaderName: "getter",
        uploaderUrl: "/channel/UC8iAV2sa8UQNXU__jVQpFzQ",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/ytc/AOPolaQ57rkHvOblDYD8cOYVpdwjOU50ZGwMq8rbpUYjjw=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2019-01-30",
        shortDescription:
          'DOWNLOAD & STREAM VISCERAL: <a href="https://smarturl.it/GetterVisceral">https://smarturl.it/GetterV',
        duration: 331,
        views: 6980221,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 83,
      },
      {
        url: "/watch?v=4O9OJJUrDOE",
        type: "video",
        title: "Sound Remedy & Illenium - Spirals (feat. King Deco)",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/4O9OJJUrDOE/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "MrSuicideSheep",
        uploaderUrl: "/channel/UC5nc_ZtjKW1htCVZVRxlQAQ",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ANmgv2-dyHCi7tnIuUtJLcKUI9QIk2Rp8Fojl4Gwe4PLxFCxD-S0jvJdO7JvEbHnT3Rk_zaD=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-05-17",
        shortDescription:
          "Sound Remedy & Illenium - Spirals (feat. King Deco)<br><br>⬙ &nbsp;FAVOURITES ON SPOTIFY ⬙<br>⇥ <a h",
        duration: 362,
        views: 4324345,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 84,
      },
      {
        url: "/watch?v=r2iRI0otWDU",
        type: "video",
        title:
          "Eva Simons feat. Doctor P - Bulletproof (Original Mix) [DUBSTEP]",
        thumbnail:
          "https://proxy.piped.yt/vi_webp/r2iRI0otWDU/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "vClubPLTV",
        uploaderUrl: "/channel/UCdS3fwCAMYF-W8UVks9vS7g",
        uploaderAvatar:
          "https://proxy.piped.yt/ytc/AOPolaSVb9_Zm2T4kfVX1C2qpfLjB-b-lB7LWCr9XW-L=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2012-09-14",
        shortDescription:
          'Eva Simons feat. Doctor P - Bulletproof (Original Mix)<br><br><a href="http://www.vclub.pl/">http://',
        duration: 264,
        views: 169022,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 85,
      },
      {
        url: "/watch?v=fuBG_osuqy8",
        type: "video",
        title: "Take Me To Church - Hozier Cover",
        thumbnail:
          "https://watchproxy-nl.whatever.social/vi/fuBG_osuqy8/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAmDt20jj385KJ0lBUavFiBqVUX4A&host=i.ytimg.com",
        uploaderName: "Sofia Karlberg",
        uploaderUrl: "/channel/UCfjnEW3mVXfW0Wb602r1IrQ",
        uploaderAvatar:
          "https://watchproxy-nl.whatever.social/8Wi5wJqNcECcMDL85HGIr3J37yHk1POQIZBgDXv3yA73OE23_zZuEoCKY6u4W-SXWtkHgT6wsdA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-12-04",
        shortDescription:
          'Instagram: <a href="http://instagram.com/sofiakarlberg">http://instagram.com/sofiakarlberg</a><br>Sp',
        duration: 243,
        views: 61532818,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 86,
      },
      {
        url: "/watch?v=5w3skz8SGH4",
        type: "video",
        title: "Grant, Anevo & Conro - Without You (feat. Victoria Zaro)",
        thumbnail:
          "https://piped-proxy-de.privacy.com.de/vi_webp/5w3skz8SGH4/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Nightblue Music",
        uploaderUrl: "/channel/UCe55Gy-hFDvLZp8C8BZhBnw",
        uploaderAvatar:
          "https://piped-proxy-de.privacy.com.de/ytc/AOPolaRoKe2F3f6Q0G_VYcyH9nnST_i9mrx-McXofUP-2g=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-08-21",
        shortDescription:
          '⭐ If you enjoyed, please be sure to leave a "Like," share with a friend, and SUBSCRIBE here: <a href',
        duration: 210,
        views: 629867,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 87,
      },
      {
        url: "/watch?v=RzRhcnN-2XQ",
        type: "video",
        title: "Sickick - Infected",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/RzRhcnN-2XQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "xKito Music",
        uploaderUrl: "/channel/UCMOgdURr7d8pOVlc-alkfRg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/tnnicKnYHQR-PL7Ef2oPNeNZpTiWllaPPNmbpqUpZ4Vrp4hgowElMiPNExw3APzW_7UFNUjQCw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-12-09",
        shortDescription:
          '🎶 Genre: Electronic<br><br><br>👉 Sickick:<br><a href="https://www.youtube.com/user/SickickMusic">s',
        duration: 203,
        views: 72456635,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 88,
      },
      {
        url: "/watch?v=Hn4sfC2PbhI",
        type: "video",
        title: "Sub Urban - Cradles [NCS Release]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/Hn4sfC2PbhI/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "NoCopyrightSounds",
        uploaderUrl: "/channel/UC_aEa8K-EOJ3D6gOs7HcyNg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/YIBi8NVC87fMfJHfQ2O0dyzjis7tUlO7VqWLhk1lq1fkIOQTrpX_Ip7G6S_u0IJosXYSe_Z9=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-01-05",
        shortDescription:
          'Subscribe to NoCopyrightSounds &nbsp;👉 <a href="http://ncs.lnk.to/SubscribeYouTube">http://ncs.lnk.',
        duration: 209,
        views: 119486610,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 89,
      },
      {
        url: "/watch?v=wQK0tzxATD8",
        type: "video",
        title: "Grant - Castaway (feat. Jessi Mason) [Monstercat Lyric Video]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/wQK0tzxATD8/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDIZONNckNULVwIevWJmfdQw3qZTQ&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-11-30",
        shortDescription:
          'Lyric Video produced by: Vacades<br><a href="https://vacades.com/">https://vacades.com</a><br><a hre',
        duration: 199,
        views: 2143636,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 90,
      },
      {
        url: "/watch?v=Vzpu1mNM0Lc",
        type: "video",
        title: "Grant & RUNN - Contagious [Monstercat EP Release]",
        thumbnail:
          "https://ytproxy.dc09.ru/vi/Vzpu1mNM0Lc/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBELSe81k56HPB2sGnpBJsy-PmpyQ&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://ytproxy.dc09.ru/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-08-09",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monster.cat/wishes-ep">https://monster.cat/wishes-ep</',
        duration: 217,
        views: 317891,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 91,
      },
      {
        url: "/watch?v=-iwYHk_SwNA",
        type: "video",
        title: "Panda Eyes - Colorblind",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi_webp/-iwYHk_SwNA/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-06-04",
        shortDescription:
          'Panda Eyes - Colorblind<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https://dubstepgu',
        duration: 292,
        views: 50896601,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 92,
      },
      {
        url: "/watch?v=8w_lwezZDUw",
        type: "video",
        title: "Spag Heddy - Permanent",
        thumbnail:
          "https://proxy.piped.yt/vi_webp/8w_lwezZDUw/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://proxy.piped.yt/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-11-09",
        shortDescription:
          'Spag Heddy - Permanent<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https://dubstepgut',
        duration: 233,
        views: 35130300,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 93,
      },
      {
        url: "/watch?v=BbJA32D3AAE",
        type: "video",
        title:
          "The Chainsmokers - All We Know ft. Phoebe Ryan (Virtual Riot Remix)",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi_webp/BbJA32D3AAE/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Virtual Riot",
        uploaderUrl: "/channel/UCVtJOq_ziepf5MpjsTWxJeg",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/ytc/AOPolaTUMW8qUlUSYF5ix9q8B9SF2-sWZ8HZD4o_VNIl=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2016-11-22",
        shortDescription:
          'Visualy by Beeple (Mike Winkelmann)<br><a href="http://beeple-crap.com/">http://beeple-crap.com/</a>',
        duration: 292,
        views: 1712468,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 94,
      },
      {
        url: "/watch?v=ROF-GRsyeuw",
        type: "video",
        title: "KUURO - Omen [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi/ROF-GRsyeuw/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLD7K48BIYYEOFnSdcBsWFUoOsEgWA&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-02-08",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/Omen">https://Monstercat.lnk.to/Omen',
        duration: 253,
        views: 991263,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 95,
      },
      {
        url: "/watch?v=3utMV9ITxsE",
        type: "video",
        title: "KUURO - Aamon [Monstercat Release]",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi/3utMV9ITxsE/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAQkVVZ6UYhKc0IX0NBbKD7EPp41Q&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-10-07",
        shortDescription:
          'Listen on Spotify: <a href="http://monster.cat/2dSF2Ut">http://monster.cat/2dSF2Ut</a><br>Support on',
        duration: 224,
        views: 1435362,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 96,
      },
      {
        url: "/watch?v=mPerS_QhVLI",
        type: "video",
        title: "KUURO - Take Me Down (feat. Bianca) [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi/mPerS_QhVLI/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCwnNQ6461hcYwvKV9AQ6YjTjOxhA&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-06-21",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/TakeMeDown">https://Monstercat.lnk.t',
        duration: 237,
        views: 1416585,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 97,
      },
      {
        url: "/watch?v=OEU3t0KMhrU",
        type: "video",
        title: "KUURO - Knockin' [Monstercat Release]",
        thumbnail:
          "https://piped-proxy.hostux.net/vi/OEU3t0KMhrU/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLD_7XIe7mFu2QE5hXq8fSKk4N6n5A&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-05-17",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/Knockin">https://Monstercat.lnk.to/K',
        duration: 210,
        views: 370166,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 98,
      },
      {
        url: "/watch?v=VmTr-ijdlJM",
        type: "video",
        title:
          "KUURO - Bad Habits (feat. Tylor Maurer) [Monstercat Lyric Video]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/VmTr-ijdlJM/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDkYjqlFtNLPxZJDtM2S74Cnwnw5w&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-04-29",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monster.cat/badhabits">https://monster.cat/badhabits</',
        duration: 187,
        views: 830858,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 99,
      },
      {
        url: "/watch?v=gjdbB1of3_I",
        type: "video",
        title:
          "Grant - Wishes (feat. McCall) [Monstercat Official Music Video]",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi/gjdbB1of3_I/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDARuwWqPt3udjnTjGcliyXxORk3A&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-03-22",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monster.cat/wishes">https://monster.cat/wishes</a><br>',
        duration: 245,
        views: 1125119,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 100,
      },
      {
        url: "/watch?v=q0--_VFsdEo",
        type: "video",
        title:
          "Half an Orange - Buzz Lightyear (WRLD Remix) [Monstercat Official Music Video]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/q0--_VFsdEo/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDxkcsw1X8CqxIDDhX_gB8gKRCW6A&host=i.ytimg.com",
        uploaderName: "Monstercat Instinct",
        uploaderUrl: "/channel/UCp8OOssjSjGZRVYK6zWbNLg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/XY-Sv9HRY6P4ACTtmxljUx1tPAJrLAZ0VWtOpx-KrqqEuNDiek8HyXr1LQXacCvGYCqwGXTr=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-05-15",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://monster.cat/buzzlightyearwrldremix">https://monster.ca',
        duration: 199,
        views: 273531,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 101,
      },
      {
        url: "/watch?v=byHSQoemFvI",
        type: "video",
        title: "Sleeping At Last North Lyrics",
        thumbnail:
          "https://piped-proxy-de.privacy.com.de/vi/byHSQoemFvI/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCbU8ed8MuXeWr3FTM6LoL4a7NHYQ&host=i.ytimg.com",
        uploaderName: "KezzyNaturals",
        uploaderUrl: "/channel/UC5_Rocmq0Iarx_ZNtAbbk9w",
        uploaderAvatar:
          "https://piped-proxy-de.privacy.com.de/ytc/AOPolaTZ8WfFPNCcJ-yW-BVeQz1jMUC9Gl8OCuXSIcUL5ho=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-06-11",
        shortDescription: "DISCLAIMER: I DO NOT OWN THIS SONG",
        duration: 252,
        views: 7170714,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 102,
      },
      {
        url: "/watch?v=ISO94EPI9x8",
        type: "video",
        title: "[Drumstep] - Tristam - The Vine [Monstercat Release]",
        thumbnail:
          "https://proxy.piped.yt/vi/ISO94EPI9x8/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAPMFJaFyFNrPsBBKrf45APoIlG-A&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://proxy.piped.yt/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-12-22",
        shortDescription:
          'Monstercat 025 - Threshold is available now!<br>Support on iTunes: <a href="http://monster.cat/025-T',
        duration: 240,
        views: 4096636,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 103,
      },
      {
        url: "/watch?v=SCD2tB1qILc",
        type: "video",
        title: "[DnB] - Tristam & Braken - Frame of Mind [Monstercat Release]",
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi/SCD2tB1qILc/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBZmzu5ZaqWczSEUOihEkQYpDmtJQ&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2014-04-25",
        shortDescription:
          '▼ Follow Monstercat<br>Spotify: <a href="https://monster.cat/2biZbkd">https://monster.cat/2biZbkd</a',
        duration: 270,
        views: 67173630,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 104,
      },
      {
        url: "/watch?v=k1I3z3g1zas",
        type: "video",
        title:
          "Tristam x Karma Fields - Build The Cities (Empire Of Sound) [feat. Kerli] [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi/k1I3z3g1zas/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDPUion9HQW12kg2L32wUeNL1EPJw&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2015-05-27",
        shortDescription:
          '| The HEX<br>| Celebrities Nightclub // Vancouver<br>| <a href="http://bit.ly/2wWGwFN">http://bit.ly',
        duration: 296,
        views: 6295448,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 105,
      },
      {
        url: "/watch?v=Xm8UTv6LSf0",
        type: "video",
        title: "Tristam - Bone Dry [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/Xm8UTv6LSf0/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBLxj2w7I03zt6nNoFyG8Gzc_omRQ&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-06-19",
        shortDescription:
          '🎧 &nbsp;Support on all platforms: <a href="https://Monstercat.lnk.to/RLVol1">https://Monstercat.lnk',
        duration: 285,
        views: 6233128,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 106,
      },
      {
        url: "/watch?v=56NvMT8DB-g",
        type: "video",
        title: "Whethan – Be Like You (feat. Broods) [Lyric Video]",
        thumbnail:
          "https://pipedproxy.frontendfriendly.xyz/vi_webp/56NvMT8DB-g/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Whethan",
        uploaderUrl: "/channel/UCdEaXmsR8KamysKFVc6F0QA",
        uploaderAvatar:
          "https://pipedproxy.frontendfriendly.xyz/FNXAUqhksbQSi87Xy2U7h4rjwEBq82KaeCpRKD_ueFuZDs1y75Xz3W7C3ncVUUo_ADGVgNknVA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-03-16",
        shortDescription:
          'Whethan – Be Like You (feat. Broods) Available Now!<br><a href="https://BigBeat.lnk.to/BLYID">https:',
        duration: 161,
        views: 954962,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 107,
      },
      {
        url: "/watch?v=3SDJljtLa84",
        type: "video",
        title:
          "Grant - Are We Still Young (feat. Jessi Mason) [Monstercat Lyric Video]",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/3SDJljtLa84/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDEy56WcSyonGzR1om5Of5bpYZcQQ&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-05-26",
        shortDescription:
          '🎧 &nbsp;Support on all platforms: <a href="https://Monstercat.lnk.to/AWSY">https://Monstercat.lnk.t',
        duration: 216,
        views: 3271100,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 108,
      },
      {
        url: "/watch?v=Byuhn6hkJbM",
        type: "video",
        title: "Azazal & Said - I Said Meow",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/Byuhn6hkJbM/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-04-06",
        shortDescription:
          'Azazal & Said - I Said Meow<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https://dubst',
        duration: 217,
        views: 31289929,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 109,
      },
      {
        url: "/watch?v=QOxI1_xv-Lg",
        type: "video",
        title: "Virtual Riot - Never Let Me Go",
        thumbnail:
          "https://piped-proxy-de.privacy.com.de/vi_webp/QOxI1_xv-Lg/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://piped-proxy-de.privacy.com.de/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-02-20",
        shortDescription:
          'Virtual Riot - Never Let Me Go<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https://du',
        duration: 293,
        views: 1736822,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 110,
      },
      {
        url: "/watch?v=HMN8msnUK5Y",
        type: "video",
        title: "Datsik & Virtual Riot - Nasty",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/HMN8msnUK5Y/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "DubstepGutter",
        uploaderUrl: "/channel/UCG6QEHCBfWZOnv7UVxappyw",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaSCDaW5z_mLXZtZjJthgoW6corB9IJRJ14Rq4krAA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-12-05",
        shortDescription:
          'Datsik & Virtual Riot - Nasty<br>🔥 STREAM NOW: <a href="https://dubstepgutter.komi.io/">https://dub',
        duration: 219,
        views: 20931674,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 111,
      },
      {
        url: "/watch?v=XS2EkLregEg",
        type: "video",
        title: "Virtual Riot - One Two",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/XS2EkLregEg/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "UKF Dubstep",
        uploaderUrl: "/channel/UCfLFTP1uTuIizynWsZq2nkQ",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaTOVcKQ1xGka-v4595bgDCtR2vAJbail2a8jfYkXw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-11-07",
        shortDescription:
          '● Become part of the UKF Family: <a href="http://family.ukf.com/">http://family.ukf.com/</a><br>● Su',
        duration: 275,
        views: 643457,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 112,
      },
      {
        url: "/watch?v=WNLC0XHk1Z0",
        type: "video",
        title:
          "너의 이름은 (Kimino nawa) - 스파클 (Sparkle) ┃Cover by Raon Lee",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/WNLC0XHk1Z0/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-02-21",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 197,
        views: 7739025,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 113,
      },
      {
        url: "/watch?v=tZb3IHnivbU",
        type: "video",
        title: "Tokyo Ghoul:re OP - Asphyxia┃Cover by Raon Lee",
        thumbnail:
          "https://pipedproxy.qdi.fi/vi_webp/tZb3IHnivbU/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://pipedproxy.qdi.fi/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-05-04",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 208,
        views: 9123067,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 114,
      },
      {
        url: "/watch?v=Ey77zylimgA",
        type: "video",
        title:
          "Kimino nawa (君の名は) - Zen Zen Zense (前前前世) ┃Cover by Raon Lee",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi_webp/Ey77zylimgA/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-05-10",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 304,
        views: 13845387,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 115,
      },
      {
        url: "/watch?v=lMqMAOHAhmM",
        type: "video",
        title:
          "君の名は (Kimino nawa) - なんでもないや (Nandemonaiya) ┃Cover by Raon Lee",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi_webp/lMqMAOHAhmM/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-01-23",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 350,
        views: 15503167,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 116,
      },
      {
        url: "/watch?v=Z6YFHYlQHcA",
        type: "video",
        title: "The Promised Neverland OP - Touch Off┃Cover by Raon Lee",
        thumbnail:
          "https://ytproxy.dc09.ru/vi_webp/Z6YFHYlQHcA/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://ytproxy.dc09.ru/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-05-24",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 306,
        views: 2766154,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 117,
      },
      {
        url: "/watch?v=NLCT8_u0S88",
        type: "video",
        title:
          "MYRNE & Popeska - Get It All (feat. Emily Hendrix) [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/NLCT8_u0S88/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC9C2ozuQOkk2LmWJgoShK8-qIalA&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-05-31",
        shortDescription:
          '🎧 Support on all platforms: <a href="https://Monstercat.lnk.to/GetItAll">https://Monstercat.lnk.to/',
        duration: 278,
        views: 927688,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 118,
      },
      {
        url: "/watch?v=nH8qYsluoJs",
        type: "video",
        title: "Going Quantum x Psychic Type - Rare [Monstercat Release]",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi/nH8qYsluoJs/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB2dB0F-TcW2hRCM3xaJZWzZ5c6Kg&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-10-24",
        shortDescription:
          'Listen on Spotify: <a href="http://monster.cat/2eGsXiA">http://monster.cat/2eGsXiA</a><br>Support on',
        duration: 248,
        views: 1657952,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 119,
      },
      {
        url: "/watch?v=dCGWi2yFjgQ",
        type: "video",
        title: "Shigatsu wa Kimi no Uso ED2 - Orange┃Cover by Raon Lee",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi_webp/dCGWi2yFjgQ/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-08-24",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 174,
        views: 4358718,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 120,
      },
      {
        url: "/watch?v=k1JmWQMvEsQ",
        type: "video",
        title: "DROELOE - Bon Voyage [Monstercat Release]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/k1JmWQMvEsQ/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCmkY9H5GNUlBXoRyoL3P9W4yiTVQ&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2016-11-07",
        shortDescription:
          'Listen on Spotify: <a href="http://monster.cat/2efXntZ">http://monster.cat/2efXntZ</a><br>Support on',
        duration: 254,
        views: 2053281,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 121,
      },
      {
        url: "/watch?v=xIQgb7sHeBk",
        type: "video",
        title: "NO REGRETS!!!",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/xIQgb7sHeBk/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "underscores - Topic",
        uploaderUrl: "/channel/UCUdMQSZu3e12dk_DREEz80w",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaQ5xqbFfl0pFU-fjrVlZitLcvNbohrMwTus6aZB=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-01-17",
        shortDescription:
          "Provided to YouTube by Symphonic Distribution<br><br>NO REGRETS!!! · underscores · Circuit Hour · Kn",
        duration: 231,
        views: 5247,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 122,
      },
      {
        url: "/watch?v=JZlTj7qqKOw",
        type: "video",
        title: "Barren Gates - Devil (VIP) [NCS Release]",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/JZlTj7qqKOw/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "NoCopyrightSounds",
        uploaderUrl: "/channel/UC_aEa8K-EOJ3D6gOs7HcyNg",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/YIBi8NVC87fMfJHfQ2O0dyzjis7tUlO7VqWLhk1lq1fkIOQTrpX_Ip7G6S_u0IJosXYSe_Z9=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-08-20",
        shortDescription:
          'Subscribe to NoCopyrightSounds &nbsp;👉 <a href="http://ncs.lnk.to/SubscribeYouTube">http://ncs.lnk.',
        duration: 198,
        views: 2027045,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 123,
      },
      {
        url: "/watch?v=A8pOVirjGF0",
        type: "video",
        title: "RIOT - Overkill [Monstercat Release]",
        thumbnail:
          "https://piped-proxy.hostux.net/vi/A8pOVirjGF0/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLByxaV_XmOpWTV9jg9f0sL7el281w&host=i.ytimg.com",
        uploaderName: "Monstercat Uncaged",
        uploaderUrl: "/channel/UCJ6td3C9QlPO9O_J5dF4ZzA",
        uploaderAvatar:
          "https://piped-proxy.hostux.net/Ph0mK5jezJ99mdmK73bQmUibmEIWMFJQR_ufljd28QwUZoGnX6diEdp0F2d7SqkeicuMmCcJh-o=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-11-05",
        shortDescription:
          '▼ Download with Gold<br><a href="https://monster.cat/goldyt">https://monster.cat/goldyt</a><br><br>\ud83c',
        duration: 343,
        views: 20088270,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 124,
      },
      {
        url: "/watch?v=tY3x3JXqAJs",
        type: "video",
        title:
          '"Shelter" | Ghibli Orchestra Edition (Emotional/Uplifting) | Porter Robinson & Madeon',
        thumbnail:
          "https://pipedimageproxy.smnz.de/vi_webp/tY3x3JXqAJs/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Seycara",
        uploaderUrl: "/channel/UCVs86Dxq2cKkzYrzzxejwMw",
        uploaderAvatar:
          "https://pipedimageproxy.smnz.de/ytc/AOPolaS6_Fne8YSfR0ohYrVovfur-SzwO7n49Zifu9CCKw=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-03-17",
        shortDescription:
          '🎵 Listen to my music on Spotify & Apple Music! ▶▶<br>Spotify: <a href="https://open.spotify.com/art',
        duration: 278,
        views: 3177742,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 125,
      },
      {
        url: "/watch?v=0YF8vecQWYs",
        type: "video",
        title: "美波「カワキヲアメク」MV",
        thumbnail:
          "https://proxy.piped.yt/vi_webp/0YF8vecQWYs/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "美波",
        uploaderUrl: "/channel/UC2JzylaIF8qeowc7-5VwwmA",
        uploaderAvatar:
          "https://proxy.piped.yt/ytc/AOPolaRjHteVnNYrzInpwH8HBbmJ-s4Gc2elnU77OiZKJw=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2019-01-29",
        shortDescription:
          "美波「カワキヲアメク」MV<br><br>Forgive me for my poor English.. but I have lots of things I want to share, del",
        duration: 253,
        views: 194509172,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 126,
      },
      {
        url: "/watch?v=jb4ybTQwcdw",
        type: "video",
        title: "美波「main actor 」MV",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi_webp/jb4ybTQwcdw/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "美波",
        uploaderUrl: "/channel/UC2JzylaIF8qeowc7-5VwwmA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/ytc/AOPolaRjHteVnNYrzInpwH8HBbmJ-s4Gc2elnU77OiZKJw=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2018-02-21",
        shortDescription:
          "美波「main actor」MV<br><br>Forgive me for my poor English .. but I have lots of things I want to share,",
        duration: 337,
        views: 26653729,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 127,
      },
      {
        url: "/watch?v=M-P4QBt-FWw",
        type: "video",
        title: "Alan Walker - Darkside (feat. Au/Ra and Tomine Harket)",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi/M-P4QBt-FWw/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDObDg9LsDz1VQF3iC9fD6vLy3oyw&host=i.ytimg.com",
        uploaderName: "Alan Walker",
        uploaderUrl: "/channel/UCJrOtniJ0-NWz37R30urifQ",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/dLEOpt3o0c7rg7R1txAmNA-XNXqsOEKrSd7bD35dga98YYyV8-i4ASf9Ba2UM4XBEBD4U3s28o0=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2018-07-27",
        shortDescription:
          'Click the link to listen to my latest album: <br><a href="https://lnk.to/AlanWalkerWalkerverse">http',
        duration: 240,
        views: 697063538,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 128,
      },
      {
        url: "/watch?v=hdonNbzHHXE",
        type: "video",
        title:
          "Alan Walker - Lily ft. K-391 & Emelie Hollow (Official Lyric Video)",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/hdonNbzHHXE/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "K-391",
        uploaderUrl: "/channel/UC1XoTfl_ctHKoEbe64yUC_g",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/5O_2Yjvm31YYmbqTHaoNNWhTFu_tLgiuGTCXmalzC_ZuIPg2KtL0XRe1mUiCj_U-QoHKrl00=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-04-04",
        shortDescription:
          'listen to my newest single, "Lonely World" - the remake of Summertime! <br><a href="https://www.yout',
        duration: 216,
        views: 86459017,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 129,
      },
      {
        url: "/watch?v=MPVq30bPq6I",
        type: "video",
        title: "Elfen Lied Opening - Lilium (Official Audio)",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi/MPVq30bPq6I/mqdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGH8gSigkMA8=&rs=AOn4CLBo4BhnivOQrBWBWnVRPd3Ka-WUYw&host=i.ytimg.com",
        uploaderName: "Diogo Reis",
        uploaderUrl: "/channel/UC0vwKrIK07S3zxSYazFFJXw",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/0WyTFV_fF4vC35wCMF97_uhKqfeY9f5BFCJ8BlGMkmyC2MKwjB0FidhiDoCZUyMbL42TKyzx=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-04-08",
        shortDescription: "",
        duration: 341,
        views: 13317761,
        isShort: false,
        uploaderVerified: false,
        timeAdded: 1691673800973,
        order: 130,
      },
      {
        url: "/watch?v=flAsTHJ6mlU",
        type: "video",
        title:
          "BeatSaber - Caramelldansen (Speedcake Remix) [FullBodyTracking]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/flAsTHJ6mlU/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARh_IBMoGTAP&rs=AOn4CLClrxf2_MVq2LjwX2X8Sf4ULUNToA&host=i.ytimg.com",
        uploaderName: "omotea",
        uploaderUrl: "/channel/UCJdoOeD2N8sM_LEREHG6kYQ",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/ytc/AOPolaTPWVhjsgGumiNMH84bPoZ64Qh3CYJuaT1LjigKSA=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-03-16",
        shortDescription:
          "世代がバレる一曲<br>ｳｯｰｳｯｰｳﾏｳﾏ(ﾟ∀ﾟ) ！<br><br>Song: Caramell - Caramelldansen (Speedcake Remix) <br>Author: &",
        duration: 183,
        views: 6604268,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 131,
      },
      {
        url: "/watch?v=h85jaMZ1yIA",
        type: "video",
        title: "Kimino nawa (君の名は) Full OST ┃ Cover by Raon Lee",
        thumbnail:
          "https://piped-proxy.lunar.icu/vi_webp/h85jaMZ1yIA/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://piped-proxy.lunar.icu/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2017-05-17",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 975,
        views: 6612377,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 5,
      },
      {
        url: "/watch?v=DAEg7zliSLw",
        type: "video",
        title: "Kamado Tanjirou no Uta (탄지로의 노래)┃Cover by Raon Lee",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi_webp/DAEg7zliSLw/mqdefault.webp?v=5e46601a&host=i.ytimg.com",
        uploaderName: "Raon",
        uploaderUrl: "/channel/UCQn1FqrR2OCjSe6Nl4GlVHw",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/3xlfTWMuYi3O_BWVgPYK9tZselbFoiVzibyB2aFq_nZe9Fo4P9ziCCHGqnYXZE2KTTMvE-mgzpA=s48-c-k-c0x00ffffff-no-nd-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-02-14",
        shortDescription:
          "▶ You can stream and download RAON's song right here!<br>* Spotify :: <a href=\"https://spoti.fi/2XNC",
        duration: 374,
        views: 6570355,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 132,
      },
      {
        url: "/watch?v=ALqOKq0M6ho",
        type: "video",
        title: "Liszt - Hungarian Rhapsody No.  2",
        thumbnail:
          "https://pipedproxy.simpleprivacy.fr/vi_webp/ALqOKq0M6ho/mqdefault.webp?v=5d90c430&host=i.ytimg.com",
        uploaderName: "Rousseau",
        uploaderUrl: "/channel/UCPZUQqtVDmcjm4NY5FkzqLA",
        uploaderAvatar:
          "https://pipedproxy.simpleprivacy.fr/ytc/AOPolaQAsc59pGkrTpcqIb2yTbDpTr5sA6qNF53jtdO15A=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-09-30",
        shortDescription:
          "Liszt - Hungarian Rhapsody No. &nbsp;2<br>Click the 🔔bell to always be notified on new uploads!<br>",
        duration: 774,
        views: 20914123,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 133,
      },
      {
        url: "/watch?v=ZFvx32SjAtE",
        type: "video",
        title: "Liebesleid (Love's Sorrow) - Kreisler (arr. Rachmaninoff)",
        thumbnail:
          "https://proxy.piped.projectsegfau.lt/vi_webp/ZFvx32SjAtE/mqdefault.webp?host=i.ytimg.com",
        uploaderName: "Rousseau",
        uploaderUrl: "/channel/UCPZUQqtVDmcjm4NY5FkzqLA",
        uploaderAvatar:
          "https://proxy.piped.projectsegfau.lt/ytc/AOPolaQAsc59pGkrTpcqIb2yTbDpTr5sA6qNF53jtdO15A=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2019-11-11",
        shortDescription:
          "Liebesleid (Love's Sorrow) - Kreisler (arr. Rachmaninoff)<br>Click the 🔔bell to always be notified ",
        duration: 296,
        views: 5301084,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 134,
      },
      {
        url: "/watch?v=hjycSRQBeT8",
        type: "video",
        title: "Deaf Kev - Babylon (feat. RIIVA)",
        thumbnail:
          "https://pipedproxy.palveluntarjoaja.eu/vi/hjycSRQBeT8/mqdefault.jpg?v=601eae92&host=i.ytimg.com",
        uploaderName: "DEAF KEV",
        uploaderUrl: "/channel/UCqkfCsmqmTZHwT6lhOeaNLA",
        uploaderAvatar:
          "https://pipedproxy.palveluntarjoaja.eu/ytc/AOPolaRqS2JbvujYn90Y2ESA7lBrf-Kgx93bWoP9MM2S=s48-c-k-c0x00ffffff-no-rw-mo?host=yt3.ggpht.com",
        uploadedDate: "2020-08-27",
        shortDescription:
          'Join my discord: <a href="https://linktr.ee/deafkev">https://linktr.ee/deafkev</a><br><br>Follow Dea',
        duration: 188,
        views: 12926,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 135,
      },
      {
        url: "/watch?v=Wz5ZVnzYZWk",
        type: "video",
        title: "DEAF KEV - Safe & Sound with Sendi Hoxha [NCS Release]",
        thumbnail:
          "https://pipedproxy.kavin.rocks/vi/Wz5ZVnzYZWk/mqdefault.jpg?host=i.ytimg.com",
        uploaderName: "NoCopyrightSounds",
        uploaderUrl: "/channel/UC_aEa8K-EOJ3D6gOs7HcyNg",
        uploaderAvatar:
          "https://pipedproxy.kavin.rocks/YIBi8NVC87fMfJHfQ2O0dyzjis7tUlO7VqWLhk1lq1fkIOQTrpX_Ip7G6S_u0IJosXYSe_Z9=s48-c-k-c0x00ffffff-no-rw?host=yt3.ggpht.com",
        uploadedDate: "2020-10-03",
        shortDescription:
          'Subscribe to NoCopyrightSounds &nbsp;👉 <a href="http://ncs.lnk.to/SubscribeYouTube">http://ncs.lnk.',
        duration: 209,
        views: 4153471,
        isShort: false,
        uploaderVerified: true,
        timeAdded: 1691673800973,
        order: 136,
      },
    ],
  };

  return (
    <>
      <A href={`/playlist?list=${list.id}`}>
        {list.name}
        <img src={list.thumbnail} />
      </A>
    </>
  );
}

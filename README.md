An modern alternative frontend for YouTube, using [Piped](https://github.com/TeamPiped/Piped/) as a backend.

## Features
- [x] No Ads
- [x] No Tracking
- [x] Synchronized Playlists, Subscriptions, Watch History, Blocklist, without a server, using [Y.js](https://github.com/yjs/yjs) and WebRTC.
- [-] Download videos locally and play them back seamlessly thanks to OPFS (Origin Private File System)
- [-] Advanced Filters to diplay only the content you want to see
- [-] PWA support allowing for a fully offline experience
- [x] Modern Player for a better viewing experience thanks to [Vidstack](https://github.com/vidstack/player)
- [x] Multiple themes
- [ ] Integration with [SponsorBlock](https://github.com/ajayyy/SponsorBlock)
- [x] Integration with [Return YouTube Dislike](https://returnyoutubedislike.com/) via [RYD-Proxy](https://github.com/TeamPiped/RYD-Proxy)
- [x] No connections to Google's servers
- [x] Easily switch between Piped instances

** and more to come... **

## How it works
    You can start synchronizing your data by creating a room. It's important that you choose a random room id and a strong password as when you create a room, a new Yjs document is created and shared with all the peers in the room. 
    This document contains the state of the room, including the playlist, the subscriptions, the watch history, the blocklist, and the current video. This document is stored locally in the browser using OPFS. Data is then synchronized between peers directly using WebRTC, meaning it is never sent to a server. This also means that if you delete your data on all synchronized devices, it will be lost forever.

### About Y.js
    Yjs is a CRDT (Conflict-free Replicated Data Type) framework. It allows for multiple peers to share the same data without a server. It is used to synchronize the state of the room between all the peers. You can read more about it [here](https://docs.yjs.dev/).

## Contributing
    Contributions are welcome, feel free to open a pull request.

## Technical Details
    I've chosen to create a custom OPFS Y.js provider instead of y-indexeddb for performance reasons. Even though IndexedDB is fast, it is not meant to read multiple MBs of data at once (a Y.js provider needs to access all the data at once to be able to synchronize it), and this causes the browser to lag on every page refresh, even though the operation is asynchronous. y-opfs is a custom provider that uses the OPFS API to store the data in a local file. This is not necessarily faster than IndexedDB but it prevents that initial lag. There are 2 main issues with this approach:
    - Synchronous access to OPFS files is only available in a Worker context, meaning y-opfs needs to communicate with it through a Worker.
    - Synchronous access to a file can only be aquired by a single client at once. This means that if you open 2 tabs, only one of them will be able to access the file at once and the second one won't be able to write to it. This is solved by using a [SharedService](https://github.com/rhashimoto/wa-sqlite/discussions/81) which uses Web Locks delegate one master tab at a time and all slave tabs communicate with it through a BroadcastChannel.

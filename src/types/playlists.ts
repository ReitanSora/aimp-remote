export interface Playlists {
    id: string;
    itemCount: number;
    name: string;
}

export interface PlaylistItem {
    album: string;
    artist: string;
    bitrate: number;
    duration: number;
    index: string;
    sampleRate: number;
    title: string;
}

export interface PlaylistDetailsHeader {
    playlistInfo: PlaylistInfo;
    playlistStats: PlaylistStats;
}

export interface PlaylistInfo {
    duration: number;
    id: string;
    is_read_only: string;
    item_count: number;
    name: string;
    playing_index: number;
}

export interface PlaylistStats {
    album_count: number;
    artist_count: number;
    artists: object[];
    avg_bitrate: number;
    avg_rating: number;
    genres: object[];
    total_play_count: number;
    total_size_bytes: number;
    tracks_never_played: number;
    tracks_with_rating: number;
}

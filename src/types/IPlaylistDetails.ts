export interface PlaylistDetailsHeaderProps {
    playlistInfo: PlaylistInfoProps;
    playlistStats: PlaylistStatsProps;
}

export interface PlaylistInfoProps {
    duration: number;
    id: string;
    is_read_only: string;
    item_count: number;
    name: string;
    playing_index: number;
}

export interface PlaylistStatsProps {
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

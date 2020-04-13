import { ObjectId } from "mongodb";

export interface IResponse {
    message: string,
    body: Object,
    code: number
}

export interface ISong {
    title: string,
    duration: number
}

export interface IAlbum {
    _id?: string | ObjectId,
    title: string,
    artist: string,
    date: string,
    imageUrl: string,
    songs: Array<ISong>
}
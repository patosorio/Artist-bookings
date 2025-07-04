import { apiClient } from "./client"
import { Artist, CreateArtistData, UpdateArtistData, ArtistNote } from "@/types/artists"

class ArtistApi {
  private readonly BASE_PATH = "/api/v1/artists"

  async fetchArtists(): Promise<Artist[]> {
    const response = await apiClient.get(this.BASE_PATH + "/")
    return response.data
  }

  async fetchArtist(id: string): Promise<Artist> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/`)
    return response.data
  }

  async create(data: CreateArtistData): Promise<Artist> {
    const response = await apiClient.post(this.BASE_PATH + "/", data)
    return response.data
  }

  async update(id: string, data: UpdateArtistData): Promise<Artist> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}/`)
  }

  // Notes endpoints
  async getNotes(artistId: string): Promise<ArtistNote[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/${artistId}/notes/`)
    return response.data
  }

  async addNote(artistId: string, data: { content: string; color: string }): Promise<ArtistNote> {
    const response = await apiClient.post(`${this.BASE_PATH}/${artistId}/notes/`, data)
    return response.data
  }

  async updateNote(artistId: string, noteId: string, data: { content: string }): Promise<ArtistNote> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${artistId}/notes/${noteId}/`, data)
    return response.data
  }

  async deleteNote(artistId: string, noteId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${artistId}/notes/${noteId}/`)
  }
}

export const artists = new ArtistApi()
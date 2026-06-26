import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { ShikimoriAnime } from './types';

@Injectable()
export class ShikimoriGQLService {
    readonly client = new GraphQLClient(
        `${process.env.SHIKIMORI_API}/api/graphql`,
        { headers: { 'User-Agent': 'Shikicinema/1.0' } },
    );

    private fields(): string {
        return `
            id
            name
            russian
            licenseNameRu
            english
            japanese
            synonyms
            kind
            rating
            score
            status
            duration
            airedOn { year month day date }
            releasedOn { year month day date }
            url
            nextEpisodeAt
            episodes
            genres { id name russian kind }
            studios { id name imageUrl }
            related {
                id
                anime { id name }
                manga { id name }
                relationKind
                relationText
            }
            videos { id url name kind playerUrl imageUrl }
            description
            poster { originalUrl }
        `;
    }

    async fetchAnimeById(id: number): Promise<ShikimoriAnime | null> {
        const query = `{
            animes(ids: "${id}") {
                ${this.fields()}
            }
        }`;
        const data = await this.client.request<{ animes: ShikimoriAnime[] }>(query);

        return data.animes?.[0] ?? null;
    }

    async fetchAnimesPage(page: number, limit: number = 50): Promise<ShikimoriAnime[]> {
        const query = `query($page: Int!, $limit: Int!) {
            animes(page: $page, limit: $limit, order: id, censored: false) {
                ${this.fields()}
            }
        }`;
        const data = await this.client.request<{ animes: ShikimoriAnime[] }>(query, { page, limit });

        return data.animes;
    }
}

import { StudioEntity } from '../../../../entities';
import { StudioSearchDocument } from '../../../types';

export function studioToSearchDoc({ id, name, russian, poster }: StudioEntity): StudioSearchDocument {
    return { id, name, russian, poster };
}

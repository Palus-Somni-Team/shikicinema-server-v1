import { StudioEntity } from '../../../../entities';
import { StudioSearchDocument } from '../../../types';

export function studioToSearchDoc({ id, name }: StudioEntity): StudioSearchDocument {
    return { id, name };
}
